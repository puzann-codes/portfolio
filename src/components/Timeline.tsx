type Entry = {
  title: string;
  place: string;
  meta?: string;
};

export default function Timeline({
  title,
  entries,
}: {
  title: string;
  entries: Entry[];
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
        {title}
      </p>
      <ul className="mt-5 space-y-7 border-l border-ink/15 pl-6">
        {entries.map((e) => (
          <li key={e.title} className="relative">
            <span className="absolute -left-[27px] top-2 h-2 w-2 rounded-full bg-ink" />
            <p className="text-xl font-medium leading-snug">{e.title}</p>
            <p className="mt-1 text-ink/60">{e.place}</p>
            {e.meta && (
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-ink/40">
                {e.meta}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
