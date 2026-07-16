import { useState } from "react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { acquiringTxns, payouts, type AcquiringTxn } from "@/mock/data";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/pay/status-badge";
import { AcquiringTxnDrawer } from "@/components/pay/acquiring-txn-drawer";

export default function PaymentsPage() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<AcquiringTxn | null>(null);

  const kpis = [
    { label: t("console.kpiVolume"), value: formatMoney(23150) },
    { label: t("acq.tabTxns"), value: "128" },
    { label: t("console.kpiSuccess"), value: "98.6%" },
    { label: t("console.kpiPending"), value: formatMoney(342120.5) },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("nav.payments")} subtitle={t("acq.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-5">
              <div className="text-sm text-muted-foreground">{k.label}</div>
              <div className="mt-2 tabular-nums text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                {k.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="txns">
        <TabsList>
          <TabsTrigger value="txns">{t("acq.tabTxns")}</TabsTrigger>
          <TabsTrigger value="payouts">{t("acq.tabPayouts")}</TabsTrigger>
        </TabsList>

        <TabsContent value="txns">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("acq.colOrder")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colMerchant")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colMethod")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("acq.colNet")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                      <th className="px-6 py-2.5 text-right font-medium">{t("console.colTime")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acquiringTxns.map((x) => (
                      <tr
                        key={x.order}
                        onClick={() => setSelected(x)}
                        className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50"
                      >
                        <td className="px-6 py-3 font-medium tabular-nums">{x.order}</td>
                        <td className="px-3 py-3">{x.merchant}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">{x.method}</td>
                        <td className="px-3 py-3 text-right tabular-nums">{formatMoney(x.gross)}</td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(x.net)}</td>
                        <td className="px-3 py-3"><StatusBadge status={x.status} /></td>
                        <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{x.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-6 py-2.5 text-left font-medium">{t("acq.payoutBatch")}</th>
                      <th className="px-3 py-2.5 text-left font-medium">{t("console.colTime")}</th>
                      <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                      <th className="px-6 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.batch} className="border-b border-border/60 last:border-0">
                        <td className="px-6 py-3 font-medium tabular-nums">{p.batch}</td>
                        <td className="px-3 py-3 tabular-nums text-muted-foreground">{p.date}</td>
                        <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(p.amount)}</td>
                        <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AcquiringTxnDrawer item={selected} onOpenChange={(o) => { if (!o) setSelected(null); }} />
    </div>
  );
}
