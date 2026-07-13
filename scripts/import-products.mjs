import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = "http://www.arkastorenyc.com";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const namedEntities = new Map([
  ["amp", "&"],
  ["apos", "'"],
  ["gt", ">"],
  ["hellip", "…"],
  ["laquo", "«"],
  ["ldquo", "“"],
  ["lsquo", "‘"],
  ["nbsp", " "],
  ["quot", '"'],
  ["raquo", "»"],
  ["rdquo", "”"],
  ["rsquo", "’"],
]);

function decodeEntities(value = "") {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return namedEntities.get(entity.toLowerCase()) ?? match;
  });
}

export function cleanHtml(value = "") {
  return decodeEntities(
    value
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/p\s*>/gi, "\n")
      .replace(/<\/li\s*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\r/g, ""),
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

export function chooseDisplayImage(media) {
  const sizes = media?.media_details?.sizes ?? {};
  return (
    sizes.shop_catalog?.source_url ??
    sizes.large?.source_url ??
    sizes.medium_large?.source_url ??
    sizes.medium?.source_url ??
    media?.source_url ??
    ""
  );
}

export function normalizeProduct(product) {
  const media = product?._embedded?.["wp:featuredmedia"]?.[0];
  return {
    id: product.id,
    slug: product.slug,
    title: cleanHtml(product.title?.rendered),
    caption: cleanHtml(product.excerpt?.rendered),
    description: cleanHtml(product.content?.rendered),
    imageUrl: chooseDisplayImage(media),
    imageAlt: cleanHtml(media?.alt_text) || cleanHtml(product.title?.rendered),
  };
}

export function originalMediaUrls(media) {
  const source = media?.source_url;
  if (!source) return [];
  const preEditOriginal = source.replace(/-e\d+(?=\.[a-z0-9]+(?:\?|$))/i, "");
  return preEditOriginal === source ? [source] : [source, preEditOriginal];
}

async function fetchJson(url, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return { data: await response.json(), headers: response.headers };
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 400));
    }
  }
  throw new Error(`Failed to fetch ${url}: ${lastError?.message}`);
}

async function fetchCollection(restPath, extraParams = {}) {
  const firstUrl = new URL(`${BASE_URL}/wp-json/wp/v2/${restPath}`);
  firstUrl.searchParams.set("per_page", "100");
  for (const [key, value] of Object.entries(extraParams)) {
    firstUrl.searchParams.set(key, String(value));
  }

  const first = await fetchJson(firstUrl);
  const totalPages = Number(first.headers.get("x-wp-totalpages") ?? 1);
  const records = [...first.data];
  for (let page = 2; page <= totalPages; page += 1) {
    const pageUrl = new URL(firstUrl);
    pageUrl.searchParams.set("page", String(page));
    const result = await fetchJson(pageUrl);
    records.push(...result.data);
  }
  return records;
}

function extensionFromUrl(url, fallback = ".jpg") {
  try {
    const extension = path.extname(new URL(url).pathname).toLowerCase();
    return extension && extension.length <= 6 ? extension : fallback;
  } catch {
    return fallback;
  }
}

async function downloadFile(url, destination, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length === 0) throw new Error("server returned an empty file");
      await writeFile(destination, bytes);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }
  throw new Error(`${url}: ${lastError?.message}`);
}

async function downloadFirstAvailable(urls, destination) {
  const failures = [];
  for (const url of urls) {
    try {
      await downloadFile(url, destination, 2);
      return;
    } catch (error) {
      failures.push(error.message);
    }
  }
  throw new Error(failures.join("; "));
}

async function downloadMany(items, worker, concurrency = 8) {
  const results = [];
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        await worker(items[index], index);
        results[index] = { ok: true };
      } catch (error) {
        results[index] = { ok: false, error: error.message };
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

async function main() {
  const rawDir = path.join(ROOT, "recovery", "raw");
  const originalDir = path.join(ROOT, "recovery", "original-media");
  const productImageDir = path.join(ROOT, "public", "images", "products");
  const dataDir = path.join(ROOT, "data");
  await Promise.all([
    mkdir(rawDir, { recursive: true }),
    mkdir(originalDir, { recursive: true }),
    mkdir(productImageDir, { recursive: true }),
    mkdir(dataDir, { recursive: true }),
  ]);

  const [productsRaw, mediaRaw, pagesRaw, postsRaw] = await Promise.all([
    fetchCollection("product", { _embed: 1 }),
    fetchCollection("media"),
    fetchCollection("pages", { _embed: 1 }),
    fetchCollection("posts", { _embed: 1 }),
  ]);

  await Promise.all([
    writeFile(path.join(rawDir, "products.json"), JSON.stringify(productsRaw, null, 2)),
    writeFile(path.join(rawDir, "media.json"), JSON.stringify(mediaRaw, null, 2)),
    writeFile(path.join(rawDir, "pages.json"), JSON.stringify(pagesRaw, null, 2)),
    writeFile(path.join(rawDir, "posts.json"), JSON.stringify(postsRaw, null, 2)),
  ]);

  const products = productsRaw.map(normalizeProduct);
  const displayResults = await downloadMany(products, async (product) => {
    if (!product.imageUrl) return;
    const filename = `${product.id}${extensionFromUrl(product.imageUrl)}`;
    await downloadFile(product.imageUrl, path.join(productImageDir, filename));
    product.localImage = `/images/products/${filename}`;
  });

  const originalResults = await downloadMany(mediaRaw, async (media) => {
    if (!media.source_url) return;
    const filename = `${media.id}${extensionFromUrl(media.source_url)}`;
    await downloadFirstAvailable(originalMediaUrls(media), path.join(originalDir, filename));
  }, 6);

  await writeFile(path.join(dataDir, "products.json"), JSON.stringify(products, null, 2));
  const report = {
    capturedAt: new Date().toISOString(),
    source: BASE_URL,
    counts: {
      products: productsRaw.length,
      media: mediaRaw.length,
      pages: pagesRaw.length,
      posts: postsRaw.length,
      productImagesDownloaded: displayResults.filter((result) => result?.ok).length,
      originalMediaDownloaded: originalResults.filter((result) => result?.ok).length,
    },
    productImageFailures: displayResults
      .map((result, index) => ({ ...result, productId: products[index]?.id }))
      .filter((result) => !result.ok),
    originalMediaFailures: originalResults
      .map((result, index) => ({ ...result, mediaId: mediaRaw[index]?.id }))
      .filter((result) => !result.ok),
  };
  await writeFile(path.join(ROOT, "recovery", "report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
