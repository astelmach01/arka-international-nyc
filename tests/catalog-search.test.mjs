import test from "node:test";
import assert from "node:assert/strict";

import { filterProducts, inferCategory } from "../app/catalog-search.mjs";

const products = [
  { title: "Carved Wooden Box", caption: "Made in the Carpathians" },
  { title: "Embroidered Blouse", caption: "Traditional red pattern" },
];

test("filterProducts searches titles and captions without case sensitivity", () => {
  assert.deepEqual(filterProducts(products, "CARPATHIANS"), [products[0]]);
  assert.deepEqual(filterProducts(products, "embroidered"), [products[1]]);
});

test("filterProducts returns the whole collection for a blank query", () => {
  assert.deepEqual(filterProducts(products, "   "), products);
});

test("inferCategory gives recovered objects one understandable browsing category", () => {
  assert.equal(inferCategory({ title: "Embroidered Jesus Icon" }), "Icons & faith");
  assert.equal(inferCategory({ title: "Rushnyk from Poltava" }), "Textiles & clothing");
  assert.equal(inferCategory({ title: "Pysanka Magnet" }), "Pysanky & folk art");
  assert.equal(inferCategory({ title: "Ukrainian-English Dictionary" }), "Books & music");
  assert.equal(inferCategory({ title: "Amber Necklace" }), "Jewelry & accessories");
  assert.equal(inferCategory({ title: "Carved Wooden Box" }), "Ceramics & woodwork");
  assert.equal(inferCategory({ id: 1031, title: "Chytaylik" }), "Books & music");
  assert.equal(inferCategory({ title: "Gerdan" }), "Jewelry & accessories");
  assert.equal(inferCategory({ title: "DMC skein" }), "Textiles & clothing");
  assert.equal(inferCategory({ title: "Winter Themed Matryoshka" }), "Gifts & décor");
});

test("filterProducts combines a category with the plain-language search", () => {
  const categorized = [
    { title: "Carved Wooden Box", caption: "Made in the Carpathians", category: "Ceramics & woodwork" },
    { title: "Embroidered Blouse", caption: "Traditional red pattern", category: "Textiles & clothing" },
    { title: "Woven Rushnyk", caption: "From Poltava", category: "Textiles & clothing" },
  ];

  assert.deepEqual(
    filterProducts(categorized, "poltava", "Textiles & clothing"),
    [categorized[2]],
  );
  assert.deepEqual(
    filterProducts(categorized, "", "Ceramics & woodwork"),
    [categorized[0]],
  );
});
