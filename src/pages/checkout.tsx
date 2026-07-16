import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Lock } from "lucide-react";
import { useI18n } from "@/i18n";
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
import { cn } from "@/lib/utils";
import { CardBrand } from "@/components/pay/card-brand";
import { useToast } from "@/components/ui/toast";

export default function CheckoutPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { paymentLinks, collectLink } = useMock();
  const [params] = useSearchParams();
  const linkId = params.get("link");
  const link = linkId ? paymentLinks.find((l) => l.id === linkId) ?? null : null;

  const amount = link?.amount ?? 299;
  const currency = link?.currency ?? "USD";
  const amountLabel = formatMoney(amount, currency);
  const alreadyPaid = link?.status === "paid";
  const [paid, setPaid] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (link && link.status === "active") collectLink(link.id);
    setPaid(true);
    toast(t("checkout.success"));
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
          ) : (
            <form onSubmit={submit} className="space-y-4 p-6">
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
              <div className="space-y-1.5">
                <Label htmlFor="cname">{t("checkout.name")}</Label>
                <Input id="cname" placeholder={t("checkout.namePh")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cemail">{t("checkout.email")}</Label>
                <Input id="cemail" type="email" placeholder="you@example.com" />
              </div>
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
