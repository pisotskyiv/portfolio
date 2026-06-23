import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/Button";
import { FragmentedPortraitClient } from "@/components/ui/FragmentedPortraitClient";

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="section flex min-h-[calc(100svh-4rem)] items-center"
    >
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-16 lg:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-6">
          <p
            className="eyebrow"
          >
            {siteConfig.title}
          </p>
          <h1
            id="hero-heading"
            className="max-w-3xl text-5xl font-bold leading-none tracking-tight text-text sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {siteConfig.name}
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            {siteConfig.shortPitch}
          </p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Button href="#work" variant="outline">
              View Work
            </Button>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex min-h-11 items-center gap-1 text-sm text-muted transition-colors hover:text-text focus-ring"
            >
              GitHub
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex min-h-11 items-center gap-1 text-sm text-muted transition-colors hover:text-text focus-ring"
            >
              LinkedIn
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="hidden lg:block">
          <FragmentedPortraitClient src="/portrait.jpg" alt="Vlad Pisotskyi" />
        </div>
      </div>
    </section>
  );
}
