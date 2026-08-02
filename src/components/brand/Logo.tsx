export function Logo({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 34c6-2 8-12 14-14s10 8 16 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.65"
      />
      <path
        d="M24 6l9 16H15l9-16z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="24" cy="27" r="4.5" stroke="currentColor" strokeWidth="2" />
      <path d="M24 31.5V42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="6" cy="34" r="2.5" fill="currentColor" />
      <circle cx="42" cy="24" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Logo className="text-primary" size={compact ? 22 : 28} />
      <div className="leading-none">
        <div className="font-display text-[15px] font-semibold uppercase tracking-[0.18em] text-foreground">
          Drone<span className="text-primary">Route</span> AI
        </div>
        <div className="label-mono mt-1 text-[9px] text-primary/80">Egypt Edition</div>
        {!compact && (
          <div className="label-mono mt-1 text-[9px]">
            Egyptian Drone Intelligence · Plan Smarter · Fly Safer · Cover More
          </div>
        )}
      </div>
    </div>
  );
}

