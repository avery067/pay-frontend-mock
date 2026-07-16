import { Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
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

const FLOW = ["disputes.stNeed", "disputes.stReview", "disputes.stWon"];

export function DisputeDrawer({
  disputeId,
  onOpenChange,
}: {
  disputeId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { disputes, submitDisputeEvidence, acceptDispute } = useMock();
  const item = disputeId ? disputes.find((d) => d.id === disputeId) ?? null : null;
  const canRespond = item?.status === "need";
  const flowIdx = item ? (item.status === "need" ? 0 : item.status === "review" ? 1 : 2) : 0;
  const lost = item?.status === "lost";

  return (
    <Sheet open={!!disputeId} onOpenChange={onOpenChange}>
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
                <div className="text-sm text-muted-foreground">{t("disputes.colReason")}: {t(DISPUTE_REASON[item.reason])}</div>
                <div className={cn("mt-1 tabular-nums text-2xl font-semibold", lost && "text-neg")}>
                  {lost && "− "}
                  {formatMoney(item.amount, item.currency)}
                </div>
              </div>

              {/* 争议流程 */}
              <div>
                {FLOW.map((s, i) => {
                  const done = i < flowIdx || (i === 2 && item.status === "won");
                  const current = i === flowIdx && item.status !== "won" && item.status !== "lost";
                  const failPoint = i === 2 && item.status === "lost";
                  const label = i === 2 && item.status === "lost" ? t("disputes.stLost") : t(s);
                  const last = i === FLOW.length - 1;
                  return (
                    <div key={s} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border", done ? "border-transparent bg-success text-success-foreground" : failPoint ? "border-transparent bg-danger text-danger-foreground" : current ? "border-primary text-primary" : "border-border bg-card text-muted-foreground")}>
                          {done ? <Check className="size-3.5" /> : current ? <span className="size-2 rounded-full bg-primary" /> : <span className="size-1.5 rounded-full bg-current" />}
                        </span>
                        {!last && <span className={cn("my-1 h-6 w-px", done ? "bg-success" : "bg-border")} />}
                      </div>
                      <div className={cn("pb-4 text-sm", done || current || failPoint ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-warning/10 p-3 text-sm">
                <span className="text-muted-foreground">{t("disputes.colDeadline")}</span>
                <span className="tabular-nums font-medium text-warning">{item.deadline}</span>
              </div>

              {canRespond && (
                <div>
                  <div className="mb-2 text-sm font-medium">{t("disputes.evidence")}</div>
                  <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-6 text-sm text-muted-foreground transition hover:bg-muted/40">
                    <Upload className="size-4" />
                    {t("disputes.uploadEvidence")}
                  </button>
                </div>
              )}

              {item.status === "review" && <p className="rounded-lg bg-info/10 p-3 text-xs text-info">{t("disputes.stReview")}…</p>}
            </SheetBody>

            {canRespond && (
              <SheetFooter className="gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { acceptDispute(item.id); onOpenChange(false); toast(t("disputes.accept")); }}>
                  {t("disputes.accept")}
                </Button>
                <Button className="flex-1" onClick={() => { submitDisputeEvidence(item.id); toast(t("disputes.submitted")); }}>
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
