"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type HeroCarHandle = {
  /** called every animation frame with the conveyor's current speed */
  updateSpeed: (speed: number, now: number) => void;
};

const SMOKE_COUNT = 6;

// A low, wedge-nosed supercar silhouette that sits behind the spiral
// gallery as an environmental detail — outline only, so it reads as a
// technical sketch on the grid rather than competing with the cards.
// Wheels spin and exhaust smoke puffs faster the more you scroll, driven
// by the exact same speed signal that feeds the cards and the ambient
// sound in SpiralGallery, so all three feel like one connected throttle
// rather than three separate animations.
const HeroCar = forwardRef<HeroCarHandle>(function HeroCar(_props, ref) {
  const bodyRef = useRef<SVGPathElement>(null);
  const wheelFrontRef = useRef<SVGGElement>(null);
  const wheelRearRef = useRef<SVGGElement>(null);
  const smokeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const rotationRef = useRef(0);
  const smokeIndexRef = useRef(0);
  const nextSmokeAtRef = useRef(0);

  useImperativeHandle(ref, () => ({
    updateSpeed(speed: number, now: number) {
      const clamped = Math.min(1, Math.max(0, (Math.abs(speed) - 0.008) / 0.09));

      rotationRef.current += speed * 900;
      const wheelTransform = `rotate(${rotationRef.current}deg)`;
      if (wheelFrontRef.current) wheelFrontRef.current.style.transform = wheelTransform;
      if (wheelRearRef.current) wheelRearRef.current.style.transform = wheelTransform;

      if (bodyRef.current) {
        bodyRef.current.style.opacity = String(0.16 + clamped * 0.28);
      }

      // idle: a puff roughly once a second. full throttle: five a second —
      // frequent enough to blur into a steady drift of exhaust
      const smokeInterval = 950 - clamped * 750;
      if (now >= nextSmokeAtRef.current) {
        const puff = smokeRefs.current[smokeIndexRef.current];
        smokeIndexRef.current = (smokeIndexRef.current + 1) % SMOKE_COUNT;
        if (puff) {
          puff.style.animation = "none";
          void puff.getBoundingClientRect();
          puff.setAttribute("cx", String(730 + (Math.random() * 10 - 5)));
          puff.setAttribute("cy", String(260 + (Math.random() * 6 - 3)));
          puff.style.animation = "exhaust-puff 0.9s ease-out forwards";
        }
        nextSmokeAtRef.current = now + smokeInterval;
      }
    },
  }));

  const wheel = (label: string, cx: number, cy: number) => (
    <g transform={`translate(${cx},${cy})`}>
      <circle r="48" stroke="#f5f3ee" strokeWidth="3" />
      <circle r="18" stroke="#f5f3ee" strokeWidth="2" />
      <line x1="-48" y1="0" x2="48" y2="0" stroke="#f5f3ee" strokeWidth="2" />
      <line x1="0" y1="-48" x2="0" y2="48" stroke="#f5f3ee" strokeWidth="2" />
      <line x1="-34" y1="-34" x2="34" y2="34" stroke="#f5f3ee" strokeWidth="2" />
      <line x1="-34" y1="34" x2="34" y2="-34" stroke="#f5f3ee" strokeWidth="2" />
    </g>
  );

  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-1/2 w-[85vw] max-w-[1100px] -translate-x-1/2 select-none"
      style={{ zIndex: -9999 }}
      viewBox="0 0 900 320"
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: SMOKE_COUNT }).map((_, i) => (
        <circle
          key={i}
          ref={(el) => {
            smokeRefs.current[i] = el;
          }}
          cx={730}
          cy={260}
          r="9"
          fill="#f5f3ee"
          opacity="0"
          className="exhaust-puff"
        />
      ))}

      <path
        ref={bodyRef}
        d="M55,252 C120,232 200,215 270,205 C290,197 302,185 312,170 C325,140 345,112 372,95 C385,88 398,84 410,82 L465,82 C480,84 492,90 502,98 C515,115 528,135 538,155 C555,178 590,200 630,218 C662,232 698,248 724,262 A74,74 0 0 0 576,262 L324,262 A74,74 0 0 0 176,262 L55,252 Z"
        stroke="#f5f3ee"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ opacity: 0.16, transition: "opacity 0.4s ease" }}
      />

      <g ref={wheelFrontRef} style={{ transformOrigin: "250px 242px" }}>
        {wheel("front", 250, 242)}
      </g>
      <g ref={wheelRearRef} style={{ transformOrigin: "650px 242px" }}>
        {wheel("rear", 650, 242)}
      </g>
    </svg>
  );
});

export default HeroCar;
