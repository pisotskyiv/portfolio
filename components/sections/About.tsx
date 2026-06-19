import { siteConfig } from "@/lib/site";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="px-12 py-20"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p
          id="about-heading"
          role="heading"
          aria-level={2}
          className="mb-10 text-xs uppercase tracking-[0.2em] text-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          About
        </p>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[3fr_2fr]">
          <div>
            <p className="text-base leading-relaxed text-muted sm:text-lg">
              {siteConfig.about}
            </p>
            <a
              href={siteConfig.links.resume}
              aria-label="Download resume"
              className="mt-8 inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Resume
            </a>
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <p
                className="mb-4 text-xs uppercase tracking-[0.2em] text-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Education
              </p>
              <ul className="flex list-none flex-col gap-4 pl-0" role="list">
                {siteConfig.education.map((entry) => (
                  <li key={entry.school}>
                    <p className="text-sm font-medium text-text">
                      {entry.program}
                    </p>
                    <p className="text-xs text-muted">
                      {entry.school} &middot; {entry.year}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className="mb-2 text-xs uppercase tracking-[0.2em] text-muted"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Location
              </p>
              <p className="text-sm text-text">{siteConfig.location}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
