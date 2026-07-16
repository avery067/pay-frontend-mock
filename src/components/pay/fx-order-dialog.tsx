import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import { formatAmount } from "@/lib/format";
import { useMock, spotRate } from "@/mock/store";
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

const FROMS = ["USD", "EUR", "GBP", "SGD", "HKD"];

export function FxOrderDialog({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { spotRates, placeFxOrder } = useMock();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("USD");
  const [amount, setAmount] = useState(50000);
  const [target, setTarget] = useState(0);
  const [direction, setDirection] = useState<"gte" | "lte">("gte");

  const cur = spotRate(spotRates, from, "CNY");

  // 打开或切换币种时，默认目标价设为当前价 +0.2%（升破触发）
  useEffect(() => {
    if (open) setTarget(Math.round(cur * 1.002 * 10000) / 10000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, from]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || target <= 0) return;
    placeFxOrder({ from, amount, targetRate: target, direction });
    setOpen(false);
    toast(t("fxo.created"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("fxo.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-[7rem_1fr] gap-3">
            <div className="space-y-1.5">
              <Label>{t("fxo.from")}</Label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {FROMS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fxoAmt">{t("fxo.amount")}</Label>
              <Input id="fxoAmt" type="number" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} className="tabular-nums" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{t("fxo.current")} {from}/CNY</span>
            <span className="tabular-nums font-medium">{formatAmount(cur, { min: 4, max: 4 })}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fxoTarget">{t("fxo.target")} ({from}/CNY)</Label>
            <Input id="fxoTarget" type="number" step="0.0001" value={target} onChange={(e) => setTarget(Math.max(0, Number(e.target.value) || 0))} className="tabular-nums" />
          </div>

          <div className="space-y-1.5">
            <Label>{t("fxo.direction")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["gte", "lte"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={
                    "rounded-xl border p-2.5 text-center text-sm font-medium transition " +
                    (direction === d ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted")
                  }
                >
                  {d === "gte" ? t("fxo.gte") : t("fxo.lte")}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit">{t("fxo.new")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
