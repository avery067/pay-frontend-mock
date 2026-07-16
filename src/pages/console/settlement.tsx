import { useState } from "react";
import { Plus } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatAmount } from "@/lib/format";
import { settlements, type Settlement } from "@/mock/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/pay/status-badge";
import { NewSettlementDialog } from "@/components/pay/new-settlement-dialog";
import { SettlementDrawer } from "@/components/pay/settlement-drawer";

const FILTERS = ["all", "processing", "settled", "failed"] as const;

export default function SettlementPage() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const rows = settlements.filter((s) => filter === "all" || s.status === filter);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{t("set.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("set.subtitle")}</p>
        </div>
        <NewSettlementDialog>
          <Button size="sm">
            <Plus />
            {t("set.newQuote")}
          </Button>
        </NewSettlementDialog>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f === "all" ? t("common.filterAll") : t(`status.${f}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("set.colRef")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("set.colCorridor")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("set.youPay")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("set.youGet")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                  <th className="px-6 py-2.5 text-right font-medium">{t("console.colTime")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr
                    key={s.ref}
                    onClick={() => setSelected(s)}
                    className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-3 font-medium tabular-nums">{s.ref}</td>
                    <td className="px-3 py-3 text-muted-foreground">{s.corridor}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.from} {formatAmount(s.pay)}</td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{s.to} {formatAmount(s.get)}</td>
                    <td className="px-3 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{s.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SettlementDrawer
        item={selected}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      />
    </div>
  );
}
