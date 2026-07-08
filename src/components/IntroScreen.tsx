"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ScrambleText from "./ScrambleText";

const EASE = [0.16, 1, 0.3, 1] as const;

// Kinetic-type opening screen, the only thing on the page before the
// visitor commits to a choice: each line of the name is masked inside an
// overflow-hidden band and slides up into view (a `translateY` reveal, not
// a `scale` transform — scaling rasterized text up via CSS is what was
// producing the soft/blurry title before; a real block-level slide stays
// crisp at any size since the text is never resampled). The role line
// scrambles in afterward using the same decode effect already used for
// case-study titles, and the two choices fade in last.
function RevealLine({ text, delay }: { text: string; delay: number }) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.85, delay, ease: EASE }}
        className="font-display text-[16vw] font-black uppercase leading-[0.85] text-paper sm:text-[10vw]"
      >
        {text}
      </motion.div>
    </div>
  );
}

export default function IntroScreen({
  onContinue,
}: {
  onContinue: (withSound: boolean) => void;
}) {
  const [showRole, setShowRole] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowRole(true), 850);
    const t2 = setTimeout(() => setShowChoices(true), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center"
    >
      <div>
        <RevealLine text="Pujan" delay={0.1} />
        <RevealLine text="Bhatt" delay={0.26} />
      </div>

      <div className="mt-6 h-6 sm:h-7">
        {showRole && (
          <p className="font-mono text-sm uppercase tracking-[0.35em] text-paper/70 sm:text-lg">
            <ScrambleText text="Full-Stack Developer · AI Engineer" />
          </p>
        )}
      </div>

      {showChoices && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-10 flex gap-3"
        >
          <button
            type="button"
            data-cursor="hover"
            onClick={() => onContinue(true)}
            className="rounded-full border border-paper/20 px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-paper/80 transition-colors hover:border-paper/50 hover:text-paper"
          >
            Continue with sound
          </button>
          <button
            type="button"
            data-cursor="hover"
            onClick={() => onContinue(false)}
            className="rounded-full border border-paper/20 px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-paper/50 transition-colors hover:border-paper/50 hover:text-paper"
          >
            Continue without sound
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
