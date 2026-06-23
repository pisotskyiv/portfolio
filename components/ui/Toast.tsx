"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, AlertCircle, X } from "lucide-react";

interface ToastProps {
  variant: "success" | "error";
  message: string;
  /** Optional action link (e.g. add-to-calendar), opened in a new tab. */
  actionHref?: string;
  actionLabel?: string;
  onDismiss: () => void;
}

/**
 * Minimal, accessible toast. Presentational — the caller controls when it
 * mounts/unmounts (wrap in AnimatePresence) and any auto-dismiss timing.
 */
export function Toast({
  variant,
  message,
  actionHref,
  actionLabel,
  onDismiss,
}: ToastProps) {
  const reduceMotion = useReducedMotion();
  const offset = reduceMotion ? 0 : 12;
  const Icon = variant === "success" ? Check : AlertCircle;

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: offset }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: offset }}
      className="fixed bottom-4 left-4 z-70 flex max-w-xs items-start gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-[12px] text-text shadow-lg"
    >
      <Icon
        className={variant === "success" ? "text-accent" : "text-muted"}
        size={16}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-0.5">
        <span>{message}</span>
        {actionHref && (
          <a
            href={actionHref}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline focus-ring"
          >
            {actionLabel ?? "Open"}
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-1 text-muted hover:text-accent focus-ring"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
