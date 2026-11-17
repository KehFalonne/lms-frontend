/**
 * Shared brand canvas — layered gradient, ambient glows and the two
 * edge-masked geometric motifs (dot grid top-left, architectural arcs
 * top-right). Used by the auth chrome and the public landing page so
 * both stay pixel-consistent. Pure CSS/SVG, no external assets.
 */
export function BrandCanvas() {
  return (
    <>
      {/* Base wash — light and dark canvases */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,hsl(221_55%_96%)_0%,hsl(0_0%_100%)_42%,hsl(218_38%_95%)_100%)] dark:bg-[linear-gradient(155deg,hsl(222_47%_9%)_0%,hsl(222_47%_13%)_45%,hsl(221_35%_17%)_100%)]"
      />

      {/* Ambient brand glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(221_83%_53%/0.20),transparent)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,hsl(199_89%_48%/0.16),transparent)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 -right-40 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,hsl(142_71%_45%/0.10),transparent)] blur-2xl"
      />

      {/* Geometric motif — dot grid, top-left */}
      <svg
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-72 w-72 [mask-image:radial-gradient(120%_120%_at_0%_0%,black_20%,transparent_75%)]"
        viewBox="0 0 240 240"
        fill="hsl(var(--primary))"
        opacity="0.28"
      >
        {Array.from({ length: 11 }).map((_, row) =>
          Array.from({ length: 11 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={12 + col * 20}
              cy={12 + row * 20}
              r={(row + col) % 5 === 0 ? 2.6 : 1.5}
            />
          )),
        )}
      </svg>

      {/* Geometric motif — concentric architectural arcs, top-right */}
      <svg
        aria-hidden
        className="pointer-events-none absolute -right-36 -top-36 h-[30rem] w-[30rem] [mask-image:radial-gradient(120%_120%_at_100%_0%,black_25%,transparent_78%)]"
        viewBox="0 0 480 480"
        fill="none"
      >
        <g stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="1.4">
          <circle cx="480" cy="0" r="90" />
          <circle cx="480" cy="0" r="150" strokeDasharray="3 7" />
          <circle cx="480" cy="0" r="210" />
          <circle cx="480" cy="0" r="270" strokeDasharray="2 10" strokeOpacity="0.5" />
          <circle cx="480" cy="0" r="330" strokeOpacity="0.35" />
        </g>
        <g stroke="hsl(var(--primary))" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round">
          <path d="M362 118h28M376 104v28" />
          <path d="M268 208h20M278 198v20" />
        </g>
        <circle cx="376" cy="118" r="3.4" fill="hsl(var(--primary))" fillOpacity="0.55" />
        <circle cx="278" cy="208" r="2.6" fill="hsl(var(--primary))" fillOpacity="0.4" />
      </svg>

      {/* Geometric motif — dotted + hairline arcs, bottom-left */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 [mask-image:radial-gradient(130%_130%_at_0%_100%,black_25%,transparent_75%)]"
        viewBox="0 0 300 300"
        fill="none"
      >
        <path
          d="M-20 300 A 210 210 0 0 1 300 -20"
          stroke="hsl(var(--primary))"
          strokeOpacity="0.35"
          strokeWidth="1.3"
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
        <path
          d="M-40 320 A 260 260 0 0 1 320 -40"
          stroke="hsl(var(--primary))"
          strokeOpacity="0.25"
          strokeWidth="1.3"
        />
      </svg>
    </>
  );
}
