import test from "node:test";
import assert from "node:assert/strict";

import {
  cleanHtml,
  chooseDisplayImage,
  normalizeProduct,
  originalMediaUrls,
} from "../scripts/import-products.mjs";

test("cleanHtml preserves readable paragraph breaks and decodes entities", () => {
  assert.equal(
    cleanHtml("<p>Handmade &amp; painted.</p><p>14&#215;19 inches.</p>"),
    "Handmade & painted.\n14×19 inches.",
  );
});

test("chooseDisplayImage prefers a reasonably sized catalog image", () => {
  const media = {
    source_url: "http://example.com/full.jpg",
    media_details: {
      sizes: {
        medium: { source_url: "http://example.com/medium.jpg" },
        shop_catalog: { source_url: "http://example.com/catalog.jpg" },
      },
    },
  };

  assert.equal(chooseDisplayImage(media), "http://example.com/catalog.jpg");
});

test("normalizeProduct keeps the public title, caption, description, and image", () => {
  const product = {
    id: 42,
    slug: "painted-icon",
    title: { rendered: "Painted &amp; Carved Icon" },
    excerpt: { rendered: "<p>Wood; 14&#215;19 inches.</p>" },
    content: { rendered: "<p>Made in Ukraine.</p>" },
    _embedded: {
      "wp:featuredmedia": [
        {
          alt_text: "Carved icon",
          source_url: "http://example.com/full.jpg",
          media_details: { sizes: {} },
        },
      ],
    },
  };

  assert.deepEqual(normalizeProduct(product), {
    id: 42,
    slug: "painted-icon",
    title: "Painted & Carved Icon",
    caption: "Wood; 14×19 inches.",
    description: "Made in Ukraine.",
    imageUrl: "http://example.com/full.jpg",
    imageAlt: "Carved icon",
  });
});

test("originalMediaUrls checks WordPress's pre-edit original without using a derivative", () => {
  assert.deepEqual(
    originalMediaUrls({
      source_url: "http://example.com/uploads/IMG_4061-e1514603811444.jpg",
    }),
    [
      "http://example.com/uploads/IMG_4061-e1514603811444.jpg",
      "http://example.com/uploads/IMG_4061.jpg",
    ],
  );
});
