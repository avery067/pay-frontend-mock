import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
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
const TERMS = [30, 90, 180];

export function FxForwardDialog({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { spotRates, bookForward } = useMock();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState("USD");
  const [notional, setNotional] = useState(100000);
  const [kind, setKind] = useState<"fixed" | "flexible">("fixed");
  const [termDays, setTermDays] = useState(90);

  const spot = spotRate(spotRates, from, "CNY");
  const estLocked = Math.round(spot * (1 + termDays * 0.00015) * 10000) / 10000;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notional <= 0) return;
    bookForward({ from, notional, kind, termDays });
    setOpen(false);
    toast(t("fwd.booked"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("fwd.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-[7rem_1fr] gap-3">
            <div className="space-y-1.5">
              <Label>{t("fwd.from")}</Label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                {FROMS.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fwdNotional">{t("fwd.notional")}</Label>
              <Input id="fwdNotional" type="number" value={notional} onChange={(e) => setNotional(Math.max(0, Number(e.target.value) || 0))} className="tabular-nums" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("fwd.kind")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["fixed", "flexible"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setKind(k)} className={cn("rounded-xl border p-2.5 text-center text-sm font-medium transition", kind === k ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted")}>
                  {k === "fixed" ? t("fwd.fixed") : t("fwd.flexible")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("fwd.term")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {TERMS.map((d) => (
                <button key={d} type="button" onClick={() => setTermDays(d)} className={cn("rounded-lg border py-2 text-center text-sm font-medium tabular-nums transition", termDays === d ? "border-primary bg-primary/5" : "border-border text-muted-foreground hover:bg-muted")}>
                  T+{d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{t("fwd.locked")} {from}/CNY</span>
            <span className="tabular-nums font-semibold">{formatAmount(estLocked, { min: 4, max: 4 })}</span>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit">{t("fwd.new")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
