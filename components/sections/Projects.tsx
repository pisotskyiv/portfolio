import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/projects";

export function Projects() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="px-12 py-20"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p
          id="work-heading"
          className="mb-10 text-xs uppercase tracking-[0.2em] text-muted"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Selected Work
        </p>
        <ul className="flex list-none flex-col gap-4 pl-0" role="list">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="border border-transparent bg-surface p-8 transition-colors hover:border-accent"
            >
              {project.highlight && (
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-accent">
                  {project.highlight}
                </p>
              )}
              <h3 className="mb-3 text-xl font-bold text-text">{project.title}</h3>
              <p className="mb-6 text-sm leading-relaxed text-muted">{project.description}</p>
              <ul className="mb-6 flex list-none flex-wrap gap-2 pl-0" aria-label="Technologies used" role="list">
                {project.tech.map((tag) => (
                  <li
                    key={tag}
                    className="border border-border py-1 pr-3 text-xs text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${project.title} on GitHub`}
                className="inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                View
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
