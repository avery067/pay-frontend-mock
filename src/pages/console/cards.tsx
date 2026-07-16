import { useState } from "react";
import { Plus, CreditCard } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatAmount, formatMoney } from "@/lib/format";
import { useMock } from "@/mock/store";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { EmptyState } from "@/components/console/empty-state";
import { PageHeader } from "@/components/console/page-header";
import { Button } from "@/components/ui/button";
import { CardVisual } from "@/components/pay/card-visual";
import { StatusBadge } from "@/components/pay/status-badge";
import { IssueCardDialog } from "@/components/pay/issue-card-dialog";
import { CardDrawer } from "@/components/pay/card-drawer";

export default function CardsPage() {
  const { t } = useI18n();
  const { cards } = useMock();
  const [cardId, setCardId] = useState<string | null>(null);
  const loading = usePageLoading();
  if (loading) return <LoadingSkeleton cards={6} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("nav.cards")}
        subtitle={t("iss.subtitle")}
        actions={
          <IssueCardDialog>
            <Button size="sm">
              <Plus />
              {t("iss.issueCard")}
            </Button>
          </IssueCardDialog>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const pct = Math.min(100, Math.round((c.spent / c.limit) * 100));
          return (
            <button
              key={c.id}
              onClick={() => setCardId(c.id)}
              className="rounded-2xl border border-border bg-card p-4 text-left transition hover:shadow-md"
            >
              <CardVisual name={c.name} brand={c.brand} last4={c.last4} currency={c.currency} frozen={c.status === "frozen"} />
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="tabular-nums text-xs text-muted-foreground">•••• {c.last4} · {c.currency}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-3 flex items-center justify-between tabular-nums text-xs text-muted-foreground">
                <span>{formatMoney(c.spent, c.currency)}</span>
                <span>/ {formatAmount(c.limit)}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {cards.length === 0 && <EmptyState icon={<CreditCard className="size-6" />} title={t("common.empty")} />}

      <CardDrawer cardId={cardId} onOpenChange={(o) => { if (!o) setCardId(null); }} />
    </div>
  );
}
