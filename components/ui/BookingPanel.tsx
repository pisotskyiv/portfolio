"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { ContactFallback } from "./ContactFallback";
import { trackedCalLink } from "@/lib/booking";
import { publishBookingResult } from "@/lib/booking-broadcast";

/** Seconds the visitor sees the "you must finalize" notice before we redirect. */
const REDIRECT_SECONDS = 5;

interface BookingPanelProps {
  date: string;
  time: string;
  /** Human-readable slot, e.g. "Wed Jun 24, 12pm PT". */
  whenLabel: string;
  signedIn: boolean;
  name?: string | null;
  email?: string | null;
}

type Phase = "idle" | "submitting" | "done" | "error";

/**
 * The booking tab's UI. Runs the whole lifecycle in its own tab so the chat tab
 * is never disturbed by the OAuth redirect. On a terminal outcome it broadcasts
 * the result so the chat tab can toast it.
 */
export function BookingPanel({
  date,
  time,
  whenLabel,
  signedIn,
  name,
  email,
}: BookingPanelProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [link, setLink] = useState<string | null>(null);
  const [meetUrl, setMeetUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [message, setMessage] = useState("");
  const finalizeRef = useRef<HTMLAnchorElement>(null);

  // Once booked, hold on the "you must finalize" notice for a few seconds so the
  // visitor reads it, then follow the `Continue now` link for them — a same-tab
  // navigation, so no pop-up blocker (unlike opening a new tab after the await).
  // Auto-clicking the real link keeps one navigation path; `Continue now` also
  // lets them skip the wait (timing control).
  useEffect(() => {
    if (phase !== "done" || !link) return;
    const tick = setInterval(
      () => setCountdown((n) => (n > 0 ? n - 1 : 0)),
      1000,
    );
    const redirect = setTimeout(() => {
      finalizeRef.current?.click();
    }, REDIRECT_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(redirect);
    };
  }, [phase, link]);

  if (!signedIn) {
    return (
      <div className="flex flex-col gap-3 text-sm text-text">
        <p>Sign in with Google to book {whenLabel}.</p>
        <button
          type="button"
          onClick={() =>
            signIn("google", { redirectTo: `/book?date=${date}&time=${time}` })
          }
          className="rounded border border-accent/40 px-3 py-1.5 text-accent hover:border-accent hover:highlight-border focus-ring transition-all"
        >
          Sign in with Google
        </button>
        <ContactFallback message="Prefer not to sign in?" />
      </div>
    );
  }

  async function confirm() {
    setPhase("submitting");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date, time }),
      });
      if (res.ok) {
        const data = (await res.json()) as { addToCalendarLink: string; meetUrl?: string };
        const tracked = trackedCalLink(data.addToCalendarLink);
        setLink(tracked);
        setMeetUrl(data.meetUrl ?? null);
        setPhase("done");
        publishBookingResult({ status: "success", when: whenLabel, link: tracked });
        return;
      }
      setMessage(
        res.status === 409
          ? "That slot was just taken. Pick another time from the chat."
          : "Couldn't book that time.",
      );
      setPhase("error");
      publishBookingResult({ status: "error", when: whenLabel });
    } catch {
      setMessage("Couldn't reach the server.");
      setPhase("error");
      publishBookingResult({ status: "error", when: whenLabel });
    }
  }

  if (phase === "done" && link) {
    return (
      <div className="flex flex-col gap-2 text-sm text-text">
        <p role="status">
          Booked on our end — but to schedule the meeting you must finalize it
          yourself. On the next screen, make sure to create the event.
        </p>
        <p aria-hidden="true" className="text-muted">
          Redirecting in {countdown}s…
        </p>
        <a ref={finalizeRef} href={link} className="text-accent hover:underline focus-ring">
          Continue now
        </a>
        {meetUrl && (
          <a
            href={meetUrl}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline focus-ring"
          >
            Join link (Google Meet)
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 text-sm text-text">
      <p>
        Booking {whenLabel} as <span className="font-medium">{name ?? email}</span>.
      </p>
      {phase === "error" && (
        <div role="alert" className="flex flex-col gap-1 text-muted">
          <span>{message}</span>
          <ContactFallback />
        </div>
      )}
      <button
        type="button"
        onClick={confirm}
        disabled={phase === "submitting"}
        className="rounded border border-accent/40 px-3 py-1.5 text-accent hover:border-accent hover:highlight-border focus-ring transition-all disabled:opacity-50"
      >
        {phase === "submitting" ? "Booking…" : phase === "error" ? "Try again" : "Confirm"}
      </button>
    </div>
  );
}
