import GridGuides from "@/components/GridGuides";
import CopyEmailButton from "@/components/CopyEmailButton";
import Magnetic from "@/components/Magnetic";

const socials = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "X / Twitter", href: "https://twitter.com" },
];

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper pb-32 pt-32 md:pt-40">
      <GridGuides />

      {/* corner crosshair marks */}
      <span className="pointer-events-none absolute left-6 top-24 h-4 w-4 border-l border-t border-ink/30 md:left-10 md:top-28" />
      <span className="pointer-events-none absolute right-6 top-24 h-4 w-4 border-r border-t border-ink/30 md:right-10 md:top-28" />
      <span className="pointer-events-none absolute bottom-24 left-6 h-4 w-4 border-b border-l border-ink/30 md:bottom-28 md:left-10" />
      <span className="pointer-events-none absolute bottom-24 right-6 h-4 w-4 border-b border-r border-ink/30 md:bottom-28 md:right-10" />

      <section className="relative px-6 md:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
          Contact
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-[11vw] font-extrabold uppercase leading-[0.9] tracking-tight text-ink sm:text-[6.5vw] lg:text-[4.75rem]">
          Let&apos;s build something worth shipping.
        </h1>

        <div className="mt-10">
          <CopyEmailButton email="hello@pujanbhatt.dev" />
        </div>
      </section>

      <section className="relative mt-24 grid gap-6 px-6 md:mt-32 md:grid-cols-2 md:px-10">
        <div className="rounded-3xl bg-paper-dim/70 p-8 md:p-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sajhadoctor opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sajhadoctor" />
            </span>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/60">
              Availability
            </p>
          </div>
          <p className="mt-5 text-2xl leading-snug md:text-3xl">
            Open to internships, freelance projects, and full-stack / AI
            engineering roles.
          </p>
          <Magnetic strength={0.2} className="mt-8 block">
            <a
              href="/resume.pdf"
              data-cursor="hover"
              className="inline-flex items-center gap-3 border-b border-ink/40 pb-1 font-mono text-sm uppercase tracking-[0.15em] text-ink transition-colors hover:border-ink"
            >
              Download Resume
              <span aria-hidden="true">↓</span>
            </a>
          </Magnetic>
        </div>

        <div className="rounded-3xl bg-ink p-8 text-paper md:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/50">
            Elsewhere
          </p>
          <ul className="mt-5 space-y-4">
            {socials.map((s) => (
              <li key={s.label}>
                <Magnetic strength={0.15}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="hover"
                    className="group flex items-center justify-between border-b border-paper/15 pb-3 font-display text-2xl uppercase tracking-tight transition-colors hover:text-paper/60 md:text-3xl"
                  >
                    {s.label}
                    <span
                      aria-hidden="true"
                      className="translate-x-0 text-lg opacity-60 transition-transform duration-300 group-hover:translate-x-2 group-hover:opacity-100"
                    >
                      ↗
                    </span>
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
