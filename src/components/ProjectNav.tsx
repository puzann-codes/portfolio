"use client";

import { useWipeTransition } from "./TransitionProvider";
import type { Project } from "@/lib/projects";

export default function ProjectNav({ next }: { next: Project }) {
  const { wipeTo } = useWipeTransition();

  return (
    <button
      onClick={() => wipeTo(`/work/${next.slug}`, next.color)}
      data-cursor="hover"
      className="group relative block w-full overflow-hidden border-t border-ink/10 bg-paper px-6 py-16 text-left md:px-10 md:py-24"
    >
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
        Next Project — {next.index}
      </span>
      <span className="mt-4 flex items-center gap-4 font-display text-[13vw] font-extrabold uppercase leading-[0.85] tracking-tight text-ink transition-transform duration-500 ease-out group-hover:translate-x-4 sm:text-[8vw] lg:text-[6rem]">
        {next.title}
        <span aria-hidden="true" className="text-[0.6em]">
          →
        </span>
      </span>
    </button>
  );
}
