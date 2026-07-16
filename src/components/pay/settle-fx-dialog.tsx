import { useEffect, useState, type ReactNode } from "react";
import { Check, Upload } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { getRate } from "@/lib/quote";
import { formatAmount } from "@/lib/format";
import type { SettleFund } from "@/mock/more";
import {
  Dialog,
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

const STEPS = ["stl.step1", "stl.step2", "stl.step3", "stl.step4"];

export function SettleFxDialog({ children, fund }: { children: ReactNode; fund?: SettleFund }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"spot" | "forward">("spot");
  const [amount, setAmount] = useState(fund?.amount ?? 20000);
  const [docType, setDocType] = useState("PI");
  const [txnCode, setTxnCode] = useState("121010");
  const from = fund?.currency ?? "USD";

  useEffect(() => {
    if (open) {
      setStep(1);
      setAmount(fund?.amount ?? 20000);
      setMode("spot");
      setDocType("PI");
      setTxnCode("121010");
    }
  }, [open, fund]);

  const rate = getRate(from, "CNY");
  const rmb = amount * rate * (1 - 0.0025);

  const submit = () => {
    setOpen(false);
    toast(t("stl.done"));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("stl.newTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={s} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                    done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : n}
                </span>
                <span className={cn("hidden truncate text-xs sm:block", active ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {t(s)}
                </span>
                {i < STEPS.length - 1 && <span className={cn("h-px flex-1", done ? "bg-success" : "bg-border")} />}
              </div>
            );
          })}
        </div>

        <div className="min-h-[236px] space-y-4 py-1">
          {step === 1 && (
            <>
              {fund && (
                <div className="rounded-xl border border-border p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("stl.colSource")}</span>
                    <span className="font-medium">{fund.source}</span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span className="tabular-nums text-muted-foreground">{fund.id}</span>
                    <span className="tabular-nums font-medium">{fund.currency} {formatAmount(fund.amount)}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-[1fr_5.5rem] gap-3">
                <div className="space-y-1.5">
                  <Label>{t("stl.amount")}</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} className="tabular-nums" />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex h-10 items-center justify-center rounded-md border border-input bg-muted/40 text-sm font-medium">{from}</div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("stl.mode")}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Choice active={mode === "spot"} onClick={() => setMode("spot")} label={t("stl.modeSpot")} />
                  <Choice active={mode === "forward"} onClick={() => setMode("forward")} label={t("stl.modeForward")} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-1.5">
                <Label>{t("stl.docType")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Choice active={docType === "PI"} onClick={() => setDocType("PI")} label={t("stl.docPI")} />
                  <Choice active={docType === "CI"} onClick={() => setDocType("CI")} label={t("stl.docCI")} />
                  <Choice active={docType === "CT"} onClick={() => setDocType("CT")} label={t("stl.docContract")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("stl.docNo")}</Label>
                <Input placeholder={t("stl.docNoPh")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("stl.logistics")}</Label>
                <Input placeholder={t("stl.logisticsPh")} />
              </div>
              <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-sm text-muted-foreground transition hover:bg-muted/40">
                <Upload className="size-4" />
                {t("stl.upload")}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-1.5">
                <Label>{t("stl.txnCode")}</Label>
                <select
                  value={txnCode}
                  onChange={(e) => setTxnCode(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  <option value="121010">{t("stl.txnGoods")}</option>
                  <option value="122010">{t("stl.txnProcess")}</option>
                  <option value="223000">{t("stl.txnService")}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("stl.nature")}</Label>
                <Input value={t("stl.natureGoods")} readOnly />
              </div>
              <div className="space-y-1.5">
                <Label>{t("stl.declareNote")}</Label>
                <Input />
              </div>
              <p className="rounded-lg bg-info/10 p-3 text-xs text-info">{t("stl.declareTip")}</p>
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2 rounded-xl bg-muted/40 p-4 text-sm">
                <Row label={t("stl.amount")} value={`${from} ${formatAmount(amount)}`} />
                <Row label={t("stl.mode")} value={mode === "spot" ? t("stl.modeSpot") : t("stl.modeForward")} />
                <Row label={t("landing.rate")} value={`1 ${from} = ${formatAmount(rate, { min: 4, max: 4 })} CNY`} />
                <Row label={t("stl.txnCode")} value={txnCode} />
              </div>
              <div className="rounded-xl bg-secondary/60 p-4">
                <div className="text-xs text-muted-foreground">{t("stl.receiveRmb")}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="tabular-nums text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{formatAmount(rmb)}</span>
                  <span className="text-sm text-muted-foreground">CNY</span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              {t("common.prev")}
            </Button>
          )}
          {step < 4 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              {t("common.next")}
            </Button>
          ) : (
            <Button type="button" onClick={submit}>
              {t("stl.submit")}
            </Button>
          )}
        </DialogFooter>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums font-medium">{value}</span>
    </div>
  );
}
