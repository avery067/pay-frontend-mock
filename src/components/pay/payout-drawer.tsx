import { Check, Download, Zap } from "lucide-react";
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
import { StatusBadge } from "./status-badge";
import { useToast } from "@/components/ui/toast";

const BATCH_STEPS = ["acq.stepInBatch", "acq.stepSettling", "acq.stepPaidOut", "acq.stepCredited"];
const IDX: Record<string, number> = { scheduled: 0, settling: 1, paid_out: 2, credited: 3 };

export function PayoutDrawer({
  batchId,
  onOpenChange,
}: {
  batchId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { batches, acqTxns, payoutRecords, advanceBatch, instantPayout } = useMock();
  const b = batchId ? batches.find((x) => x.id === batchId) ?? null : null;
  const txns = b ? acqTxns.filter((x) => b.txnOrders.includes(x.order)) : [];
  const payout = b ? payoutRecords.find((p) => p.batchId === b.id) : null;
  const stageIdx = b ? IDX[b.status] : 0;

  return (
    <Sheet open={!!batchId} onOpenChange={onOpenChange}>
      <SheetContent>
        {b && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{t("stmt.detailTitle")}</SheetTitle>
                <StatusBadge status={b.status} />
              </div>
              <SheetDescription className="tabular-nums">{b.id} · T+{b.termDays} · {b.payoutDate}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Cell label={t("acq.colGross")} value={formatMoney(b.gross)} />
                <Cell label={t("acq.colFee")} value={`− ${formatMoney(b.fee)}`} muted />
                <Cell label={t("acq.colReserve")} value={b.reserve > 0 ? `− ${formatMoney(b.reserve)}` : "—"} muted />
                <Cell label={t("acq.colNet")} value={formatMoney(b.net)} strong />
              </div>

              <Timeline idx={stageIdx} credited={b.status === "credited"} />

              {payout && (
                <div className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                  <div>
                    <div className="tabular-nums font-medium">{payout.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {payout.method === "instant" ? t("acq.methodInstant") : t("acq.methodStandard")}
                      {payout.fee > 0 && ` · −${formatMoney(payout.fee)}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="tabular-nums font-semibold">{formatMoney(payout.amount)}</div>
                    <div className={cn("text-xs", payout.status === "paid" ? "text-success" : "text-warning")}>
                      {payout.status === "paid" ? t("acq.payoutPaid") : t("acq.payoutInTransit")}
                    </div>
                  </div>
                </div>
              )}

              {txns.length > 0 && (
                <div>
                  <div className="mb-2 text-sm font-medium">{t("acq.tabTxns")}</div>
                  <div className="divide-y divide-border rounded-xl border border-border">
                    {txns.map((x) => (
                      <div key={x.order} className="flex items-center justify-between px-3 py-2.5 text-sm">
                        <span className="truncate text-muted-foreground">{x.merchant}</span>
                        <span className="tabular-nums font-medium">{formatMoney(x.net)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SheetBody>

            <SheetFooter className="gap-2">
              {b.status !== "credited" ? (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => advanceBatch(b.id)}>{t("acq.advance")}</Button>
                  <Button className="flex-1" onClick={() => { instantPayout(b.id); toast(t("acq.instantDone")); }}>
                    <Zap />
                    {t("acq.instant")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    exportCsv(
                      `batch-${b.id}.csv`,
                      txns.map((x) => ({ order: x.order, merchant: x.merchant, method: x.method, gross: x.gross, fee: x.fee, reserve: x.reserve, net: x.net })),
                    )
                  }
                >
                  <Download />
                  {t("common.download")}
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Timeline({ idx, credited }: { idx: number; credited: boolean }) {
  const { t } = useI18n();
  return (
    <div>
      {BATCH_STEPS.map((s, i) => {
        const done = credited || i < idx;
        const current = !credited && i === idx;
        const last = i === BATCH_STEPS.length - 1;
        return (
          <div key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border", done ? "border-transparent bg-success text-success-foreground" : current ? "border-primary text-primary" : "border-border bg-card text-muted-foreground")}>
                {done ? <Check className="size-3.5" /> : current ? <span className="size-2 rounded-full bg-primary" /> : <span className="size-1.5 rounded-full bg-current" />}
              </span>
              {!last && <span className={cn("my-1 h-6 w-px", done ? "bg-success" : "bg-border")} />}
            </div>
            <div className={cn("pb-4 text-sm", done || current ? "font-medium text-foreground" : "text-muted-foreground")}>{t(s)}</div>
          </div>
        );
      })}
    </div>
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
