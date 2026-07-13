import test from "node:test";
import assert from "node:assert/strict";

import { filterProducts } from "../app/catalog-search.mjs";

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
