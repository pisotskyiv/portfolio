import { siteConfig } from "./site";

export const SITE_URL = "https://www.pisotskyiv.dev";

/**
 * schema.org Person structured data. `alternateName` lists the name variants so
 * search engines treat them as one entity; `sameAs` links authoritative
 * profiles to corroborate identity for the Knowledge Graph.
 */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  alternateName: siteConfig.alternateNames,
  url: SITE_URL,
  jobTitle: siteConfig.title,
  description: siteConfig.shortPitch,
  address: {
    "@type": "PostalAddress",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    addressCountry: "US",
  },
  sameAs: [siteConfig.links.github, siteConfig.links.linkedin],
} as const;

/** Serialized for a <script type="application/ld+json"> tag, `<` escaped. */
export function personJsonLdString(): string {
  return JSON.stringify(personJsonLd).replace(/</g, "\\u003c");
}
