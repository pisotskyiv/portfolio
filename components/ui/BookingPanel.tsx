"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ContactFallback } from "./ContactFallback";
import { publishBookingResult } from "@/lib/booking-broadcast";

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
  const [message, setMessage] = useState("");

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
        const data = (await res.json()) as { addToCalendarLink: string };
        setLink(data.addToCalendarLink);
        setPhase("done");
        publishBookingResult({ status: "success", when: whenLabel, link: data.addToCalendarLink });
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
        <p>Confirmed on our end. Add it to your calendar to lock it in:</p>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline focus-ring"
        >
          Add to your Google Calendar
        </a>
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
