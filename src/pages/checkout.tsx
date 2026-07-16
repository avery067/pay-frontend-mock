import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { useI18n } from "@/i18n";
import { Logo } from "@/components/common/logo";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CardBrand } from "@/components/pay/card-brand";
import { useToast } from "@/components/ui/toast";

export default function CheckoutPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast(t("checkout.success"));
  };

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
            <div className="mt-5 text-xs text-muted-foreground">{t("checkout.amount")}</div>
            <div className="tabular-nums text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              USD 299.00
            </div>
          </div>

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
              {t("checkout.pay")} · USD 299.00
            </Button>
          </form>

          <div className="flex items-center justify-center gap-1.5 border-t border-border p-4 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            {t("checkout.secured")}
          </div>
        </Card>
      </div>
    </div>
  );
}
