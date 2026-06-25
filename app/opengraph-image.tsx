import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
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
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "40px",
        }}
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
          {siteConfig.title}
        </span>
      </div>

      <div
        style={{
          fontSize: "80px",
          fontWeight: 700,
          color: "#F5EDE4",
          lineHeight: 1,
          marginBottom: "32px",
        }}
      >
        {siteConfig.name}
      </div>

      <div
        style={{
          fontSize: "26px",
          color: "#8C7D74",
          maxWidth: "820px",
          lineHeight: 1.5,
        }}
      >
        {siteConfig.pitch}
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
    </div>,
    { ...size },
  );
}
