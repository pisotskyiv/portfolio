"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { siteConfig } from "@/lib/site";
import { bookingEmail } from "@/lib/availability";

interface BookingFormProps {
  day: string;
  /** ISO yyyy-mm-dd; absent on the dateless sample, where online booking is off. */
  date?: string;
  time: string;
  label: string;
  timezone: string;
  onCancel: () => void;
}

type Phase = "idle" | "submitting" | "confirmed" | "error";

export function BookingForm({
  day,
  date,
  time,
  label,
  timezone,
  onCancel,
}: BookingFormProps) {
  const { data: session, status } = useSession();
  const [phase, setPhase] = useState<Phase>("idle");
  const [link, setLink] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const when = `${day} at ${label} ${timezone}`;

  async function confirm() {
    if (!date) {
      setMessage("This slot isn't bookable online — email me instead.");
      setPhase("error");
      return;
    }
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
        setPhase("confirmed");
        return;
      }
      setMessage(
        res.status === 409
          ? "That slot was just taken. Pick another time."
          : "Couldn't book that time. Email me instead.",
      );
      setPhase("error");
    } catch {
      setMessage("Couldn't reach the server. Email me instead.");
      setPhase("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="border-t border-border px-3 py-3 text-[11px] text-muted">
        Checking sign-in…
      </div>
    );
  }

  if (phase === "confirmed" && link) {
    return (
      <div
        role="status"
        className="border-t border-border px-3 py-3 text-[11px] text-text"
      >
        <p className="font-medium">Booked — {when}.</p>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-accent hover:underline focus-ring"
        >
          Add to your calendar
        </a>
        <p className="mt-1 text-muted">I&apos;ll follow up by email to confirm.</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="border-t border-border px-3 py-3 text-[11px] text-text">
        <p>Sign in with Google to book {when}.</p>
        <button
          type="button"
          onClick={() => signIn("google")}
          className="mt-2 w-full rounded border border-accent/40 px-2 py-1 text-accent hover:border-accent hover:highlight-border focus-ring transition-all"
        >
          Sign in with Google
        </button>
        <p className="mt-2 text-muted">
          Prefer not to sign in?{" "}
          <a
            href={siteConfig.links.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline focus-ring"
          >
            Reach me on LinkedIn
          </a>
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-2 text-muted hover:text-accent focus-ring transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-border px-3 py-3 text-[11px] text-text">
      <p>
        Booking {when} as{" "}
        <span className="font-medium">
          {session?.user?.name ?? session?.user?.email}
        </span>
        .
      </p>
      {phase === "error" && (
        <p role="alert" className="mt-1 text-muted">
          {message}{" "}
          <a
            href={`mailto:${bookingEmail}`}
            className="text-accent hover:underline focus-ring"
          >
            email directly
          </a>
        </p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={confirm}
          disabled={phase === "submitting"}
          className="flex-1 rounded border border-accent/40 px-2 py-1 text-accent hover:border-accent hover:highlight-border focus-ring transition-all disabled:opacity-50"
        >
          {phase === "submitting" ? "Booking…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-border px-2 py-1 text-muted hover:text-accent focus-ring transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
