import { useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGES, commonLinks, content, photographyAssets } from "./content.js";

const SECTION_IDS = ["top", "work", "playground", "contact"];
const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, "");

const SPLASH_NOTES = [
  { left: "7%", top: "-92px", width: 108, height: 82, color: "#FEF3C7", delay: "0ms", duration: "2300ms", rotFrom: "-8deg", rotTo: "22deg" },
  { left: "21%", top: "-130px", width: 92, height: 92, color: "#DCFCE7", delay: "80ms", duration: "2600ms", rotFrom: "10deg", rotTo: "-28deg" },
  { left: "38%", top: "-104px", width: 118, height: 72, color: "#E0E7FF", delay: "160ms", duration: "2450ms", rotFrom: "-14deg", rotTo: "26deg" },
  { left: "54%", top: "-132px", width: 96, height: 96, color: "#FCE7F3", delay: "40ms", duration: "2700ms", rotFrom: "12deg", rotTo: "-20deg" },
  { left: "70%", top: "-88px", width: 104, height: 76, color: "#E0F2FE", delay: "130ms", duration: "2400ms", rotFrom: "-6deg", rotTo: "18deg" },
  { left: "84%", top: "-124px", width: 90, height: 88, color: "#FDE68A", delay: "220ms", duration: "2800ms", rotFrom: "18deg", rotTo: "-34deg" },
  { left: "13%", top: "-180px", width: 88, height: 74, color: "#F5F3FF", delay: "260ms", duration: "2550ms", rotFrom: "6deg", rotTo: "32deg" },
  { left: "47%", top: "-188px", width: 110, height: 82, color: "#ECFCCB", delay: "320ms", duration: "2900ms", rotFrom: "-16deg", rotTo: "24deg" },
  { left: "76%", top: "-178px", width: 98, height: 86, color: "#FFE4E6", delay: "360ms", duration: "2650ms", rotFrom: "4deg", rotTo: "-26deg" },
];

function withBasePath(path) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  return `${import.meta.env.BASE_URL}${path.slice(1)}`;
}

function routePath(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${import.meta.env.BASE_URL}${normalizedPath.slice(1)}`;
}

function currentRoutePath() {
  if (typeof window === "undefined") {
    return "/";
  }

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  if (!BASE_PATH) {
    return pathname;
  }

  if (pathname === BASE_PATH) {
    return "/";
  }

  if (pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length) || "/";
  }

  return pathname;
}

function pageFromLocation() {
  return currentRoutePath() === "/photography" ? "photography" : "home";
}

function isExternalLink(href) {
  return href.startsWith("http");
}

function isDownloadLink(href) {
  return href.endsWith(".pdf");
}

function scrollToSection(sectionId, behavior = "smooth") {
  if (sectionId === "top") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  document.getElementById(sectionId)?.scrollIntoView({ behavior, block: "start" });
}

function useInView({ threshold = 0.16, rootMargin = "0px 0px -8% 0px" } = {}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return [elementRef, isVisible];
}

function Reveal({ children, className = "", as: Element = "div", delay = 0 }) {
  const [revealRef, isVisible] = useInView();

  return (
    <Element
      ref={revealRef}
      className={`reveal ${isVisible ? "is-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Element>
  );
}

function RichText({ parts }) {
  return parts.map((part, index) => (
    part.strong ? <strong key={`${part.text}-${index}`}>{part.text}</strong> : <span key={`${part.text}-${index}`}>{part.text}</span>
  ));
}

function CustomCursor({ label }) {
  const [position, setPosition] = useState({ x: -80, y: -80 });

  useEffect(() => {
    const handlePointerMove = (event) => {
      setPosition({ x: event.clientX + 4, y: event.clientY + 4 });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div className="custom-cursor" style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }} aria-hidden="true">
      <svg className="cursor-arrow" width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2L17.8 13.4L10.5 14.3L7 21.2L2 2Z" fill="black" stroke="white" strokeWidth="1.4" />
      </svg>
      <span className="cursor-label">{label}</span>
    </div>
  );
}

function SplashOverlay({ labels, isFading }) {
  return (
    <div className={`splash-overlay ${isFading ? "is-fading" : ""}`} aria-hidden="true">
      {SPLASH_NOTES.map((note, index) => (
        <div
          key={`${note.left}-${note.top}`}
          className="splash-note"
          style={{
            left: note.left,
            top: note.top,
            width: `${note.width}px`,
            height: `${note.height}px`,
            background: note.color,
            "--fall-delay": note.delay,
            "--fall-dur": note.duration,
            "--rot-from": note.rotFrom,
            "--rot-to": note.rotTo,
          }}
        >
          <span className="splash-note-label">{labels[index % labels.length]}</span>
        </div>
      ))}
    </div>
  );
}

