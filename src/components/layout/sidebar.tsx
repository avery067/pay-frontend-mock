import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Repeat,
  Send,
  Users,
  HandCoins,
  Link2,
  Scale,
  CreditCard,
  BarChart3,
  UsersRound,
  Code2,
  Settings,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { Logo } from "@/components/common/logo";

type Item = { to: string; end?: boolean; icon: LucideIcon; key: string };
type Group = { label?: string; items: Item[] };

const GROUPS: Group[] = [
  { items: [{ to: "/app", end: true, icon: LayoutDashboard, key: "nav.overview" }] },
  {
    label: "nav.groupMoney",
    items: [
      { to: "/app/balances", icon: Wallet, key: "nav.balances" },
      { to: "/app/transactions", icon: Receipt, key: "nav.transactions" },
      { to: "/app/convert", icon: Repeat, key: "nav.convert" },
      { to: "/app/transfers", icon: Send, key: "nav.transfers" },
      { to: "/app/recipients", icon: Users, key: "nav.recipients" },
    ],
  },
  {
    label: "nav.groupAccept",
    items: [
      { to: "/app/payments", icon: HandCoins, key: "nav.payments" },
      { to: "/app/links", icon: Link2, key: "nav.links" },
      { to: "/app/disputes", icon: Scale, key: "nav.disputes" },
    ],
  },
  { items: [{ to: "/app/cards", icon: CreditCard, key: "nav.cards" }] },
  {
    label: "nav.groupManage",
    items: [
      { to: "/app/reports", icon: BarChart3, key: "nav.reports" },
      { to: "/app/team", icon: UsersRound, key: "nav.team" },
      { to: "/app/developers", icon: Code2, key: "nav.developers" },
    ],
  },
];

function itemClass({ isActive }: { isActive: boolean }) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
    isActive
      ? "bg-secondary font-semibold text-foreground"
      : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
  );
}

export function Sidebar({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <aside className={cn("flex h-full w-60 flex-col border-r border-border bg-card", className)}>
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {GROUPS.map((g, gi) => (
          <div key={g.label ?? gi}>
            {g.label && (
              <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t(g.label)}
              </div>
            )}
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.end} className={itemClass}>
                  <it.icon className="size-[18px]" />
                  {t(it.key)}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <NavLink to="/app/settings" className={itemClass}>
          <Settings className="size-[18px]" />
          {t("nav.settings")}
        </NavLink>
        <div className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <Building2 className="size-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">示例商户 001</div>
            <div className="truncate text-xs text-muted-foreground">demo@example.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
