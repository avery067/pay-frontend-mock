import { useI18n } from "@/i18n";

export function LangSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "zh" ? "en" : "zh")}
      aria-label={t("a11y.switchLang")}
      className="grid h-8 min-w-8 place-items-center rounded-full border border-border px-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      {lang === "zh" ? "EN" : "中"}
    </button>
  );
}
