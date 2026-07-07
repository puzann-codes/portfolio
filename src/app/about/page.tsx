import Marquee from "@/components/Marquee";
import SkillsGrid from "@/components/SkillsGrid";
import Timeline from "@/components/Timeline";

const skillTags = [
  "React",
  "Node.js",
  "Python",
  "FastAPI",
  "MongoDB",
  "Prompt Engineering",
  "RAG",
  "Express",
  "Redux",
  "Git",
];

export default function AboutPage() {
  return (
    <main className="bg-paper pb-32 pt-32 md:pt-40">
      <section className="grid gap-10 px-6 md:grid-cols-[1.3fr_0.7fr] md:gap-16 md:px-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
            About
          </p>
          <h1 className="mt-4 font-display text-[12vw] font-extrabold uppercase leading-[0.85] tracking-tight text-ink sm:text-[7vw] lg:text-[5rem]">
            Pujan Bhatt
          </h1>
          <p className="mt-8 max-w-xl text-xl leading-relaxed text-ink/80 md:text-2xl">
            I&apos;m an AI engineer and full-stack developer who likes building
            things that solve small, real problems — a farmer&apos;s supply
            chain, a citizen&apos;s stalled complaint, a doctor&apos;s booking
            queue. I work across the stack, from React interfaces down to the
            APIs and models that power them.
          </p>
        </div>

        <div className="relative hidden aspect-square items-center justify-center overflow-hidden rounded-[3rem] bg-ink md:flex">
          <div className="animate-blob absolute h-[70%] w-[70%] bg-paper/15" />
          <span className="relative font-display text-6xl font-extrabold text-paper">
            PB
          </span>
        </div>
      </section>

      <div className="mt-16">
        <Marquee items={skillTags} />
      </div>

      <section className="px-6 pt-16 md:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          Skills
        </p>
        <div className="mt-6">
          <SkillsGrid />
        </div>
      </section>

      <section className="grid gap-16 px-6 pt-24 md:grid-cols-2 md:px-10">
        <Timeline
          title="Education"
          entries={[
            {
              title: "+2 in Science",
              place: "Sainik Awasiya Mahavidyalaya, Bhaktapur",
              meta: "Higher Secondary Education",
            },
          ]}
        />
        <Timeline
          title="Achievements"
          entries={[
            {
              title: "Runner-Up",
              place: "Civic Code Hackathon",
              meta: "Organized by Think Big",
            },
            {
              title: "2nd Runner-Up",
              place: "Hackathon",
              meta: "Organized by PCPS College",
            },
          ]}
        />
      </section>
    </main>
  );
}
