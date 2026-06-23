"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toast } from "./Toast";
import { siteConfig } from "@/lib/site";
import {
  subscribeBookingResult,
  type BookingResult,
} from "@/lib/booking-broadcast";

const ERROR_DISMISS_MS = 8000;

/**
 * Lives in the chat tab. Listens for booking outcomes broadcast from the
 * separate booking tab and surfaces them as a toast, so the user gets feedback
 * without leaving the conversation. Success stays until dismissed (it carries
 * the add-to-calendar link); errors auto-dismiss.
 */
export function BookingNotifier() {
  const [result, setResult] = useState<BookingResult | null>(null);

  useEffect(() => subscribeBookingResult(setResult), []);

  useEffect(() => {
    if (result?.status !== "error") return;
    const id = setTimeout(() => setResult(null), ERROR_DISMISS_MS);
    return () => clearTimeout(id);
  }, [result]);

  return (
    <AnimatePresence>
      {result && (
        <Toast
          variant={result.status}
          message={
            result.status === "success"
              ? `Booked — ${result.when}`
              : `Booking didn't go through — ${result.when}`
          }
          actionHref={
            result.status === "success" ? result.link : siteConfig.links.linkedin
          }
          actionLabel={
            result.status === "success" ? "Add to calendar" : "Schedule via LinkedIn"
          }
          onDismiss={() => setResult(null)}
        />
      )}
    </AnimatePresence>
  );
}
