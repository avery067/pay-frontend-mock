import { Bell, LogOut, Menu, Search, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import { notifications } from "@/mock/data";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenu} aria-label={t("a11y.menu")}>
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

        {/* 通知 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative grid size-8 place-items-center rounded-full border border-border text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground"
              aria-label={t("a11y.notifications")}
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-danger" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>{t("menu.notifTitle")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
                <span className="text-sm">{lang === "zh" ? n.zh : n.en}</span>
                <span className="tabular-nums text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 用户菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground outline-none transition hover:opacity-90"
            >
              M
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-medium text-foreground">示例商户 001</div>
              <div className="tabular-nums text-xs text-muted-foreground">demo@example.com</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User />
              {t("menu.account")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/app/settings")}>
              <Settings />
              {t("menu.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/login")}>
              <LogOut />
              {t("menu.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
