import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = "http://www.arkastorenyc.com";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

const suspectPattern =
  /casino|betting|sportsbook|บาคาร่า|แทงบอลออนไลน์|mostbet|golisimo|kraken\s+(?:onion|market)|dexscreener/i;

function renderedText(record) {
  return [record?.title?.rendered, record?.excerpt?.rendered, record?.content?.rendered]
    .filter(Boolean)
    .join(" ");
}

export function identifySuspectContent({ products, posts, pages }) {
  const afterHistoricalSitePeriod = (record) => String(record?.date ?? "") >= "2020-01-01";
  return {
    suspectProductIds: products
      .filter((record) => afterHistoricalSitePeriod(record) || suspectPattern.test(renderedText(record)))
      .map((record) => record.id),
    suspectPostIds: posts
      .filter((record) => afterHistoricalSitePeriod(record) || suspectPattern.test(renderedText(record)))
      .map((record) => record.id),
    suspectPageIds: pages
      .filter((record) => suspectPattern.test(renderedText(record)))
      .map((record) => record.id),
  };
}

export function auditRecords({
  expected,
  products,
  media,
  pages,
  posts,
  downloadedOriginalIds,
  downloadedProductIds,
}) {
  const errors = [];
  const collections = { products, media, pages, posts };
  for (const [name, records] of Object.entries(collections)) {
    if (records.length !== expected[name]) {
      errors.push(`expected ${expected[name]} ${name}, captured ${records.length}`);
    }
    for (const id of findDuplicates(records.map((record) => record.id))) {
      errors.push(`duplicate ${name.slice(0, -1)} id ${id}`);
    }
  }

  for (const slug of findDuplicates(products.map((product) => product.slug).filter(Boolean))) {
    errors.push(`duplicate product slug ${slug}`);
  }
  for (const product of products) {
    if (!product.title?.rendered?.trim()) errors.push(`product ${product.id} has empty title`);
  }

  const mediaIds = new Set(media.map((item) => item.id));
  for (const product of products) {
    if (product.featured_media && !mediaIds.has(product.featured_media)) {
      errors.push(`product ${product.id} references missing media ${product.featured_media}`);
    }
    if (product.featured_media && !downloadedProductIds.has(product.id)) {
      errors.push(`product ${product.id} display image missing`);
    }
  }
  for (const item of media) {
    if (item.source_url && !downloadedOriginalIds.has(item.id)) {
      errors.push(`media ${item.id} original file missing`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      products: products.length,
      media: media.length,
      pages: pages.length,
      posts: posts.length,
      productsWithoutFeaturedImage: products.filter((product) => !product.featured_media).length,
      productsWithEmptyExcerpt: products.filter((product) => !product.excerpt?.rendered?.trim()).length,
      productsWithEmptyDescription: products.filter((product) => !product.content?.rendered?.trim()).length,
      mediaWithoutSourceUrl: media.filter((item) => !item.source_url).length,
    },
  };
}

async function readJson(filename) {
  return JSON.parse(await readFile(filename, "utf8"));
}

async function expectedTotal(restPath) {
  const response = await fetch(`${BASE_URL}/wp-json/wp/v2/${restPath}?per_page=1`);
  if (!response.ok) throw new Error(`could not verify ${restPath}: ${response.status}`);
  return Number(response.headers.get("x-wp-total"));
}

async function downloadedIds(directory) {
  const names = await readdir(directory);
  return new Set(names.map((name) => Number.parseInt(name, 10)).filter(Number.isFinite));
}

async function invalidFiles(directory) {
  const names = await readdir(directory);
  const invalid = [];
  for (const name of names) {
    const info = await stat(path.join(directory, name));
    if (!info.isFile() || info.size === 0) invalid.push({ name, size: info.size });
  }
  return invalid;
}

async function main() {
  const rawDir = path.join(ROOT, "recovery", "raw");
  const originalDir = path.join(ROOT, "recovery", "original-media");
  const productImageDir = path.join(ROOT, "public", "images", "products");

  const [products, media, pages, posts, expected] = await Promise.all([
    readJson(path.join(rawDir, "products.json")),
    readJson(path.join(rawDir, "media.json")),
    readJson(path.join(rawDir, "pages.json")),
    readJson(path.join(rawDir, "posts.json")),
    Promise.all([
      expectedTotal("product"),
      expectedTotal("media"),
      expectedTotal("pages"),
      expectedTotal("posts"),
    ]).then(([productCount, mediaCount, pageCount, postCount]) => ({
      products: productCount,
      media: mediaCount,
      pages: pageCount,
      posts: postCount,
    })),
  ]);

  const [downloadedOriginalIds, downloadedProductIds, invalidOriginals, invalidProductImages] =
    await Promise.all([
      downloadedIds(originalDir),
      downloadedIds(productImageDir),
      invalidFiles(originalDir),
      invalidFiles(productImageDir),
    ]);

  const result = auditRecords({
    expected,
    products,
    media,
    pages,
    posts,
    downloadedOriginalIds,
    downloadedProductIds,
  });
  result.checkedAt = new Date().toISOString();
  result.expected = expected;
  result.contentQuarantine = identifySuspectContent({ products, posts, pages });
  result.warnings = [];
  if (result.contentQuarantine.suspectPostIds.length) {
    result.warnings.push(
      `${result.contentQuarantine.suspectPostIds.length} likely spam posts were preserved only in the raw archive`,
    );
  }
  if (result.contentQuarantine.suspectPageIds.length) {
    result.warnings.push(
      `${result.contentQuarantine.suspectPageIds.length} pages contain injected text and require cleaning`,
    );
  }
  if (result.contentQuarantine.suspectProductIds.length) {
    result.errors.push(
      `${result.contentQuarantine.suspectProductIds.length} product records require manual quarantine review`,
    );
    result.ok = false;
  }
  result.invalidOriginalFiles = invalidOriginals;
  result.invalidProductImageFiles = invalidProductImages;
  if (invalidOriginals.length || invalidProductImages.length) {
    result.ok = false;
    result.errors.push("one or more downloaded files is empty or invalid");
  }

  await writeFile(path.join(ROOT, "recovery", "audit.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
