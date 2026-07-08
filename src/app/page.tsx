"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import SpiralGallery from "@/components/SpiralGallery";
import GridBackdrop from "@/components/GridBackdrop";

const HeroCar3D = dynamic(() => import("@/components/HeroCar3D"), { ssr: false });

// intro choreography: the 3D car rig runs its own zoom-out/rotate animation
// and calls onIntroComplete once it settles; everything below reacts to
// that single moment — the brand name "pops" out from roughly where the
// car's window ends up on screen and drifts down to its resting corner,
// then the spiral gallery fades in once that settles. Same beat, three
// layers, so it reads as one sequence instead of three separate reveals.
const TEXT_DURATION = 0.9;
const CARDS_DELAY = TEXT_DURATION + 0.35;

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <main className="relative h-screen overflow-hidden bg-electric">
      <GridBackdrop />

      <HeroCar3D onIntroComplete={() => setIntroDone(true)} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: 0.8, delay: introDone ? CARDS_DELAY : 0 }}
        className="relative z-10 h-full w-full"
      >
        <SpiralGallery />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.35, x: "34vw", y: "-40vh" }}
        animate={
          introDone
            ? { opacity: 1, scale: 1, x: 0, y: 0 }
            : { opacity: 0, scale: 0.35, x: "34vw", y: "-40vh" }
        }
        transition={{ duration: TEXT_DURATION, ease: [0.16, 1, 0.3, 1] }}
        data-cursor="hover"
        className="absolute bottom-8 left-6 z-20 md:bottom-10 md:left-10"
      >
        <p className="font-display text-3xl font-bold uppercase leading-[0.9] text-paper md:text-4xl">
          Pujan
          <br />
          Bhatt
        </p>
        <p className="mt-2 font-sans text-sm text-paper/70 md:text-base">
          Full-Stack &amp; AI Engineer
        </p>
      </motion.div>
    </main>
  );
}
