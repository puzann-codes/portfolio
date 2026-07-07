export default function GridGuides() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-ink/15"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <line x1="22%" y1="0" x2="22%" y2="100%" stroke="currentColor" strokeDasharray="4 7" />
      <line x1="78%" y1="0" x2="78%" y2="100%" stroke="currentColor" strokeDasharray="4 7" />
      <line x1="0" y1="16%" x2="100%" y2="16%" stroke="currentColor" strokeDasharray="4 7" />
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse
          key={i}
          cx="50%"
          cy="6%"
          rx={`${12 + i * 10}%`}
          ry={`${9 + i * 8}%`}
          fill="none"
          stroke="currentColor"
          strokeDasharray="3 6"
        />
      ))}
    </svg>
  );
}
