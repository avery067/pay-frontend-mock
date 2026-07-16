import { useState, type ReactNode } from "react";
import { ArrowDown } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { computeQuote, CURRENCIES } from "@/lib/quote";
import { formatAmount } from "@/lib/format";

export function NewSettlementDialog({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pay, setPay] = useState(10000);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("CNY");
  const q = computeQuote(pay, from, to);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    toast(t("set.created"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("set.newQuote")}</DialogTitle>
          <DialogDescription>{t("set.subtitle")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-[1fr_7rem] gap-3">
            <div className="space-y-1.5">
              <Label>{t("set.youPay")}</Label>
              <Input
                type="number"
                value={pay}
                onChange={(e) => setPay(Math.max(0, Number(e.target.value) || 0))}
                className="tabular-nums"
              />
            </div>
            <div className="flex flex-col justify-end">
              <CurrencySelect value={from} onChange={setFrom} />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="grid size-7 place-items-center rounded-full border border-border bg-muted text-muted-foreground">
              <ArrowDown className="size-4" />
            </span>
          </div>

          <div className="grid grid-cols-[1fr_7rem] gap-3">
            <div className="space-y-1.5">
              <Label>{t("set.youGet")}</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm font-semibold tabular-nums">
                {formatAmount(q.get)}
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <CurrencySelect value={to} onChange={setTo} />
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
            <Row label={t("landing.rate")} value={`1 ${from} = ${formatAmount(q.rate, { min: 4, max: 4 })} ${to}`} />
            <Row label={t("landing.spread")} value={`− ${formatAmount(q.spread)}`} />
            <Row label={t("landing.fee")} value={`${from} ${formatAmount(q.fee)}`} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recipient">{t("set.recipient")}</Label>
            <Input id="recipient" placeholder={t("set.recipientPh")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purpose">{t("set.purpose")}</Label>
            <Input id="purpose" placeholder={t("set.purposePh")} />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit">{t("set.confirm")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CurrencySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
      )}
    >
      {CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}
