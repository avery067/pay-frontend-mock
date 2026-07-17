import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { type ApprovalStep } from "@/mock/more";
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

type Variant = "success" | "warning" | "danger" | "info";

/** 通用多级审批抽屉：批量结汇 / 开卡审批共用 */
export function ApprovalDrawer({
  open,
  onOpenChange,
  title,
  refId,
  statusVariant,
  statusLabel,
  lines,
  approvals,
  canAct,
  onApprove,
  onReject,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  refId: string;
  statusVariant: Variant;
  statusLabel: string;
  lines: { label: string; value: string }[];
  approvals: ApprovalStep[];
  canAct: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const { t } = useI18n();
  const nextIdx = approvals.findIndex((a) => !a.done);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>{title}</SheetTitle>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <SheetDescription className="tabular-nums">{refId}</SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-6">
          <div className="space-y-2 rounded-xl border border-border p-4 text-sm">
            {lines.map((l) => (
              <div key={l.label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{l.label}</span>
                <span className="tabular-nums font-medium">{l.value}</span>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">{t("approval.steps")}</div>
            {approvals.map((a, i) => {
              const current = canAct && i === nextIdx;
              const last = i === approvals.length - 1;
              return (
                <div key={a.role} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn("grid size-6 shrink-0 place-items-center rounded-full border", a.done ? "border-transparent bg-success text-success-foreground" : current ? "border-primary text-primary" : "border-border bg-card text-muted-foreground")}>
                      {a.done ? <Check className="size-3.5" /> : current ? <span className="size-2 rounded-full bg-primary" /> : <span className="size-1.5 rounded-full bg-current" />}
                    </span>
                    {!last && <span className={cn("my-1 h-6 w-px", a.done ? "bg-success" : "bg-border")} />}
                  </div>
                  <div className="flex flex-1 items-center justify-between pb-4">
                    <span className={cn("text-sm", a.done || current ? "font-medium text-foreground" : "text-muted-foreground")}>{a.role}</span>
                    <span className="text-xs text-muted-foreground">{a.done ? t("approval.done") : t("approval.pending")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SheetBody>

        {canAct && (
          <SheetFooter className="gap-2">
            <Button variant="outline" className="flex-1 text-danger hover:text-danger" onClick={onReject}>
              <X />
              {t("approval.reject")}
            </Button>
            <Button className="flex-1" onClick={onApprove}>
              <Check />
              {t("approval.approve")}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
