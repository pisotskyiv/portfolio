import Link from "next/link";

export default function CaseStudyNotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-12 text-center"
    >
      <p className="eyebrow">404</p>
      <h1 className="text-2xl font-bold text-text">Case study not found</h1>
      <p className="text-sm text-muted">
        This project page doesn&apos;t exist yet.
      </p>
      <Link
        href="/#work"
        className="text-sm text-accent transition-colors hover:text-accent-hover focus-ring"
      >
        Back to work
      </Link>
    </main>
  );
}
