import { useState, type FormEvent, type ReactNode } from "react";
import { Check, Plus, Zap } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatMoney, maskCard } from "@/lib/format";
import { useMock } from "@/mock/store";
import { CURRENCIES } from "@/lib/quote";
import type { PayoutAccount, SettlementConfig, SettlementSchedule } from "@/mock/more";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

const SCHEDULES: { id: SettlementSchedule; titleKey: string; descKey: string }[] = [
  { id: "instant", titleKey: "payset.schInstant", descKey: "payset.schInstantDesc" },
  { id: "tplus", titleKey: "payset.schTplus", descKey: "payset.schTplusDesc" },
  { id: "weekly", titleKey: "payset.schWeekly", descKey: "payset.schWeeklyDesc" },
  { id: "monthly", titleKey: "payset.schMonthly", descKey: "payset.schMonthlyDesc" },
];

function metaFor(t: (key: string) => string, id: SettlementSchedule, cfg: SettlementConfig): string {
  switch (id) {
    case "instant":
      return `T+0 · ${t("payset.expeditedFee")} ${cfg.expeditedFee}%`;
    case "tplus":
      return `T+${cfg.termDays}`;
    case "weekly":
      return t("payset.previewWeekly");
    case "monthly":
      return t("payset.previewMonthly");
  }
}

const STATUS_META: Record<PayoutAccount["status"], { variant: "success" | "warning" | "info"; key: string }> = {
  active: { variant: "success", key: "payset.stActive" },
  pending_verify: { variant: "warning", key: "payset.stPendingVerify" },
  disabled: { variant: "info", key: "payset.stDisabled" },
};

