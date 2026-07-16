import { useState, type ReactNode } from "react";
import { CreditCard, Wallet } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
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
import { CURRENCIES } from "@/lib/quote";

export function IssueCardDialog({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { issueCard } = useMock();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"virtual" | "physical">("virtual");
  const [currency, setCurrency] = useState("USD");
  const [name, setName] = useState("");
  const [limit, setLimit] = useState(10000);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    issueCard({
      name: name.trim() || t("iss.cardName"),
      type,
      brand: Math.random() < 0.5 ? "Visa" : "Mastercard",
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      currency,
      limit: Number(limit) || 10000,
    });
    setOpen(false);
    setName("");
    setLimit(10000);
    setType("virtual");
    toast(t("iss.issued"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("iss.issueCard")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("iss.type")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <TypeOption active={type === "virtual"} onClick={() => setType("virtual")} icon={<CreditCard className="size-4" />} label={t("iss.virtual")} />
              <TypeOption active={type === "physical"} onClick={() => setType("physical")} icon={<Wallet className="size-4" />} label={t("iss.physical")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cardName">{t("iss.cardName")}</Label>
            <Input id="cardName" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("iss.cardNamePh")} required />
          </div>

          <div className="grid grid-cols-[1fr_7rem] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="limit">{t("iss.monthlyLimit")}</Label>
              <Input id="limit" type="number" value={limit} onChange={(e) => setLimit(Math.max(0, Number(e.target.value) || 0))} className="tabular-nums" />
            </div>
            <div className="flex flex-col justify-end">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit">{t("iss.issueCard")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TypeOption({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition",
        active ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
