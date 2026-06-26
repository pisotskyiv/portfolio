import { ImageResponse } from "next/og";

// Generated as a raster PNG (not SVG) so Google's favicon-in-search reliably
// picks it up; 96x96 satisfies the "square, multiple of 48px" guideline and
// downscales cleanly for the browser tab. Brand mark is fixed (copper VP on the
// dark surface) regardless of the active site theme.
export const runtime = "edge";
export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
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
          color: "#C3753A",
          fontSize: 52,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 18,
        }}
      >
        VP
      </div>
    ),
    { ...size },
  );
}
