import { useEffect, useState } from "react";
import { Check, ChevronDown, PlusCircle, StopCircle } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { useMock } from "@/mock/store";
import { useToast } from "@/components/ui/toast";
import { CaptureDialog } from "./capture-dialog";
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
import { RefundDialog } from "./refund-dialog";

const STEP_KEYS = [
  "acq.stepAuthorized",
  "acq.stepCaptured",
  "acq.stepInBatch",
  "acq.stepSettling",
  "acq.stepPaidOut",
  "acq.stepCredited",
];

const BRANCH = ["voided", "refunded", "disputed", "failed"];
const CAPTURED_PLUS = ["captured", "in_batch", "settling", "paid_out", "credited"];

export function AcquiringTxnDrawer({
  order,
  onOpenChange,
}: {
  order: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { acqTxns, captureTxn, incrementAuth, endAuth, voidTxn, refundTxn } = useMock();
  const x = order ? acqTxns.find((a) => a.order === order) ?? null : null;
  const branch = x ? BRANCH.includes(x.status) : false;
  const inAuth = x ? x.status === "authorized" || x.status === "partially_captured" : false;
  const authAmt = x ? x.authAmount ?? x.gross : 0;
  const capturedAmt = x ? x.capturedAmount ?? 0 : 0;
  const remaining = Math.round((authAmt - capturedAmt) * 100) / 100;
  const [feeOpen, setFeeOpen] = useState(false);
  useEffect(() => { setFeeOpen(false); }, [order]);

  return (
    <Sheet open={!!order} onOpenChange={onOpenChange}>
      <SheetContent>
        {x && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{t("acq.detailTitle")}</SheetTitle>
                <StatusBadge status={x.status} />
              </div>
              <SheetDescription className="tabular-nums">{x.order} · {x.merchant}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="rounded-xl border border-border p-4">
                <div className="text-sm text-muted-foreground tabular-nums">{x.method}</div>
                <div className="mt-1 tabular-nums text-2xl font-semibold">{formatMoney(x.gross)}</div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">{t("acq.waterfall")}</div>
                <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
                  <Row label={t("acq.colGross")} value={formatMoney(x.gross)} />
                  {x.feeBreakdown ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setFeeOpen((v) => !v)}
                        aria-expanded={feeOpen}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <span className="flex items-center gap-1 text-muted-foreground">
                          {t("acq.colFee")}
                          <ChevronDown className={cn("size-3.5 transition-transform", feeOpen && "rotate-180")} />
                        </span>
                        <span className="font-medium tabular-nums">{`− ${formatMoney(x.fee)}`}</span>
                      </button>
                      {feeOpen && (
                        <div className="mt-1.5 space-y-1 border-l border-border pl-3">
                          <Row label={t("price.interchange")} value={`− ${formatMoney(x.feeBreakdown.interchange)}`} sub />
                          <Row label={t("price.scheme")} value={`− ${formatMoney(x.feeBreakdown.scheme)}`} sub />
                          <Row label={t("price.markup")} value={`− ${formatMoney(x.feeBreakdown.markup)}`} sub />
                        </div>
                      )}
                    </div>
                  ) : (
                    <Row label={t("acq.colFee")} value={`− ${formatMoney(x.fee)}`} />
                  )}
                  {x.reserve > 0 && <Row label={t("acq.colReserve")} value={`− ${formatMoney(x.reserve)}`} />}
                  <div className="h-px bg-border" />
                  <Row label={t("acq.colNet")} value={formatMoney(x.net)} strong />
                </div>
              </div>

              {inAuth && (
                <div className="space-y-2 rounded-xl border border-border p-3 text-sm">
                  <Row label={t("acq.authAmount")} value={formatMoney(authAmt, x.currency)} />
                  <Row label={t("acq.capturedAmount")} value={formatMoney(capturedAmt, x.currency)} />
                  <div className="h-px bg-border" />
                  <Row label={t("acq.remainingAuth")} value={formatMoney(remaining, x.currency)} strong />
                  {(x.captures?.length ?? 0) > 0 && (
                    <div className="pt-1">
                      <div className="mb-1 text-xs text-muted-foreground">{t("acq.capturesTitle")}</div>
                      {x.captures!.map((cpt) => (
                        <div key={cpt.id} className="flex items-center justify-between text-xs">
                          <span className="tabular-nums text-muted-foreground">{cpt.id}</span>
                          <span className="tabular-nums">{formatMoney(cpt.amount, x.currency)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!branch && <Timeline stage={x.stage} status={x.status} />}

              {x.batchId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("acq.payoutBatch")}</span>
                  <span className="tabular-nums font-medium">{x.batchId}</span>
                </div>
              )}
            </SheetBody>

            <SheetFooter className="flex-col gap-2">
              {inAuth && (
                <>
                  <div className="flex gap-2">
                    <CaptureDialog remaining={remaining} currency={x.currency} onConfirm={(amount) => captureTxn({ order: x.order, amount })}>
                      <Button className="flex-1">{t("acq.capture")}</Button>
                    </CaptureDialog>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { incrementAuth({ order: x.order, delta: Math.round(authAmt * 0.1 * 100) / 100 }); toast(t("acq.incrementDone")); }}
                    >
                      <PlusCircle />
                      {t("acq.incrementAuth")}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {x.status === "authorized" && (
                      <Button variant="outline" className="flex-1" onClick={() => { voidTxn(x.order); onOpenChange(false); }}>{t("acq.voidTxn")}</Button>
                    )}
                    <Button variant="outline" className="flex-1" onClick={() => { endAuth(x.order); onOpenChange(false); toast(t("acq.endAuthDone")); }}>
                      <StopCircle />
                      {t("acq.endAuth")}
                    </Button>
                  </div>
                </>
              )}
              {CAPTURED_PLUS.includes(x.status) && (
                <RefundDialog defaultAmount={x.gross} onConfirm={(amount) => refundTxn({ order: x.order, amount })}>
                  <Button variant="outline" className="w-full">{t("acq.refund")}</Button>
                </RefundDialog>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Timeline({ stage, status }: { stage: number; status: string }) {
  const { t } = useI18n();
  const settled = status === "credited";
  return (
    <div>
      {STEP_KEYS.map((s, i) => {
        const done = settled || i < stage;
        const current = !settled && i === stage;
        const last = i === STEP_KEYS.length - 1;
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

function Row({ label, value, strong, sub }: { label: string; value: string; strong?: boolean; sub?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", sub && "text-xs")}>
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold tabular-nums" : "font-medium tabular-nums"}>{value}</span>
    </div>
  );
}
