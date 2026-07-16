import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
  invert = false,
}: {
  className?: string;
  showText?: boolean;
  invert?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg",
          invert
            ? "bg-brand text-brand-strong"
            : "bg-primary text-primary-foreground",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
          <ellipse cx="12" cy="12" rx="4.2" ry="9" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      {showText && (
        <span
          className="text-lg font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Meridian
        </span>
      )}
    </span>
  );
}
