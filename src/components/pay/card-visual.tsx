import { Snowflake, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { CardBrand } from "./card-brand";

export function CardVisual({
  name,
  brand,
  last4,
  currency,
  frozen = false,
  type,
  className,
}: {
  name: string;
  brand: string;
  last4: string;
  currency: string;
  frozen?: boolean;
  type?: "virtual" | "physical" | "single_use" | "vendor";
  className?: string;
}) {
  const { t } = useI18n();
  const typeLabel = type === "single_use" ? t("iss.singleUse") : type === "vendor" ? t("iss.vendorCard") : null;
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
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-medium opacity-95">{name}</span>
          <div className="flex shrink-0 items-center gap-1.5">
            {typeLabel && (
              <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide opacity-90">{typeLabel}</span>
            )}
            {frozen ? (
              <Snowflake className="size-4 opacity-80" />
            ) : (
              <Wifi className="size-4 rotate-90 opacity-70" />
            )}
          </div>
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