export default function SettlementSettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { balances, payoutAccounts, settlementConfig, setDefaultAccount, updateSettlementConfig, sweepNow } = useMock();
  const loading = usePageLoading();
  if (loading) return <LoadingSkeleton rows={6} />;

  const chooseSchedule = (id: SettlementSchedule) => {
    if (id === settlementConfig.schedule) return;
    updateSettlementConfig({ schedule: id });
    toast(t("payset.scheduleUpdated"));
  };

  const sweepTarget = payoutAccounts.find((a) => a.id === settlementConfig.sweep.targetAccountId);
  const sweepAvail = sweepTarget ? balances.find((b) => b.currency === sweepTarget.currency)?.available ?? 0 : 0;
  const eligibleTargets = payoutAccounts.filter((a) => a.status === "active");

  const doSweep = () => {
    if (!sweepTarget || sweepAvail <= 0) {
      toast(t("payset.sweepEmpty"));
      return;
    }
    sweepNow(sweepTarget.currency);
    toast(t("payset.sweepDone"));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader title={t("payset.title")} subtitle={t("payset.subtitle")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("payset.scheduleTitle")}</CardTitle>
          <CardDescription>{t("payset.scheduleDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {SCHEDULES.map((s) => (
              <ScheduleChoice
                key={s.id}
                active={settlementConfig.schedule === s.id}
                title={t(s.titleKey)}
                desc={t(s.descKey)}
                meta={metaFor(t, s.id, settlementConfig)}
                onClick={() => chooseSchedule(s.id)}
              />
            ))}
          </div>

          {settlementConfig.schedule === "tplus" && (
            <div className="mt-4 flex items-center gap-3">
              <Label htmlFor="termdays" className="shrink-0">
                {t("payset.termDays")}
              </Label>
              <Input
                id="termdays"
                type="number"
                min={1}
                max={30}
                value={settlementConfig.termDays}
                onChange={(e) => updateSettlementConfig({ termDays: Math.min(30, Math.max(1, Number(e.target.value) || 1)) })}
                className="h-9 w-24 tabular-nums"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{t("payset.accountsTitle")}</CardTitle>
            <CardDescription>{t("payset.accountsDesc")}</CardDescription>
          </div>
          <AddPayoutAccountDialog>
            <Button size="sm">
              <Plus />
              {t("payset.addAccount")}
            </Button>
          </AddPayoutAccountDialog>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("payset.colAccount")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("payset.colCountry")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("payset.colLast4")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                  <th className="px-6 py-2.5 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {payoutAccounts.map((a) => {
                  const meta = STATUS_META[a.status];
                  return (
                    <tr key={a.id} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2 font-medium">
                          {a.label}
                          {a.isDefault && <Badge variant="info">{t("payset.defaultBadge")}</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">{a.currency}</div>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{a.country}</td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{maskCard(a.last4)}</td>
                      <td className="px-3 py-3">
                        <Badge variant={meta.variant}>{t(meta.key)}</Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {!a.isDefault && a.status === "active" && (
                          <Button size="sm" variant="outline" onClick={() => setDefaultAccount(a.id)}>
                            {t("payset.setDefault")}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("payset.sweepTitle")}</CardTitle>
          <CardDescription>{t("payset.sweepDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-6">
            <div className="text-sm font-medium">{t("payset.sweepOn")}</div>
            <Switch checked={settlementConfig.sweep.on} onCheckedChange={(on) => updateSettlementConfig({ sweep: { on } })} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sweepthresh">{t("payset.sweepThreshold")}</Label>
              <Input
                id="sweepthresh"
                type="number"
                min={0}
                value={settlementConfig.sweep.threshold}
                onChange={(e) => updateSettlementConfig({ sweep: { threshold: Math.max(0, Number(e.target.value) || 0) } })}
                className="tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sweeptarget">{t("payset.sweepTarget")}</Label>
              <select
                id="sweeptarget"
                value={settlementConfig.sweep.targetAccountId}
                onChange={(e) => updateSettlementConfig({ sweep: { targetAccountId: e.target.value } })}
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {eligibleTargets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} · {a.currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground">
              {sweepTarget ? `${t("bal.available")} ${formatMoney(sweepAvail, sweepTarget.currency)}` : "—"}
            </div>
            <Button size="sm" variant="outline" onClick={doSweep}>
              <Zap />
              {t("payset.sweepNow")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScheduleChoice({
  active,
  title,
  desc,
  meta,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("rounded-xl border p-4 text-left transition", active ? "border-primary bg-primary/5" : "border-border hover:bg-muted")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{title}</span>
        {active && (
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="size-3" />
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      <p className="mt-2 tabular-nums text-sm font-medium">{meta}</p>
    </button>
  );
}

function AddPayoutAccountDialog({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { addPayoutAccount } = useMock();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [country, setCountry] = useState("");
  const [last4, setLast4] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const digits = (last4.replace(/\D/g, "").slice(-4) || "0000").padStart(4, "0");
    addPayoutAccount({
      label: label.trim() || `${currency} Account（示例）`,
      currency,
      country: country.trim().toUpperCase() || "US",
      last4: digits,
    });
    setOpen(false);
    setLabel("");
    setCountry("");
    setLast4("");
    toast(t("payset.accountAdded"));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setLabel("");
          setCountry("");
          setLast4("");
          setCurrency("USD");
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("payset.addAccountTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="palabel">{t("payset.accountLabel")}</Label>
            <Input id="palabel" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("payset.accountLabelPh")} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pacur">{t("payset.accountCurrency")}</Label>
              <select
                id="pacur"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pacountry">{t("payset.accountCountry")}</Label>
              <Input id="pacountry" value={country} onChange={(e) => setCountry(e.target.value)} placeholder={t("payset.accountCountryPh")} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="palast4">{t("payset.accountLast4")}</Label>
            <Input
              id="palast4"
              value={last4}
              onChange={(e) => setLast4(e.target.value)}
              placeholder={t("payset.accountLast4Ph")}
              inputMode="numeric"
              maxLength={4}
              required
              className="tabular-nums"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit">{t("payset.addAccount")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
