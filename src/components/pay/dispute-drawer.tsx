import { Upload } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import type { Dispute } from "@/mock/more";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

type Variant = "success" | "warning" | "danger" | "info";

export const DISPUTE_REASON: Record<string, string> = {
  fraud: "disputes.reasonFraud",
  product: "disputes.reasonProduct",
  dup: "disputes.reasonDup",
};

export const DISPUTE_STATUS: Record<string, { variant: Variant; key: string }> = {
  need: { variant: "warning", key: "disputes.stNeed" },
  review: { variant: "info", key: "disputes.stReview" },
  won: { variant: "success", key: "disputes.stWon" },
  lost: { variant: "danger", key: "disputes.stLost" },
};

export function DisputeDrawer({
  item,
  onOpenChange,
}: {
  item: Dispute | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const canRespond = item?.status === "need";

  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent>
        {item && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{t("disputes.detailTitle")}</SheetTitle>
                <Badge variant={DISPUTE_STATUS[item.status].variant}>{t(DISPUTE_STATUS[item.status].key)}</Badge>
              </div>
              <SheetDescription className="tabular-nums">{item.id} · {item.order}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <div className="rounded-xl border border-border p-4">
                <div className="text-sm text-muted-foreground">
                  {t("disputes.colReason")}: {t(DISPUTE_REASON[item.reason])}
                </div>
                <div className="mt-1 tabular-nums text-2xl font-semibold">{formatMoney(item.amount, item.currency)}</div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-warning/10 p-3 text-sm">
                <span className="text-muted-foreground">{t("disputes.colDeadline")}</span>
                <span className="tabular-nums font-medium text-warning">{item.deadline}</span>
              </div>

              {canRespond && (
                <div>
                  <div className="mb-2 text-sm font-medium">{t("disputes.evidence")}</div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-6 text-sm text-muted-foreground transition hover:bg-muted/40"
                  >
                    <Upload className="size-4" />
                    {t("disputes.uploadEvidence")}
                  </button>
                </div>
              )}
            </SheetBody>

            {canRespond && (
              <SheetFooter className="gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { onOpenChange(false); toast(t("disputes.accept")); }}>
                  {t("disputes.accept")}
                </Button>
                <Button className="flex-1" onClick={() => { onOpenChange(false); toast(t("disputes.submitted")); }}>
                  {t("disputes.submitEvidence")}
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
