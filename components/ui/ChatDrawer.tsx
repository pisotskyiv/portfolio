"use client";

import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, X } from "lucide-react";
import { SchedulerCard } from "./SchedulerCard";
import { availability } from "@/lib/availability";

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  tool?: "scheduler";
}

const DEMO_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hi! I'm Vlad's AI assistant. Ask me anything about his experience, projects, or skills.",
  },
  {
    id: "2",
    role: "user",
    content: "I'd like to schedule an interview.",
  },
  {
    id: "3",
    role: "assistant",
    content:
      "Here's Vlad's availability this week. Click a slot and I'll set you up.",
    tool: "scheduler",
  },
];

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    setIsScrolled(e.currentTarget.scrollTop > 4);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Tap-outside backdrop — mobile only */}
          <div
            className="fixed inset-0 z-59 bg-bg/60 sm:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            id="chat-drawer"
            role="dialog"
            aria-label="Chat with Vlad"
            aria-modal="true"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-3 bottom-3 z-60 flex h-[82vh] flex-col overflow-hidden rounded-2xl border border-border bg-surface sm:inset-auto sm:h-auto sm:bottom-24 sm:right-6 sm:w-85 sm:rounded-xl sm:shadow-2xl"
          >
            <div className={clsx(
              "flex items-center justify-between border-b border-border bg-elevated px-4 transition-all duration-200",
              isScrolled ? "py-1.5" : "py-2",
            )}>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <span className={clsx(
                  "font-mono text-[10px] uppercase tracking-badge text-muted transition-all duration-200",
                  isScrolled ? "h-0 opacity-0" : "opacity-100",
                )}>
                  AI assistant
                </span>
                <span className="text-sm font-medium text-text">Chat with Vlad</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded text-muted hover:text-text focus-ring transition-colors"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div onScroll={handleScroll} className="scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:max-h-105">
              {DEMO_MESSAGES.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex flex-col gap-2",
                    msg.role === "user" && "items-end",
                  )}
                >
                  <div
                    className={clsx(
                      "rounded-lg px-3 py-2 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "max-w-[65%] bg-accent/10 text-text"
                        : "border border-border bg-bg text-text",
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.tool === "scheduler" && (
                    <SchedulerCard availability={availability} />
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2">
                <input
                  type="text"
                  aria-label="Chat message"
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Send message"
                  className="flex h-6 w-6 items-center justify-center rounded border border-accent/40 bg-transparent text-accent hover:border-accent hover:highlight-border focus-ring transition-all"
                >
                  <ArrowUp size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
