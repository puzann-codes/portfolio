"use client";

import { motion } from "framer-motion";
import SpiralGallery from "@/components/SpiralGallery";
import GridBackdrop from "@/components/GridBackdrop";

export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden bg-electric">
      <GridBackdrop />

      <div className="relative z-10 h-full w-full">
        <SpiralGallery />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
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
