"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DaySchedule } from "@/lib/availability";
import { subscribeBookingResult } from "@/lib/booking-broadcast";
import { ContactFallback } from "./ContactFallback";

const MAX_WEEK_OFFSET = 4;

interface SchedulerCardProps {
  availability: DaySchedule[];
  timezone?: string;
}

function bookUrl(date: string | undefined, time: string): string {
  return `/book?date=${date}&time=${time}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const [, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

export function SchedulerCard({ availability: initialAvailability, timezone = "PST" }: SchedulerCardProps) {
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [availability, setAvailability] = useState(initialAvailability);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return subscribeBookingResult((result) => {
      if (result.status !== "success") return;
      setIsLoading(true);
      fetch(`/api/availability?week=${weekOffset}`)
        .then((r) => r.json())
        .then((data: { availability: DaySchedule[] }) => setAvailability(data.availability))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    });
  }, [weekOffset]);

  function handleWeekChange(delta: number) {
    const next = weekOffset + delta;
    if (next < 0) return;
    setWeekOffset(next);
    if (next === 0) {
      setAvailability(initialAvailability);
      return;
    }
    setIsLoading(true);
    fetch(`/api/availability?week=${next}`)
      .then((r) => r.json())
      .then((data: { availability: DaySchedule[] }) => {
        setAvailability(data.availability);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }

  // Open booking in a separate tab so the chat tab (and conversation) is never
  // disturbed by the OAuth redirect. Anchors keep it accessible and let
  // modified clicks open natively; a plain click goes through window.open so we
  // can detect a blocked popup and offer a fallback.
  function openBooking(e: React.MouseEvent, url: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    // window.open(..., "noopener") returns null even on a successful open, which
    // would false-trigger the blocked-popup fallback on every click. Open without
    // it and sever the opener by hand, so a null return means a genuinely blocked
    // popup.
    const win = window.open(url, "_blank");
    if (win) {
      win.opener = null;
    } else {
      setPopupBlocked(true);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-text">Schedule a Call</span>
        <span className="font-mono text-[10px] uppercase tracking-badge text-muted">
          {timezone}
        </span>
      </div>

      <div className="flex items-center justify-between border-b border-border px-2 py-1">
        <button
          type="button"
          onClick={() => handleWeekChange(-1)}
          disabled={weekOffset === 0 || isLoading}
          aria-label="Previous week"
          className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-text focus-ring transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} aria-hidden="true" />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-badge text-muted">
          {weekOffset === 0 ? "This week" : weekOffset === 1 ? "Next week" : `+${weekOffset} weeks`}
        </span>
        <button
          type="button"
          onClick={() => handleWeekChange(1)}
          disabled={isLoading || weekOffset >= MAX_WEEK_OFFSET}
          aria-label="Next week"
          className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-text focus-ring transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
      {weekOffset >= MAX_WEEK_OFFSET && (
        <div className="border-b border-border px-3 py-1.5 text-center">
          <span className="text-[10px] text-muted">
            Booking available up to {MAX_WEEK_OFFSET} weeks ahead
          </span>
        </div>
      )}

      <div className={clsx("grid grid-cols-5 divide-x divide-border", isLoading && "opacity-50")}>
        {availability.map((day) => (
          <div key={day.day} className="flex flex-col">
            <div className="border-b border-border px-1 py-1.5 text-center">
              <span className="block font-mono text-[10px] uppercase tracking-badge text-muted">
                {day.short}
              </span>
              {day.date && (
                <span className="block text-[10px] text-muted">
                  {formatDate(day.date)}
                </span>
              )}
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

    </div>
  );
}
