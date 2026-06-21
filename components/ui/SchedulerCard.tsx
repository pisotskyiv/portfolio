"use client";

import { useState } from "react";
import clsx from "clsx";
import type { DaySchedule } from "@/lib/availability";
import { bookingEmail } from "@/lib/availability";
import { BookingForm } from "./BookingForm";

interface SchedulerCardProps {
  availability: DaySchedule[];
  timezone?: string;
  /** Optional override; when provided, suppresses the inline booking form. */
  onSlotClick?: (day: string, time: string) => void;
}

interface SelectedSlot {
  day: string;
  date?: string;
  time: string;
  label: string;
}

export function SchedulerCard({
  availability,
  timezone = "PST",
  onSlotClick,
}: SchedulerCardProps) {
  const [selected, setSelected] = useState<SelectedSlot | null>(null);

  function handleSlotClick(slot: SelectedSlot) {
    if (onSlotClick) {
      onSlotClick(slot.day, slot.time);
      return;
    }
    setSelected(slot);
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
                day.slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() =>
                      handleSlotClick({
                        day: day.day,
                        date: day.date,
                        time: slot.time,
                        label: slot.label,
                      })
                    }
                    aria-label={`Schedule for ${day.day} at ${slot.label} ${timezone}`}
                    className="w-full rounded border border-accent/40 bg-transparent px-1 py-0.5 text-[11px] text-accent hover:border-accent hover:highlight-border focus-ring transition-all"
                  >
                    {slot.label}
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {selected ? (
        <BookingForm
          day={selected.day}
          date={selected.date}
          time={selected.time}
          label={selected.label}
          timezone={timezone}
          onCancel={() => setSelected(null)}
        />
      ) : (
        <div className="border-t border-border px-3 py-2">
          <a
            href={`mailto:${bookingEmail}?subject=${encodeURIComponent("Interview Scheduling")}`}
            className="text-[11px] text-muted hover:text-accent transition-colors focus-ring"
            aria-label="Email to schedule"
          >
            Or email directly
          </a>
        </div>
      )}
    </div>
  );
}
