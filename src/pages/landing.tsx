import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeftRight,
  CreditCard,
  Store,
  Wallet,
  Check,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { fxTicker, networks } from "@/mock/data";
import { Logo } from "@/components/common/logo";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Reveal } from "@/components/common/reveal";
import { CountUp } from "@/components/common/count-up";
import { LiveQuote } from "@/components/pay/live-quote";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const pillars = [
  { icon: ArrowLeftRight, title: "landing.p1Title", desc: "landing.p1Desc" },
  { icon: CreditCard, title: "landing.p2Title", desc: "landing.p2Desc" },
  { icon: Store, title: "landing.p3Title", desc: "landing.p3Desc" },
];

const steps = [
  { n: "01", icon: Wallet, title: "home.step1", desc: "home.step1d" },
  { n: "02", icon: ArrowLeftRight, title: "home.step2", desc: "home.step2d" },
  { n: "03", icon: CreditCard, title: "home.step3", desc: "home.step3d" },
];

export default function LandingPage() {
  const { t, lang } = useI18n();
  const tight = lang === "en" ? "tracking-tight" : "";

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* 导航 */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <Link to="/" aria-label="Meridian">
            <Logo />
          </Link>
          <nav className="ml-2 hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#pillars" className="transition hover:text-foreground">{t("nav.product")}</a>
            <a href="#how" className="transition hover:text-foreground">{t("nav.solutions")}</a>
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

      {/* FX 行情条 */}
      <div className="overflow-hidden border-b border-border bg-muted/20">
        <div className="ticker-track whitespace-nowrap py-2.5">
          {[...fxTicker, ...fxTicker].map((f, i) => (
            <span key={i} className="mx-5 inline-flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{f.pair}</span>
              <span className="tabular-nums font-medium">{f.rate}</span>
              <span className={cn("text-[10px]", f.up ? "text-pos" : "text-neg")}>{f.up ? "▲" : "▼"}</span>
            </span>
          ))}
        </div>
      </div>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 right-[-10%] h-[30rem] w-[30rem] rounded-full opacity-20 blur-3xl"
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
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-success" />
                {t("landing.trust")}
              </div>
            </div>

            {/* 签名元素：可交互报价卡 + 悬浮到账卡 */}
            <div className="relative">
              <div
                className="absolute -bottom-6 -left-4 z-0 hidden items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg sm:flex"
              >
                <span className="grid size-9 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="size-4" />
                </span>
                <div>
                  <div className="text-xs text-muted-foreground">{t("set.stepArrived")}</div>
                  <div className="tabular-nums text-sm font-semibold text-pos">+ CNY 71,676.86</div>
                </div>
              </div>
              <LiveQuote className="relative z-10 overflow-hidden shadow-xl" />
            </div>
          </div>
        </section>

        {/* 支付网络 */}
        <section className="border-y border-border bg-muted/10">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t("home.networksTitle")}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {networks.map((n) => (
                <span key={n} className="text-base font-semibold text-muted-foreground/70">{n}</span>
              ))}
            </div>
          </div>
        </section>

        {/* 三步流程 */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <Reveal>
            <h2 className={cn("text-2xl font-semibold md:text-3xl", tight)}>{t("home.howTitle")}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t("home.howSubtitle")}</p>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                      <s.icon className="size-5" />
                    </span>
                    <span className="tabular-nums text-sm font-semibold text-muted-foreground">{s.n}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{t(s.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(s.desc)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 产品预览 */}
        <section className="border-t border-border bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <Reveal>
              <h2 className={cn("text-2xl font-semibold md:text-3xl", tight)}>{t("home.previewTitle")}</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">{t("home.previewSubtitle")}</p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                  <span className="size-2.5 rounded-full bg-danger/50" />
                  <span className="size-2.5 rounded-full bg-warning/50" />
                  <span className="size-2.5 rounded-full bg-success/50" />
                  <span className="ml-3 tabular-nums text-xs text-muted-foreground">app.meridian.example / overview</span>
                </div>
                <div className="space-y-4 bg-muted/20 p-5 md:p-7">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { l: t("console.kpiVolume"), v: "USD 1,284,530" },
                      { l: t("console.kpiCards"), v: "1,286" },
                      { l: t("console.kpiSuccess"), v: "98.6%" },
                    ].map((k) => (
                      <div key={k.l} className="rounded-xl border border-border bg-card p-4">
                        <div className="truncate text-xs text-muted-foreground">{k.l}</div>
                        <div className="mt-1.5 tabular-nums text-base font-semibold md:text-xl" style={{ fontFamily: "var(--font-display)" }}>
                          {k.v}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-border bg-card">
                    {[
                      { m: "Acme Inc.（示例）", a: "+ USD 1,200.00", s: t("status.settled"), c: "text-success" },
                      { m: "示例商户 001", a: "+ USD 3,450.00", s: t("status.processing"), c: "text-warning" },
                      { m: "Globex（示例）", a: "+ USD 880.00", s: t("status.settled"), c: "text-success" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-border/60 px-4 py-3 text-sm last:border-0">
                        <span className="font-medium">{r.m}</span>
                        <span className="flex items-center gap-4">
                          <span className="tabular-nums text-pos">{r.a}</span>
                          <span className={cn("text-xs", r.c)}>{r.s}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* 三条业务线 */}
        <section id="pillars" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <Reveal>
            <h2 className={cn("text-2xl font-semibold md:text-3xl", tight)}>{t("landing.pillarsTitle")}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{t("landing.pillarsSubtitle")}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 90}>
                <Card className="h-full p-6 transition hover:shadow-md">
                  <span className="grid size-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <p.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{t(p.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(p.desc)}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 深色品牌带 + 统计 */}
        <section className="px-6 pb-16">
          <div
            className="mx-auto max-w-6xl overflow-hidden rounded-3xl px-8 py-12 md:px-14 md:py-16"
            style={{ background: "var(--surface-deep)", color: "var(--surface-deep-foreground)" }}
          >
            <h2 className={cn("max-w-2xl text-2xl font-semibold md:text-3xl", tight)}>{t("landing.bandTitle")}</h2>
            <p className="mt-3 max-w-xl text-sm opacity-75">{t("landing.bandDesc")}</p>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-8">
              <Stat value={<CountUp to={40} suffix="+" />} label={t("landing.stat1")} />
              <Stat value={<CountUp to={180} suffix="+" />} label={t("landing.stat2")} />
              <Stat value={t("landing.stat3v")} label={t("landing.stat3")} />
            </div>
            <div className="mt-10">
              <Link to="/app" className={cn(buttonVariants({ variant: "brand", size: "lg" }))}>
                {t("actions.enterConsole")}
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <Reveal className="text-center">
            <h2 className={cn("mx-auto max-w-2xl text-2xl font-semibold md:text-4xl", tight)}>{t("home.ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("home.ctaSubtitle")}</p>
            <div className="mt-8 flex justify-center">
              <Link to="/login" className={cn(buttonVariants({ variant: "default", size: "lg" }))}>
                {t("actions.getStarted")}
                <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">{t("brand.cn")} · {t("footer.rights")}</p>
          </div>
          <FooterCol title={t("footer.product")} items={[t("nav.settlement"), t("nav.issuing"), t("nav.acquiring")]} />
          <FooterCol title={t("footer.company")} items={[t("nav.product"), t("nav.solutions"), t("nav.pricing")]} />
          <FooterCol title={t("footer.legal")} items={[t("nav.developers"), "Terms", "Privacy"]} />
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
            <p className="tabular-nums text-sm text-muted-foreground">© 2026 Meridian</p>
            <div className="flex items-center gap-2">
              <LangSwitcher />
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="tabular-nums text-2xl font-semibold md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </div>
      <div className="mt-1 text-xs opacity-75 md:text-sm">{label}</div>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((it) => (
          <li key={it}>
            <a href="#" className="transition hover:text-foreground">{it}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
