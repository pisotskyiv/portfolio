import { ImageResponse } from "next/og";
import { projects } from "@/lib/projects";
import { caseStudies } from "@/lib/case-studies";
import { siteConfig } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Case study";

export function generateStaticParams() {
  return Object.keys(caseStudies).map((slug) => ({ slug }));
}

// Per-project social card, text-rendered (no image assets). Mirrors the root
// opengraph-image so case-study links unfurl with the project's own title.
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  const title = project?.title ?? siteConfig.name;
  const description = project?.description ?? siteConfig.pitch;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#100D0A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}
        >
          <div
            style={{
              width: "4px",
              height: "44px",
              background: "#C3753A",
              marginRight: "20px",
            }}
          />
          <span
            style={{
              fontSize: "16px",
              color: "#8C7D74",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Case Study
          </span>
        </div>

        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#F5EDE4",
            lineHeight: 1.05,
            marginBottom: "32px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: "26px",
            color: "#8C7D74",
            maxWidth: "900px",
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "64px",
            right: "80px",
            fontSize: "16px",
            color: "#C3753A",
            letterSpacing: "0.05em",
          }}
        >
          pisotskyiv.dev
        </div>
      </div>
    ),
    { ...size },
  );
}
