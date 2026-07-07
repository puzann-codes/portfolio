import { notFound } from "next/navigation";
import { getProject, getAdjacentProject, projects } from "@/lib/projects";
import ProjectCover from "@/components/ProjectCover";
import ScrambleText from "@/components/ScrambleText";
import ProjectNav from "@/components/ProjectNav";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getAdjacentProject(slug);

  const blocks = [
    { label: "Problem", body: project.problem },
    { label: "Approach", body: project.approach },
    { label: "Outcome", body: project.outcome },
  ];

  return (
    <main className="bg-paper">
      <section className="relative h-[75vh] w-full overflow-hidden pt-24 md:pt-28">
        <ProjectCover project={project} className="absolute inset-0" />
        <div className="relative flex h-full flex-col justify-end px-6 pb-12 md:px-10 md:pb-16">
          <h1 className="font-display text-[15vw] font-extrabold uppercase leading-[0.82] tracking-tight text-paper sm:text-[10vw] lg:text-[6.5rem]">
            <ScrambleText key={project.slug} text={project.title} />
          </h1>
          <p className="mt-4 max-w-xl font-mono text-sm text-paper/85 md:text-base">
            {project.tagline}
          </p>
        </div>
      </section>

      <section className="grid gap-10 border-b border-ink/10 px-6 py-16 md:grid-cols-3 md:px-10 md:py-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
            Role
          </p>
          <p className="mt-2 text-lg">{project.role}</p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
            Stack
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <span
                key={s}
                className="rounded-full border border-ink/15 px-3 py-1 text-xs"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
            Year
          </p>
          <p className="mt-2 text-lg">{project.year}</p>
        </div>
      </section>

      <section className="space-y-16 px-6 py-16 md:px-10 md:py-24">
        {blocks.map((block) => (
          <div key={block.label} className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
              {block.label}
            </p>
            <p className="mt-3 text-2xl leading-snug md:text-3xl">
              {block.body}
            </p>
          </div>
        ))}
      </section>

      <ProjectNav next={next} />
    </main>
  );
}
