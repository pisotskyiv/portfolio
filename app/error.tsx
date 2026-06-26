"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-12 text-center"
    >
      <p className="eyebrow">Error</p>
      <h1 className="text-2xl font-bold text-text">Something went wrong</h1>
      <p className="text-sm text-muted">An unexpected error occurred.</p>
      <div className="flex gap-6">
        <button
          onClick={reset}
          className="text-sm text-accent transition-colors hover:text-accent-hover focus-ring"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm text-muted transition-colors hover:text-text focus-ring"
        >
          Reload page
        </Link>
      </div>
    </main>
  );
}
