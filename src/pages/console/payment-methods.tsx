import { useI18n } from "@/i18n";
import { useMock } from "@/mock/store";
import { type MethodKind } from "@/mock/more";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

const KIND_ORDER: MethodKind[] = ["card", "wallet", "apm", "bnpl", "cash"];
const KIND_KEY: Record<MethodKind, string> = {
  card: "pm.kindCard",
  wallet: "pm.kindWallet",
  apm: "pm.kindApm",
  bnpl: "pm.kindBnpl",
  cash: "pm.kindCash",
};

export default function PaymentMethodsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { paymentMethods, toggleMethod } = useMock();
  const loading = usePageLoading();
  if (loading) return <LoadingSkeleton cards={6} />;

  const enabledCount = paymentMethods.filter((m) => m.enabled).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("pm.title")}
        subtitle={t("pm.subtitle")}
        actions={<Badge variant="success">{t("pm.enabledCount")} {enabledCount}</Badge>}
      />

      {KIND_ORDER.map((kind) => {
        const items = paymentMethods.filter((m) => m.kind === kind);
        if (items.length === 0) return null;
        return (
          <div key={kind} className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground">{t(KIND_KEY[kind])}</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((m) => (
                <Card key={m.code} className={m.enabled ? "" : "opacity-70"}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{m.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{t("pm.region")}: {m.regions.join(" · ")}</div>
                      </div>
                      <Switch checked={m.enabled} onCheckedChange={() => { toggleMethod(m.code); toast(t("pm.toggled")); }} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {m.currencies.map((c) => (
                        <span key={c} className="rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">{c}</span>
                      ))}
                      <span className={"rounded px-1.5 py-0.5 text-[10px] " + (m.refundable ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                        {m.refundable ? t("pm.refundable") : t("pm.nonRefundable")}
                      </span>
                      {m.async && <span className="rounded bg-info/10 px-1.5 py-0.5 text-[10px] text-info">{t("pm.async")}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
