import { Download } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { exportCsv } from "@/lib/export-csv";
import { statements } from "@/mock/more";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StatementsPage() {
  const { t } = useI18n();
  const loading = usePageLoading();
  if (loading) return <LoadingSkeleton rows={4} />;
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("stmt.title")} subtitle={t("stmt.subtitle")} />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("stmt.period")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("stmt.txns")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("stmt.volume")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("stmt.fees")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("stmt.net")}</th>
                  <th className="px-6 py-2.5 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {statements.map((s) => (
                  <tr key={s.period} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3 font-medium tabular-nums">{s.period}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{s.txns.toLocaleString("en-US")}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatMoney(s.volume)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">− {formatMoney(s.fees)}</td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(s.net)}</td>
                    <td className="px-6 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => exportCsv(`statement-${s.period}.csv`, [s])}>
                        <Download />
                        {t("stmt.download")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
