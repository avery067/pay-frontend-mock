import { useState } from "react";
import { Copy, Eye, EyeOff, Webhook } from "lucide-react";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function DevelopersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [reveal, setReveal] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("dev.title")} subtitle={t("dev.subtitle")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("dev.apiKeys")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <KeyRow label={t("dev.publicKey")} value="pk_test_51Meridian_Xa93kQ（示例）" onCopy={() => toast(t("common.copied"))} />
          <div className="flex items-center gap-2 rounded-xl border border-border p-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground">{t("dev.secretKey")}</div>
              <div className="truncate tabular-nums text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                {reveal ? "sk_test_51Meridian_9fJ2laQ（示例）" : "sk_test_••••••••••••••••"}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setReveal((r) => !r)} aria-label={t("dev.reveal")}>
              {reveal ? <EyeOff /> : <Eye />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => toast(t("common.copied"))} aria-label={t("common.copy")}>
              <Copy />
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
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-secondary text-secondary-foreground">
                <Webhook className="size-4" />
              </span>
              <span className="tabular-nums text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                https://api.example.com/hooks/meridian
              </span>
            </div>
            <Badge variant="success">active</Badge>
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
