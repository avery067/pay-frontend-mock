import { useState } from "react";
import { Copy, Eye, EyeOff, RefreshCw, Send, Webhook } from "lucide-react";
import { useI18n } from "@/i18n";
import { useMock } from "@/mock/store";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";

// 台账事件 → 类 Stripe webhook 事件名
const EVENT_NAME: Record<string, string> = {
  payment: "payment.succeeded",
  payout: "payout.paid",
  convert: "fx.settlement.completed",
  card: "issuing.authorization.created",
  refund: "refund.created",
};

function randomKey() {
  // 应用运行期用 Math.random 生成示例后缀（仅工作流脚本禁用）
  return "sk_test_51Meridian_" + Math.random().toString(36).slice(2, 9);
}

export default function DevelopersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { ledger } = useMock();
  const [reveal, setReveal] = useState(false);
  const [secret, setSecret] = useState("sk_test_51Meridian_9fJ2laQ");
  const [live, setLive] = useState(true);

  const events = ledger.slice(0, 12).map((x) => ({
    id: x.id,
    event: EVENT_NAME[x.type] ?? "event.updated",
    status: x.status === "failed" ? 402 : x.status === "processing" || x.status === "pending" ? 202 : 200,
    live: x.live,
    date: x.date,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("dev.title")}
        subtitle={t("dev.subtitle")}
        actions={<Badge variant="warning">{t("dev.testMode")}</Badge>}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t("dev.apiKeys")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <KeyRow label={t("dev.publicKey")} value="pk_test_51Meridian_Xa93kQ" onCopy={() => toast(t("common.copied"))} />
          <div className="flex items-center gap-2 rounded-xl border border-border p-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground">{t("dev.secretKey")}</div>
              <div className="truncate tabular-nums text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                {reveal ? secret : "sk_test_••••••••••••••••"}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setReveal((r) => !r)} aria-label={t("dev.reveal")}>
              {reveal ? <EyeOff /> : <Eye />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => toast(t("common.copied"))} aria-label={t("common.copy")}>
              <Copy />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSecret(randomKey()); setReveal(true); toast(t("dev.regenerated")); }}
            >
              <RefreshCw />
              {t("dev.regenerate")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dev.webhooks")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <Webhook className="size-4" />
              </span>
              <span className="truncate tabular-nums text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                https://api.example.com/hooks/meridian
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Badge variant={live ? "success" : "warning"}>{live ? t("dev.listening") : t("dev.paused")}</Badge>
              <Switch checked={live} onCheckedChange={setLive} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>{t("dev.events")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t("dev.eventsDesc")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast(t("dev.sent"))}>
            <Send />
            {t("dev.testEvent")}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("dev.colEvent")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("dev.colObject")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("dev.colStatus")}</th>
                  <th className="px-6 py-2.5 text-right font-medium">{t("txn.colDate")}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3">
                      <span className="tabular-nums" style={{ fontFamily: "var(--font-mono)" }}>{e.event}</span>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">{e.id}</td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums " +
                          (e.status === 200 ? "bg-success/15 text-success" : e.status === 202 ? "bg-info/15 text-info" : "bg-danger/15 text-danger")
                        }
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{e.live ? t("txn.now") : e.date}</td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">{t("dev.empty")}</td>
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

function KeyRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border p-3">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate tabular-nums text-sm" style={{ fontFamily: "var(--font-mono)" }}>
          {value}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onCopy} aria-label="copy">
        <Copy />
      </Button>
    </div>
  );
}
