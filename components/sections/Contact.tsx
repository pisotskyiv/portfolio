import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="px-12 py-20"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p
          id="contact-heading"
          role="heading"
          aria-level={2}
          className="mb-10 text-xs uppercase tracking-[0.2em] text-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Contact
        </p>
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Open to full-stack and AI-focused roles. Best reached by email.
          </p>
          <ul className="flex list-none flex-col gap-4 pl-0 sm:flex-row sm:gap-8" role="list">
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label="Email"
                className="flex items-center gap-1 text-sm text-text transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {siteConfig.email}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                GitHub
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={siteConfig.links.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                LinkedIn
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
