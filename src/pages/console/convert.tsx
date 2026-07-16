import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatAmount } from "@/lib/format";
import { computeQuote, CURRENCIES } from "@/lib/quote";
import { settlements } from "@/mock/data";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/pay/status-badge";
import { useToast } from "@/components/ui/toast";

export default function ConvertPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [pay, setPay] = useState(10000);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("CNY");
  const q = computeQuote(pay, from, to);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("cvt.title")} subtitle={t("cvt.subtitle")} />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label>{t("cvt.youConvert")}</Label>
              <div className="grid grid-cols-[1fr_6.5rem] gap-2">
                <input
                  type="number"
                  value={pay}
                  onChange={(e) => setPay(Math.max(0, Number(e.target.value) || 0))}
                  className="h-11 rounded-md border border-input bg-background px-3 text-lg font-semibold tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
                <Sel value={from} onChange={setFrom} />
              </div>
            </div>

            <div className="flex justify-center">
              <span className="grid size-8 place-items-center rounded-full border border-border bg-muted text-muted-foreground">
                <ArrowDown className="size-4" />
              </span>
            </div>

            <div className="space-y-1.5">
              <Label>{t("cvt.youReceive")}</Label>
              <div className="grid grid-cols-[1fr_6.5rem] gap-2">
                <div className="flex h-11 items-center rounded-md border border-input bg-muted/40 px-3 text-lg font-semibold tabular-nums">
                  {formatAmount(q.get)}
                </div>
                <Sel value={to} onChange={setTo} />
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
              <Row label={t("landing.rate")} value={`1 ${from} = ${formatAmount(q.rate, { min: 4, max: 4 })} ${to}`} />
              <Row label={t("landing.spread")} value={`− ${formatAmount(q.spread)}`} />
              <Row label={t("landing.fee")} value={`${from} ${formatAmount(q.fee)}`} />
            </div>

            <Button className="w-full" size="lg" onClick={() => toast(t("cvt.done"))}>
              {t("cvt.confirm")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <div className="border-b border-border px-6 py-4 text-sm font-medium">{t("cvt.history")}</div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-6 py-2.5 text-left font-medium">{t("set.colRef")}</th>
                    <th className="px-3 py-2.5 text-left font-medium">{t("set.colCorridor")}</th>
                    <th className="px-3 py-2.5 text-right font-medium">{t("cvt.youConvert")}</th>
                    <th className="px-3 py-2.5 text-right font-medium">{t("cvt.youReceive")}</th>
                    <th className="px-6 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map((s) => (
                    <tr key={s.ref} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-3 font-medium tabular-nums">{s.ref}</td>
                      <td className="px-3 py-3 text-muted-foreground">{s.corridor}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{s.from} {formatAmount(s.pay)}</td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums">{s.to} {formatAmount(s.get)}</td>
                      <td className="px-6 py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Sel({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
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
