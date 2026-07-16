import { useState } from "react";
import { Plus, RotateCcw, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatAmount, formatMoney } from "@/lib/format";
import { settleQuota } from "@/mock/more";
import { useMock } from "@/mock/store";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/pay/status-badge";
import { SettleFxDialog } from "@/components/pay/settle-fx-dialog";
import { SettleRecordDrawer } from "@/components/pay/settle-record-drawer";

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
  const { funds, records, pendingUsd, retrySettlement } = useMock();
  const [openRef, setOpenRef] = useState<string | null>(null);
  const quotaPct = Math.round((settleQuota.usedRmb / settleQuota.totalRmb) * 100);

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
          <TabsTrigger value="records">{t("stl.tabRecords")}</TabsTrigger>
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
      </Tabs>

      <SettleRecordDrawer openRef={openRef} onOpenChange={(o) => { if (!o) setOpenRef(null); }} />
    </div>
  );
}
