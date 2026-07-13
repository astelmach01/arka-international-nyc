import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cleanHtml } from "./import-products.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const hiddenBlockPattern =
  /<(div|span)[^>]*style=["'][^"']*(?:opacity\s*:\s*0(?:\.0+)?|left\s*:\s*-\d{3,}px|display\s*:\s*none|visibility\s*:\s*hidden)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi;

export function cleanInjectedPage(html = "") {
  return cleanHtml(html.replace(hiddenBlockPattern, ""));
}

export function isLegacyThemePost(record) {
  const text = cleanHtml(record?.content?.rendered ?? "");
  return (
    record?.slug === "hello-world" ||
    /^post-(?:standard|with-)/.test(record?.slug ?? "") ||
    /^(another-post|a-lovely-love-story|yet-another-story)$/.test(record?.slug ?? "") ||
    /The world was so recent that many things lacked names/i.test(text) ||
    /Welcome to WordPress/i.test(text)
  );
}

export function buildSafeArchive(posts, suspectIds) {
  return posts
    .filter((record) => !suspectIds.has(record.id))
    .map((record) => ({
      id: record.id,
      date: new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${record.date.slice(0, 10)}T12:00:00Z`)),
      isoDate: record.date,
      slug: record.slug,
      title: cleanHtml(record.title?.rendered),
      excerpt: cleanHtml(record.excerpt?.rendered || record.content?.rendered),
      provenance: isLegacyThemePost(record) ? "WordPress theme demo" : "Arka archive",
    }))
    .sort((left, right) => right.isoDate.localeCompare(left.isoDate));
}

async function main() {
  const [posts, audit] = await Promise.all([
    readFile(path.join(ROOT, "recovery", "raw", "posts.json"), "utf8").then(JSON.parse),
    readFile(path.join(ROOT, "recovery", "audit.json"), "utf8").then(JSON.parse),
  ]);
  const archive = buildSafeArchive(
    posts,
    new Set(audit.contentQuarantine.suspectPostIds),
  );
  await writeFile(path.join(ROOT, "data", "archive.json"), JSON.stringify(archive, null, 2));
  console.log(`Prepared ${archive.length} safe legacy archive records.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
