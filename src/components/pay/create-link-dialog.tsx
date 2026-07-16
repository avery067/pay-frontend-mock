import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { CURRENCIES } from "@/lib/quote";
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

export function CreateLinkDialog({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"once" | "reuse">("once");
  const [currency, setCurrency] = useState("USD");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    toast(t("links.created"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("links.create")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="lname">{t("links.name")}</Label>
            <Input id="lname" placeholder={t("links.namePh")} required />
          </div>
          <div className="grid grid-cols-[1fr_7rem] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="lamt">{t("links.amount")}</Label>
              <Input id="lamt" type="number" defaultValue={299} className="tabular-nums" />
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
          <div className="space-y-1.5">
            <Label>{t("links.type")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Choice active={type === "once"} onClick={() => setType("once")} label={t("links.typeOnce")} />
              <Choice active={type === "reuse"} onClick={() => setType("reuse")} label={t("links.typeReuse")} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit">{t("links.create")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-2.5 text-center text-sm font-medium transition",
        active ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );
}
