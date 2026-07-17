import { AlertTriangle, Check, Download, FileCheck2, RotateCcw, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/format";
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
import { useToast } from "@/components/ui/toast";
import { StatusBadge } from "./status-badge";

const STEP_KEYS = [
  "set.stepInitiated",
  "set.stepCompliance",
  "set.stepConverting",
  "set.stepSending",
  "set.stepArrived",
];

export function SettleRecordDrawer({
  openRef,
  onOpenChange,
}: {
  openRef: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { records, advance, retrySettlement, submitRfi } = useMock();
  const rec = openRef ? records.find((r) => r.ref === openRef) ?? null : null;

  return (
    <Sheet open={!!openRef} onOpenChange={onOpenChange}>
      <SheetContent>
        {rec && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{t("stl.detailTitle")}</SheetTitle>
                <StatusBadge status={rec.status} />
              </div>
              <SheetDescription className="tabular-nums">{rec.ref}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("stl.amount")}</span>
                  <span className="tabular-nums font-medium">{rec.from} {formatAmount(rec.amount)}</span>
                </div>
                <div className="my-3 h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("stl.receiveRmb")}</span>
                  <span className="tabular-nums text-xl font-semibold">{formatAmount(rec.rmb)} CNY</span>
                </div>
              </div>

              <Timeline stage={rec.stage} status={rec.status} />

              {rec.status === "settled" && rec.declareNo && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <FileCheck2 className="size-3.5" />
                      {t("stl.declareNo")}
                    </div>
                    <div className="mt-1 tabular-nums font-medium">{rec.declareNo}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      exportCsv(`${rec.declareNo}.csv`, [
                        { declareNo: rec.declareNo, settlementRef: rec.ref, currency: rec.from, amount: rec.amount, rate: rec.rate, rmb: rec.rmb },
                      ]);
                      toast(t("stl.declareDownloaded"));
                    }}
                  >
                    <Download className="size-3.5" />
                    {t("stl.downloadDeclare")}
                  </Button>
                </div>
              )}

              {rec.status === "processing" && (
                <p className="rounded-lg bg-info/10 p-3 text-xs text-info">{t("stl.liveHint")}</p>
              )}
              {rec.status === "failed" && (
                <p className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-xs text-danger">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  {t("stl.failHint")}
                </p>
              )}
              {rec.status === "need_info" && rec.rfi && (
                <div className="space-y-3 rounded-lg bg-warning/10 p-3">
                  <p className="flex items-start gap-2 text-xs text-warning">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    {t("stl.rfiTitle")}：{rec.rfi.reason}
                  </p>
                  <div>
                    <div className="mb-1.5 text-xs font-medium">{t("stl.rfiDocs")}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.rfi.docs.map((d) => (
                        <span key={d} className="rounded-md border border-dashed border-warning/60 px-2 py-1 text-xs text-foreground">{d}</span>
                      ))}
                    </div>
                  </div>
                  <button type="button" onClick={() => toast(t("stl.rfiUpload"))} className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground transition hover:bg-muted">
                    {t("stl.rfiUpload")}
                  </button>
                </div>
              )}
            </SheetBody>

            <SheetFooter>
              {rec.status === "processing" ? (
                <Button className="w-full" onClick={() => advance(rec.ref)}>
                  {t("stl.advance")}
                </Button>
              ) : rec.status === "failed" ? (
                <Button className="w-full" onClick={() => { retrySettlement(rec.ref); toast(t("stl.retryDone")); }}>
                  <RotateCcw />
                  {t("stl.retry")}
                </Button>
              ) : rec.status === "need_info" ? (
                <Button className="w-full" onClick={() => { submitRfi(rec.ref); toast(t("stl.rfiDone")); }}>
                  {t("stl.rfiSubmit")}
                </Button>
              ) : (
                <Button variant="outline" className="w-full">
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

function Timeline({ stage, status }: { stage: number; status: string }) {
  const { t } = useI18n();
  const settled = status === "settled";
  return (
    <div>
      {STEP_KEYS.map((s, i) => {
        const done = settled || i < stage;
        const current = status === "processing" && i === stage;
        const failPoint = status === "failed" && i === stage;
        const last = i === STEP_KEYS.length - 1;
        return (
          <div key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border",
                  done
                    ? "border-transparent bg-success text-success-foreground"
                    : failPoint
                      ? "border-transparent bg-danger text-danger-foreground"
                      : current
                        ? "border-primary text-primary"
                        : "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? (
                  <Check className="size-3.5" />
                ) : failPoint ? (
                  <X className="size-3.5" />
                ) : current ? (
                  <span className="size-2 rounded-full bg-primary" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
              {!last && <span className={cn("my-1 h-6 w-px", done ? "bg-success" : "bg-border")} />}
            </div>
            <div className={cn("pb-4 text-sm", done || current || failPoint ? "font-medium text-foreground" : "text-muted-foreground")}>
              {t(s)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
