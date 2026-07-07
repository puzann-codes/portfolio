export default function GridBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,243,238,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(245,243,238,0.12) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage:
            "radial-gradient(120% 100% at 50% 40%, black 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(120% 100% at 50% 40%, black 40%, transparent 90%)",
        }}
      />
    </div>
  );
}
