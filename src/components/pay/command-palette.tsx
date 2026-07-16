import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useI18n } from "@/i18n";
import { ledger } from "@/mock/more";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const NAV = [
    { label: t("nav.overview"), to: "/app" },
    { label: t("nav.balances"), to: "/app/balances" },
    { label: t("nav.transactions"), to: "/app/transactions" },
    { label: t("nav.settlement"), to: "/app/settlement" },
    { label: t("nav.convert"), to: "/app/convert" },
    { label: t("nav.transfers"), to: "/app/transfers" },
    { label: t("nav.recipients"), to: "/app/recipients" },
    { label: t("nav.payments"), to: "/app/payments" },
    { label: t("nav.links"), to: "/app/links" },
    { label: t("nav.disputes"), to: "/app/disputes" },
    { label: t("nav.cards"), to: "/app/cards" },
    { label: t("nav.reports"), to: "/app/reports" },
    { label: t("nav.team"), to: "/app/team" },
    { label: t("nav.developers"), to: "/app/developers" },
    { label: t("nav.settings"), to: "/app/settings" },
  ];
  const ACTIONS = [
    { label: t("stl.newTitle"), to: "/app/settlement" },
    { label: t("iss.issueCard"), to: "/app/cards" },
    { label: t("links.create"), to: "/app/links" },
    { label: t("tf.new"), to: "/app/transfers" },
  ];

  const ql = q.trim().toLowerCase();
  const nav = NAV.filter((x) => x.label.toLowerCase().includes(ql));
  const acts = ql ? ACTIONS.filter((x) => x.label.toLowerCase().includes(ql)) : ACTIONS;
  const txns = ql
    ? ledger.filter((x) => x.desc.toLowerCase().includes(ql) || x.id.toLowerCase().includes(ql)).slice(0, 4)
    : [];

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  const first = nav[0]?.to ?? acts[0]?.to ?? (txns[0] ? "/app/transactions" : null);
  const empty = nav.length === 0 && acts.length === 0 && txns.length === 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-[overlay-in_150ms_ease-out]" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[12%] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl outline-none data-[state=open]:animate-[content-in_150ms_ease-out]">
          <DialogPrimitive.Title className="sr-only">Command</DialogPrimitive.Title>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && first) {
                  e.preventDefault();
                  go(first);
                }
              }}
              placeholder={t("cmd.placeholder")}
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {empty && <div className="px-3 py-8 text-center text-sm text-muted-foreground">{t("cmd.empty")}</div>}
            {nav.length > 0 && (
              <Group title={t("cmd.navGroup")}>
                {nav.map((x) => <Item key={x.to + x.label} label={x.label} onClick={() => go(x.to)} />)}
              </Group>
            )}
            {acts.length > 0 && (
              <Group title={t("cmd.actionGroup")}>
                {acts.map((x) => <Item key={"a" + x.label} label={x.label} onClick={() => go(x.to)} />)}
              </Group>
            )}
            {txns.length > 0 && (
              <Group title={t("cmd.txnGroup")}>
                {txns.map((x) => <Item key={x.id} label={`${x.desc} · ${x.id}`} onClick={() => go("/app/transactions")} />)}
              </Group>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-1">
      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Item({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted">
      {label}
    </button>
  );
}
