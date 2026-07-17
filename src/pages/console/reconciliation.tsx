import { useState } from "react";
import { Download, ScrollText } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { exportCsv } from "@/lib/export-csv";
import { useMock } from "@/mock/store";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReconDrawer } from "@/components/pay/recon-drawer";

export default function ReconciliationPage() {
  const { t } = useI18n();
  const { reconStatements, reconPayouts, adjustments } = useMock();
  const [period, setPeriod] = useState<string | null>(null);
  const loading = usePageLoading();
  if (loading) return <LoadingSkeleton rows={4} />;

  const txnCount = (payoutIds: string[]) =>
    reconPayouts.filter((p) => payoutIds.includes(p.id)).reduce((n, p) => n + p.txns.length, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("recon.title")} subtitle={t("recon.subtitle")} />

      <Tabs defaultValue="statements">
        <TabsList>
          <TabsTrigger value="statements">{t("recon.tabStatements")}</TabsTrigger>
          <TabsTrigger value="adjustments">{t("recon.tabAdjustments")}</TabsTrigger>
        </TabsList>

        <TabsContent value="statements">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("recon.colPeriod")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("stmt.txns")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colGross")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colFee")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.refund")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("recon.colChargebacks")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colReserve")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("recon.colNetPaid")}</th>
                      <th className="px-6 py-2.5 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reconStatements.map((s) =>
                      s.empty ? (
                        <tr key={s.period} className="border-b border-border/60 last:border-0">
                          <td className="px-6 py-3 font-medium tabular-nums text-muted-foreground">{s.period}</td>
                          <td colSpan={8} className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                                <ScrollText className="size-4" />
                              </span>
                              <div>
                                <div className="font-medium">{t("recon.emptyPeriod")}</div>
                                <div className="text-xs text-muted-foreground">{t("recon.emptyPeriodDesc")}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr
                          key={s.period}
                          onClick={() => setPeriod(s.period)}
                          className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-6 py-3 font-medium tabular-nums">{s.period}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{txnCount(s.payoutIds).toLocaleString("en-US")}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{formatMoney(s.gross)}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">− {formatMoney(s.fees)}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{s.refunds > 0 ? `− ${formatMoney(s.refunds)}` : "—"}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{s.chargebacks > 0 ? `− ${formatMoney(s.chargebacks)}` : "—"}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{s.reserve > 0 ? `− ${formatMoney(s.reserve)}` : "—"}</td>
                          <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(s.netPaid)}</td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="outline" onClick={() => exportCsv(`statement-${s.period}.csv`, [s])}>
                                <Download />
                                {t("stmt.download")}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <p className="mb-3 text-sm text-muted-foreground">{t("recon.adjustmentsDesc")}</p>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("txn.colType")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("recon.colOriginalOrder")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                      <th className="px-6 py-2.5 text-left font-medium">{t("recon.colDeductedBatch")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.map((a) => (
                      <tr key={a.id} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-3">
                          <Badge variant={a.type === "chargeback" ? "danger" : "warning"}>
                            {a.type === "chargeback" ? t("recon.colChargebacks") : t("acq.refund")}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 tabular-nums">{a.originalOrder}</td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums text-muted-foreground">− {formatMoney(a.amount)}</td>
                        <td className="px-6 py-3 tabular-nums">{a.deductedFromBatch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReconDrawer period={period} onOpenChange={(o) => { if (!o) setPeriod(null); }} />
    </div>
  );
}
