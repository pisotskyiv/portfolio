import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="flex min-h-[calc(100vh-4rem)] items-center px-6 py-20"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p
          className="mb-6 text-xs uppercase tracking-[0.2em] text-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {siteConfig.title}
        </p>
        <h1
          id="hero-heading"
          className="mb-8 max-w-3xl text-5xl font-bold leading-none tracking-tight text-text sm:text-6xl md:text-7xl lg:text-8xl"
        >
          {siteConfig.name}
        </h1>
        <p className="mb-12 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
          {siteConfig.shortPitch}
        </p>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <a
            href="#work"
            className="inline-flex min-h-11 items-center bg-accent px-6 py-3 text-sm font-medium text-text transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            View Work
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="flex min-h-11 items-center gap-1 text-sm text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            GitHub
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="flex min-h-11 items-center gap-1 text-sm text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            LinkedIn
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
