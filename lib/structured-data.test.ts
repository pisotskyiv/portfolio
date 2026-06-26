import { describe, expect, it } from "vitest";
import { personJsonLd, personJsonLdString } from "./structured-data";
import { siteConfig } from "./site";

describe("personJsonLd", () => {
  it("is a schema.org Person", () => {
    expect(personJsonLd["@context"]).toBe("https://schema.org");
    expect(personJsonLd["@type"]).toBe("Person");
  });

  it("uses the canonical name and lists every variant as alternateName", () => {
    expect(personJsonLd.name).toBe(siteConfig.name);
    expect(personJsonLd.alternateName).toEqual(
      expect.arrayContaining([
        "Volodymyr Pisotskyi",
        "Vlad Pisotski",
        "Volodymyr Pisotski",
      ]),
    );
  });

  it("links authoritative profiles via sameAs", () => {
    expect(personJsonLd.sameAs).toContain(siteConfig.links.github);
    expect(personJsonLd.sameAs).toContain(siteConfig.links.linkedin);
  });

  it("points url at the production origin", () => {
    expect(personJsonLd.url).toBe("https://www.pisotskyiv.dev");
  });
});

describe("personJsonLdString", () => {
  it("produces valid JSON that round-trips to the object", () => {
    expect(JSON.parse(personJsonLdString())).toEqual(personJsonLd);
  });

  it("escapes < so it cannot break out of the script tag", () => {
    expect(personJsonLdString()).not.toMatch(/</);
  });
});
