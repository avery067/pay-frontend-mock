import { Snowflake, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardBrand } from "./card-brand";

export function CardVisual({
  name,
  brand,
  last4,
  currency,
  frozen = false,
  className,
}: {
  name: string;
  brand: string;
  last4: string;
  currency: string;
  frozen?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl p-5 shadow-md",
        className,
      )}
      style={{
        background: frozen
          ? "linear-gradient(135deg, #3a3f45, #22262b)"
          : "var(--surface-deep)",
        color: "var(--surface-deep-foreground)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full opacity-30 blur-2xl"
        style={{ background: "var(--brand)" }}
      />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium opacity-95">{name}</span>
          {frozen ? (
            <Snowflake className="size-4 opacity-80" />
          ) : (
            <Wifi className="size-4 rotate-90 opacity-70" />
          )}
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div
              className="text-lg tracking-[0.2em] tabular-nums"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              •••• {last4}
            </div>
            <div className="mt-1.5 tabular-nums text-xs opacity-75">{currency}</div>
          </div>
          <CardBrand brand={brand} className="h-6 w-auto" />
        </div>
      </div>
    </div>
  );
}
