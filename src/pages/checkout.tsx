import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Lock } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { useMock } from "@/mock/store";
import { Logo } from "@/components/common/logo";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CardBrand } from "@/components/pay/card-brand";
import { useToast } from "@/components/ui/toast";

export default function CheckoutPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { paymentLinks, collectLink, paymentMethods } = useMock();
  const [params] = useSearchParams();
  const linkId = params.get("link");
  const link = linkId ? paymentLinks.find((l) => l.id === linkId) ?? null : null;

  const amount = link?.amount ?? 299;
  const currency = link?.currency ?? "USD";
  const amountLabel = formatMoney(amount, currency);
  const alreadyPaid = link?.status === "paid";

  const enabled = paymentMethods.filter((m) => m.enabled);
  const [methodCode, setMethodCode] = useState(enabled[0]?.code ?? "visa");
  const method = enabled.find((m) => m.code === methodCode) ?? enabled[0];
  const [paid, setPaid] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (enabled.length && !enabled.some((m) => m.code === methodCode)) setMethodCode(enabled[0].code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethods]);

  const complete = () => {
    if (link && link.status === "active") collectLink(link.id, { method: method?.name ?? "Card", methodKind: method?.kind, payerCountry: method?.regions[0] });
    setPending(false);
    setPaid(true);
    toast(t("checkout.success"));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return;
    if (method.async) {
      setPending(true);
      window.setTimeout(complete, 2600);
    } else {
      complete();
    }
  };

  const done = paid || alreadyPaid;

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/app/links" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="size-4" />
          {t("common.back")}
        </Link>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeSwitcher />
        </div>
      </header>

      <div className="mx-auto max-w-md px-6 pb-16 pt-6">
        <div className="mb-3 flex justify-center">
          <Badge variant="info">{t("checkout.sample")}</Badge>
        </div>
        <Card className="overflow-hidden">
          <div className="border-b border-border p-6">
            <div className="text-sm text-muted-foreground">{t("checkout.payTo")}</div>
            <div className="mt-2 flex items-center gap-2">
              <Logo showText={false} />
              <span className="font-semibold">示例商户 001</span>
            </div>
            {link && <div className="mt-3 text-sm text-muted-foreground">{link.name}</div>}
            <div className="mt-5 text-xs text-muted-foreground">{t("checkout.amount")}</div>
            <div className="tabular-nums text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {amountLabel}
            </div>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-7" />
              </span>
              <div>
                <div className="text-lg font-semibold">{t("checkout.success")}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {alreadyPaid && !paid ? t("checkout.paidAlready") : t("checkout.doneDesc")}
                </p>
              </div>
              <Link to="/app/links" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                {t("checkout.backToLinks")}
              </Link>
            </div>
          ) : pending ? (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <Loader2 className="size-9 animate-spin text-brand" />
              <div>
                <div className="font-semibold">{t("pm.pending")}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t("pm.pendingDesc")}</p>
              </div>
              <div className="grid size-28 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                <div className="grid grid-cols-4 gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className={cn("size-2 rounded-[2px]", i % 3 === 0 || i % 5 === 0 ? "bg-secondary-foreground" : "bg-transparent")} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>{t("pm.choose")}</Label>
                <div className="grid gap-2">
                  {enabled.map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => setMethodCode(m.code)}
                      className={cn(
                        "flex items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm transition",
                        methodCode === m.code ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                      )}
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="flex items-center gap-1.5">
                        {m.async && <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] text-info">{t("pm.async")}</span>}
                        <span className={cn("grid size-4 place-items-center rounded-full border", methodCode === m.code ? "border-primary" : "border-muted-foreground/40")}>
                          {methodCode === m.code && <span className="size-2 rounded-full bg-primary" />}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {method?.kind === "card" && (
                <div className="space-y-3 border-t border-border pt-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cno">{t("checkout.cardNo")}</Label>
                    <div className="relative">
                      <Input id="cno" placeholder="1234 5678 9012 3456" className="pr-16 tabular-nums" />
                      <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                        <CardBrand brand="visa" className="h-4 w-auto text-[#1434CB]" />
                        <CardBrand brand="mastercard" className="h-4 w-auto" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="exp">{t("checkout.expiry")}</Label>
                      <Input id="exp" placeholder="MM / YY" className="tabular-nums" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cvc">{t("checkout.cvc")}</Label>
                      <Input id="cvc" placeholder="123" className="tabular-nums" />
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full">
                {t("checkout.pay")} · {amountLabel}
              </Button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 border-t border-border p-4 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            {t("checkout.secured")}
          </div>
        </Card>
      </div>
    </div>
  );
}
