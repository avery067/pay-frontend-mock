import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeftRight, CreditCard, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Logo } from "@/components/common/logo";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const pillars = [
  { icon: ArrowLeftRight, title: "landing.p1Title", desc: "landing.p1Desc" },
  { icon: CreditCard, title: "landing.p2Title", desc: "landing.p2Desc" },
  { icon: Store, title: "landing.p3Title", desc: "landing.p3Desc" },
];

const stats = [
  { v: "landing.stat1v", k: "landing.stat1" },
  { v: "landing.stat2v", k: "landing.stat2" },
  { v: "landing.stat3v", k: "landing.stat3" },
];

export default function LandingPage() {
  const { t, lang } = useI18n();
  const tight = lang === "en" ? "tracking-tight" : "";

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <Link to="/" aria-label="Meridian">
            <Logo />
          </Link>
          <nav className="ml-2 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#pillars" className="transition hover:text-foreground">{t("nav.product")}</a>
            <a href="#pillars" className="transition hover:text-foreground">{t("nav.solutions")}</a>
            <a href="#" className="transition hover:text-foreground">{t("nav.pricing")}</a>
            <a href="#" className="transition hover:text-foreground">{t("nav.developers")}</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LangSwitcher />
            <ThemeSwitcher className="hidden sm:flex" />
            <Link to="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
              {t("actions.login")}
            </Link>
            <Link to="/login" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
              {t("actions.getStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
            style={{ background: "var(--brand)" }}
          />
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-brand" />
                {t("landing.eyebrow")}
              </span>
              <h1
                className={cn("mt-5 text-4xl font-semibold leading-[1.1] sm:text-5xl md:text-6xl", tight)}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t("landing.titleA")}
                <span style={{ color: "var(--brand-strong)" }}>{t("landing.titleB")}</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("landing.subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/login" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
                  {t("actions.getStarted")}
                  <ArrowRight />
                </Link>
                <Link to="/app" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                  {t("actions.viewDemo")}
                </Link>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">{t("landing.trust")}</p>
            </div>

            {/* 签名元素：透明报价卡 */}
            <div className="relative">
              <Card className="relative z-10 overflow-hidden shadow-xl">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <span className="text-sm font-medium">{t("landing.quoteTitle")}</span>
                  <Badge variant="warning">{t("landing.locked")}</Badge>
                </div>
                <div className="space-y-3.5 p-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">{t("landing.youSend")}</span>
                    <span className="tabular-nums text-lg font-semibold">
                      10,000.00 <span className="text-sm font-medium text-muted-foreground">USD</span>
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <QuoteLine label={t("landing.rate")} value="1 USD = 7.1820 CNY" />
                  <QuoteLine label={t("landing.spread")} value="0.35%" sub="− 25.14" />
                  <QuoteLine label={t("landing.fee")} value="USD 12.00" />
                  <QuoteLine label={t("landing.eta")} value={t("landing.etaValue")} />
                  <div className="mt-1 rounded-xl bg-secondary/60 p-4">
                    <div className="text-xs text-muted-foreground">{t("landing.theyGet")}</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="tabular-nums text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                        71,676.86
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">CNY</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 三条业务线 */}
        <section id="pillars" className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <h2 className={cn("text-2xl font-semibold md:text-3xl", tight)}>{t("landing.pillarsTitle")}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t("landing.pillarsSubtitle")}</p>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {pillars.map((p) => (
                <Card key={p.title} className="p-6 transition hover:shadow-md">
                  <span className="grid size-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <p.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{t(p.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(p.desc)}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 深色品牌带 + 统计 */}
        <section className="px-6 py-16">
          <div
            className="mx-auto max-w-6xl overflow-hidden rounded-3xl px-8 py-12 md:px-14 md:py-16"
            style={{ background: "var(--surface-deep)", color: "var(--surface-deep-foreground)" }}
          >
            <h2 className={cn("max-w-2xl text-2xl font-semibold md:text-3xl", tight)}>{t("landing.bandTitle")}</h2>
            <p className="mt-3 max-w-xl text-sm opacity-75">{t("landing.bandDesc")}</p>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-8">
              {stats.map((s) => (
                <div key={s.k}>
                  <div className="tabular-nums text-2xl font-semibold md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
                    {t(s.v)}
                  </div>
                  <div className="mt-1 text-xs opacity-75 md:text-sm">{t(s.k)}</div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link to="/app" className={cn(buttonVariants({ variant: "brand", size: "lg" }))}>
                {t("actions.enterConsole")}
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm text-muted-foreground">· {t("brand.cn")}</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Meridian · {t("footer.rights")}</p>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </footer>
    </div>
  );
}

function QuoteLine({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className="tabular-nums font-medium">{value}</span>
        {sub && <span className="tabular-nums text-xs text-muted-foreground">{sub}</span>}
      </span>
    </div>
  );
}
