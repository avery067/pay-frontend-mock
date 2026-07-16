import { useState } from "react";
import { Plus, Send } from "lucide-react";
import { useI18n } from "@/i18n";
import { useMock } from "@/mock/store";
import { CURRENCIES } from "@/lib/quote";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NewTransferDialog } from "@/components/pay/new-transfer-dialog";
import { useToast } from "@/components/ui/toast";

export default function RecipientsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { recipients, addRecipient } = useMock();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const loading = usePageLoading();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecipient({
      name: name.trim() || t("rcp.namePh"),
      account: account.trim() || "•••• 0000",
      country: country.trim() || "—",
      currency,
    });
    setOpen(false);
    setName("");
    setAccount("");
    setCountry("");
    setCurrency("USD");
    toast(t("rcp.added"));
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("rcp.title")}
        subtitle={t("rcp.subtitle")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus />
                {t("rcp.add")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("rcp.add")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rname">{t("rcp.name")}</Label>
                  <Input id="rname" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("rcp.namePh")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="racc">{t("rcp.account")}</Label>
                  <Input id="racc" value={account} onChange={(e) => setAccount(e.target.value)} placeholder={t("rcp.accountPh")} required />
                </div>
                <div className="grid grid-cols-[1fr_7rem] gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="rcountry">{t("rcp.country")}</Label>
                    <Input id="rcountry" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="US / CN / EU" />
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
                    <Button type="button" variant="outline">
                      {t("common.cancel")}
                    </Button>
                  </DialogClose>
                  <Button type="submit">{t("rcp.add")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("rcp.name")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("rcp.account")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("rcp.country")}</th>
                  <th className="px-6 py-2.5 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3 font-medium">{r.name}</td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      {r.account} · {r.currency}
                    </td>
                    <td className="px-3 py-3">{r.country}</td>
                    <td className="px-6 py-3 text-right">
                      <NewTransferDialog defaultRid={r.id}>
                        <Button size="sm" variant="outline">
                          <Send />
                          {t("rcp.pay")}
                        </Button>
                      </NewTransferDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
