import { Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { REASON_CODES } from "@/mock/more";
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

const STAGES = ["chargeback", "representment", "pre_arb", "arbitration"] as const;
const STAGE_KEY: Record<string, string> = {
  chargeback: "disputes.stChargeback",
  representment: "disputes.stRepresentment",
  pre_arb: "disputes.stPreArb",
  arbitration: "disputes.stArbitration",
};
const CAT_KEY: Record<string, string> = {
  duty: "disputes.catDuty",
  not_received: "disputes.catNotReceived",
  not_as_described: "disputes.catNotAsDescribed",
  other: "disputes.catOther",
};

export function DisputeDrawer({
  disputeId,
  onOpenChange,
}: {
  disputeId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { disputes, submitDisputeEvidence, acceptDispute, escalateDispute, uploadEvidence } = useMock();
  const item = disputeId ? disputes.find((d) => d.id === disputeId) ?? null : null;
  const canRespond = item?.status === "need";
  const lost = item?.status === "lost";
  const rc = item ? REASON_CODES[item.reason] : null;
  const uploaded = item?.evidenceUploaded ?? [];
  const stageIdx = item ? STAGES.indexOf((item.stage ?? "chargeback") as (typeof STAGES)[number]) : 0;
  const canEscalate = lost && stageIdx < STAGES.length - 1;
  const allUploaded = rc ? rc.docs.every((d) => uploaded.includes(d.zh)) : false;

  return (
    <Sheet open={!!disputeId} onOpenChange={onOpenChange}>
      <SheetContent>
        {item && rc && (
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("disputes.colReason")}: {t(DISPUTE_REASON[item.reason])}</span>
                  <Badge variant="outline">{rc.network} {rc.code}</Badge>
                </div>
                <div className={cn("mt-1 tabular-nums text-2xl font-semibold", lost && "text-neg")}>
                  {lost && "− "}
                  {formatMoney(item.amount, item.currency)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{t("disputes.category")}: {t(CAT_KEY[rc.category])}</div>
              </div>

              {/* 争议四阶段 */}
              <div>
                <div className="mb-2 text-sm font-medium">{t("disputes.stageFlow")}</div>
                {STAGES.map((s, i) => {
                  const done = i < stageIdx || (i === stageIdx && item.status === "won");
                  const current = i === stageIdx && item.status !== "won";
                  const failPoint = i === stageIdx && item.status === "lost";
                  const last = i === STAGES.length - 1;
                  return (
                    <div key={s} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border", done ? "border-transparent bg-success text-success-foreground" : failPoint ? "border-transparent bg-danger text-danger-foreground" : current ? "border-primary text-primary" : "border-border bg-card text-muted-foreground")}>
                          {done ? <Check className="size-3.5" /> : current ? <span className="size-2 rounded-full bg-primary" /> : <span className="size-1.5 rounded-full bg-current" />}
                        </span>
                        {!last && <span className={cn("my-1 h-6 w-px", done ? "bg-success" : "bg-border")} />}
                      </div>
                      <div className={cn("pb-4 text-sm", done || current || failPoint ? "font-medium text-foreground" : "text-muted-foreground")}>{t(STAGE_KEY[s])}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-warning/10 p-3 text-sm">
                <span className="text-muted-foreground">{t("disputes.colDeadline")}</span>
                <span className="tabular-nums font-medium text-warning">{item.deadline}</span>
              </div>

              {/* 按理由码的举证清单 */}
              <div>
                <div className="mb-2 text-sm font-medium">{t("disputes.evidenceChecklist")}</div>
                <div className="space-y-1.5">
                  {rc.docs.map((d) => {
                    const on = uploaded.includes(d.zh);
                    return (
                      <div key={d.zh} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                        <span className="flex items-center gap-2">
                          <span className={cn("grid size-4 place-items-center rounded-full", on ? "bg-success text-success-foreground" : "border border-border")}>
                            {on && <Check className="size-3" />}
                          </span>
                          {lang === "zh" ? d.zh : d.en}
                        </span>
                        {canRespond && !on && (
                          <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-xs" onClick={() => uploadEvidence(item.id, d.zh)}>
                            <Upload className="size-3" />
                            {t("disputes.upload")}
                          </Button>
                        )}
                        {on && <span className="text-xs text-success">{t("disputes.uploaded")}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {item.status === "review" && <p className="rounded-lg bg-info/10 p-3 text-xs text-info">{t("disputes.stReview")}…</p>}
            </SheetBody>

            {canRespond && (
              <SheetFooter className="gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { acceptDispute(item.id); onOpenChange(false); toast(t("disputes.accept")); }}>
                  {t("disputes.accept")}
                </Button>
                <Button className="flex-1" disabled={!allUploaded} onClick={() => { submitDisputeEvidence(item.id); toast(t("disputes.submitted")); }}>
                  {t("disputes.submitEvidence")}
                </Button>
              </SheetFooter>
            )}
            {canEscalate && (
              <SheetFooter>
                <Button className="w-full" onClick={() => { escalateDispute(item.id); toast(t("disputes.escalated")); }}>
                  {t("disputes.escalate")} · {t(STAGE_KEY[STAGES[stageIdx + 1]])}
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
