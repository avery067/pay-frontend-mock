import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import type { AcquiringTxn } from "@/mock/data";
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

export function AcquiringTxnDrawer({
  item,
  onOpenChange,
}: {
  item: AcquiringTxn | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const canRefund = item ? item.status === "settled" || item.status === "processing" : false;

  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent>
        {item && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{t("acq.detailTitle")}</SheetTitle>
                <StatusBadge status={item.status} />
              </div>
              <SheetDescription className="tabular-nums">{item.order}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="rounded-xl border border-border p-4">
                <div className="text-sm text-muted-foreground">{item.merchant}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tabular-nums">{formatMoney(item.gross)}</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground tabular-nums">{item.method}</div>
              </div>

              <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
                <Row label={t("console.colAmount")} value={formatMoney(item.gross)} />
                <Row label={t("acq.colFee")} value={`− ${formatMoney(item.fee)}`} />
                <div className="h-px bg-border" />
                <Row label={t("acq.colNet")} value={formatMoney(item.net)} strong />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("console.colTime")}</span>
                <span className="tabular-nums">{item.time}</span>
              </div>
            </SheetBody>

            {canRefund && (
              <SheetFooter>
                <RefundDialog defaultAmount={item.gross}>
                  <Button variant="outline" className="w-full">
                    {t("acq.refund")}
                  </Button>
                </RefundDialog>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold tabular-nums" : "font-medium tabular-nums"}>{value}</span>
    </div>
  );
}
