import { ImageResponse } from "next/og";
import { loadInterBlack } from "@/lib/og-fonts";

// Generated as a raster PNG (not SVG) so Google's favicon-in-search reliably
// picks it up; 96x96 satisfies the "square, multiple of 48px" guideline and
// downscales cleanly for the browser tab. Brand mark is fixed (dark surface,
// copper VP) regardless of the active site theme.
//
// Inter Black (900) is fetched from Google Fonts at request time; the edge
// runtime ships only Inter 400/700, so we load 900 explicitly to avoid
// synthesized-bold artifacts.
export const runtime = "edge";
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default async function Icon() {
  const fontData = await loadInterBlack();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#100D0A",
          color: "#E08535",
          fontSize: 58,
          fontWeight: 900,
          fontFamily: "Inter",
          letterSpacing: -2,
          borderRadius: 18,
        }}
      >
        VP
      </div>
    ),
    {
      ...size,
      ...(fontData && {
        fonts: [{ name: "Inter", data: fontData, weight: 900, style: "normal" as const }],
      }),
    },
  );
}
