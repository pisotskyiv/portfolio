"use client";

import { motion, useReducedMotion } from "framer-motion";

const COLS = 5;
const ROWS = 4;

const OFFSETS = Array.from({ length: COLS * ROWS }, () => ({
  x: (Math.random() - 0.5) * 140,
  y: (Math.random() - 0.5) * 100,
  rotate: (Math.random() - 0.5) * 24,
}));

interface FragmentedPortraitProps {
  src: string;
  alt: string;
}

export function FragmentedPortrait({ src, alt }: FragmentedPortraitProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      role="img"
      aria-label={alt}
      className="grid aspect-4/5 w-full cursor-pointer select-none grid-cols-5 grid-rows-4 gap-0.5"
      initial={prefersReduced ? "assembled" : "scattered"}
      animate={prefersReduced ? "assembled" : "scattered"}
      whileHover="assembled"
    >
      {OFFSETS.map((offset, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const bgX = (col / (COLS - 1)) * 100;
        const bgY = (row / (ROWS - 1)) * 100;

        return (
          <motion.div
            key={i}
            variants={{
              assembled: {
                x: 0,
                y: 0,
                opacity: 1,
                rotate: 0,
                transition: {
                  delay: i * 0.025,
                  type: "spring",
                  stiffness: 220,
                  damping: 22,
                },
              },
              scattered: {
                x: offset.x,
                y: offset.y,
                opacity: 0.65,
                rotate: offset.rotate,
                transition: {
                  delay: i * 0.008,
                  type: "spring",
                  stiffness: 160,
                  damping: 18,
                },
              },
            }}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
              backgroundPosition: `${bgX}% ${bgY}%`,
              filter:
                "grayscale(100%) sepia(30%) saturate(1.8) hue-rotate(-15deg) brightness(0.85)",
            }}
          />
        );
      })}
    </motion.div>
  );
}