function LanguageToggle({ language, setLanguage, label, setCursorLabel }) {
  return (
    <div className="language-toggle" role="group" aria-label={label}>
      {LANGUAGES.map((languageCode) => (
        <button
          key={languageCode}
          type="button"
          className={`language-toggle-button ${language === languageCode ? "language-toggle-active" : ""}`}
          aria-pressed={language === languageCode}
          onClick={() => setLanguage(languageCode)}
          onPointerEnter={() => setCursorLabel(languageCode.toUpperCase())}
          onPointerLeave={() => setCursorLabel(null)}
        >
          {languageCode.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function NavPill({ copy, activeSection, page, language, setLanguage, navigateSection, setCursorLabel }) {
  return (
    <nav className="nav-pill-wrap" aria-label="Primary navigation">
      <div className="nav-pill">
        {SECTION_IDS.map((sectionId) => (
          <button
            key={sectionId}
            type="button"
            className={`nav-pill-link ${page === "home" && activeSection === sectionId ? "nav-pill-active" : ""}`}
            onClick={() => navigateSection(sectionId)}
            onPointerEnter={() => setCursorLabel(copy.nav[sectionId])}
            onPointerLeave={() => setCursorLabel(null)}
          >
            {copy.nav[sectionId]}
          </button>
        ))}
        <span className="nav-pill-divider" aria-hidden="true" />
        <LanguageToggle
          language={language}
          setLanguage={setLanguage}
          label={copy.languageLabel}
          setCursorLabel={setCursorLabel}
        />
      </div>
    </nav>
  );
}

function Ticker({ items }) {
  const repeatedItems = [...items, ...items];

  return (
    <div className="ticker-outer" aria-hidden="true">
      <div className="ticker-track">
        {repeatedItems.map((item, index) => (
          <span className="ticker-item" key={`${item}-${index}`}>
            <span>{item}</span>
            <span className="ticker-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Hero({ copy, navigateSection, setCursorLabel }) {
  return (
    <section id="top" className="hs" aria-labelledby="hero-heading">
      <div className="hs-container">
        <div className="hs-left">
          <h1 id="hero-heading" className="hs-headline">
            <span className="hs-enter-greeting hero-line-block">{copy.hero.greeting}</span>
            <span className="hs-enter-name hero-line-block">{copy.hero.name}</span>
          </h1>
          <p className="hs-sub hs-enter-bio">
            <RichText parts={copy.hero.bio} />
          </p>
          <div className="hs-scroll-row hs-enter-scroll">
            <button
              type="button"
              className="hs-cursor-decor hero-mini-link"
              onClick={() => navigateSection("work")}
              onPointerEnter={() => setCursorLabel(copy.hero.workCta)}
              onPointerLeave={() => setCursorLabel(null)}
            >
              {copy.hero.workCta}
            </button>
            <div className="hs-scroll-indicator" aria-hidden="true">
              <span className="hs-scroll-line" />
              <span className="hs-scroll-label">{copy.hero.scroll}</span>
            </div>
          </div>
        </div>
        <div className="hs-right">
          <div className="hs-img-float">
            <img className="hs-person-img hs-enter-photo" src={withBasePath(copy.hero.image)} alt={copy.hero.imageAlt} />
          </div>
        </div>
      </div>
      <div className="hs-scroll-strip">
        <Ticker items={copy.ticker} />
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, subtitle, headingId }) {
  return (
    <Reveal className="section-heading">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 id={headingId} className="section-h2">{title}</h2>
      {subtitle && <p className="section-sub">{subtitle}</p>}
    </Reveal>
  );
}

function WorkSampleLightbox({ gallery, setGallery }) {
  const sampleCount = gallery?.samples?.length ?? 0;
  const selectedSample = sampleCount ? gallery.samples[gallery.index] : null;

  const moveSample = (direction) => {
    setGallery((currentGallery) => {
      const currentCount = currentGallery?.samples?.length ?? 0;
      if (!currentCount) {
        return currentGallery;
      }

      return {
        ...currentGallery,
        index: (currentGallery.index + direction + currentCount) % currentCount,
      };
    });
  };

  useEffect(() => {
    if (!gallery) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setGallery(null);
      }

      if (event.key === "ArrowLeft") {
        moveSample(-1);
      }

      if (event.key === "ArrowRight") {
        moveSample(1);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gallery, setGallery]);

  if (!gallery || !selectedSample) {
    return null;
  }

  return (
    <div
      className="work-sample-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={gallery.title}
      onClick={() => setGallery(null)}
    >
      <button
        type="button"
        className="work-sample-close"
        aria-label="Close work sample preview"
        onClick={(event) => {
          event.stopPropagation();
          setGallery(null);
        }}
      >
        ×
      </button>
      <figure className="work-sample-panel" onClick={(event) => event.stopPropagation()}>
        <div className="work-sample-frame">
          {sampleCount > 1 && (
            <button
              type="button"
              className="work-sample-nav work-sample-nav-prev"
              aria-label="Previous work sample"
              onClick={() => moveSample(-1)}
            >
              ‹
            </button>
          )}
          <img className="work-sample-image" src={withBasePath(selectedSample.image)} alt={selectedSample.alt} />
          {sampleCount > 1 && (
            <button
              type="button"
              className="work-sample-nav work-sample-nav-next"
              aria-label="Next work sample"
              onClick={() => moveSample(1)}
            >
              ›
            </button>
          )}
        </div>
        <figcaption className="work-sample-caption">
          <span className="work-sample-kicker">{gallery.title}</span>
          <span className="work-sample-title">{selectedSample.title}</span>
          <span className="work-sample-meta">{selectedSample.meta}</span>
          <span className="work-sample-counter">{gallery.index + 1} / {sampleCount}</span>
        </figcaption>
      </figure>
    </div>
  );
}

function ProjectRow({ project, navigateSection, setCursorLabel, onOpenSamples }) {
  const [rowRef, isVisible] = useInView({ threshold: 0.22 });
  const isReverse = project.side === "right";
  const hasSamples = Boolean(project.samples?.length);
  const projectHref = hasSamples ? "#work" : project.href;
  const isExternal = isExternalLink(projectHref);

  const handleProjectClick = (event) => {
    if (hasSamples) {
      event.preventDefault();
      onOpenSamples(project);
      return;
    }

    if (projectHref.startsWith("#")) {
      event.preventDefault();
      navigateSection(projectHref.slice(1));
    }
  };

  return (
    <article ref={rowRef} className={`cs-row cs-row-anim ${isVisible ? "cs-row-visible" : ""}`}>
      <a
        className="cs-row-link"
        href={projectHref}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        onClick={handleProjectClick}
        onPointerEnter={() => setCursorLabel(project.cta)}
        onPointerLeave={() => setCursorLabel(null)}
      >
        <div className={`cs-row-grid ${isReverse ? "cs-row-reverse" : ""}`}>
          <div className="cs-row-image cs-row-tilt">
            <img className="cs-row-img-inner" src={withBasePath(project.image)} alt={project.alt} />
            <span className="cs-row-image-overlay" />
          </div>
          <div className="cs-row-text">
            <p className="cs-row-eyebrow">{project.eyebrow}</p>
            <h3 className="cs-row-title">{project.title}</h3>
            <p className="cs-row-body">{project.body}</p>
            <span className="cs-row-cta">{project.cta}</span>
          </div>
        </div>
      </a>
    </article>
  );
}

function CaseStudies({ copy, navigateSection, setCursorLabel }) {
  const [sampleGallery, setSampleGallery] = useState(null);

  const openSamples = (project) => {
    setSampleGallery({
      title: project.sampleGalleryTitle ?? project.eyebrow,
      samples: project.samples,
      index: 0,
    });
  };

  return (
    <section id="work" className="case-studies-section" aria-labelledby="work-heading">
      <div className="container">
        <SectionHeading
          headingId="work-heading"
          eyebrow={copy.work.eyebrow}
          title={copy.work.title}
          subtitle={copy.work.subtitle}
        />
        <div className="case-studies-container">
          {copy.work.projects.map((project) => (
            <ProjectRow
              key={project.eyebrow}
              project={project}
              navigateSection={navigateSection}
              setCursorLabel={setCursorLabel}
              onOpenSamples={openSamples}
            />
          ))}
        </div>
      </div>
      <WorkSampleLightbox gallery={sampleGallery} setGallery={setSampleGallery} />
    </section>
  );
}

function Playground({ copy, navigateSection, navigatePage, setCursorLabel }) {
  const handleCardClick = (event, card) => {
    if (card.href === "/photography") {
      event.preventDefault();
      navigatePage("photography");
      return;
    }

    if (card.href.startsWith("#")) {
      event.preventDefault();
      navigateSection(card.href.slice(1));
    }
  };

  return (
    <section id="playground" className="playground-section" aria-labelledby="playground-heading">
      <div className="pg-paper-wrapper">
        <img className="pg-paper" src={withBasePath("/paperbg.png")} alt="" aria-hidden="true" />
        <div className="pg-content">
          <Reveal>
            <h2 id="playground-heading" className="pg-title">{copy.playground.title}</h2>
            <p className="pg-sub">{copy.playground.subtitle}</p>
          </Reveal>
          <div className="pg-cards">
            {copy.playground.cards.map((card, index) => (
              <a
                key={card.title}
                className={`playground-card ${card.className}`}
                href={card.href === "/photography" ? routePath(card.href) : card.href}
                style={{ transitionDelay: `${index * 55}ms` }}
                onClick={(event) => handleCardClick(event, card)}
                onPointerEnter={() => setCursorLabel(card.title)}
                onPointerLeave={() => setCursorLabel(null)}
              >
                <span className="pg-tape" aria-hidden="true" />
                <img src={withBasePath(card.image)} alt={card.alt} />
                <div className="pg-card-label">
                  <h4>{card.title}</h4>
                  <p>{card.text}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials({ copy, setCursorLabel }) {
  const repeatedCards = [...copy.testimonials.cards, ...copy.testimonials.cards];
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (!selectedCard) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedCard(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCard]);

  return (
    <section className="testimonials-section" aria-labelledby="testimonials-heading">
      <div className="container">
        <SectionHeading
          headingId="testimonials-heading"
          eyebrow={copy.testimonials.eyebrow}
          title={copy.testimonials.title}
          subtitle={copy.testimonials.subtitle}
        />
      </div>
      <div className="testi-outer">
        <div className="testi-track">
          {repeatedCards.map((card, index) => (
            <button
              type="button"
              className="testimonial-card reference-card"
              key={`${card.image}-${index}`}
              aria-label={`Open ${card.name} ${card.role}`}
              onClick={() => setSelectedCard(card)}
              onPointerEnter={() => setCursorLabel(card.name)}
              onPointerLeave={() => setCursorLabel(null)}
            >
              <img
                className="reference-card-image"
                src={withBasePath(card.thumbnail)}
                alt={card.alt}
                loading="lazy"
              />
              <span className="reference-card-meta">
                <span className="testimonial-name">{card.name}</span>
                <span className="testimonial-role">{card.role}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {selectedCard && (
        <div
          className="reference-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedCard.name} ${selectedCard.role}`}
          onClick={() => setSelectedCard(null)}
        >
          <button
            type="button"
            className="reference-lightbox-close"
            aria-label="Close reference preview"
            onClick={(event) => {
              event.stopPropagation();
              setSelectedCard(null);
            }}
          >
            ×
          </button>
          <figure className="reference-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <img className="reference-lightbox-image" src={withBasePath(selectedCard.image)} alt={selectedCard.alt} />
            <figcaption className="reference-lightbox-caption">
              <span>{selectedCard.name}</span>
              <span>{selectedCard.role}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

function Footer({ copy, setCursorLabel }) {
  return (
    <footer id="contact" className="home-footer-v2">
      <div className="footer-cta-block">
        <div className="footer-cta-text">
          <p className="footer-cta-eyebrow">{copy.footer.eyebrow}</p>
          <h2 className="footer-cta-headline">{copy.footer.headline}</h2>
        </div>
        <a
          className="footer-cta"
          href={commonLinks.email}
          onPointerEnter={() => setCursorLabel(copy.footer.cta)}
          onPointerLeave={() => setCursorLabel(null)}
        >
          <span>{copy.footer.cta}</span>
          <span className="footer-cta-arrow">→</span>
        </a>
      </div>
      <div className="footer-row">
        <div className="footer-socials">
          {copy.footer.links.map((link) => {
            const shouldOpenNewTab = isExternalLink(link.href) || isDownloadLink(link.href);
            return (
              <a
                className="social-icon"
                key={link.label}
                href={withBasePath(link.href)}
                target={shouldOpenNewTab ? "_blank" : undefined}
                rel={shouldOpenNewTab ? "noreferrer" : undefined}
                onPointerEnter={() => setCursorLabel(link.label)}
                onPointerLeave={() => setCursorLabel(null)}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
      <div className="footer-bottom-v2">
        <span>{copy.footer.copyright}</span>
        <span className="footer-heart">•</span>
        <span className="footer-tagline">{copy.footer.tagline}</span>
      </div>
    </footer>
  );
}

function HomePage({ copy, navigateSection, navigatePage, setCursorLabel }) {
  return (
    <main className="home-page">
      <Hero copy={copy} navigateSection={navigateSection} setCursorLabel={setCursorLabel} />
      <CaseStudies copy={copy} navigateSection={navigateSection} setCursorLabel={setCursorLabel} />
      <Playground
        copy={copy}
        navigateSection={navigateSection}
        navigatePage={navigatePage}
        setCursorLabel={setCursorLabel}
      />
      <Testimonials copy={copy} setCursorLabel={setCursorLabel} />
      <Footer copy={copy} setCursorLabel={setCursorLabel} />
    </main>
  );
}

function PhotographyPage({ copy }) {
  const hasPhotographyAssets = photographyAssets.length > 0;

  return (
    <main className="photo-page">
      <header className="photo-header">
        <h1 className="photo-title">{copy.photography.title}</h1>
        <p className="photo-sub">{copy.photography.subtitle}</p>
      </header>
      {hasPhotographyAssets ? (
        <div className="photo-masonry">
          {photographyAssets.map((asset, index) => (
            <figure
              className="photo-item"
              key={asset.src}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {asset.type === "video" ? (
                <video src={withBasePath(asset.src)} aria-label={asset.alt} controls muted playsInline preload="metadata" />
              ) : (
                <img src={withBasePath(asset.src)} alt={asset.alt} loading="lazy" />
              )}
            </figure>
          ))}
        </div>
      ) : (
        <p className="photo-empty-state">{copy.photography.empty}</p>
      )}
    </main>
  );
}

export function App() {
  const [language, setLanguage] = useState("en");
  const [page, setPage] = useState(pageFromLocation);
  const [activeSection, setActiveSection] = useState("top");
  const [cursorLabel, setCursorLabel] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [splashIsFading, setSplashIsFading] = useState(false);
  const copy = content[language];
  const displayCursorLabel = cursorLabel ?? copy.cursor;

  const prefersReducedMotion = useMemo(() => (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ), []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = page === "photography"
      ? `${copy.photography.title} · Phan My Anh Nguyen`
      : "Phan My Anh Nguyen · UX/UI Designer";
  }, [copy.photography.title, language, page]);

  useEffect(() => {
    const handlePopState = () => {
      setPage(pageFromLocation());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || page !== "home") {
      setShowSplash(false);
      return undefined;
    }

    const fadeTimer = window.setTimeout(() => setSplashIsFading(true), 2300);
    const hideTimer = window.setTimeout(() => setShowSplash(false), 2850);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [page, prefersReducedMotion]);

  useEffect(() => {
    if (page !== "home") {
      setActiveSection("playground");
      return undefined;
    }

    const updateActiveSection = () => {
      const sectionScores = SECTION_IDS.map((sectionId) => {
        const element = document.getElementById(sectionId);
        if (!element) {
          return { sectionId, score: Number.POSITIVE_INFINITY };
        }

        return { sectionId, score: Math.abs(element.getBoundingClientRect().top - 120) };
      });

      sectionScores.sort((firstSection, secondSection) => firstSection.score - secondSection.score);
      setActiveSection(sectionScores[0]?.sectionId ?? "top");
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [page]);

  useEffect(() => {
    if (page !== "home" || !window.location.hash) {
      return undefined;
    }

    const initialSectionId = window.location.hash.slice(1);
    if (!SECTION_IDS.includes(initialSectionId)) {
      return undefined;
    }

    const hashTimer = window.setTimeout(() => scrollToSection(initialSectionId, "auto"), 120);
    return () => window.clearTimeout(hashTimer);
  }, [page]);

  const navigateSection = (sectionId) => {
    if (page !== "home") {
      window.history.pushState({}, "", routePath("/"));
      setPage("home");
      window.setTimeout(() => scrollToSection(sectionId), 80);
      return;
    }

    scrollToSection(sectionId);
  };

  const navigatePage = (nextPage) => {
    if (nextPage === "photography") {
      window.history.pushState({}, "", routePath("/photography"));
      setPage("photography");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="app">
      {showSplash && <SplashOverlay labels={copy.splash} isFading={splashIsFading} />}
      <CustomCursor label={displayCursorLabel} />
      <NavPill
        copy={copy}
        activeSection={activeSection}
        page={page}
        language={language}
        setLanguage={setLanguage}
        navigateSection={navigateSection}
        setCursorLabel={setCursorLabel}
      />
      {page === "photography" ? (
        <PhotographyPage copy={copy} />
      ) : (
        <HomePage
          copy={copy}
          navigateSection={navigateSection}
          navigatePage={navigatePage}
          setCursorLabel={setCursorLabel}
        />
      )}
    </div>
  );
}
