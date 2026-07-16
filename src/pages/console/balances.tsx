import { Plus, ArrowDownToLine, Repeat } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatAmount, formatMoney } from "@/lib/format";
import { balances, totalUsdEq } from "@/mock/more";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewSettlementDialog } from "@/components/pay/new-settlement-dialog";
import { useToast } from "@/components/ui/toast";

export default function BalancesPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("bal.title")}
        subtitle={t("bal.subtitle")}
        actions={
          <Button size="sm" variant="outline" onClick={() => toast(t("bal.addCurrency"))}>
            <Plus />
            {t("bal.addCurrency")}
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <div className="text-sm text-muted-foreground">{t("bal.total")}</div>
            <div className="mt-1 tabular-nums text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              {formatMoney(totalUsdEq)}
            </div>
          </div>
          <div className="flex gap-2">
            <NewSettlementDialog>
              <Button variant="outline">
                <Repeat />
                {t("bal.convert")}
              </Button>
            </NewSettlementDialog>
            <Button variant="outline" onClick={() => toast(t("bal.withdraw"))}>
              <ArrowDownToLine />
              {t("bal.withdraw")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {balances.map((b) => (
          <Card key={b.currency}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                    {b.currency.slice(0, 2)}
                  </span>
                  <span className="font-medium">{b.currency}</span>
                </span>
                <span className="tabular-nums text-xs text-muted-foreground">≈ {formatMoney(b.usdEq)}</span>
              </div>
              <div className="mt-4 tabular-nums text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {formatAmount(b.available)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t("bal.available")}
                {b.pending > 0 && (
                  <>
                    {" · "}
                    {t("bal.pending")} <span className="tabular-nums">{formatAmount(b.pending)}</span>
                  </>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <NewSettlementDialog>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Repeat />
                    {t("bal.convert")}
                  </Button>
                </NewSettlementDialog>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => toast(t("bal.withdraw"))}>
                  <ArrowDownToLine />
                  {t("bal.withdraw")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
