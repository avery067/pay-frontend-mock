import { Check, Download, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/format";
import type { Settlement, PayStatus } from "@/mock/data";
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

export function SettlementDrawer({
  item,
  onOpenChange,
}: {
  item: Settlement | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent>
        {item && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{t("set.detailTitle")}</SheetTitle>
                <StatusBadge status={item.status} />
              </div>
              <SheetDescription className="tabular-nums">{item.ref}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("set.youPay")}</span>
                  <span className="tabular-nums font-medium">
                    {item.from} {formatAmount(item.pay)}
                  </span>
                </div>
                <div className="my-3 h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("set.youGet")}</span>
                  <span className="tabular-nums text-xl font-semibold">
                    {item.to} {formatAmount(item.get)}
                  </span>
                </div>
              </div>

              <Timeline status={item.status} />

              <div>
                <div className="mb-2 text-sm font-medium">{t("set.feeTitle")}</div>
                <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
                  <Row label={t("landing.rate")} value={`1 ${item.from} = ${formatAmount(item.rate, { min: 4, max: 4 })} ${item.to}`} />
                  <Row label={t("landing.spread")} value={`− ${formatAmount(item.spread)}`} />
                  <Row label={t("landing.fee")} value={`${item.from} ${formatAmount(item.fee)}`} />
                  <Row label={t("set.colCorridor")} value={item.corridor} />
                  <Row label={t("set.recipient")} value={item.recipient} />
                </div>
              </div>
            </SheetBody>

            <SheetFooter>
              <Button variant="outline" className="w-full">
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

function Timeline({ status }: { status: PayStatus }) {
  const { t } = useI18n();
  const steps = [
    t("set.stepInitiated"),
    t("set.stepCompliance"),
    t("set.stepConverting"),
    t("set.stepSending"),
    t("set.stepArrived"),
  ];
  const reached =
    status === "settled" ? 5 : status === "processing" ? 3 : status === "pending" ? 2 : 1;
  const failed = status === "failed";

  return (
    <div>
      {steps.map((s, i) => {
        const done = i < reached;
        const failPoint = failed && i === reached;
        const last = i === steps.length - 1;
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border",
                  done
                    ? "border-transparent bg-success text-success-foreground"
                    : failPoint
                      ? "border-transparent bg-danger text-danger-foreground"
                      : "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : failPoint ? <X className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
              </span>
              {!last && <span className={cn("my-1 h-6 w-px", done ? "bg-success" : "bg-border")} />}
            </div>
            <div className={cn("pb-4 text-sm", done || failPoint ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</div>
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}
