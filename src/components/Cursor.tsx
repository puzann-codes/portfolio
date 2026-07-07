"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const IDLE_SIZE = 18;
const HOVER_SIZE = 58;
// Cards get a smaller bump than generic UI hover — they're already moving
// on their own (the spiral/list conveyors), so a big overlay parked on top
// of a drifting card reads as disconnected rather than "highlighted".
const CARD_HOVER_SIZE = 30;

// "#rrggbb" -> "r, g, b", the form the --tint custom property (globals.css)
// expects so it can be dropped straight into an rgba() at any alpha.
function hexToRgbTriplet(hex: string) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const value = parseInt(full, 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}

// Everything here is driven by Framer motion values (set() outside React),
// never by useState — a prior emoji-based version called setState on every
// mousemove, forcing a React re-render per pixel of mouse travel, which is
// what made the whole page feel laggy. Hover detection also stays on
// mouseover/mouseout (fires once per enter/exit) rather than mousemove.
//
// Stays a circle always — it doesn't morph to match a hovered element's
// box (that was tried and felt flat/rigid) — instead the "highlight" comes
// from the dot growing and glowing brighter, while a squash-and-stretch
// pass every frame (reading the position springs' own velocity) elongates
// it along the direction of travel, snapping back round with a bouncy,
// underdamped spring for that jiggly feel.
export default function Cursor() {
  // Starts false on both server and client so SSR/hydration output matches;
  // flips true post-mount once we can safely read matchMedia client-side.
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const size = useMotionValue(IDLE_SIZE);
  const rotate = useMotionValue(0);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);

  const posSpring = { stiffness: 420, damping: 30, mass: 0.4 };
  const sizeSpring = { stiffness: 340, damping: 16, mass: 0.5 };
  // low damping on purpose: makes the stretch overshoot a touch as it
  // snaps back to round, which is what reads as "bouncy/jiggly"
  const jiggleSpring = { stiffness: 300, damping: 11, mass: 0.6 };

  const springX = useSpring(x, posSpring);
  const springY = useSpring(y, posSpring);
  const springSize = useSpring(size, sizeSpring);
  const springRotate = useSpring(rotate, { stiffness: 220, damping: 22 });
  const springScaleX = useSpring(scaleX, jiggleSpring);
  const springScaleY = useSpring(scaleY, jiggleSpring);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (isTouch || reduced) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target?.closest?.('[data-cursor="card"]') as HTMLElement | null;
      if (card) {
        size.set(CARD_HOVER_SIZE);
        const color = card.dataset.cursorColor;
        if (color) {
          dotRef.current?.style.setProperty("--tint", hexToRgbTriplet(color));
        }
        dotRef.current?.classList.add("cursor-dot--card");
        return;
      }
      const el = target?.closest?.('[data-cursor="hover"]');
      if (!el) return;
      size.set(HOVER_SIZE);
      dotRef.current?.classList.add("cursor-dot--active");
    };

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target?.closest?.('[data-cursor="card"]');
      if (card) {
        size.set(IDLE_SIZE);
        dotRef.current?.classList.remove("cursor-dot--card");
        dotRef.current?.style.removeProperty("--tint");
        return;
      }
      const el = target?.closest?.('[data-cursor="hover"]');
      if (!el) return;
      size.set(IDLE_SIZE);
      dotRef.current?.classList.remove("cursor-dot--active");
    };

    let raf = 0;
    const tick = () => {
      const vx = springX.getVelocity();
      const vy = springY.getVelocity();
      const speed = Math.min(1, Math.hypot(vx, vy) / 2200);
      if (speed > 0.03) {
        rotate.set((Math.atan2(vy, vx) * 180) / Math.PI);
      }
      scaleX.set(1 + speed * 0.85);
      scaleY.set(1 - speed * 0.35);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      cancelAnimationFrame(raf);
    };
  }, [x, y, size, rotate, scaleX, scaleY, springX, springY]);

  if (!enabled) return null;

  return (
    <motion.div
      ref={dotRef}
      className="cursor-dot pointer-events-none fixed left-0 top-0 z-[200] rounded-full"
      style={{
        x: springX,
        y: springY,
        width: springSize,
        height: springSize,
        rotate: springRotate,
        scaleX: springScaleX,
        scaleY: springScaleY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    />
  );
}
