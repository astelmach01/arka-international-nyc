"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product } from "./page";
import { filterProducts } from "./catalog-search.mjs";

const PAGE_SIZE = 24;

export function Catalog({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Product | null>(null);
  const filtered = useMemo(() => filterProducts(products, query), [products, query]);
  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selected]);

  return (
    <>
      <div className="catalog-tools">
        <label className="search-box">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <span className="sr-only">Search the collection</span>
          <input
            type="search"
            placeholder="Search the collection…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />
        </label>
        <p aria-live="polite">{filtered.length} {filtered.length === 1 ? "object" : "objects"}</p>
      </div>

      {visible.length ? (
        <div className="product-grid">
          {visible.map((product) => (
            <button className="product-card" key={product.id} onClick={() => setSelected(product)}>
              <span className="product-image">
                {product.localImage ? (
                  <img src={product.localImage} alt={product.imageAlt} loading="lazy" />
                ) : (
                  <span className="image-placeholder">Image unavailable</span>
                )}
              </span>
              <span className="product-copy">
                <strong>{product.title}</strong>
                {product.caption && <small>{product.caption}</small>}
                <span>View object <b aria-hidden="true">↗</b></span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No objects found</h3>
          <p>Try a broader word such as “wood,” “icon,” “embroidered,” or “Ukraine.”</p>
        </div>
      )}

      {visibleCount < filtered.length && (
        <button className="load-more" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
          Show more objects
        </button>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" aria-label="Close details" onClick={() => setSelected(null)}>×</button>
            <div className="modal-image">
              {selected.localImage ? (
                <img src={selected.localImage} alt={selected.imageAlt} />
              ) : (
                <span className="image-placeholder">Image unavailable</span>
              )}
            </div>
            <div className="modal-copy">
              <p className="eyebrow">From the Arka archive</p>
              <h3 id="product-title">{selected.title}</h3>
              {selected.caption && <p>{selected.caption}</p>}
              {selected.description && <p>{selected.description}</p>}
              <div className="modal-note">
                <strong>Interested in this piece?</strong>
                <span>Call the store to ask about current availability.</span>
              </div>
              <a className="button-primary" href="tel:+12124733550">Call 212-473-3550</a>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
