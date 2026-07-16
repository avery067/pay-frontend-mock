import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import { recipients } from "@/mock/more";
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

export function NewTransferDialog({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rid, setRid] = useState(recipients[0]?.id ?? "");
  const [currency, setCurrency] = useState("USD");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    toast(t("tf.submitted"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("tf.new")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="trcp">{t("tf.recipient")}</Label>
            <select
              id="trcp"
              value={rid}
              onChange={(e) => setRid(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>{r.name} · {r.account}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-[1fr_7rem] gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tamt">{t("tf.amount")}</Label>
              <Input id="tamt" type="number" defaultValue={5000} className="tabular-nums" />
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
            <Label htmlFor="tnote">{t("tf.note")}</Label>
            <Input id="tnote" placeholder={t("tf.notePh")} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit">{t("tf.review")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
