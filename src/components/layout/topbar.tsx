import { Bell, Menu, Search } from "lucide-react";
import { useI18n } from "@/i18n";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { Button } from "@/components/ui/button";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenu}
        aria-label={t("a11y.menu")}
      >
        <Menu />
      </Button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder={t("console.searchPh")}
          className="h-9 w-full rounded-full border border-border bg-muted/50 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <LangSwitcher />
        <ThemeSwitcher className="hidden sm:flex" />
        <button
          type="button"
          className="relative grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label={t("a11y.notifications")}
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger" />
        </button>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
          M
        </span>
      </div>
    </header>
  );
}
