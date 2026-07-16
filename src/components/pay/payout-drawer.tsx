import { Download } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { exportCsv } from "@/lib/export-csv";
import { acquiringTxns, type PayStatus } from "@/mock/data";
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

export type Payout = { batch: string; date: string; amount: number; status: PayStatus };

export function PayoutDrawer({
  item,
  onOpenChange,
}: {
  item: Payout | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const rows = acquiringTxns.slice(0, 4); // 批次内交易（示例）

  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent>
        {item && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{t("stmt.detailTitle")}</SheetTitle>
                <StatusBadge status={item.status} />
              </div>
              <SheetDescription className="tabular-nums">{item.batch} · {item.date}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="rounded-xl border border-border p-4">
                <div className="text-sm text-muted-foreground">{t("stmt.batchTotal")}</div>
                <div className="mt-1 tabular-nums text-2xl font-semibold">{formatMoney(item.amount)}</div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">{t("acq.tabTxns")}</div>
                <div className="divide-y divide-border rounded-xl border border-border">
                  {rows.map((x) => (
                    <div key={x.order} className="flex items-center justify-between px-3 py-2.5 text-sm">
                      <span className="truncate text-muted-foreground">{x.merchant}</span>
                      <span className="tabular-nums font-medium">{formatMoney(x.net)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SheetBody>

            <SheetFooter>
              <Button variant="outline" className="w-full" onClick={() => exportCsv(`payout-${item.batch}.csv`, rows)}>
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
