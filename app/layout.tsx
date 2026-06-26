import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { themeInitScript } from "@/lib/theme";
import { personJsonLdString } from "@/lib/structured-data";
import { AuthProvider } from "@/components/ui/AuthProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const BASE_URL = "https://www.pisotskyiv.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: `${siteConfig.name} — ${siteConfig.title}`,
  description: siteConfig.pitch,
  authors: [{ name: siteConfig.name }],
  // Public Search Console token (not a secret — rendered into page HTML).
  verification: { google: "_nKuqgYjQTkCRDiAfPTabFgOIhKquW7IaZ8xh_otsrs" },
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.pitch,
    type: "website",
    url: BASE_URL,
    siteName: siteConfig.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.pitch,
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: personJsonLdString() }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-text"
        >
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
