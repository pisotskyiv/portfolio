"use client";

import { MessageSquare, X } from "lucide-react";

interface ChatFabProps {
  isOpen: boolean;
  onClick: () => void;
}

export function ChatFab({ isOpen, onClick }: ChatFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Close chat" : "Open chat"}
      aria-expanded={isOpen}
      aria-controls="chat-drawer"
      className="fixed bottom-6 right-6 z-50 flex h-8 w-14 items-center justify-center rounded border border-accent bg-elevated text-accent glow-pulse focus-ring"
    >
      {isOpen ? (
        <X size={15} aria-hidden="true" />
      ) : (
        <MessageSquare size={15} aria-hidden="true" />
      )}
    </button>
  );
}
