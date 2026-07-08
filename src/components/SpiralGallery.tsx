"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/lib/projects";
import ProjectCover from "./ProjectCover";
import { useWipeTransition } from "./TransitionProvider";
import { cn } from "@/lib/utils";

const N = projects.length;
const NORMAL_SPEED = 0.012;
// "way faster than now" for the opening sweep, before the brand name docks
const FAST_SPEED = 0.32;
const SETTLE_DURATION = 0.7;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// classic overshoot-then-settle curve — used both for the text's pop-in at
// the top of the path and its bouncy landing in the corner
function easeOutBack(x: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

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

// The brand name rides the exact same lateral/vertical curve as the cards
// (same x/y math, no seed jitter) but skips the rotateY spin and blur — it
// needs to stay flat and legible the whole way down while cards blur past
// around it. A quick overshoot pop sells the "smooth and bouncy" entrance
// at the very top instead of just fading in.
function getTextPose(t: number, spreadScale: number, topY: number, bottomY: number) {
  const y = topY + (bottomY - topY) * t;
  const amplitude = 400 * spreadScale;
  const x = amplitude * Math.cos(t * 3 * Math.PI);
  const z = -360 + 620 * Math.sin(t * Math.PI);

  const entryT = Math.min(1, t / 0.12);
  const scale = entryT < 1 ? Math.max(0, easeOutBack(entryT)) : 1;
  const opacity = entryT < 1 ? entryT : 1;

  return { x, y, z, scale, opacity };
}

export default function SpiralGallery({
  introDone,
  setIntensity,
  playTick,
}: {
  introDone: boolean;
  setIntensity: (speed: number) => void;
  playTick: () => void;
}) {
  const { wipeTo } = useWipeTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const textCardRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const velocityRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const introDoneRef = useRef(introDone);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    introDoneRef.current = introDone;
  }, [introDone]);

  useEffect(() => {
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
    // where the brand name lands after its bouncy landing — bottom-left
    // corner, in the same wrapper-centered coordinate space as the path
    const finalX = -window.innerWidth / 2 + 150;
    const finalY = window.innerHeight / 2 - 96;

    type TextPhase = "traveling" | "settling" | "settled";
    let textPhase: TextPhase = reduced ? "settled" : "traveling";
    let settleProgress = 0;
    let settleStart = { x: finalX, y: finalY, z: 0, scale: 1 };

    let raf = 0;
    let last = performance.now();

    const renderText = () => {
      const wrapperEl = textWrapperRef.current;
      const cardEl = textCardRef.current;
      if (!wrapperEl || !cardEl) return;

      if (textPhase === "traveling") {
        const t = Math.min(1, progressRef.current);
        const pose = getTextPose(t, spreadScale, topY, bottomY);
        wrapperEl.style.transform = `translate3d(-50%, -50%, 0) translateY(${pose.y}px)`;
        cardEl.style.transform = `translateX(${pose.x}px) translateZ(${pose.z}px) scale(${pose.scale})`;
        cardEl.style.opacity = String(pose.opacity);
        if (t >= 1) {
          settleStart = { x: pose.x, y: pose.y, z: pose.z, scale: pose.scale };
          textPhase = "settling";
        }
        return;
      }

      const st = textPhase === "settled" ? 1 : Math.min(1, settleProgress);
      const eased = easeOutBack(st);
      const x = lerp(settleStart.x, finalX, eased);
      const y = lerp(settleStart.y, finalY, eased);
      const z = lerp(settleStart.z, 0, eased);
      const scale = lerp(settleStart.scale, 1, eased);
      wrapperEl.style.transform = `translate3d(-50%, -50%, 0) translateY(${y}px)`;
      cardEl.style.transform = `translateX(${x}px) translateZ(${z}px) scale(${scale})`;
      cardEl.style.opacity = "1";
    };

    const render = () => {
      const speedBlur =
        textPhase !== "settled" ? Math.min(18, currentSpeedRef.current * 55) : 0;

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
        const totalBlur = blur + speedBlur;
        cardEl.style.filter = totalBlur > 0.4 ? `blur(${totalBlur}px)` : "none";
      });

      renderText();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const baseSpeed = textPhase === "settled" ? NORMAL_SPEED : FAST_SPEED;
      const speed = introDoneRef.current ? baseSpeed + velocityRef.current : 0;
      progressRef.current += speed * dt;
      velocityRef.current *= 0.92;
      currentSpeedRef.current = speed;
      setIntensity(speed);

      if (textPhase === "settling") {
        settleProgress += dt / SETTLE_DURATION;
        if (settleProgress >= 1) {
          settleProgress = 1;
          textPhase = "settled";
        }
      }

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

      <div
        ref={textWrapperRef}
        className="absolute left-1/2 top-1/2 z-[500] will-change-transform"
        style={{ perspective: 1000 }}
      >
        <div ref={textCardRef} data-cursor="hover" className="will-change-transform">
          <p className="font-display text-3xl font-bold uppercase leading-[0.9] text-paper md:text-4xl">
            Pujan
            <br />
            Bhatt
          </p>
          <p className="mt-2 font-sans text-sm text-paper/70 md:text-base">
            Full-Stack &amp; AI Engineer
          </p>
        </div>
      </div>
    </div>
  );
}
