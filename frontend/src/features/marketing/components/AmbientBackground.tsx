export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Soft gradient blur spheres */}
      <div className="absolute -top-32 -left-32 size-96 rounded-full bg-sage-200/40 blur-3xl animate-float-gentle" />
      <div className="absolute top-1/3 -right-48 size-[28rem] rounded-full bg-teal-200/30 blur-3xl animate-pulse-subtle" />
      <div className="absolute bottom-10 left-1/4 size-80 rounded-full bg-cream-200/60 blur-2xl" />

      {/* Decorative ambient subtle SVG orbital rings */}
      <svg
        className="absolute top-12 right-10 size-[36rem] opacity-25 text-sage-300 animate-glow-orbit"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="250" cy="250" r="240" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" />
        <circle cx="250" cy="250" r="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 16" />
        <circle cx="250" cy="250" r="120" stroke="currentColor" strokeWidth="1" />
        <circle cx="370" cy="250" r="5" fill="currentColor" />
        <circle cx="250" cy="70" r="4" fill="currentColor" />
      </svg>
    </div>
  )
}
