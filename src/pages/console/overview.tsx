import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, ChevronRight, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useI18n } from "@/i18n";
import { formatAmount, formatMoney } from "@/lib/format";
import { acquiringTxns, payouts, type AcquiringTxn } from "@/mock/data";
import { volumeSeries } from "@/mock/more";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/pay/status-badge";
import { NewSettlementDialog } from "@/components/pay/new-settlement-dialog";
import { AcquiringTxnDrawer } from "@/components/pay/acquiring-txn-drawer";

type BadgeVariant = "success" | "warning";

const kpis: { key: string; value: string; delta: string; variant: BadgeVariant }[] = [
  { key: "console.kpiVolume", value: formatMoney(1284530), delta: "+12.4%", variant: "success" },
  { key: "console.kpiPending", value: formatMoney(342120.5), delta: "+8.1%", variant: "warning" },
  { key: "console.kpiCards", value: formatAmount(1286, { min: 0, max: 0 }), delta: "+3.2%", variant: "success" },
  { key: "console.kpiSuccess", value: "98.6%", delta: "+0.4%", variant: "success" },
];

export default function OverviewPage() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<AcquiringTxn | null>(null);
  const tooltipStyle = {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    color: "var(--popover-foreground)",
    fontSize: 12,
  } as const;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        to="/onboarding"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 transition hover:shadow-md"
        style={{ background: "var(--surface-deep)", color: "var(--surface-deep-foreground)" }}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-brand-strong">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <div className="text-sm font-medium">{t("onb.bannerTitle")}</div>
            <div className="text-xs opacity-75">{t("onb.bannerDesc")}</div>
          </div>
        </div>
        <span className={cn(buttonVariants({ variant: "brand", size: "sm" }))}>
          {t("onb.bannerCta")}
          <ArrowRight />
        </span>
      </Link>

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
          <NewSettlementDialog>
            <Button size="sm">
              <Plus />
              {t("actions.new")}
            </Button>
          </NewSettlementDialog>
        </div>
      </div>

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

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t("rep.volumeTrend")}</CardTitle>
          <span className="text-sm text-muted-foreground">{t("console.range")}</span>
        </CardHeader>
        <CardContent>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeSeries} margin={{ left: -12, right: 8, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gvOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => formatMoney(Number(v))} />
                <Area type="monotone" dataKey="v" stroke="var(--brand-strong)" strokeWidth={2} fill="url(#gvOverview)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>{t("console.recentTitle")}</CardTitle>
              <Badge variant="info">{t("console.sample")}</Badge>
            </div>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              {t("actions.viewAll")}
              <ChevronRight className="size-4" />
            </span>
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
                  {acquiringTxns.slice(0, 5).map((x) => (
                    <tr
                      key={x.order}
                      onClick={() => setSelected(x)}
                      className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-6 py-3 font-medium">{x.merchant}</td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{x.method}</td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums text-pos">+ {formatMoney(x.gross)}</td>
                      <td className="px-3 py-3"><StatusBadge status={x.status} /></td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{x.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("console.payoutsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payouts.map((p) => (
                <div key={p.batch} className="flex items-center justify-between text-sm">
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

      <AcquiringTxnDrawer item={selected} onOpenChange={(o) => { if (!o) setSelected(null); }} />
    </div>
  );
}
