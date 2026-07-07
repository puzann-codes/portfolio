"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type WipeState = {
  visible: boolean;
  color: string;
  origin: string;
};

type Ctx = {
  wipeTo: (href: string, color: string) => void;
};

const TransitionCtx = createContext<Ctx | null>(null);

export function useWipeTransition() {
  const ctx = useContext(TransitionCtx);
  if (!ctx) {
    throw new Error("useWipeTransition must be used within TransitionProvider");
  }
  return ctx;
}

export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<WipeState>({
    visible: false,
    color: "#0a0a0a",
    origin: "90% 90%",
  });

  const wipeTo = useCallback(
    (href: string, color: string) => {
      const origin = `${40 + Math.random() * 20}% ${80 + Math.random() * 15}%`;
      setState({ visible: true, color, origin });
      window.setTimeout(() => {
        router.push(href);
      }, 550);
      window.setTimeout(() => {
        setState((s) => ({ ...s, visible: false }));
      }, 680);
    },
    [router],
  );

  return (
    <TransitionCtx.Provider value={{ wipeTo }}>
      {children}
      <AnimatePresence>
        {state.visible && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[500]"
            style={{ backgroundColor: state.color }}
            initial={{ clipPath: `circle(0% at ${state.origin})` }}
            animate={{ clipPath: `circle(150% at ${state.origin})` }}
            exit={{ clipPath: `circle(0% at 15% 15%)` }}
            transition={{ duration: 0.62, ease: [0.76, 0, 0.24, 1] }}
          />
        )}
      </AnimatePresence>
    </TransitionCtx.Provider>
  );
}

export function PageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    // no `initial={false}` here — that prop propagates through the *entire*
    // subtree and silently disables nested mount animations (like the hero
    // list's entrance swirl) even though they set their own `initial` prop.
    // Route-to-route transitions already animate correctly via the `key`
    // change below; this only affects (and now restores) the very first paint.
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
