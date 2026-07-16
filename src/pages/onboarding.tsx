import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Upload, Building2, User, Briefcase, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Logo } from "@/components/common/logo";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STEPS = [
  { key: "onb.step1", icon: Building2 },
  { key: "onb.step2", icon: User },
  { key: "onb.step3", icon: Briefcase },
  { key: "onb.step4", icon: FileText },
];

const REVIEW_STEPS = ["onb.rStep1", "onb.rStep2", "onb.rStep3", "onb.rStep4"];

export default function OnboardingPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1..4 forms, 5 = review
  const tight = lang === "en" ? "tracking-tight" : "";

  return (
    <div className="grid min-h-svh lg:grid-cols-[360px_1fr]">
      {/* 品牌 + 步骤 */}
      <div
        className="relative hidden flex-col justify-between p-10 lg:flex"
        style={{ background: "var(--surface-deep)", color: "var(--surface-deep-foreground)" }}
      >
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: "var(--brand)" }} />
        <Link to="/" className="relative z-10" aria-label="Meridian">
          <Logo invert />
        </Link>
        <div className="relative z-10 space-y-6">
          <h1 className={cn("max-w-xs text-2xl font-semibold leading-snug", tight)} style={{ fontFamily: "var(--font-display)" }}>
            {t("onb.brand")}
          </h1>
          <p className="max-w-xs text-sm opacity-75">{t("onb.tagline")}</p>
          <div className="space-y-3 pt-2">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const done = step > n || step === 5;
              const active = step === n;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold", done ? "bg-brand text-brand-strong" : active ? "bg-white/20" : "bg-white/10 opacity-70")}>
                    {done ? <Check className="size-4" /> : n}
                  </span>
                  <span className={cn("text-sm", active ? "font-medium" : "opacity-75")}>{t(s.key)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="relative z-10 text-xs opacity-60">© 2026 Meridian</p>
      </div>

      {/* 表单 */}
      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="size-4" />
            {t("common.back")}
          </Link>
          <div className="flex items-center gap-2">
            <LangSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        <div className="flex flex-1 items-start justify-center px-6 pb-16">
          <div className="w-full max-w-lg">
            {step <= 4 ? (
              <>
                <div className="text-sm text-muted-foreground">{`${step} / 4`}</div>
                <h2 className={cn("mt-1 text-xl font-semibold", tight)}>{t(`onb.step${step}`)}</h2>

                <div className="mt-6 space-y-4">
                  {step === 1 && (
                    <>
                      <Field label={t("onb.companyName")}>
                        <Input placeholder={t("onb.companyNamePh")} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label={t("onb.uscc")}>
                          <Input placeholder={t("onb.usccPh")} className="tabular-nums" />
                        </Field>
                        <Field label={t("onb.regDate")}>
                          <Input type="date" />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label={t("onb.country")}>
                          <Input placeholder="CN" />
                        </Field>
                        <Field label={t("onb.entityType")}>
                          <select className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                            <option>{t("onb.entityLtd")}</option>
                            <option>{t("onb.entityCorp")}</option>
                            <option>{t("onb.entitySole")}</option>
                          </select>
                        </Field>
                      </div>
                      <Field label={t("onb.scope")}>
                        <Input placeholder={t("onb.scopePh")} />
                      </Field>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="text-sm font-medium">{t("onb.legalRep")}</div>
                      <Field label={t("onb.repName")}>
                        <Input />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label={t("onb.idType")}>
                          <select className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                            <option>{t("onb.idCard")}</option>
                            <option>{t("onb.idPassport")}</option>
                          </select>
                        </Field>
                        <Field label={t("onb.idNo")}>
                          <Input className="tabular-nums" />
                        </Field>
                      </div>
                      <div className="pt-2 text-sm font-medium">{t("onb.ubo")}</div>
                      <div className="grid grid-cols-[1fr_7rem] gap-3">
                        <Field label={t("onb.uboName")}>
                          <Input />
                        </Field>
                        <Field label={t("onb.uboPct")}>
                          <Input type="number" defaultValue={100} className="tabular-nums" />
                        </Field>
                      </div>
                      <p className="rounded-lg bg-info/10 p-3 text-xs text-info">{t("onb.uboTip")}</p>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <Field label={t("onb.mainBiz")}>
                        <Input placeholder={t("onb.mainBizPh")} />
                      </Field>
                      <Field label={t("onb.monthlyVol")}>
                        <Input placeholder="USD 500,000" className="tabular-nums" />
                      </Field>
                      <Field label={t("onb.corridors")}>
                        <Input placeholder={t("onb.corridorsPh")} />
                      </Field>
                      <Field label={t("onb.settleAcct")}>
                        <Input placeholder={t("onb.settleAcctPh")} className="tabular-nums" />
                      </Field>
                    </>
                  )}

                  {step === 4 && (
                    <div className="grid grid-cols-2 gap-3">
                      {["onb.docLicense", "onb.docRepId", "onb.docBankPermit", "onb.docContract"].map((k) => (
                        <button
                          key={k}
                          type="button"
                          className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center transition hover:bg-muted/40"
                        >
                          <Upload className="size-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{t(k)}</span>
                          <span className="text-xs text-muted-foreground">{t("onb.uploadHint")}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div>
                    {step > 1 && (
                      <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                        {t("common.prev")}
                      </Button>
                    )}
                  </div>
                  {step < 4 ? (
                    <Button onClick={() => setStep((s) => s + 1)}>{t("common.next")}</Button>
                  ) : (
                    <Button onClick={() => setStep(5)}>{t("onb.submit")}</Button>
                  )}
                </div>
              </>
            ) : (
              <div className="pt-6 text-center">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-success/15 text-success">
                  <Check className="size-7" />
                </div>
                <h2 className={cn("mt-5 text-2xl font-semibold", tight)}>{t("onb.reviewTitle")}</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{t("onb.reviewDesc")}</p>
                <div className="mx-auto mt-8 max-w-xs text-left">
                  {REVIEW_STEPS.map((s, i) => (
                    <div key={s} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className={cn("grid size-6 place-items-center rounded-full", i === 0 ? "bg-success text-success-foreground" : "border border-border bg-card text-muted-foreground")}>
                          {i === 0 ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                        </span>
                        {i < REVIEW_STEPS.length - 1 && <span className={cn("my-1 h-6 w-px", i === 0 ? "bg-success" : "bg-border")} />}
                      </div>
                      <div className={cn("pb-4 text-sm", i === 0 ? "font-medium" : "text-muted-foreground")}>{t(s)}</div>
                    </div>
                  ))}
                </div>
                <Button className="mt-2" onClick={() => navigate("/app")}>{t("onb.enter")}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
