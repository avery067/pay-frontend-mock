import { useState } from "react";
import { Scale } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { REASON_CODES } from "@/mock/more";
import { useMock } from "@/mock/store";
import { usePageLoading } from "@/hooks/use-page-loading";
import { PageHeader } from "@/components/console/page-header";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { EmptyState } from "@/components/console/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisputeDrawer, DISPUTE_REASON, DISPUTE_STATUS } from "@/components/pay/dispute-drawer";

const CATS = [
  { key: "all", label: "disputes.allCat" },
  { key: "duty", label: "disputes.catDuty" },
  { key: "not_received", label: "disputes.catNotReceived" },
  { key: "not_as_described", label: "disputes.catNotAsDescribed" },
  { key: "other", label: "disputes.catOther" },
];

export default function DisputesPage() {
  const { t } = useI18n();
  const { disputes } = useMock();
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [cat, setCat] = useState("all");
  const loading = usePageLoading();

  if (loading) return <LoadingSkeleton rows={4} />;

  const rows = disputes.filter((d) => cat === "all" || REASON_CODES[d.reason]?.category === cat);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("disputes.title")} subtitle={t("disputes.subtitle")} />

      <Tabs value={cat} onValueChange={setCat}>
        <TabsList>
          {CATS.map((c) => (
            <TabsTrigger key={c.key} value={c.key}>{t(c.label)}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {rows.length === 0 ? (
        <EmptyState icon={<Scale className="size-6" />} title={t("disputes.empty")} desc={t("disputes.emptyDesc")} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-6 py-2.5 text-left font-medium">{t("disputes.colOrder")}</th>
                    <th className="px-3 py-2.5 text-left font-medium">{t("disputes.colReason")}</th>
                    <th className="px-3 py-2.5 text-left font-medium">{t("disputes.reasonCode")}</th>
                    <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                    <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                    <th className="px-6 py-2.5 text-right font-medium">{t("disputes.colDeadline")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.id} onClick={() => setDisputeId(d.id)} className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50">
                      <td className="px-6 py-3">
                        <div className="font-medium tabular-nums">{d.order}</div>
                        <div className="tabular-nums text-xs text-muted-foreground">{d.id}</div>
                      </td>
                      <td className="px-3 py-3">{t(DISPUTE_REASON[d.reason])}</td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">{REASON_CODES[d.reason]?.network} {REASON_CODES[d.reason]?.code}</Badge>
                      </td>
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
      )}

      <DisputeDrawer disputeId={disputeId} onOpenChange={(o) => { if (!o) setDisputeId(null); }} />
    </div>
  );
}
