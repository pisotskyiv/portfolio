"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  heading: string;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const NAV_OFFSET = 80;

    const getActive = () => {
      let active = items[0]?.id ?? "";
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= NAV_OFFSET) {
          active = id;
        }
      }
      return active;
    };

    const onScroll = () => setActiveId(getActive());
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <nav aria-label="On this page">
      <p className="eyebrow mb-4">On this page</p>
      <ul className="flex flex-col gap-0.5" role="list">
        {items.map(({ id, heading }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={[
                "block border-l-2 py-1 pl-3 text-sm transition-colors",
                activeId === id
                  ? "border-accent text-text"
                  : "border-transparent text-muted hover:text-text",
              ].join(" ")}
            >
              {heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
