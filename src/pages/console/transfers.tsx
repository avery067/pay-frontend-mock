import { Send } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { useMock } from "@/mock/store";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/pay/status-badge";
import { NewTransferDialog } from "@/components/pay/new-transfer-dialog";

export default function TransfersPage() {
  const { t } = useI18n();
  const { ledger } = useMock();
  const rows = ledger.filter((x) => x.type === "payout");
  const loading = usePageLoading();
  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("tf.title")}
        subtitle={t("tf.subtitle")}
        actions={
          <NewTransferDialog>
            <Button size="sm">
              <Send />
              {t("tf.new")}
            </Button>
          </NewTransferDialog>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("txn.colDesc")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                  <th className="px-6 py-2.5 text-right font-medium">{t("txn.colDate")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3 font-medium">
                      {x.desc}
                      <div className="tabular-nums text-xs text-muted-foreground">{x.id}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums text-neg">− {formatMoney(x.amount, x.currency)}</td>
                    <td className="px-3 py-3"><StatusBadge status={x.status} /></td>
                    <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{x.live ? t("txn.now") : x.date}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">{t("common.empty")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
