import { useEffect, useState } from "react";
import { ChevronLeft, Download } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { exportCsv } from "@/lib/export-csv";
import { useMock } from "@/mock/store";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

/**
 * 对账中心下钻：账期对账单 → 打款批次（Payout ID）→ 逐笔交易
 * 同一个 Sheet 内用 view 切换两级列表，避免弹窗反复开合。
 */
export function ReconDrawer({
  period,
  onOpenChange,
}: {
  period: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { reconStatements, reconPayouts } = useMock();
  const [view, setView] = useState<"payouts" | "txns">("payouts");
  const [payoutId, setPayoutId] = useState<string | null>(null);

  // 每次账期切换（含关闭）都回到第一级视图，避免下次打开停在上次的下钻位置
  useEffect(() => {
    setView("payouts");
    setPayoutId(null);
  }, [period]);

  const s = period ? (reconStatements.find((x) => x.period === period) ?? null) : null;
  const payouts = s ? reconPayouts.filter((p) => s.payoutIds.includes(p.id)) : [];
  const payout = payoutId ? (reconPayouts.find((p) => p.id === payoutId) ?? null) : null;

  return (
    <Sheet open={!!s} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        {s && view === "payouts" && (
          <>
            <SheetHeader>
              <SheetTitle>{t("recon.statementDetailTitle")}</SheetTitle>
              <SheetDescription className="tabular-nums">{s.period}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Cell label={t("acq.colGross")} value={formatMoney(s.gross)} />
                <Cell label={t("acq.colFee")} value={`− ${formatMoney(s.fees)}`} muted />
                <Cell label={t("acq.refund")} value={s.refunds > 0 ? `− ${formatMoney(s.refunds)}` : "—"} muted />
                <Cell label={t("recon.colChargebacks")} value={s.chargebacks > 0 ? `− ${formatMoney(s.chargebacks)}` : "—"} muted />
                <Cell label={t("acq.colReserve")} value={s.reserve > 0 ? `− ${formatMoney(s.reserve)}` : "—"} muted />
                <Cell label={t("recon.colNetPaid")} value={formatMoney(s.netPaid)} strong />
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">{t("acq.payoutBatch")}</div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                        <th className="px-3 py-2 text-left font-medium">{t("recon.colPayoutId")}</th>
                        <th className="px-3 py-2 text-left font-medium">{t("recon.colPayoutDate")}</th>
                        <th className="px-3 py-2 text-right font-medium">{t("acq.colGross")}</th>
                        <th className="px-3 py-2 text-right font-medium">{t("acq.colFee")}</th>
                        <th className="px-3 py-2 text-right font-medium">{t("acq.colReserve")}</th>
                        <th className="px-3 py-2 text-right font-medium">{t("acq.colNet")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr
                          key={p.id}
                          onClick={() => { setPayoutId(p.id); setView("txns"); }}
                          className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50"
                        >
                          <td className="px-3 py-2.5 font-medium tabular-nums">{p.id}</td>
                          <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{p.payoutDate}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{formatMoney(p.gross)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">− {formatMoney(p.fees)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{p.reserve > 0 ? `− ${formatMoney(p.reserve)}` : "—"}</td>
                          <td className="px-3 py-2.5 text-right font-medium tabular-nums">{formatMoney(p.net)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </SheetBody>

            <SheetFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  exportCsv(
                    `statement-${s.period}.csv`,
                    payouts.map((p) => ({ payoutId: p.id, payoutDate: p.payoutDate, gross: p.gross, fees: p.fees, reserve: p.reserve, net: p.net })),
                  )
                }
              >
                <Download />
                {t("stmt.download")}
              </Button>
            </SheetFooter>
          </>
        )}

        {s && view === "txns" && payout && (
          <>
            <SheetHeader>
              <button
                type="button"
                onClick={() => { setView("payouts"); setPayoutId(null); }}
                className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                <ChevronLeft className="size-3.5" />
                {t("common.back")}
              </button>
              <SheetTitle>{t("recon.payoutDetailTitle")}</SheetTitle>
              <SheetDescription className="tabular-nums">{payout.id} · {payout.payoutDate} · {payout.batchId}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Cell label={t("acq.colGross")} value={formatMoney(payout.gross)} />
                <Cell label={t("acq.colFee")} value={`− ${formatMoney(payout.fees)}`} muted />
                <Cell label={t("acq.colReserve")} value={payout.reserve > 0 ? `− ${formatMoney(payout.reserve)}` : "—"} muted />
                <Cell label={t("acq.colNet")} value={formatMoney(payout.net)} strong />
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">{t("acq.tabTxns")}</div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-xs text-muted-foreground">
                        <th className="px-3 py-2 text-left font-medium">{t("acq.colOrder")}</th>
                        <th className="px-3 py-2 text-left font-medium">{t("console.colMerchant")}</th>
                        <th className="px-3 py-2 text-right font-medium">{t("acq.colGross")}</th>
                        <th className="px-3 py-2 text-right font-medium">{t("acq.colFee")}</th>
                        <th className="px-3 py-2 text-right font-medium">{t("acq.colReserve")}</th>
                        <th className="px-3 py-2 text-right font-medium">{t("acq.colNet")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payout.txns.map((x) => (
                        <tr key={x.order} className="border-b border-border/60 last:border-0">
                          <td className="px-3 py-2.5 font-medium tabular-nums">{x.order}</td>
                          <td className="px-3 py-2.5">{x.merchant}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums">{formatMoney(x.gross)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">− {formatMoney(x.fee)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{x.reserve > 0 ? `− ${formatMoney(x.reserve)}` : "—"}</td>
                          <td className="px-3 py-2.5 text-right font-medium tabular-nums">{formatMoney(x.net)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </SheetBody>

            <SheetFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  exportCsv(
                    `payout-${payout.id}.csv`,
                    payout.txns.map((x) => ({ order: x.order, merchant: x.merchant, gross: x.gross, fee: x.fee, reserve: x.reserve, net: x.net })),
                  )
                }
              >
                <Download />
                {t("common.download")}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Cell({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-1 tabular-nums", strong ? "text-base font-semibold" : "font-medium", muted && "text-muted-foreground")}>{value}</div>
    </div>
  );
}
