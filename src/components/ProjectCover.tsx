import Image from "next/image";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

export default function ProjectCover({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `linear-gradient(135deg, ${project.color} 0%, ${project.color}b3 45%, #0a0a0b 145%)`,
      }}
    >
      <Image
        src={project.image}
        alt=""
        fill
        sizes="(max-width: 768px) 90vw, 400px"
        className="object-cover"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(0deg, rgba(10,10,11,0.55) 0%, transparent 30%)",
        }}
        aria-hidden="true"
      />
      <span className="absolute left-4 top-4 font-mono text-xs uppercase tracking-[0.2em] text-paper/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)] md:left-6 md:top-6">
        {project.index} / {project.year}
      </span>
    </div>
  );
}
