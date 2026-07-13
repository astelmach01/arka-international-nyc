import productsData from "../data/products.json";
import archiveData from "../data/archive.json";
import { Catalog } from "./catalog";

export type Product = {
  id: number;
  slug: string;
  title: string;
  caption: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  localImage?: string;
};

const products = productsData as Product[];
const heroProducts = products.filter((product) => product.localImage).slice(0, 3);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type ArchivePost = {
  id: number;
  date: string;
  isoDate: string;
  slug: string;
  title: string;
  excerpt: string;
  provenance: string;
};

const archivePosts = archiveData as ArchivePost[];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Arka International home">
          <span className="brand-mark" aria-hidden="true">А</span>
          <span>
            <strong>Arka International</strong>
            <small>New York · Since 1951</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#collection">Collection</a>
          <a className="nav-secondary" href="#story">Our story</a>
          <a className="nav-secondary" href="#archive">Archive</a>
          <a className="nav-visit" href="#visit">Visit the store</a>
        </nav>
      </header>

      <main id="main-content">

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Ukrainian heritage in the East Village</p>
          <h1>Objects with a story.<br />Traditions with a home.</h1>
          <p className="hero-intro">
            Discover folk art, handcrafts, textiles, icons, books, and keepsakes
            gathered across generations.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#collection">Explore the collection</a>
            <a className="button-secondary" href="tel:+12124733550">Call 212-473-3550</a>
          </div>
          <p className="archive-note">
            This online collection was recovered from Arka’s original catalog.
            Please call to confirm current availability.
          </p>
        </div>
        <div className="hero-gallery" aria-label="Highlights from the Arka collection">
          {heroProducts.map((product, index) => (
            <figure className={`hero-image hero-image-${index + 1}`} key={product.id}>
              <img src={`${basePath}${product.localImage}`} alt={product.imageAlt} />
            </figure>
          ))}
          <div className="hero-seal" aria-hidden="true">From Ukraine<br />to New York</div>
        </div>
      </section>

      <section className="collection-section" id="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The recovered archive</p>
            <h2>Explore the collection</h2>
          </div>
          <p>
            Browse {products.length} objects preserved from the original Arka catalog.
            Search by name, material, artist, or description.
          </p>
        </div>
        <Catalog products={products} basePath={basePath} />
      </section>

      <section className="story" id="story">
        <div className="story-pattern" aria-hidden="true">
          <span>АРКА</span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">A New York institution</p>
          <h2>A bridge between cultures, built object by object.</h2>
          <p>
            Arka International has long been a neighborhood home for Ukrainian
            art, culture, and memory. The shop’s collection brings together
            traditional craftsmanship and the stories carried by every piece.
          </p>
          <p>
            This rebuilt catalog preserves the photographs and descriptions from
            Arka’s earlier website while making them easier to discover and share.
          </p>
        </div>
      </section>

      <section className="archive" id="archive">
        <div className="archive-intro">
          <div>
            <p className="eyebrow">Legacy archive</p>
            <h2>What survived the old website.</h2>
          </div>
          <div className="archive-context">
            <p>
              These nine safe posts were recovered exactly enough to identify them,
              but they appear to be sample entries installed with the old WordPress
              theme—not Arka news or store history.
            </p>
            <p className="archive-safety">
              Compromised posts and hidden links remain quarantined and are not
              included anywhere on this site.
            </p>
          </div>
        </div>
        <div className="archive-grid">
          {archivePosts.map((post, index) => (
            <article className="archive-card" key={post.id}>
              <div className="archive-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <p className="archive-meta">
                  <time dateTime={post.isoDate}>{post.date}</time>
                  <span>{post.provenance}</span>
                </p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="visit" id="visit">
        <div>
          <p className="eyebrow">Come say hello</p>
          <h2>Visit Arka in the East Village.</h2>
          <address>
            89 East 2nd Street<br />
            Corner of 1st Avenue<br />
            New York, NY 10009
          </address>
        </div>
        <div className="visit-details">
          <div>
            <span>Recovered store hours</span>
            <p>Tuesday–Friday, 12–6 pm · Saturday by appointment</p>
          </div>
          <div>
            <span>Phone</span>
            <a href="tel:+12124733550">212-473-3550</a>
          </div>
          <div>
            <span>Before visiting</span>
            <p>Call to confirm today’s hours and item availability.</p>
          </div>
          <a className="button-light" href="https://maps.google.com/?q=89+East+2nd+Street+New+York+NY+10009">
            Get directions
          </a>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">А</span>
          <span><strong>Arka International</strong><small>New York, NY</small></span>
        </div>
        <p>Preserving Ukrainian craft, culture, and memory.</p>
        <a href="tel:+12124733550">212-473-3550</a>
      </footer>
      </main>
    </>
  );
}
