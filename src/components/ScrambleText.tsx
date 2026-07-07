"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function ScrambleText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      el.textContent = text;
      return;
    }

    const chars = text.split("");
    const obj = { progress: 0 };
    const tween = gsap.to(obj, {
      progress: chars.length,
      duration: chars.length * 0.045 + 0.3,
      ease: "none",
      onUpdate: () => {
        const revealCount = Math.floor(obj.progress);
        el.textContent = chars
          .map((c, i) => {
            if (c === " ") return " ";
            if (i < revealCount) return c;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
      },
      onComplete: () => {
        el.textContent = text;
      },
    });

    return () => {
      tween.kill();
    };
  }, [text]);

  return <span ref={ref} className={className} aria-label={text} />;
}
