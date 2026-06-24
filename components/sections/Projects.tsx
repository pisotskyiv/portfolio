import { ArrowUpRight } from "lucide-react";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import Link from "next/link";
import { projects, type Project } from "@/lib/projects";

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {project.caseStudy && (
        <Link
          href={project.caseStudy}
          aria-label={`Read ${project.title} case study`}
          className="inline-flex items-center gap-1 text-sm text-accent transition-colors hover:text-accent-hover focus-ring"
        >
          Case study
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      )}
      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${project.title} live`}
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-text focus-ring"
        >
          Live
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      )}
      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${project.title} on GitHub`}
          className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-text focus-ring"
        >
          <GitHubIcon size={13} className="text-accent transition-colors group-hover:text-accent-hover" />
        </a>
      )}
    </div>
  );
}

export function Projects() {
  return (
    <section id="work" aria-labelledby="work-heading" className="section">
      <div className="container-page flex flex-col gap-10">
        <h2
          id="work-heading"
          className="eyebrow"
        >
          Selected Work
        </h2>
        <ul className="flex flex-col gap-4" role="list">
          {projects.map((project) => (
            <li
              key={project.slug}
              className="flex flex-col gap-3 border border-transparent bg-surface p-8 transition-colors hover:border-accent"
            >
              {project.highlight && (
                <p className="text-xs font-medium uppercase tracking-badge text-accent">
                  {project.highlight}
                </p>
              )}
              <h3 className="text-xl font-bold text-text">{project.title}</h3>
              <p className="text-base leading-relaxed text-muted">
                {project.description}
              </p>
              <ul
                className="flex flex-wrap gap-2"
                aria-label="Technologies used"
                role="list"
              >
                {project.tech.map((tag) => (
                  <li
                    key={tag}
                    className="border border-border text-[13px] text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <ProjectLinks project={project} />

              {project.children && project.children.length > 0 && (
                <ul className="mt-2 flex flex-col gap-3 border-l-2 border-accent/30 pl-4" role="list">
                  {project.children.map((child) => (
                    <li
                      key={child.slug}
                      className="flex flex-col gap-2 rounded border border-border px-4 py-3"
                    >
                      <h4 className="text-base font-semibold text-text">{child.title}</h4>
                      <p className="text-sm leading-relaxed text-muted">
                        {child.description}
                      </p>
                      <ul
                        className="flex flex-wrap gap-2"
                        aria-label="Technologies used"
                        role="list"
                      >
                        {child.tech.map((tag) => (
                          <li
                            key={tag}
                            className="border border-border text-[13px] text-muted"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                      <ProjectLinks project={child} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
