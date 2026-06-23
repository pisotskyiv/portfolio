"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Toast } from "./Toast";
import { siteConfig } from "@/lib/site";
import {
  subscribeBookingResult,
  type BookingResult,
} from "@/lib/booking-broadcast";

const SUCCESS_DISMISS_MS = 6000;
const ERROR_DISMISS_MS = 8000;

/**
 * Lives in the chat tab. Listens for booking outcomes broadcast from the
 * separate booking tab and surfaces them as a toast, so the user gets feedback
 * without leaving the conversation. The booking tab handles the calendar
 * finalize itself, so the success toast is just a confirmation. Both variants
 * auto-dismiss.
 */
export function BookingNotifier() {
  const [result, setResult] = useState<BookingResult | null>(null);

  useEffect(() => subscribeBookingResult(setResult), []);

  useEffect(() => {
    if (!result) return;
    const ms = result.status === "error" ? ERROR_DISMISS_MS : SUCCESS_DISMISS_MS;
    const id = setTimeout(() => setResult(null), ms);
    return () => clearTimeout(id);
  }, [result]);

  return (
    <AnimatePresence>
      {result && (
        <Toast
          variant={result.status}
          message={
            result.status === "success"
              ? `Confirmed for ${result.when}`
              : `Booking didn't go through — ${result.when}`
          }
          actionHref={
            result.status === "success" ? undefined : siteConfig.links.linkedin
          }
          actionLabel={
            result.status === "success" ? undefined : "Schedule via LinkedIn"
          }
          onDismiss={() => setResult(null)}
        />
      )}
    </AnimatePresence>
  );
}
