"use client";

import { useState } from "react";
import clsx from "clsx";
import type { DaySchedule } from "@/lib/availability";
import { bookingEmail } from "@/lib/availability";
import { ContactFallback } from "./ContactFallback";

interface SchedulerCardProps {
  availability: DaySchedule[];
  timezone?: string;
}

function bookUrl(date: string | undefined, time: string): string {
  return `/book?date=${date}&time=${time}`;
}

export function SchedulerCard({ availability, timezone = "PST" }: SchedulerCardProps) {
  const [popupBlocked, setPopupBlocked] = useState(false);

  // Open booking in a separate tab so the chat tab (and conversation) is never
  // disturbed by the OAuth redirect. Anchors keep it accessible and let
  // modified clicks open natively; a plain click goes through window.open so we
  // can detect a blocked popup and offer a fallback.
  function openBooking(e: React.MouseEvent, url: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const win = window.open(url, "_blank", "noopener");
    if (!win) setPopupBlocked(true);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-text">Schedule a Call</span>
        <span className="font-mono text-[10px] uppercase tracking-badge text-muted">
          {timezone}
        </span>
      </div>

      <div className="grid grid-cols-5 divide-x divide-border">
        {availability.map((day) => (
          <div key={day.day} className="flex flex-col">
            <div className="border-b border-border px-1 py-1.5 text-center">
              <span className="font-mono text-[10px] uppercase tracking-badge text-muted">
                {day.short}
              </span>
            </div>
            <div className={clsx("flex min-h-22 flex-col gap-1 p-1.5")}>
              {day.slots.length === 0 ? (
                <span className="pt-2 text-center text-[11px] text-muted">
                  —
                </span>
              ) : (
                day.slots.map((slot) => {
                  const url = bookUrl(day.date, slot.time);
                  return (
                    <a
                      key={slot.time}
                      href={url}
                      target="_blank"
                      rel="noopener"
                      onClick={(e) => openBooking(e, url)}
                      aria-label={`Book ${day.day} at ${slot.label} ${timezone}`}
                      className="block w-full rounded border border-accent/40 bg-transparent px-1 py-0.5 text-center text-[11px] text-accent hover:border-accent hover:highlight-border focus-ring transition-all"
                    >
                      {slot.label}
                    </a>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {popupBlocked && (
        <ContactFallback
          message="Popup blocked — couldn't open the booking tab."
          className="border-t border-border px-3 py-2"
        />
      )}

      <div className="border-t border-border px-3 py-2">
        <a
          href={`mailto:${bookingEmail}?subject=${encodeURIComponent("Interview Scheduling")}`}
          className="text-[11px] text-muted hover:text-accent transition-colors focus-ring"
          aria-label="Email to schedule"
        >
          Or email directly
        </a>
      </div>
    </div>
  );
}
