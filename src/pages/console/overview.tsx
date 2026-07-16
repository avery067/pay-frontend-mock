import { Calendar, ChevronRight, Plus, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { formatAmount, formatMoney } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type BadgeVariant = "success" | "warning" | "danger" | "info";

const kpis: { key: string; value: string; delta: string; variant: BadgeVariant }[] = [
  { key: "console.kpiVolume", value: formatMoney(1284530), delta: "+12.4%", variant: "success" },
  { key: "console.kpiPending", value: formatMoney(342120.5), delta: "+8.1%", variant: "warning" },
  { key: "console.kpiCards", value: formatAmount(1286, { min: 0, max: 0 }), delta: "+3.2%", variant: "success" },
  { key: "console.kpiSuccess", value: "98.6%", delta: "+0.4%", variant: "success" },
];

const txns: {
  name: string;
  method: string;
  dir: "in" | "out";
  amount: number;
  status: string;
  time: string;
}[] = [
  { name: "Acme Inc.", method: "Visa •••• 4242", dir: "out", amount: 1200, status: "settled", time: "09:24" },
  { name: "示例商户 001", method: "Alipay", dir: "in", amount: 3450, status: "processing", time: "09:12" },
  { name: "Globex", method: "Mastercard •••• 5100", dir: "in", amount: 880, status: "settled", time: "08:57" },
  { name: "Contoso", method: "SEPA Transfer", dir: "in", amount: 12000, status: "pending", time: "08:30" },
  { name: "示例网店", method: "WeChat Pay", dir: "out", amount: 220, status: "failed", time: "08:02" },
];

const payouts = [
  { date: "T+1 · 07-17", amount: 84250 },
  { date: "T+2 · 07-18", amount: 32120.5 },
  { date: "T+7 · 07-23", amount: 128900 },
];

const STATUS: Record<string, { variant: BadgeVariant; key: string }> = {
  settled: { variant: "success", key: "status.settled" },
  processing: { variant: "warning", key: "status.processing" },
  pending: { variant: "info", key: "status.pending" },
  failed: { variant: "danger", key: "status.failed" },
};

export default function OverviewPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* 页头 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{t("console.overviewTitle")}</h1>
            <Badge variant="info">{t("console.sample")}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t("console.overviewSub")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <Calendar className="size-4" />
            {t("console.range")}
          </button>
          <Button size="sm">
            <Plus />
            {t("actions.new")}
          </Button>
        </div>
      </div>

      {/* KPI 行 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.key}>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{t(k.key)}</div>
              <div className="mt-2 flex items-end justify-between gap-2">
                <div className="tabular-nums text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {k.value}
                </div>
                <Badge variant={k.variant}>
                  <TrendingUp className="size-3" />
                  {k.delta}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 主体两栏 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 近期交易 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>{t("console.recentTitle")}</CardTitle>
              <Badge variant="info">{t("console.sample")}</Badge>
            </div>
            <a href="#" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground">
              {t("actions.viewAll")}
              <ChevronRight className="size-4" />
            </a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border text-xs text-muted-foreground">
                    <th className="px-6 py-2.5 text-left font-medium">{t("console.colMerchant")}</th>
                    <th className="px-3 py-2.5 text-left font-medium">{t("console.colMethod")}</th>
                    <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                    <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                    <th className="px-6 py-2.5 text-right font-medium">{t("console.colTime")}</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((x, i) => {
                    const st = STATUS[x.status];
                    return (
                      <tr key={i} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-3 font-medium">{x.name}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">{x.method}</td>
                        <td className={cn("px-3 py-3 text-right font-medium tabular-nums", x.dir === "in" ? "text-pos" : "text-neg")}>
                          {x.dir === "in" ? "+ " : "− "}
                          {formatMoney(x.amount)}
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant={st.variant}>{t(st.key)}</Badge>
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{x.time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 右侧面板 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("console.payoutsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payouts.map((p) => (
                <div key={p.date} className="flex items-center justify-between text-sm">
                  <span className="tabular-nums text-muted-foreground">{p.date}</span>
                  <span className="tabular-nums font-medium">{formatMoney(p.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("console.usageTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="tabular-nums text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  62%
                </span>
                <span className="tabular-nums text-sm text-muted-foreground">
                  {formatMoney(620000)} / {formatMoney(1000000)}
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-brand" style={{ width: "62%" }} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{t("console.usageUsed")}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
