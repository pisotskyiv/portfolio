import { ImageResponse } from "next/og";

// Apple touch icon: 180x180 PNG, edge-to-edge opaque fill (iOS applies its own
// rounded-corner mask, so no border-radius / transparency here). Same VP brand
// mark as the favicon.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        VP
      </div>
    ),
    { ...size },
  );
}
