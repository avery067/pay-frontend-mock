import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Plus, Copy, Zap, ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { useMock } from "@/mock/store";
import { CURRENCIES } from "@/lib/quote";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const DEFAULT_INCOMING: Record<string, number> = {
  USD: 10000,
  EUR: 10000,
  GBP: 10000,
  SGD: 10000,
  AUD: 10000,
  HKD: 80000,
  CNY: 70000,
  JPY: 1500000,
};

function IncomingSim({ accountId, currency }: { accountId: string; currency: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { simulateIncoming } = useMock();
  const [amount, setAmount] = useState(DEFAULT_INCOMING[currency] ?? 10000);

  const go = () => {
    if (amount <= 0) return;
    simulateIncoming(accountId, amount);
    toast(t("recv.simulateDone"));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          className="h-8 text-xs tabular-nums"
          aria-label={t("recv.simulateAmount")}
        />
        <Button size="sm" variant="outline" className="h-8 shrink-0 gap-1 px-2.5 text-xs" onClick={go}>
          <Zap className="size-3.5" />
          {t("recv.simulate")}
        </Button>
      </div>
      <div className="text-[11px] tabular-nums text-muted-foreground">≈ {formatMoney(amount, currency)}</div>
    </div>
  );
}

export default function ReceivingPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { receivingAccounts, addReceivingAccount } = useMock();
  const [open, setOpen] = useState(false);
  const options = CURRENCIES.filter((c) => !receivingAccounts.some((a) => a.currency === c));
  const [currency, setCurrency] = useState(options[0] ?? "");
  const loading = usePageLoading();

  useEffect(() => {
    if (open) setCurrency(options[0] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (loading) return <LoadingSkeleton cards={6} />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!currency) return;
    addReceivingAccount(currency);
    setOpen(false);
    toast(t("recv.added"));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("recv.title")}
        subtitle={t("recv.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/app/settlement" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
              {t("recv.toSettlement")}
              <ArrowRight className="size-3.5" />
            </Link>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={options.length === 0}>
                  <Plus />
                  {t("recv.addCurrency")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>{t("recv.addTitle")}</DialogTitle>
                </DialogHeader>
                {options.length > 0 ? (
                  <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="rcvcur">{t("recv.selectCurrency")}</Label>
                      <select
                        id="rcvcur"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      >
                        {options.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          {t("common.cancel")}
                        </Button>
                      </DialogClose>
                      <Button type="submit">{t("recv.addSubmit")}</Button>
                    </DialogFooter>
                  </form>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("recv.allOpened")}</p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <p className="text-xs text-muted-foreground">{t("recv.hint")}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {receivingAccounts.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {a.currency.slice(0, 2)}
                  </span>
                  <span>
                    <div className="font-medium">{a.currency}</div>
                    <div className="text-xs text-muted-foreground">{a.bankName}</div>
                  </span>
                </span>
                {a.local && <Badge variant="info">{t("recv.localBadge")}</Badge>}
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                {t("recv.holder")}：{a.holder}
              </div>

              <div className="mt-3 space-y-1.5 rounded-lg border border-border/70 bg-muted/30 p-3">
                {a.localFields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="flex items-center gap-1">
                      <span className="tabular-nums font-medium" style={{ fontFamily: "var(--font-mono)" }}>
                        {f.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => toast(t("common.copied"))}
                        aria-label={t("common.copy")}
                        className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      >
                        <Copy className="size-3" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3">
                <Badge variant="success">{t("recv.feeSaveBadge")}</Badge>
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <div className="mb-1.5 text-xs text-muted-foreground">{t("recv.simulateAmount")}</div>
                <IncomingSim accountId={a.id} currency={a.currency} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
