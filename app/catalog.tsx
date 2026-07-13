"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "./page";
import { CATEGORY_NAMES, filterProducts } from "./catalog-search.mjs";

const PAGE_SIZE = 18;
const ALL_OBJECTS = "All objects";

export function Catalog({ products, basePath = "" }: { products: Product[]; basePath?: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_OBJECTS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Product | null>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const categoryNames = useMemo(() => {
    const present = new Set(products.map((product) => product.category));
    return [...CATEGORY_NAMES, "More treasures"].filter((name) => present.has(name));
  }, [products]);

  const categoryCounts = useMemo(
    () => new Map(categoryNames.map((name) => [name, products.filter((product) => product.category === name).length])),
    [categoryNames, products],
  );

  const categoryImages = useMemo(
    () => new Map(categoryNames.map((name) => [name, products.find((product) => product.category === name && product.localImage)])),
    [categoryNames, products],
  );

  const filtered = useMemo(
    () => filterProducts(products, query, category) as Product[],
    [products, query, category],
  );
  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [selected]);

  const chooseCategory = (name: string) => {
    setCategory(name);
    setQuery("");
    setVisibleCount(PAGE_SIZE);
    requestAnimationFrame(() => collectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const clearFilters = () => {
    setQuery("");
    setCategory(ALL_OBJECTS);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <section className="shop-section" id="collection" aria-labelledby="browse-title">
      <div className="browse-heading">
        <div>
          <p className="kicker">Start with what interests you</p>
          <h2 id="browse-title">Browse by category</h2>
        </div>
        <p>
          Choose a category or search for a word such as “pysanka,” “icon,”
          “rushnyk,” or “book.” You can always call us for help.
        </p>
      </div>

      <div className="category-grid" aria-label="Object categories">
        {categoryNames.map((name, index) => {
          const sample = categoryImages.get(name);
          return (
            <button
              type="button"
              className="category-card"
              key={name}
              onClick={() => chooseCategory(name)}
            >
              <span className="category-card-image">
                {sample?.localImage ? (
                  <img src={`${basePath}${sample.localImage}`} alt="" loading={index > 3 ? "lazy" : undefined} />
                ) : (
                  <span aria-hidden="true">А</span>
                )}
              </span>
              <span className="category-card-copy">
                <strong>{name}</strong>
                <small>{categoryCounts.get(name)} objects</small>
              </span>
              <span className="category-arrow" aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>

      <div className="catalog-panel" ref={collectionRef}>
        <div className="catalog-heading">
          <div>
            <p className="kicker">Arka’s collection</p>
            <h2>Find an object</h2>
          </div>
          <p>Browse {products.length} objects, then call the store for current availability, pricing, or help finding the right piece.</p>
        </div>

        <div className="catalog-controls">
          <label className="search-field">
            <span>What are you looking for?</span>
            <span className="search-input-wrap">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Try “embroidered shirt” or “wooden box”"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              />
            </span>
          </label>

          <div className="filter-group" aria-label="Filter collection by category">
            {[ALL_OBJECTS, ...categoryNames].map((name) => (
              <button
                type="button"
                key={name}
                aria-pressed={category === name}
                className={category === name ? "filter-chip is-active" : "filter-chip"}
                onClick={() => chooseCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="results-bar">
          <p aria-live="polite">
            <strong>{filtered.length}</strong> {filtered.length === 1 ? "object" : "objects"}
            {category !== ALL_OBJECTS ? ` in ${category}` : ""}
          </p>
          {(query || category !== ALL_OBJECTS) && (
            <button type="button" onClick={clearFilters}>Clear search and filters</button>
          )}
        </div>

        {visible.length ? (
          <div className="product-grid">
            {visible.map((product) => (
              <button className="product-card" type="button" key={product.id} onClick={() => setSelected(product)}>
                <span className="product-image">
                  {product.localImage ? (
                    <img src={`${basePath}${product.localImage}`} alt={product.imageAlt} loading="lazy" />
                  ) : (
                    <span className="image-placeholder">Photograph unavailable</span>
                  )}
                </span>
                <span className="product-copy">
                  <small>{product.category}</small>
                  <strong>{product.title}</strong>
                  {product.caption && <span>{product.caption}</span>}
                  <b>View details <span aria-hidden="true">→</span></b>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span aria-hidden="true">⌕</span>
            <h3>We could not find that in the archive.</h3>
            <p>Try one simple word, choose another category, or call the store and ask us.</p>
            <button type="button" onClick={clearFilters}>Show all objects</button>
          </div>
        )}

        {visibleCount < filtered.length && (
          <button className="load-more" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Show more objects
            <small>{Math.min(filtered.length - visibleCount, PAGE_SIZE)} more will appear</small>
          </button>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button ref={closeRef} className="modal-close" type="button" aria-label="Close object details" onClick={() => setSelected(null)}>×</button>
            <div className="modal-image">
              {selected.localImage ? (
                <img src={`${basePath}${selected.localImage}`} alt={selected.imageAlt} />
              ) : (
                <span className="image-placeholder">Photograph unavailable</span>
              )}
            </div>
            <div className="modal-copy">
              <p className="kicker">{selected.category}</p>
              <h3 id="product-title">{selected.title}</h3>
              {selected.caption && <p>{selected.caption}</p>}
              {selected.description && <p>{selected.description}</p>}
              <div className="modal-callout">
                <strong>Ask about this object</strong>
                <span>Tell us the name shown above. We will confirm whether it is still available and answer your questions.</span>
              </div>
              <a className="button button-primary" href="tel:+12124733550">Call the store: 212-473-3550</a>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
