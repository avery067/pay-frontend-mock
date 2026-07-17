import { useState } from "react";
import { Download, Plus, RotateCcw, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatAmount, formatMoney } from "@/lib/format";
import { exportCsv } from "@/lib/export-csv";
import { settleQuota } from "@/mock/more";
import { useMock } from "@/mock/store";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/pay/status-badge";
import { SettleFxDialog } from "@/components/pay/settle-fx-dialog";
import { SettleRecordDrawer } from "@/components/pay/settle-record-drawer";
import { FxTicker } from "@/components/pay/fx-ticker";
import { FxOrderDialog } from "@/components/pay/fx-order-dialog";
import { FxForwardDialog } from "@/components/pay/fx-forward-dialog";
import { spotRate } from "@/mock/store";

const STEP_KEYS = [
  "set.stepInitiated",
  "set.stepCompliance",
  "set.stepConverting",
  "set.stepSending",
  "set.stepArrived",
];

export default function SettlementPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { funds, records, pendingUsd, retrySettlement, fxOrders, cancelFxOrder, spotRates, fxForwards, drawForward, terminateForward } = useMock();
  const [openRef, setOpenRef] = useState<string | null>(null);
  const [reconView, setReconView] = useState<"orig" | "settle">("orig");
  const quotaPct = Math.round((settleQuota.usedRmb / settleQuota.totalRmb) * 100);
  const loading = usePageLoading();

  // 对账（纯派生）：毛额 = 原币金额 × 成交汇率，点差 = 毛额 − 结算到手
  const recon = records
    .filter((r) => r.status === "settled")
    .map((r) => {
      const grossRmb = r.amount * r.rate;
      const spread = grossRmb - r.rmb;
      return { ref: r.ref, from: r.from, amount: r.amount, rate: r.rate, grossRmb, spread, rmb: r.rmb, diff: grossRmb - spread - r.rmb };
    });
  const reconTotal = recon.reduce(
    (a, r) => ({ grossRmb: a.grossRmb + r.grossRmb, spread: a.spread + r.spread, rmb: a.rmb + r.rmb }),
    { grossRmb: 0, spread: 0, rmb: 0 },
  );

  if (loading) return <LoadingSkeleton kpis={3} rows={5} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("stl.title")}
        subtitle={t("stl.subtitle")}
        actions={
          <SettleFxDialog>
            <Button size="sm">
              <Plus />
              {t("stl.newTitle")}
            </Button>
          </SettleFxDialog>
        }
      />

      <FxTicker />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">{t("stl.dirStatus")}</div>
            <div className="mt-2 flex items-center gap-2">
              <ShieldCheck className="size-5 text-success" />
              <span className="text-lg font-semibold">{t("stl.dirA")}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-muted-foreground">{t("stl.pendingTitle")}</div>
            <div className="mt-2 tabular-nums text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {formatMoney(pendingUsd)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">{t("stl.quotaTitle")}</span>
              <span className="tabular-nums text-xs text-muted-foreground">{quotaPct}%</span>
            </div>
            <div className="mt-2 tabular-nums text-sm">
              <span className="font-semibold">RMB {formatAmount(settleQuota.usedRmb, { min: 0, max: 0 })}</span>
              <span className="text-muted-foreground"> / {formatAmount(settleQuota.totalRmb, { min: 0, max: 0 })}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-brand" style={{ width: `${quotaPct}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">{t("stl.tabPending")}</TabsTrigger>
          <TabsTrigger value="orders">{t("fxo.tab")}</TabsTrigger>
          <TabsTrigger value="forwards">{t("fwd.tab")}</TabsTrigger>
          <TabsTrigger value="records">{t("stl.tabRecords")}</TabsTrigger>
          <TabsTrigger value="recon">{t("stl.tabRecon")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("stl.colSource")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("stl.colTrade")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("stl.colArrived")}</th>
                      <th className="px-6 py-2.5 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {funds.map((f) => (
                      <tr key={f.id} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-3">
                          <div className="font-medium">{f.source}</div>
                          <div className="tabular-nums text-xs text-muted-foreground">{f.id}</div>
                        </td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{f.currency} {formatAmount(f.amount)}</td>
                        <td className="px-3 py-3">
                          {f.tradeVerified ? (
                            <Badge variant="success">{t("stl.tradeVerified")}</Badge>
                          ) : (
                            <Badge variant="warning">{t("stl.tradePending")}</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">{f.arrived}</td>
                        <td className="px-6 py-3 text-right">
                          <SettleFxDialog fund={f}>
                            <Button size="sm" variant="outline" disabled={!f.tradeVerified}>
                              {t("stl.settle")}
                            </Button>
                          </SettleFxDialog>
                        </td>
                      </tr>
                    ))}
                    {funds.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">—</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
              <p className="text-xs text-muted-foreground">{t("fxo.hint")}</p>
              <FxOrderDialog>
                <Button size="sm">
                  <Plus />
                  {t("fxo.new")}
                </Button>
              </FxOrderDialog>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("stl.recRef")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("fxo.amount")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("fxo.colTarget")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("fxo.current")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("fxo.distance")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                      <th className="px-6 py-2.5 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fxOrders.map((o) => {
                      const cur = spotRate(spotRates, o.from, "CNY");
                      const dist = ((o.targetRate - cur) / cur) * 100 * (o.direction === "gte" ? 1 : -1);
                      return (
                        <tr key={o.id} className="border-b border-border/60 last:border-0">
                          <td className="px-6 py-3 font-medium tabular-nums">{o.id}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{o.from} {formatAmount(o.amount)}</td>
                          <td className="px-3 py-3 text-right tabular-nums">{formatAmount(o.targetRate, { min: 4, max: 4 })}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatAmount(cur, { min: 4, max: 4 })}</td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {o.status === "watching" ? (
                              <span className={dist <= 0 ? "text-pos" : "text-muted-foreground"}>{dist > 0 ? `${dist.toFixed(2)}%` : "≤0%"}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                          <td className="px-6 py-3 text-right">
                            {o.status === "watching" && (
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-danger hover:text-danger" onClick={() => { cancelFxOrder(o.id); toast(t("fxo.cancelled")); }}>
                                {t("fxo.cancel")}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {fxOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground">{t("common.empty")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forwards">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
              <p className="text-xs text-muted-foreground">{t("fwd.hint")}</p>
              <FxForwardDialog>
                <Button size="sm">
                  <Plus />
                  {t("fwd.new")}
                </Button>
              </FxForwardDialog>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("fwd.colContract")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("fwd.notional")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("fwd.locked")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("fwd.spot")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("fwd.mtm")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                      <th className="px-6 py-2.5 text-right font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fxForwards.map((f) => {
                      const spot = spotRate(spotRates, f.from, "CNY");
                      const remaining = f.notional - f.drawn;
                      const mtm = (spot - f.lockedRate) * remaining;
                      const open = f.status === "active" || f.status === "partially_drawn";
                      const stKey = f.status === "active" ? "fwd.statusActive" : f.status === "partially_drawn" ? "fwd.statusPartial" : f.status === "settled" ? "fwd.statusSettled" : "fwd.statusCancelled";
                      const stTone = f.status === "settled" ? "text-success" : f.status === "cancelled" ? "text-muted-foreground" : "text-foreground";
                      return (
                        <tr key={f.id} className="border-b border-border/60 last:border-0">
                          <td className="px-6 py-3">
                            <div className="font-medium tabular-nums">{f.id}</div>
                            <div className="text-xs text-muted-foreground">{f.termLabel}</div>
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums">
                            {f.from} {formatAmount(f.notional)}
                            {f.drawn > 0 && <div className="text-xs text-muted-foreground">{t("fwd.drawn")} {formatAmount(f.drawn)}</div>}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums font-medium">{formatAmount(f.lockedRate, { min: 4, max: 4 })}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatAmount(spot, { min: 4, max: 4 })}</td>
                          <td className={cn("px-3 py-3 text-right tabular-nums font-medium", open ? (mtm >= 0 ? "text-pos" : "text-neg") : "text-muted-foreground")}>
                            {open ? `${mtm >= 0 ? "+" : "−"} ${formatAmount(Math.abs(mtm), { min: 0, max: 0 })}` : "—"}
                          </td>
                          <td className={cn("px-3 py-3 font-medium", stTone)}>{t(stKey)}</td>
                          <td className="px-6 py-3">
                            {open && (
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => drawForward(f.id)}>{t("fwd.draw")}</Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-danger hover:text-danger" onClick={() => { terminateForward(f.id); toast(t("fwd.terminated")); }}>{t("fwd.terminate")}</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {fxForwards.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground">{t("common.empty")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("stl.recRef")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("cvt.youConvert")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">RMB</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("stl.stage")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("stl.recDeclare")}</th>
                      <th className="px-6 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr
                        key={r.ref}
                        onClick={() => setOpenRef(r.ref)}
                        className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50"
                      >
                        <td className="px-6 py-3 font-medium tabular-nums">{r.ref}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{r.from} {formatAmount(r.amount)}</td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatAmount(r.rmb)}</td>
                        <td className="px-3 py-3">
                          <span className={r.status === "processing" ? "text-foreground" : "text-muted-foreground"}>
                            {t(STEP_KEYS[r.stage])}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {r.declared ? (
                            <Badge variant="success">{t("stl.declared")}</Badge>
                          ) : (
                            <Badge variant="warning">{t("stl.toDeclare")}</Badge>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={r.status} />
                            {r.status === "failed" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 gap-1 px-2 text-xs text-danger hover:text-danger"
                                onClick={(e) => { e.stopPropagation(); retrySettlement(r.ref); toast(t("stl.retryDone")); }}
                              >
                                <RotateCcw className="size-3" />
                                {t("stl.retry")}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recon">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
              <div className="flex rounded-lg border border-border p-0.5 text-sm">
                {(["orig", "settle"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setReconView(v)}
                    className={cn("rounded-md px-3 py-1 font-medium transition", reconView === v ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    {v === "orig" ? t("stl.viewOrig") : t("stl.viewSettle")}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={() => exportCsv("settlement-recon.csv", recon)}>
                <Download />
                {t("rep.export")}
              </Button>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("stl.recRef")}</th>
                      {reconView === "orig" ? (
                        <>
                          <th className="px-3 py-2.5 text-right font-medium">{t("cvt.youConvert")}</th>
                          <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                        </>
                      ) : (
                        <>
                          <th className="px-3 py-2.5 text-right font-medium">{t("stl.colGrossRmb")}</th>
                          <th className="px-3 py-2.5 text-right font-medium">{t("stl.colSpread")}</th>
                        </>
                      )}
                      <th className="px-3 py-2.5 text-right font-medium">{t("stl.colNetRmb")}</th>
                      <th className="px-6 py-2.5 text-right font-medium">{t("stl.colReconcile")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recon.map((r) => (
                      <tr key={r.ref} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-3 font-medium tabular-nums">{r.ref}</td>
                        {reconView === "orig" ? (
                          <>
                            <td className="px-3 py-3 text-right tabular-nums">{r.from} {formatAmount(r.amount)}</td>
                            <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatAmount(r.rate, { min: 4, max: 4 })}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-3 text-right tabular-nums">{formatAmount(r.grossRmb)}</td>
                            <td className="px-3 py-3 text-right tabular-nums text-neg">− {formatAmount(r.spread)}</td>
                          </>
                        )}
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatAmount(r.rmb)}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-success">{r.diff.toFixed(2)}</td>
                      </tr>
                    ))}
                    {recon.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">{t("common.empty")}</td>
                      </tr>
                    )}
                  </tbody>
                  {recon.length > 0 && (
                    <tfoot>
                      <tr className="border-t border-border font-medium">
                        <td className="px-6 py-3">{t("stl.totalRow")}</td>
                        {reconView === "orig" ? (
                          <>
                            <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                            <td className="px-3 py-3 text-right text-muted-foreground">—</td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-3 text-right tabular-nums">{formatAmount(reconTotal.grossRmb)}</td>
                            <td className="px-3 py-3 text-right tabular-nums text-neg">− {formatAmount(reconTotal.spread)}</td>
                          </>
                        )}
                        <td className="px-3 py-3 text-right tabular-nums">{formatAmount(reconTotal.rmb)}</td>
                        <td className="px-6 py-3 text-right tabular-nums text-success">0.00</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <p className="px-6 py-3 text-xs text-muted-foreground">{t("stl.reconTip")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SettleRecordDrawer openRef={openRef} onOpenChange={(o) => { if (!o) setOpenRef(null); }} />
    </div>
  );
}
