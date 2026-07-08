"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SpiralGallery from "@/components/SpiralGallery";
import GridBackdrop from "@/components/GridBackdrop";
import { useAmbientSound } from "@/lib/useAmbientSound";
import { cn } from "@/lib/utils";

const HeroCar3D = dynamic(() => import("@/components/HeroCar3D"), { ssr: false });

// intro choreography: the page opens on just the huge brand name and a
// minimal sound choice — nothing else has even started loading yet. That
// choice is the one deliberate click sound needs (clicking it directly is
// a real user gesture, so audio starts reliably instead of guessing at
// which interaction counts). The name then bounces down into its small
// resting corner, the 3D car only mounts now and runs its own reveal, and
// once it settles the gallery sweeps in fast for its opening pass before
// easing down to its normal slow drift.
export default function Home() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const { enable, disable, setIntensity, playTick } = useAmbientSound();

  const handleContinue = (withSound: boolean) => {
    setSoundOn(withSound);
    if (withSound) enable();
    setConsentGiven(true);
  };

  return (
    <main className="relative h-screen overflow-hidden bg-electric">
      <GridBackdrop />

      {consentGiven && (
        <HeroCar3D onIntroComplete={() => setIntroDone(true)} playTick={playTick} />
      )}

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

      <motion.div
        initial={false}
        animate={
          consentGiven
            ? { scale: 1, x: 0, y: 0 }
            : { scale: 4.2, x: "36vw", y: "-40vh" }
        }
        transition={{ type: "spring", stiffness: 190, damping: 15 }}
        data-cursor="hover"
        className="absolute bottom-8 left-6 z-30 md:bottom-10 md:left-10"
      >
        <p className="font-display text-3xl font-bold uppercase leading-[0.9] text-paper md:text-4xl">
          Pujan
          <br />
          Bhatt
        </p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: consentGiven ? 1 : 0 }}
          transition={{ duration: 0.5, delay: consentGiven ? 0.5 : 0 }}
          className="mt-2 font-sans text-sm text-paper/70 md:text-base"
        >
          Full-Stack &amp; AI Engineer
        </motion.p>
      </motion.div>

      {!consentGiven && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute inset-x-0 bottom-24 z-30 flex justify-center gap-3 md:bottom-28"
        >
          <button
            type="button"
            data-cursor="hover"
            onClick={() => handleContinue(true)}
            className="rounded-full border border-paper/20 px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-paper/80 transition-colors hover:border-paper/50 hover:text-paper"
          >
            Continue with sound
          </button>
          <button
            type="button"
            data-cursor="hover"
            onClick={() => handleContinue(false)}
            className="rounded-full border border-paper/20 px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-paper/50 transition-colors hover:border-paper/50 hover:text-paper"
          >
            Continue without sound
          </button>
        </motion.div>
      )}

      {consentGiven && (
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
          className={cn(
            "pointer-events-auto fixed bottom-8 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-paper/15 bg-black/40 text-paper/80 backdrop-blur-sm transition-colors hover:text-paper md:bottom-10 md:right-10",
          )}
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
      )}
    </main>
  );
}
