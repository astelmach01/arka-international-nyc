const categories = [
  {
    name: "Icons & faith",
    pattern: /\b(icon|christ|jesus|mary|madonna|virgin|saint|nativity|holy family|our lady|mother of god|cross|crucifix|shrine|triptych|diptych|rosary)\b/i,
  },
  {
    name: "Pysanky & folk art",
    pattern: /\b(pysank(?:a|y|i)|easter egg|diduh|bandura|folk art|hutsul doll|traditional doll|petrykivka)\b/i,
  },
  {
    name: "Books & music",
    pattern: /\b(book|dictionary|encyclopedia|atlas|poetry|poem|novel|history of|album|song|music|cd|dvd|cassette|record|vinyl|shevchenko)\b/i,
  },
  {
    name: "Jewelry & accessories",
    pattern: /\b(necklace|bracelet|earrings?|jewelry|jewellery|brooch|pendant|ring|beads?|amber|coral|gerdan|belt|bag|purse|scarf|headpiece|headband|hat|cap|pin)\b/i,
  },
  {
    name: "Textiles & clothing",
    pattern: /\b(vyshyvanka|blouse|shirt|dress|skirt|sweater|vest|jacket|coat|rushnyk|rusnyk|towel|textile|embroider(?:ed|y)|woven|weaving|rug|zapaska|obgortka|tapci|kerpchi|tablecloth|runner|pillow|duvet|linen|wool|cloth|skeins?|costumes?|outfits?)\b/i,
  },
  {
    name: "Ceramics & woodwork",
    pattern: /\b(ceramic|pottery|clay|porcelain|wood|wooden|carved|carving|box|plate|dish|cup|bowl|vase|decanter|pitcher|spoon)\b/i,
  },
  {
    name: "Gifts & décor",
    pattern: /\b(magnets?|ornament|souvenir|figurines?|candle|map|flag|postcard|clock|frame|dolls?|matryoshka|toy|flower|painting|picture|print|oil|canvas|canvass|landscape|tryzub|oberig|charm|tray)\b/i,
  },
];

export const CATEGORY_NAMES = categories.map((category) => category.name);

export function inferCategory(product) {
  const text = `${product?.title ?? ""} ${product?.caption ?? ""} ${product?.description ?? ""}`;
  if (product?.id >= 957 && product?.id <= 1071) return "Books & music";
  return categories.find((category) => category.pattern.test(text))?.name ?? "More treasures";
}

export function filterProducts(products, query, category = "All objects") {
  const normalized = query.trim().toLocaleLowerCase();
  return products.filter((product) => {
    const matchesCategory = category === "All objects" || product.category === category;
    if (!matchesCategory) return false;
    if (!normalized) return true;
    return `${product.title} ${product.caption ?? ""} ${product.description ?? ""}`
      .toLocaleLowerCase()
      .includes(normalized);
  });
}
