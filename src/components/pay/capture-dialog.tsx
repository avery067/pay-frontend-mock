import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
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

export function CaptureDialog({
  remaining,
  currency,
  onConfirm,
  children,
}: {
  remaining: number;
  currency: string;
  onConfirm: (amount: number) => void;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(remaining);

  useEffect(() => {
    if (open) setAmount(remaining);
  }, [open, remaining]);

  const invalid = amount <= 0 || amount > remaining + 0.001;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid) return;
    setOpen(false);
    onConfirm(amount);
    toast(t("acq.captureDone"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("acq.captureTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="capAmount">{t("acq.captureAmount")}</Label>
            <Input
              id="capAmount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
              className="tabular-nums"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("acq.remainingAuth")}: <span className="tabular-nums">{formatMoney(remaining, currency)}</span></span>
              <button type="button" className="font-medium text-brand hover:underline" onClick={() => setAmount(remaining)}>
                {t("acq.captureFull")}
              </button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit" disabled={invalid}>{t("acq.capture")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
