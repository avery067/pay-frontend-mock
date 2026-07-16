import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Chrome, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Logo } from "@/components/common/logo";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const tight = lang === "en" ? "tracking-tight" : "";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/app"); // 原型：不做真实鉴权，直接进控制台
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* 左：品牌深色面板 */}
      <div
        className="relative hidden flex-col justify-between p-10 lg:flex"
        style={{ background: "var(--surface-deep)", color: "var(--surface-deep-foreground)" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--brand)" }}
        />
        <Link to="/" className="relative z-10" aria-label="Meridian">
          <Logo invert />
        </Link>
        <p
          className={cn("relative z-10 max-w-md text-2xl font-semibold leading-snug md:text-3xl", tight)}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t("login.brandTagline")}
        </p>
        <p className="relative z-10 text-sm opacity-70">© 2026 Meridian · {t("brand.cn")}</p>
      </div>

      {/* 右：登录表单 */}
      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("actions.backHome")}
          </Link>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <h1 className={cn("text-2xl font-semibold", tight)} style={{ fontFamily: "var(--font-display)" }}>
              {t("login.title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("login.subtitle")}</p>

            <form className="mt-8 space-y-4" onSubmit={onSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("login.email")}</Label>
                <Input id="email" type="email" placeholder={t("login.emailPh")} required />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("login.password")}</Label>
                  <a href="#" className="text-xs text-muted-foreground transition hover:text-foreground">
                    {t("login.forgot")}
                  </a>
                </div>
                <Input id="password" type="password" placeholder={t("login.passwordPh")} required />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="size-4 rounded border-border"
                  style={{ accentColor: "var(--primary)" }}
                />
                {t("login.remember")}
              </label>
              <Button type="submit" size="lg" className="w-full">
                {t("login.submit")}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              {t("login.or")}
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Chrome />
                {t("login.google")}
              </Button>
              <Button variant="outline" className="w-full">
                <Building2 />
                {t("login.sso")}
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {t("login.noAccount")}{" "}
              <a href="#" className="font-medium text-foreground hover:underline">
                {t("actions.signup")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
