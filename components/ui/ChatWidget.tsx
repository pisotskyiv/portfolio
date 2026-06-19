"use client";

import { useState, useEffect } from "react";
import { ChatFab } from "./ChatFab";
import { ChatDrawer } from "./ChatDrawer";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }
    if (window.matchMedia("(max-width: 639px)").matches) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <ChatFab isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
      <ChatDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
