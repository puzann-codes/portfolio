"use client";

import { useState } from "react";
import Magnetic from "./Magnetic";

export default function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — email remains visible/selectable regardless.
    }
  };

  return (
    <Magnetic strength={0.25}>
      <button
        onClick={handleClick}
        data-cursor="hover"
        className="group relative inline-flex items-center gap-3 rounded-full border border-ink/15 bg-ink px-6 py-4 font-mono text-sm uppercase tracking-[0.1em] text-paper transition-colors duration-300 hover:bg-paper hover:text-ink sm:px-8 sm:text-base"
      >
        {email}
        <span className="text-xs opacity-70">{copied ? "Copied" : "Copy"}</span>
      </button>
    </Magnetic>
  );
}
