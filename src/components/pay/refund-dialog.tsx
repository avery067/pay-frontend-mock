import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

export function RefundDialog({
  defaultAmount,
  children,
}: {
  defaultAmount: number;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    toast(t("acq.refunded"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("acq.refundTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="refundAmount">{t("acq.refundAmount")}</Label>
            <Input id="refundAmount" type="number" defaultValue={defaultAmount} className="tabular-nums" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">{t("acq.reason")}</Label>
            <Input id="reason" placeholder={t("acq.reasonPh")} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              {t("acq.refund")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
