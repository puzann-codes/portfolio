"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SpiralGallery from "@/components/SpiralGallery";
import GridBackdrop from "@/components/GridBackdrop";
import { useAmbientSound } from "@/lib/useAmbientSound";

const HeroCar3D = dynamic(() => import("@/components/HeroCar3D"), { ssr: false });

// intro choreography: the 3D car rig runs its own zoom-out/rotate animation
// and calls onIntroComplete once it settles. That single moment is the
// starting gun for SpiralGallery's own sequence — the brand name and cards
// pop in and sweep down the conveyor path fast (with a motion-blur flourish
// on the cards), the brand name lands with a bounce in its resting corner,
// and the conveyor eases back down to its normal ambient drift once it does.
export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const { enable, disable, setIntensity, playTick } = useAmbientSound();
  const soundOnRef = useRef(soundOn);
  const unlockedRef = useRef(false);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    // browsers block audio until a real user gesture — sound defaults to
    // "on" in UI state, but the AudioContext itself only actually starts
    // the moment the user first interacts with the page at all, not
    // specifically the mute button. Not every gesture type is accepted as
    // a valid "user activation" by every browser's autoplay policy (`wheel`
    // in particular often isn't), so `enable()` reports back whether it
    // actually got the context running — if not, the listeners stay
    // attached and it just tries again on the next gesture instead of
    // giving up silently after one failed attempt.
    const unlock = () => {
      if (unlockedRef.current || !soundOnRef.current) return;
      enable().then((running) => {
        if (!running) return;
        unlockedRef.current = true;
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("wheel", unlock);
      });
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("wheel", unlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("wheel", unlock);
    };
  }, [enable]);

  return (
    <main className="relative h-screen overflow-hidden bg-electric">
      <GridBackdrop />

      <HeroCar3D onIntroComplete={() => setIntroDone(true)} playTick={playTick} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 h-full w-full"
      >
        <SpiralGallery
          introDone={introDone}
          setIntensity={setIntensity}
          playTick={playTick}
        />
      </motion.div>

      <button
        type="button"
        data-cursor="hover"
        onClick={() => {
          setSoundOn((prev) => {
            const next = !prev;
            if (next) {
              enable();
            } else {
              disable();
            }
            return next;
          });
        }}
        aria-label={soundOn ? "Mute sound" : "Enable sound"}
        aria-pressed={soundOn}
        className="pointer-events-auto fixed bottom-8 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-paper/15 bg-black/40 text-paper/80 backdrop-blur-sm transition-colors hover:text-paper md:bottom-10 md:right-10"
      >
        {soundOn ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="4 9 9 9 13 5 13 19 9 15 4 15 4 9" />
            <path d="M17 8.5a5 5 0 0 1 0 7" />
            <path d="M19.5 6a8.5 8.5 0 0 1 0 12" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="4 9 9 9 13 5 13 19 9 15 4 15 4 9" />
            <line x1="17" y1="8" x2="22" y2="13" />
            <line x1="22" y1="8" x2="17" y2="13" />
          </svg>
        )}
      </button>
    </main>
  );
}
