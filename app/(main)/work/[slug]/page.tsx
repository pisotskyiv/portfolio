import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/sections/Nav";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { TableOfContents } from "@/components/ui/TableOfContents";
import { TldrBlock } from "@/components/ui/TldrBlock";
import { caseStudies } from "@/lib/case-studies";
import { projects } from "@/lib/projects";

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(caseStudies).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  const canonical = project.caseStudy ?? `/work/${slug}`;
  const title = `${project.title} — Case Study`;
  return {
    title,
    description: project.description,
    alternates: { canonical },
    // og:image is supplied by the sibling opengraph-image.tsx (per-project).
    openGraph: {
      title,
      description: project.description,
      type: "article",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.description,
    },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = caseStudies[slug];
  const project = projects.find((p) => p.slug === slug);

  if (!caseStudy || !project) {
    notFound();
  }

  const tocItems = [
    { id: "tldr", heading: "TL;DR" },
    ...caseStudy.sections.map(({ id, heading }) => ({ id, heading })),
  ];

  return (
    <>
      <ScrollProgress />
      <Nav />
      <main id="main-content" className="mx-auto max-w-5xl px-12 py-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_220px]">
          <article className="flex flex-col gap-12">
            <header className="flex flex-col gap-2">
              <p className="eyebrow">{project.role}</p>
              <h1 className="text-3xl font-bold text-text md:text-4xl">
                {project.title}
              </h1>
            </header>

            <TldrBlock>{caseStudy.tldr}</TldrBlock>

            {caseStudy.sections.map((section) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2
                  id={section.id}
                  className="mb-5 border-l-2 border-accent pl-3 text-lg font-bold text-text md:text-xl"
                >
                  {section.heading}
                </h2>
                <div className="flex flex-col gap-4">
                  {section.body.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-muted md:text-base lg:text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents items={tocItems} />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
