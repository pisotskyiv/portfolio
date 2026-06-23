import clsx from "clsx";
import { siteConfig } from "@/lib/site";

interface ContactFallbackProps {
  /** Context line shown before the LinkedIn link. */
  message?: string;
  className?: string;
}

const DEFAULT_MESSAGE = "Prefer to reach out directly?";

/**
 * Reusable degraded-path prompt: a short message plus a LinkedIn scheduling
 * link. Used wherever the in-app booking path is unavailable — popup blocked,
 * not signed in, or a booking error.
 */
export function ContactFallback({
  message = DEFAULT_MESSAGE,
  className,
}: ContactFallbackProps) {
  return (
    <p className={clsx("text-[11px] text-muted", className)}>
      {message}{" "}
      <a
        href={siteConfig.links.linkedin}
        target="_blank"
        rel="noreferrer"
        className="text-accent hover:underline focus-ring"
      >
        Schedule via LinkedIn
      </a>
    </p>
  );
}
