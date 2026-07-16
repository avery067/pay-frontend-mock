import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Store,
  Settings,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Logo } from "@/components/common/logo";

const items = [
  { to: "/app", end: true, icon: LayoutDashboard, key: "nav.overview" },
  { to: "/app/settlement", icon: ArrowLeftRight, key: "nav.settlement" },
  { to: "/app/issuing", icon: CreditCard, key: "nav.issuing" },
  { to: "/app/acquiring", icon: Store, key: "nav.acquiring" },
  { to: "/app/settings", icon: Settings, key: "nav.settings" },
];

export function Sidebar({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-border bg-card",
        className,
      )}
    >
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-3">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                isActive
                  ? "bg-secondary font-semibold text-foreground"
                  : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              )
            }
          >
            <it.icon className="size-[18px]" />
            {t(it.key)}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">示例商户 001</div>
            <div className="truncate text-xs text-muted-foreground">
              demo@example.com
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
