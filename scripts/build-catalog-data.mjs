import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeProduct } from "./import-products.mjs";
import { inferCategory } from "../app/catalog-search.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productsRaw = JSON.parse(
  await readFile(path.join(root, "recovery", "raw", "products.json"), "utf8"),
);

const products = productsRaw.map((record) => {
  const product = normalizeProduct(record);
  product.category = inferCategory(product);
  if (product.imageUrl) {
    const extension = path.extname(new URL(product.imageUrl).pathname).toLowerCase() || ".jpg";
    product.localImage = `/images/products/${product.id}${extension}`;
  }
  return product;
});

await writeFile(path.join(root, "data", "products.json"), JSON.stringify(products, null, 2));
console.log(`Prepared ${products.length} catalog records.`);
