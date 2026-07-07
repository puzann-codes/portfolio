export default function Marquee({ items }: { items: string[] }) {
  return (
    <div className="group relative overflow-hidden border-y border-ink/10 py-5">
      <div className="animate-marquee flex w-max gap-10 font-mono text-sm uppercase tracking-[0.15em] group-hover:[animation-play-state:paused]">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap text-ink/70">
            {item}
            <span aria-hidden="true" className="text-ink/25">
              /
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
