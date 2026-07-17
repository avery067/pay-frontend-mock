import { useState, type ReactNode } from "react";
import { Check, Plus } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { CURRENCIES } from "@/lib/quote";
import { type AcqTxn, type FeeRule, type FeeChannel } from "@/mock/more";
import { useMock } from "@/mock/store";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const round2 = (n: number) => Math.round(n * 100) / 100;

// 与 reports.tsx 的 methodName 同逻辑的本地副本，避免跨页改动
function canonicalMethod(m: string): string {
  if (m.startsWith("Visa")) return "Visa";
  if (m.startsWith("Mastercard")) return "Mastercard";
  if (m.startsWith("Amex")) return "Amex";
  if (m.includes("Alipay")) return "Alipay";
  if (m.includes("WeChat")) return "WeChat Pay";
  if (m.includes("SEPA")) return "SEPA";
  if (m.includes("链接") || m.toLowerCase().includes("link")) return "Link";
  return m;
}

function impliedChannel(x: AcqTxn): FeeChannel {
  return canonicalMethod(x.method) === "Link" ? "link" : "online";
}

function blendedFee(gross: number, percent: number, fixed: number): number {
  return round2(gross * (percent / 100) + fixed);
}

// IC+：interchange / scheme 按实际发生透传，markup 命中费率规则则按规则重算，否则回退到样本自带的加价
function icPlusFee(x: AcqTxn, feeRules: FeeRule[]): number {
  const bd = x.feeBreakdown;
  if (!bd) return x.fee;
  const rule = feeRules.find(
    (r) => r.channel === impliedChannel(x) && r.method === canonicalMethod(x.method) && r.currency === x.currency,
  );
  const markup = rule ? round2(rule.fixed + x.gross * (rule.rateBps / 10000)) : bd.markup;
  return round2(bd.interchange + bd.scheme + markup);
}

const CHANNELS: FeeChannel[] = ["online", "pos", "link", "moto"];
const CHANNEL_KEY: Record<FeeChannel, string> = {
  online: "price.channelOnline",
  pos: "price.channelPos",
  link: "price.channelLink",
  moto: "price.channelMoto",
};

type Better = "blended" | "ic_plus" | "same";
function betterOf(diff: number): Better {
  return diff > 0.005 ? "ic_plus" : diff < -0.005 ? "blended" : "same";
}

