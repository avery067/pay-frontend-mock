import { Check, EyeOff, RotateCcw, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { useMock } from "@/mock/store";
import type { FraudAlert } from "@/mock/more";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

const TIER_TONE: Record<string, string> = {
  normal: "success",
  watch: "warning",
  restricted: "danger",
};

// 预警来源 / 原因 / 状态：枚举值 + 本地映射表，文案统一走 i18n（沿用 disputes.tsx 的 DISPUTE_REASON/DISPUTE_STATUS 模式）
const ALERT_SOURCE_KEY: Record<FraudAlert["source"], string> = {
  rdr: "sourceRdr",
  ethoca: "sourceEthoca",
  fraud_alert: "sourceFraudAlert",
};

const ALERT_REASON_KEY: Record<FraudAlert["reason"], string> = {
  cardholder_fraud: "reasonCardholderFraud",
  unauthorized: "reasonUnauthorized",
  subscription_cancelled: "reasonSubscriptionCancelled",
  duplicate: "reasonDuplicate",
};

const ALERT_STATUS_KEY: Record<FraudAlert["status"], string> = {
  open: "stOpen",
  auto_refunded: "stAutoRefunded",
  merchant_refunded: "stMerchantRefunded",
  ignored: "stIgnored",
};

const ALERT_STATUS_TONE: Record<FraudAlert["status"], "warning" | "success" | "outline"> = {
  open: "warning",
  auto_refunded: "success",
  merchant_refunded: "success",
  ignored: "outline",
};

export default function RiskPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const {
    acqTxns, riskRules, toggleRule, approveReview, declineReview, disputeRatio, riskThreshold, riskTier,
    fraudAlerts, autoRules, resolveAlert, toggleAutoRule, alertsIntercepted, alertsAvoidedRatio,
  } = useMock();
  const loading = usePageLoading();

  const queue = acqTxns.filter((x) => x.status === "review");
  const pct = Math.min(100, Math.round((disputeRatio / riskThreshold) * 100));
  const barTone = pct >= 100 ? "bg-danger" : pct >= 85 ? "bg-warning" : "bg-success";
  const approvalRate = (() => {
    const decided = acqTxns.filter((x) => x.status !== "review").length;
    const declined = acqTxns.filter((x) => x.status === "voided" || x.status === "failed").length;
    return decided ? (((decided - declined) / decided) * 100).toFixed(1) : "100.0";
  })();
  const openAlerts = fraudAlerts.filter((a) => a.status === "open");

  if (loading) return <LoadingSkeleton kpis={3} rows={5} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("risk.title")}
        subtitle={t("risk.subtitle")}
        actions={<Badge variant={TIER_TONE[riskTier] as "success" | "warning" | "danger"}>{t("risk.tier" + riskTier.charAt(0).toUpperCase() + riskTier.slice(1))}</Badge>}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("risk.tabOverview")}</TabsTrigger>
          <TabsTrigger value="alerts">{t("risk.tabAlerts")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">{t("risk.ratioTitle")}</span>
                  <span className="tabular-nums text-xs text-muted-foreground">{t("risk.threshold")} {riskThreshold}%</span>
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className={cn("tabular-nums text-3xl font-semibold", pct >= 100 ? "text-danger" : pct >= 85 ? "text-warning" : "")} style={{ fontFamily: "var(--font-display)" }}>
                    {disputeRatio.toFixed(2)}%
                  </span>
                </div>
                <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className={cn("h-full rounded-full transition-[width] duration-500", barTone)} style={{ width: `${pct}%` }} />
                  <div className="absolute inset-y-0" style={{ left: "100%" }} />
                </div>
                <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                  {t("risk.tierHint")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex h-full flex-col justify-center p-6">
                <div className="text-sm text-muted-foreground">{t("risk.approvalRate")}</div>
                <div className="mt-2 tabular-nums text-3xl font-semibold text-success" style={{ fontFamily: "var(--font-display)" }}>
                  {approvalRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>{t("risk.queueTitle")}</CardTitle>
                {queue.length > 0 && <Badge variant="warning">{queue.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("risk.colOrder")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("risk.colAmount")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("risk.colScore")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("risk.rules")}</th>
                      <th className="px-6 py-2.5 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((x) => (
                      <tr key={x.order} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-3">
                          <div className="font-medium">{x.merchant}</div>
                          <div className="tabular-nums text-xs text-muted-foreground">{x.order} · {x.method}</div>
                        </td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(x.gross, x.currency)}</td>
                        <td className="px-3 py-3">
                          <span className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                            (x.riskScore ?? 0) >= 75 ? "bg-danger/15 text-danger" : (x.riskScore ?? 0) >= 50 ? "bg-warning/15 text-warning" : "bg-success/15 text-success",
                          )}>
                            {x.riskScore ?? 0}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(x.riskRules ?? []).map((r) => (
                              <span key={r} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{r}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => { approveReview(x.order); toast(t("risk.approved")); }}>
                              <Check className="size-3" />
                              {t("risk.approve")}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs text-danger hover:text-danger" onClick={() => { declineReview(x.order); toast(t("risk.declinedToast")); }}>
                              <X className="size-3" />
                              {t("risk.decline")}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {queue.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">{t("risk.queueEmpty")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("risk.rulesTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {riskRules.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-sm">{lang === "zh" ? r.zh : r.en}</span>
                  <Switch checked={r.on} onCheckedChange={() => { toggleRule(r.id); toast(t("risk.ruleToast")); }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">{t("alert.statIntercepted")}</div>
                <div className="mt-2 tabular-nums text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {alertsIntercepted} <span className="text-base font-normal text-muted-foreground">{t("alert.count")}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">{t("alert.statAvoided")}</div>
                <div className="mt-2 tabular-nums text-3xl font-semibold text-success" style={{ fontFamily: "var(--font-display)" }}>
                  +{alertsAvoidedRatio.toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>{t("alert.queueTitle")}</CardTitle>
                {openAlerts.length > 0 && <Badge variant="warning">{openAlerts.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("alert.colOrder")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("alert.colSource")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("alert.colReason")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("risk.colAmount")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("alert.colDeadline")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                      <th className="px-6 py-2.5 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudAlerts.map((a) => (
                      <tr key={a.id} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-3">
                          <div className="font-medium tabular-nums">{a.order}</div>
                          <div className="tabular-nums text-xs text-muted-foreground">{a.id}</div>
                        </td>
                        <td className="px-3 py-3">{t(`alert.${ALERT_SOURCE_KEY[a.source]}`)}</td>
                        <td className="px-3 py-3 text-muted-foreground">{t(`alert.${ALERT_REASON_KEY[a.reason]}`)}</td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(a.amount, a.currency)}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">{a.deadline}</td>
                        <td className="px-3 py-3">
                          <Badge variant={ALERT_STATUS_TONE[a.status]}>{t(`alert.${ALERT_STATUS_KEY[a.status]}`)}</Badge>
                        </td>
                        <td className="px-6 py-3">
                          {a.status === "open" && (
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => { resolveAlert(a.id, "refund"); toast(t("alert.refundedToast")); }}>
                                <RotateCcw className="size-3" />
                                {t("alert.refund")}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs text-muted-foreground" onClick={() => { resolveAlert(a.id, "ignore"); toast(t("alert.ignoredToast")); }}>
                                <EyeOff className="size-3" />
                                {t("alert.ignore")}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {fraudAlerts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">{t("alert.queueEmpty")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("alert.autoRulesTitle")}</CardTitle>
              <CardDescription>{t("alert.autoRulesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {autoRules.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-sm">{lang === "zh" ? r.zh : r.en}</span>
                  <Switch checked={r.on} onCheckedChange={() => { toggleAutoRule(r.id); toast(t("alert.ruleToast")); }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
