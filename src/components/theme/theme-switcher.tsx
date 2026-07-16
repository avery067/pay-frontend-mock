import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { THEMES, useTheme, type Theme } from "./theme-provider";

const LABELS: Record<Theme, string> = {
  wise: "Wise",
  mercury: "Mercury",
  revolut: "Revolut",
  stripe: "Stripe",
};

/** 每套主题的品牌色，用作可视化选择的色块 */
const SWATCH: Record<Theme, string> = {
  wise: "#9fe870",
  mercury: "#2563eb",
  revolut: "#ff3b6b",
  stripe: "#635bff",
};

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, dark, toggleDark } = useTheme();
  const { t } = useI18n();

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-1 rounded-full border border-border p-1">
        {THEMES.map((tk) => (
          <button
            key={tk}
            type="button"
            onClick={() => setTheme(tk)}
            title={LABELS[tk]}
            aria-label={LABELS[tk]}
            aria-pressed={theme === tk}
            className={cn(
              "size-6 rounded-full border-2 transition",
              theme === tk
                ? "scale-110 border-foreground"
                : "border-transparent opacity-60 hover:opacity-100",
            )}
            style={{ background: SWATCH[tk] }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={toggleDark}
        aria-label={t("a11y.toggleTheme")}
        className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </div>
  );
}
