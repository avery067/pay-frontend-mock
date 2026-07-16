import { useState } from "react";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { computeQuote } from "@/lib/quote";
import { formatAmount } from "@/lib/format";

export function LiveQuote({ className }: { className?: string }) {
  const { t } = useI18n();
  const [pay, setPay] = useState(10000);
  const from = "USD";
  const to = "CNY";
  const q = computeQuote(pay, from, to);

  return (
    <Card className={className}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-sm font-medium">{t("landing.quoteTitle")}</span>
        <Badge variant="warning">{t("landing.locked")}</Badge>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("set.youPay")}</span>
            <span className="text-xs text-muted-foreground">{t("home.tryIt")}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <input
              type="number"
              min={0}
              value={pay}
              onChange={(e) => setPay(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-transparent text-3xl font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              style={{ fontFamily: "var(--font-display)" }}
              aria-label={t("set.youPay")}
            />
            <span className="text-sm font-medium text-muted-foreground">{from}</span>
          </div>
          <Slider
            className="mt-3"
            value={[pay]}
            min={1000}
            max={100000}
            step={500}
            onValueChange={(v) => setPay(v[0])}
          />
        </div>

        <div className="space-y-2.5 rounded-xl bg-muted/40 p-4 text-sm">
          <Row label={t("landing.rate")} value={`1 ${from} = ${formatAmount(q.rate, { min: 4, max: 4 })} ${to}`} />
          <Row label={t("landing.spread")} value={`− ${formatAmount(q.spread)}`} />
          <Row label={t("landing.fee")} value={`${from} ${formatAmount(q.fee)}`} />
          <Row label={t("landing.eta")} value={t("landing.etaValue")} />
        </div>

        <div className="rounded-xl bg-secondary/60 p-4">
          <div className="text-xs text-muted-foreground">{t("set.youGet")}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="tabular-nums text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {formatAmount(q.get)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">{to}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}
