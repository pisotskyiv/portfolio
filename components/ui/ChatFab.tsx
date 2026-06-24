"use client";

import { MessageSquare } from "lucide-react";

interface ChatFabProps {
  onClick: () => void;
}

export function ChatFab({ onClick }: ChatFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open chat"
      aria-expanded={false}
      aria-controls="chat-drawer"
      className="fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-lg border border-accent bg-elevated px-5 text-accent glow-pulse focus-ring"
    >
      <MessageSquare size={20} aria-hidden="true" />
      <span className="text-[15px] font-medium">Chat</span>
    </button>
  );
}
