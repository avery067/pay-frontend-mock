import { TrendingDown, TrendingUp } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatAmount } from "@/lib/format";
import { RATES } from "@/lib/quote";
import { useMock, spotRate } from "@/mock/store";

const BASES = ["USD", "EUR", "GBP", "SGD", "HKD"];

export function FxTicker() {
  const { t } = useI18n();
  const { spotRates } = useMock();
  const rows = BASES.map((base) => {
    const cur = spotRate(spotRates, base, "CNY");
    const seed = spotRate(RATES, base, "CNY");
    return { base, cur, up: cur >= seed };
  });

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border bg-card px-5 py-3">
      <span className="text-xs font-medium text-muted-foreground">{t("fxo.tickerTitle")}</span>
      {rows.map((r) => (
        <span key={r.base} className="flex items-center gap-1.5 text-sm tabular-nums">
          <span className="text-muted-foreground">{r.base}/CNY</span>
          <span className="font-semibold">{formatAmount(r.cur, { min: 4, max: 4 })}</span>
          {r.up ? <TrendingUp className="size-3.5 text-pos" /> : <TrendingDown className="size-3.5 text-neg" />}
        </span>
      ))}
    </div>
  );
}
