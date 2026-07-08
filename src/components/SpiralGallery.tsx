"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/lib/projects";
import ProjectCover from "./ProjectCover";
import { useWipeTransition } from "./TransitionProvider";
import { cn } from "@/lib/utils";

const N = projects.length;

// One clean pass, top to bottom, through four named waypoints: rightish at
// the top, leftish at the middle, rightish again a bit below middle, then
// leftish at the bottom — a tighter, more winding zigzag than a single lazy
// S. That's 1.5 lateral cycles over the full pass (`cos(t*3π)`), not one.
//
// Rotation and focus are independent of that lateral shape: `rotateY` is
// monotonic (t*720 — exactly two full turns for the whole pass, one per
// half), so it only ever spins one direction, never flipping back and
// forth. Sharpness (`sin(t*π)`) peaks once, at dead center of the pass
// (t=0.5) — which also happens to be a lateral zero-crossing of the new
// waypoint path, so "in focus" still lines up with "laterally centered."
//
// The lateral path's endpoints don't match (rightish at t=0 vs. leftish at
// t=1), which would normally pop as a jump-cut on the top/bottom wrap —
// but that instant is exactly when edgeFade (below) has opacity at zero,
// so the pop is invisible.
//
// `topY`/`bottomY` are sized to the actual viewport (see the effect below) —
// they used to be a fixed, much-taller-than-the-screen range, which meant a
// viewer only ever saw the *middle slice* of the cycle: the two extreme
// waypoints (top-right start, bottom-left end) happened off-screen, above
// and below what was visible, so the path read as a plain wave instead of
// the intended 4-point path.
//
// The big top->bottom drift (`y`) is returned separately from the local
// wobble (`x`/`z`/rotation) — see the render loop below for why: mixing them
// into one shared-perspective transform chain makes CSS perspective's x/y
// magnification (it scales apparent position along with size for anything
// pushed toward the camera) warp the vertical drift into an uneven, pulsing
// crawl instead of a clean, constant-speed flow.
function getCardPose(
  t: number,
  seed: number,
  spreadScale: number,
  topY: number,
  bottomY: number,
) {
  const sharpness = Math.sin(t * Math.PI);
  const blurAmount = 1 - sharpness;

  const z = -360 + 620 * sharpness;
  const rotateY = t * 720;
  const blur = blurAmount * 7;
  const opacity = 1 - blurAmount * 0.35;

  const y = topY + (bottomY - topY) * t;
  const amplitude = (400 + Math.sin(seed * 3.7) * 90) * spreadScale;
  const x = amplitude * Math.cos(t * 3 * Math.PI);

  // soften the pop-in/out right at the very top/bottom of the conveyor
  let edgeFade = 1;
  if (t < 0.04) edgeFade = t / 0.04;
  else if (t > 0.96) edgeFade = (1 - t) / 0.04;

  return { x, y, z, rotateY, blur, opacity: opacity * edgeFade };
}

export default function SpiralGallery({
  setIntensity,
  playTick,
}: {
  setIntensity: (speed: number) => void;
  playTick: () => void;
}) {
  const { wipeTo } = useWipeTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef(0);
  const velocityRef = useRef(0);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const baseSpeed = 0.012;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // narrower viewports get a proportionally narrower swing, so the curve
    // doesn't clip almost entirely off-screen on phones
    const spreadScale = Math.min(1, Math.max(0.45, window.innerWidth / 1440));
    // sized to the viewport (not a fixed constant) so the full 4-waypoint
    // path — including the top-right start and bottom-left end — actually
    // falls within view instead of running mostly off-screen
    const topY = -window.innerHeight * 0.65;
    const bottomY = window.innerHeight * 0.65;

    let raf = 0;
    let last = performance.now();

    const render = () => {
      wrapperRefs.current.forEach((wrapperEl, i) => {
        const cardEl = cardRefs.current[i];
        if (!wrapperEl || !cardEl) return;
        const t = ((progressRef.current + i / N) % 1 + 1) % 1;
        const { x, y, z, rotateY, blur, opacity } = getCardPose(
          t,
          i,
          spreadScale,
          topY,
          bottomY,
        );

        // plain 2D vertical position — no perspective involved, so it moves
        // at a constant, undistorted speed
        wrapperEl.style.transform = `translate3d(-50%, -50%, 0) translateY(${y}px)`;
        wrapperEl.style.zIndex = String(Math.round(z));

        // local figure-8 wobble, isolated in its own perspective context
        cardEl.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg)`;
        cardEl.style.opacity = String(opacity);
        cardEl.style.filter = blur > 0.4 ? `blur(${blur}px)` : "none";
      });
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const speed = baseSpeed + velocityRef.current;
      progressRef.current += speed * dt;
      velocityRef.current *= 0.92;
      setIntensity(speed);

      render();
      raf = requestAnimationFrame(tick);
    };

    render();
    if (!reduced) {
      raf = requestAnimationFrame(tick);
    }

    const el = containerRef.current;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocityRef.current += e.deltaY * 0.00025;
      if (reduced) {
        // manual, user-initiated scrubbing only — no ambient auto-play
        progressRef.current += velocityRef.current;
        setIntensity(velocityRef.current);
        render();
      }
    };
    el?.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener("wheel", onWheel);
    };
  }, [setIntensity]);

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      className="relative h-full w-full overflow-hidden"
    >
      {projects.map((project, i) => (
        <div
          key={project.slug}
          ref={(el) => {
            wrapperRefs.current[i] = el;
          }}
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{ perspective: 1000 }}
        >
          <div
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="will-change-transform"
          >
            <a
              href={`/work/${project.slug}`}
              data-cursor="card"
              data-cursor-color={project.color}
              onMouseEnter={() => {
                setHovered(project.slug);
                playTick();
              }}
              onMouseLeave={() => setHovered(null)}
              onClick={(e) => {
                e.preventDefault();
                wipeTo(`/work/${project.slug}`, project.color);
              }}
              className="group relative block h-[170px] w-[240px] overflow-hidden rounded-xl border border-paper/10 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out hover:scale-[1.08] sm:h-[190px] sm:w-[270px]"
            >
              <ProjectCover project={project} className="h-full w-full" />
              <span
                className={cn(
                  "pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 p-4 opacity-0 transition-opacity duration-300",
                  hovered === project.slug && "opacity-100",
                )}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70">
                  {project.index} / {project.year}
                </span>
                <span className="font-display text-lg font-bold uppercase text-paper">
                  {project.title}
                </span>
              </span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
