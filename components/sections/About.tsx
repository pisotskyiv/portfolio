import { siteConfig } from "@/lib/site";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="section"
    >
      <div className="container-page flex flex-col gap-8">
        <p
          id="about-heading"
          role="heading"
          aria-level={2}
          className="eyebrow"
        >
          About
        </p>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-6">
            <p className="text-base leading-relaxed text-muted sm:text-lg">
              {siteConfig.about}
            </p>
            <a
              href={siteConfig.links.resume}
              aria-label="Download resume"
              className="inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-hover focus-ring"
            >
              Resume
            </a>
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <p className="eyebrow">
                Education
              </p>
              <ul className="flex flex-col gap-4" role="list">
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
            <div className="flex flex-col gap-1">
              <p className="eyebrow">
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
