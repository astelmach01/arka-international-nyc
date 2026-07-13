export function filterProducts(products, query) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return products;
  return products.filter((product) =>
    `${product.title} ${product.caption} ${product.description}`
      .toLocaleLowerCase()
      .includes(normalized),
  );
}
