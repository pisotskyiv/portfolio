import { ImageResponse } from "next/og";
import { loadInterBlack } from "@/lib/og-fonts";

// Apple touch icon: 180x180 PNG, edge-to-edge opaque fill (iOS applies its own
// rounded-corner mask, so no border-radius / transparency here). Same VP brand
// mark as the favicon.
export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          fontSize: 115,
          fontWeight: 900,
          fontFamily: "Inter",
          letterSpacing: -4,
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
