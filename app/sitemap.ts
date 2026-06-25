import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";

const BASE_URL = "https://www.pisotskyiv.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const caseStudies = projects
    .filter((p): p is typeof p & { caseStudy: string } => Boolean(p.caseStudy))
    .map((p) => ({
      url: `${BASE_URL}${p.caseStudy}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...caseStudies,
  ];
}
