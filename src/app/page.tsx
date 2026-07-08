"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SpiralGallery from "@/components/SpiralGallery";
import GridBackdrop from "@/components/GridBackdrop";
import { useAmbientSound } from "@/lib/useAmbientSound";

const HeroCar3D = dynamic(() => import("@/components/HeroCar3D"), { ssr: false });

// intro choreography: the brand name shows up huge and centered the instant
// the page loads (it doesn't wait on the car's model download), holds that
// size while the 3D rig runs its own zoom-out/rotate animation, then the
// moment the car settles it "docks" — collapsing down into its small resting
// corner — followed by the subtitle fading in, then the spiral gallery.
// Four beats, one continuous handoff instead of four separate reveals.
const DOCK_DURATION = 0.95;
const CARDS_DELAY = DOCK_DURATION + 0.35;

export default function Home() {
  const [introDone, setIntroDone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const { enable, disable, setIntensity, playTick } = useAmbientSound();

  return (
    <main className="relative h-screen overflow-hidden bg-electric">
      <GridBackdrop />

      <HeroCar3D onIntroComplete={() => setIntroDone(true)} playTick={playTick} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: 0.8, delay: introDone ? CARDS_DELAY : 0 }}
        className="relative z-10 h-full w-full"
      >
        <SpiralGallery setIntensity={setIntensity} playTick={playTick} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 4.2, x: "36vw", y: "-40vh" }}
        animate={
          introDone
            ? { opacity: 1, scale: 1, x: 0, y: 0 }
            : { opacity: 1, scale: 4.2, x: "36vw", y: "-40vh" }
        }
        transition={
          introDone
            ? { duration: DOCK_DURATION, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0.7, ease: "easeOut", delay: 0.15 }
        }
        data-cursor="hover"
        className="absolute bottom-8 left-6 z-20 md:bottom-10 md:left-10"
      >
        <p className="font-display text-3xl font-bold uppercase leading-[0.9] text-paper md:text-4xl">
          Pujan
          <br />
          Bhatt
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: introDone ? 1 : 0 }}
          transition={{ duration: 0.5, delay: introDone ? DOCK_DURATION * 0.55 : 0 }}
          className="mt-2 font-sans text-sm text-paper/70 md:text-base"
        >
          Full-Stack &amp; AI Engineer
        </motion.p>
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
