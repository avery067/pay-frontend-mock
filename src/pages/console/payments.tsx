import { useState } from "react";
import { Zap } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { useMock } from "@/mock/store";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/pay/status-badge";
import { AcquiringTxnDrawer } from "@/components/pay/acquiring-txn-drawer";
import { PayoutDrawer } from "@/components/pay/payout-drawer";
import { useToast } from "@/components/ui/toast";

export default function PaymentsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const {
    acqTxns,
    batches,
    reserves,
    pendingPoolUsd,
    reservedUsd,
    instantAvailableUsd,
    captureTxn,
    voidTxn,
    advanceBatch,
    instantPayout,
    releaseReserve,
  } = useMock();
  const [txnOrder, setTxnOrder] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  const kpis = [
    { label: t("console.kpiVolume"), value: formatMoney(acqTxns.reduce((s, x) => s + x.gross, 0)) },
    { label: t("acq.kpiPool"), value: formatMoney(pendingPoolUsd) },
    { label: t("acq.kpiReserved"), value: formatMoney(reservedUsd) },
    { label: t("acq.kpiInstant"), value: formatMoney(instantAvailableUsd) },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("nav.payments")} subtitle={t("acq.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{k.label}</div>
              <div className="mt-2 tabular-nums text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {k.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="txns">
        <TabsList>
          <TabsTrigger value="txns">{t("acq.tabTxns")}</TabsTrigger>
          <TabsTrigger value="payouts">{t("acq.tabPayouts")}</TabsTrigger>
          <TabsTrigger value="reserve">{t("acq.tabReserve")}</TabsTrigger>
        </TabsList>

        <TabsContent value="txns">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("acq.colOrder")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colMerchant")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colGross")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colNet")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                      <th className="px-6 py-2.5 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {acqTxns.map((x) => (
                      <tr key={x.order} onClick={() => setTxnOrder(x.order)} className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50">
                        <td className="px-6 py-3 font-medium tabular-nums">{x.order}</td>
                        <td className="px-3 py-3">
                          {x.merchant}
                          <div className="tabular-nums text-xs text-muted-foreground">{x.method}</div>
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums">{formatMoney(x.gross)}</td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(x.net)}</td>
                        <td className="px-3 py-3"><StatusBadge status={x.status} /></td>
                        <td className="px-6 py-3 text-right">
                          {x.status === "authorized" && (
                            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="outline" onClick={() => { captureTxn(x.order); toast(t("acq.captured")); }}>{t("acq.capture")}</Button>
                              <Button size="sm" variant="ghost" onClick={() => { voidTxn(x.order); toast(t("acq.voided")); }}>{t("acq.voidTxn")}</Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("acq.payoutBatch")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("acq.colTerm")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colGross")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colFee")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colReserve")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colNet")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                      <th className="px-6 py-2.5 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr key={b.id} onClick={() => setBatchId(b.id)} className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50">
                        <td className="px-6 py-3 font-medium tabular-nums">{b.id}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">T+{b.termDays} · {b.payoutDate}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{formatMoney(b.gross)}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">− {formatMoney(b.fee)}</td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{b.reserve > 0 ? `− ${formatMoney(b.reserve)}` : "—"}</td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(b.net)}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={b.status} />
                          {b.instant && <span className="ml-1 text-[10px] text-muted-foreground">⚡</span>}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {b.status !== "credited" && (
                            <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button size="sm" variant="outline" onClick={() => advanceBatch(b.id)}>{t("acq.advance")}</Button>
                              <Button size="sm" onClick={() => { instantPayout(b.id); toast(t("acq.instantDone")); }}>
                                <Zap />
                                {t("acq.instant")}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reserve">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("acq.tabReserve")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("acq.payoutBatch")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("acq.releaseOn")}</th>
                      <th className="px-6 py-2.5 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reserves.map((r) => (
                      <tr key={r.id} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-3 font-medium tabular-nums">{r.id}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">{r.batchId}</td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(r.amount)}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">{r.releaseOn}</td>
                        <td className="px-6 py-3 text-right">
                          {r.released ? (
                            <Badge variant="success">{t("acq.released")}</Badge>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => { releaseReserve(r.id); toast(t("acq.released")); }}>
                              {t("acq.release")}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AcquiringTxnDrawer order={txnOrder} onOpenChange={(o) => { if (!o) setTxnOrder(null); }} />
      <PayoutDrawer batchId={batchId} onOpenChange={(o) => { if (!o) setBatchId(null); }} />
    </div>
  );
}