export default function PricingPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { acqTxns, pricingModel, setPricingModel, pricingPlan, feeRules } = useMock();
  const loading = usePageLoading();
  if (loading) return <LoadingSkeleton rows={8} />;

  const samples = acqTxns.filter((x) => x.feeBreakdown);
  const rows = samples.map((x) => {
    const blended = blendedFee(x.gross, pricingPlan.percent, pricingPlan.fixed);
    const icplus = icPlusFee(x, feeRules);
    const diff = round2(blended - icplus);
    return { x, blended, icplus, diff, better: betterOf(diff) };
  });
  const totalBlended = round2(rows.reduce((s, r) => s + r.blended, 0));
  const totalIcPlus = round2(rows.reduce((s, r) => s + r.icplus, 0));
  const totalDiff = round2(totalBlended - totalIcPlus);
  const totalBetter = betterOf(totalDiff);

  const switchPlan = (model: "blended" | "ic_plus") => {
    if (model === pricingModel) return;
    setPricingModel(model);
    toast(t(model === "blended" ? "price.toastBlended" : "price.toastIcPlus"));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("price.title")} subtitle={t("price.subtitle")} />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{t("price.planTitle")}</CardTitle>
            <CardDescription>{t("price.planDesc")}</CardDescription>
          </div>
          <Badge variant="info">{t("console.sample")}</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <PlanChoice
              active={pricingModel === "blended"}
              title={t("price.planBlended")}
              desc={t("price.planBlendedDesc")}
              meta={`${pricingPlan.percent}% + ${formatMoney(pricingPlan.fixed)}`}
              onClick={() => switchPlan("blended")}
            />
            <PlanChoice
              active={pricingModel === "ic_plus"}
              title={t("price.planIcPlus")}
              desc={t("price.planIcPlusDesc")}
              meta={`${t("price.interchange")} + ${t("price.scheme")} + ${t("price.markup")}`}
              onClick={() => switchPlan("ic_plus")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("price.compareTitle")}</CardTitle>
          <CardDescription>{t("price.compareDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("price.colTxn")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("price.colAmount")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    {t("price.colBlendedFee")}
                    {pricingModel === "blended" && <span className="ml-1 text-[10px] text-primary">· {t("price.currentPlan")}</span>}
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    {t("price.colIcPlusFee")}
                    {pricingModel === "ic_plus" && <span className="ml-1 text-[10px] text-primary">· {t("price.currentPlan")}</span>}
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("price.colDiff")}</th>
                  <th className="px-6 py-2.5 text-left font-medium">{t("price.colBetter")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ x, blended, icplus, diff, better }) => (
                  <tr key={x.order} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3">
                      <div className="font-medium">{x.merchant}</div>
                      <div className="tabular-nums text-xs text-muted-foreground">{x.order} · {x.method}</div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatMoney(x.gross, x.currency)}</td>
                    <td className={cn("px-3 py-3 text-right tabular-nums", better === "blended" && "font-semibold text-success")}>{formatMoney(blended, x.currency)}</td>
                    <td className={cn("px-3 py-3 text-right tabular-nums", better === "ic_plus" && "font-semibold text-success")}>{formatMoney(icplus, x.currency)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">{formatMoney(Math.abs(diff), x.currency)}</td>
                    <td className="px-6 py-3">
                      {better === "same" ? (
                        <Badge variant="outline">{t("price.betterSame")}</Badge>
                      ) : (
                        <Badge variant="success">{t(better === "ic_plus" ? "price.betterIcPlus" : "price.betterBlended")}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border text-sm">
                  <td className="px-6 py-3 font-semibold">{t("price.totalLabel")}</td>
                  <td className="px-3 py-3" />
                  <td className={cn("px-3 py-3 text-right font-semibold tabular-nums", totalBetter === "blended" && "text-success")}>{formatMoney(totalBlended)}</td>
                  <td className={cn("px-3 py-3 text-right font-semibold tabular-nums", totalBetter === "ic_plus" && "text-success")}>{formatMoney(totalIcPlus)}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-muted-foreground">{formatMoney(Math.abs(totalDiff))}</td>
                  <td className="px-6 py-3">
                    {totalBetter !== "same" && <Badge variant="success">{t(totalBetter === "ic_plus" ? "price.betterIcPlus" : "price.betterBlended")}</Badge>}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{t("price.rulesTitle")}</CardTitle>
            <CardDescription>{t("price.rulesDesc")}</CardDescription>
          </div>
          <NewRuleDialog>
            <Button size="sm">
              <Plus />
              {t("price.newRule")}
            </Button>
          </NewRuleDialog>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("price.colChannel")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("price.colMethod")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("price.colCurrency")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("price.colFixed")}</th>
                  <th className="px-6 py-2.5 text-right font-medium">{t("price.colRateBps")}</th>
                </tr>
              </thead>
              <tbody>
                {feeRules.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3">{t(CHANNEL_KEY[r.channel])}</td>
                    <td className="px-3 py-3 font-medium">{r.method}</td>
                    <td className="px-3 py-3 tabular-nums">{r.currency}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatMoney(r.fixed, r.currency)}</td>
                    <td className="px-6 py-3 text-right tabular-nums">{r.rateBps}</td>
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

function PlanChoice({
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
      className={cn(
        "rounded-xl border p-4 text-left transition",
        active ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
      )}
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

function NewRuleDialog({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { addFeeRule } = useMock();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState<FeeChannel>("online");
  const [method, setMethod] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [fixed, setFixed] = useState(0.1);
  const [rateBps, setRateBps] = useState(20);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = addFeeRule({ channel, method: method.trim(), currency, fixed, rateBps });
    if (!ok) {
      toast(t("price.ruleDup"));
      return;
    }
    setOpen(false);
    setMethod("");
    setFixed(0.1);
    setRateBps(20);
    toast(t("price.ruleCreated"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("price.ruleDialogTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="frch">{t("price.colChannel")}</Label>
              <select
                id="frch"
                value={channel}
                onChange={(e) => setChannel(e.target.value as FeeChannel)}
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{t(CHANNEL_KEY[c])}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="frcur">{t("price.colCurrency")}</Label>
              <select
                id="frcur"
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
            <Label htmlFor="frm">{t("price.colMethod")}</Label>
            <Input id="frm" value={method} onChange={(e) => setMethod(e.target.value)} placeholder={t("price.methodPh")} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="frf">{t("price.colFixed")}</Label>
              <Input id="frf" type="number" step="0.01" min="0" value={fixed} onChange={(e) => setFixed(Math.max(0, Number(e.target.value) || 0))} className="tabular-nums" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="frb">{t("price.colRateBps")}</Label>
              <Input id="frb" type="number" step="1" min="0" value={rateBps} onChange={(e) => setRateBps(Math.max(0, Number(e.target.value) || 0))} className="tabular-nums" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit">{t("price.newRule")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
