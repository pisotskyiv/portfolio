import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-medium text-text transition-colors hover:text-accent"
        >
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-6">
          <a
            href="#work"
            className="text-sm text-muted transition-colors hover:text-text"
          >
            Work
          </a>
          <a
            href="#about"
            className="text-sm text-muted transition-colors hover:text-text"
          >
            About
          </a>
          <a
            href="#contact"
            className="text-sm text-muted transition-colors hover:text-text"
          >
            Contact
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted transition-colors hover:text-text"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}
