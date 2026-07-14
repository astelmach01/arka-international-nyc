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
  category: string;
};

type ArchivePost = {
  id: number;
  date: string;
  isoDate: string;
  slug: string;
  title: string;
  excerpt: string;
  provenance: string;
};

const products = productsData as Product[];
const archivePosts = archiveData as ArchivePost[];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const heroProducts = [
  products.find((product) => product.category === "Textiles & clothing" && product.localImage),
  products.find((product) => product.category === "Icons & faith" && product.localImage),
  products.find((product) => product.category === "Pysanky & folk art" && product.localImage),
].filter(Boolean) as Product[];

function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true">А</span>
      <span className="brand-words">
        <strong>Arka International</strong>
        <small>Ukrainian art &amp; heritage · New York</small>
      </span>
    </span>
  );
}

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <div className="utility-bar">
        <p>89 East 2nd Street, New York</p>
        <a href="tel:+12124733550">Questions? Call 212-473-3550</a>
      </div>

      <header className="site-header">
        <a href="#top" aria-label="Arka International home"><Brand /></a>
        <nav aria-label="Main navigation">
          <a href="#collection">Browse objects</a>
          <a href="#about">About Arka</a>
          <a href="#visit">Plan a visit</a>
        </nav>
        <a className="header-call" href="tel:+12124733550">Call the store</a>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="kicker">Serving New York’s Ukrainian community since 1951</p>
            <h1>A Ukrainian treasure in New York.</h1>
            <p className="hero-intro">
              Folk art, embroidery, icons, books, ceramics, and keepsakes from
              Arka’s collection—now easier to explore online.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#collection">Browse the collection</a>
              <a className="button button-secondary" href="tel:+12124733550">Call 212-473-3550</a>
            </div>
            <div className="availability-note">
              <span aria-hidden="true">i</span>
              <p><strong>Looking for something specific?</strong> Call us for current availability, pricing, and store hours.</p>
            </div>
          </div>

          <div className="hero-images" aria-label="Objects from the recovered Arka collection">
            {heroProducts.map((product, index) => (
              <figure className={`hero-object hero-object-${index + 1}`} key={product.id}>
                <img src={`${basePath}${product.localImage}`} alt={product.imageAlt} />
                <figcaption>{product.title}</figcaption>
              </figure>
            ))}
            <div className="hero-pattern" aria-hidden="true" />
          </div>
        </section>

        <section className="how-it-works" aria-labelledby="how-title">
          <div className="how-heading">
            <p className="kicker">Simple ways to explore</p>
            <h2 id="how-title">Find what you love in three steps.</h2>
          </div>
          <ol>
            <li><span>1</span><div><strong>Browse or search</strong><p>Choose a category, or type a simple word.</p></div></li>
            <li><span>2</span><div><strong>Open an object</strong><p>See the recovered photograph and description.</p></div></li>
            <li><span>3</span><div><strong>Call the store</strong><p>Ask whether it is available before visiting.</p></div></li>
          </ol>
        </section>

        <Catalog products={products} basePath={basePath} />

        <section className="about" id="about">
          <div className="about-art">
            <img src={`${basePath}/story-textile.webp`} alt="Original Ukrainian folk-art inspired botanical textile illustration" loading="lazy" />
          </div>
          <div className="about-copy">
            <p className="kicker">About Arka</p>
            <h2>A bridge between generations.</h2>
            <p className="about-lead">
              Arka International has been a home for Ukrainian art, craft, language,
              and memory in New York’s East Village since 1951.
            </p>
            <p>
              This site brings together Arka’s photographs and descriptions in a
              clearer collection that is easier for everyone to navigate.
            </p>
            <a className="text-link" href="#visit">See the store address and hours <span aria-hidden="true">→</span></a>
          </div>
        </section>

        <section className="visit" id="visit">
          <div className="visit-intro">
            <p className="kicker">Plan a visit</p>
            <h2>Come see Arka in the East Village.</h2>
            <p>Call before visiting so the store can confirm today’s hours and whether a particular object is available.</p>
          </div>

          <div className="visit-card">
            <div className="visit-row">
              <span>Address</span>
              <address>89 East 2nd Street<br />Corner of 1st Avenue<br />New York, NY 10009</address>
            </div>
            <div className="visit-row">
              <span>Phone</span>
              <a href="tel:+12124733550">212-473-3550</a>
            </div>
            <div className="visit-row">
              <span>Summer hours</span>
              <p>Thursday, 12-5 pm<br />Saturday, 12-4 pm</p>
            </div>
            <div className="visit-actions">
              <a className="button button-light" href="tel:+12124733550">Call the store</a>
              <a className="button button-outline-light" href="https://maps.google.com/?q=89+East+2nd+Street+New+York+NY+10009">Open in maps</a>
            </div>
          </div>
        </section>

        <section className="recovery" aria-labelledby="recovery-title">
          <div className="recovery-copy">
            <p className="kicker">Website recovery</p>
            <h2 id="recovery-title">What happened to the old posts?</h2>
            <p>
              The former WordPress site contained thousands of injected gambling and
              spam posts. Those records were preserved privately for forensic purposes
              but were never published here.
            </p>
          </div>
          <details className="recovery-details">
            <summary>
              <span><strong>View 9 safe legacy records</strong><small>These appear to be WordPress theme samples, not Arka articles.</small></span>
              <b aria-hidden="true">+</b>
            </summary>
            <div className="archive-list">
              {archivePosts.map((post) => (
                <article key={post.id}>
                  <p><time dateTime={post.isoDate}>{post.date}</time><span>{post.provenance}</span></p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </article>
              ))}
            </div>
          </details>
        </section>
      </main>

      <footer>
        <Brand />
        <div className="footer-contact">
          <a href="tel:+12124733550">212-473-3550</a>
          <span>89 East 2nd Street, New York, NY 10009</span>
        </div>
        <p>Recovered with care. Call to confirm all current details.</p>
      </footer>

      <a className="mobile-call-bar" href="tel:+12124733550">Call Arka · 212-473-3550</a>
    </>
  );
}
