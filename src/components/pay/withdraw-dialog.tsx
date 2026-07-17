import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatAmount, formatMoney } from "@/lib/format";
import { useMock } from "@/mock/store";
import { WITHDRAW_CHANNELS, WITHDRAW_HOPS, type WithdrawChannel } from "@/mock/more";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

/** 通道名 / 说明的 i18n key 映射（WithdrawChannel → wd.* 键） */
const CHANNEL_TEXT: Record<WithdrawChannel, { name: string; desc: string }> = {
  preferred: { name: "wd.chPreferred", desc: "wd.descPreferred" },
  fast: { name: "wd.chFast", desc: "wd.descFast" },
  express: { name: "wd.chExpress", desc: "wd.descExpress" },
};

export function WithdrawDialog({ currency, children }: { currency: string; children: ReactNode }) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const { balances, withdraw } = useMock();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [channel, setChannel] = useState<WithdrawChannel>("preferred");
  const avail = balances.find((b) => b.currency === currency)?.available ?? 0;
  const insufficient = amount > avail;

  useEffect(() => {
    if (open) {
      setAmount(0);
      setChannel("preferred");
    }
  }, [open]);

  // 资金链路：到手 = 提现金额 − 中间行逐跳扣费 − 加急费（纯展示，透明化费用去向）
  const channelInfo = WITHDRAW_CHANNELS.find((c) => c.key === channel) ?? WITHDRAW_CHANNELS[0];
  const hopsTotal = WITHDRAW_HOPS.reduce((s, h) => s + h.deduct, 0);
  const expressFee = Math.round(amount * channelInfo.rate * 100) / 100;
  const netArrival = Math.max(0, amount - hopsTotal - expressFee);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (insufficient || amount <= 0) return;
    setOpen(false);
    withdraw({ currency, amount, channel });
    toast(t("bal.withdrawDone"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
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

          <div className="space-y-1.5">
            <Label>{t("wd.channel")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {WITHDRAW_CHANNELS.map((c) => (
                <ChannelOption
                  key={c.key}
                  active={channel === c.key}
                  onClick={() => setChannel(c.key)}
                  name={t(CHANNEL_TEXT[c.key].name)}
                  eta={lang === "zh" ? c.etaZh : c.etaEn}
                  feeLabel={c.feeLabel}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t(CHANNEL_TEXT[channel].desc)}</p>
          </div>

          <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
            <div className="text-xs font-medium text-muted-foreground">{t("wd.route")}</div>
            <Row label={t("bal.withdrawAmount")} value={formatAmount(amount)} />
            {WITHDRAW_HOPS.map((h) => (
              <Row key={h.bank} label={`${h.bank} · ${h.label}`} value={`− ${formatAmount(h.deduct)}`} sub />
            ))}
            {expressFee > 0 && <Row label={t("wd.expressFee")} value={`− ${formatAmount(expressFee)}`} sub />}
            <div className="h-px bg-border" />
            <Row label={t("wd.netArrival")} value={formatMoney(netArrival, currency)} strong />
            <p className="text-[11px] leading-relaxed text-muted-foreground">{t("wd.routeHint")}</p>
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

function ChannelOption({
  active,
  onClick,
  name,
  eta,
  feeLabel,
}: {
  active: boolean;
  onClick: () => void;
  name: string;
  eta: string;
  feeLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition",
        active ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:bg-muted",
      )}
    >
      <span className="text-sm font-medium text-foreground">{name}</span>
      <span className="text-[11px] leading-tight">{eta}</span>
      <Badge variant={active ? "info" : "outline"}>{feeLabel}</Badge>
    </button>
  );
}

function Row({ label, value, strong, sub }: { label: string; value: string; strong?: boolean; sub?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", sub && "text-xs")}>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("tabular-nums", strong ? "font-semibold" : "font-medium")}>{value}</span>
    </div>
  );
}
