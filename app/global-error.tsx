"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-12 text-center">
          <p className="eyebrow">Error</p>
          <h1 className="text-2xl font-bold text-text">Something went wrong</h1>
          <p className="text-sm text-muted">An unexpected error occurred. Please try again.</p>
          <button
            onClick={reset}
            className="text-sm text-accent transition-colors hover:text-accent-hover focus-ring"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
