import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import { formatAmount } from "@/lib/format";
import { useMock } from "@/mock/store";
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

export function WithdrawDialog({ currency, children }: { currency: string; children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { balances, withdraw } = useMock();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const avail = balances.find((b) => b.currency === currency)?.available ?? 0;
  const insufficient = amount > avail;

  useEffect(() => {
    if (open) setAmount(0);
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (insufficient || amount <= 0) return;
    setOpen(false);
    withdraw({ currency, amount });
    toast(t("bal.withdrawDone"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("bal.withdraw")} · {currency}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="wamt">{t("bal.withdrawAmount")}</Label>
              <span className="tabular-nums text-xs text-muted-foreground">{t("bal.available")} {formatAmount(avail)}</span>
            </div>
            <Input id="wamt" type="number" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} className="tabular-nums" />
            {insufficient && <p className="text-xs text-danger">{t("common.insufficient")}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit" disabled={insufficient || amount <= 0}>{t("bal.withdraw")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
