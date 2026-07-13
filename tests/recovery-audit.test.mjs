import test from "node:test";
import assert from "node:assert/strict";

import { auditRecords, identifySuspectContent } from "../scripts/audit-recovery.mjs";

test("auditRecords accepts a complete, linked recovery", () => {
  const result = auditRecords({
    expected: { products: 2, media: 1, pages: 1, posts: 0 },
    products: [
      { id: 1, slug: "one", title: { rendered: "One" }, featured_media: 10 },
      { id: 2, slug: "two", title: { rendered: "Two" }, featured_media: 0 },
    ],
    media: [{ id: 10, source_url: "http://example.com/10.jpg" }],
    pages: [{ id: 20, slug: "home", title: { rendered: "Home" } }],
    posts: [],
    downloadedOriginalIds: new Set([10]),
    downloadedProductIds: new Set([1]),
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.productsWithoutFeaturedImage, 1);
});

test("auditRecords reports count, identity, title, link, and download problems", () => {
  const result = auditRecords({
    expected: { products: 3, media: 2, pages: 0, posts: 0 },
    products: [
      { id: 1, slug: "same", title: { rendered: "" }, featured_media: 99 },
      { id: 1, slug: "same", title: { rendered: "Two" }, featured_media: 10 },
    ],
    media: [{ id: 10, source_url: "http://example.com/10.jpg" }],
    pages: [],
    posts: [],
    downloadedOriginalIds: new Set(),
    downloadedProductIds: new Set(),
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("expected 3 products")));
  assert.ok(result.errors.some((error) => error.includes("duplicate product id")));
  assert.ok(result.errors.some((error) => error.includes("duplicate product slug")));
  assert.ok(result.errors.some((error) => error.includes("empty title")));
  assert.ok(result.errors.some((error) => error.includes("missing media 99")));
  assert.ok(result.errors.some((error) => error.includes("original file missing")));
  assert.ok(result.errors.some((error) => error.includes("display image missing")));
});

test("identifySuspectContent separates late spam from the historical catalog", () => {
  const result = identifySuspectContent({
    products: [{ id: 1, date: "2017-12-27T12:00:00", title: { rendered: "Wooden Box" } }],
    posts: [
      { id: 2, date: "2014-06-01T12:00:00", title: { rendered: "Store story" } },
      { id: 3, date: "2026-01-01T12:00:00", title: { rendered: "Casino bonus" } },
    ],
    pages: [
      { id: 4, content: { rendered: "<p>Store Hours</p>" } },
      { id: 5, content: { rendered: "<p>Store Hours</p> บาคาร่าออนไลน์" } },
      { id: 6, content: { rendered: "<div style=\"left:-7566px\">betandreas</div>" } },
    ],
  });

  assert.deepEqual(result.suspectPostIds, [3]);
  assert.deepEqual(result.suspectPageIds, [5, 6]);
  assert.deepEqual(result.suspectProductIds, []);
});
