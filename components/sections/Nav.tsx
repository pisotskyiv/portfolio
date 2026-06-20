"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import clsx from "clsx";
import { GitHubIcon } from "@/components/ui/GitHubIcon";
import { siteConfig } from "@/lib/site";
import { NavLink } from "@/components/ui/NavLink";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 h-16 border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-bg/90 backdrop-blur-sm"
          : "border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-full max-w-5xl items-center justify-between px-12"
      >
        <Link
          href="/"
          aria-label="Vlad Pisotski"
          className="font-bold text-accent transition-colors hover:text-accent-hover focus-ring"
        >
          VP
        </Link>
        <div className="flex items-center gap-x-6">
          <NavLink href="#work">Work</NavLink>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#contact">Contact</NavLink>
          <NavLink href={siteConfig.links.github} external aria-label="GitHub">
            <GitHubIcon size={15} className="text-accent transition-colors group-hover:text-accent-hover" />
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
