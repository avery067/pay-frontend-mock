import { useState } from "react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { disputes, type Dispute } from "@/mock/more";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisputeDrawer, DISPUTE_REASON, DISPUTE_STATUS } from "@/components/pay/dispute-drawer";

export default function DisputesPage() {
  const { t } = useI18n();
  const [sel, setSel] = useState<Dispute | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("disputes.title")} subtitle={t("disputes.subtitle")} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("disputes.colOrder")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("disputes.colReason")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                  <th className="px-6 py-2.5 text-right font-medium">{t("disputes.colDeadline")}</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSel(d)}
                    className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-3">
                      <div className="font-medium tabular-nums">{d.order}</div>
                      <div className="tabular-nums text-xs text-muted-foreground">{d.id}</div>
                    </td>
                    <td className="px-3 py-3">{t(DISPUTE_REASON[d.reason])}</td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(d.amount, d.currency)}</td>
                    <td className="px-3 py-3">
                      <Badge variant={DISPUTE_STATUS[d.status].variant}>{t(DISPUTE_STATUS[d.status].key)}</Badge>
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{d.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DisputeDrawer item={sel} onOpenChange={(o) => { if (!o) setSel(null); }} />
    </div>
  );
}
