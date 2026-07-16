import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { notifications } from "@/mock/data";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const DOT: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
};

export default function NotificationsPage() {
  const { t, lang } = useI18n();
  const { toast } = useToast();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t("notif.title")}
        subtitle={t("notif.subtitle")}
        actions={
          <Button size="sm" variant="outline" onClick={() => toast(t("notif.allRead"))}>
            <Check />
            {t("notif.markAll")}
          </Button>
        }
      />
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-6 py-4">
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[n.type] ?? "bg-muted-foreground")} />
              <div className="min-w-0 flex-1 text-sm">{lang === "zh" ? n.zh : n.en}</div>
              <span className="tabular-nums text-xs text-muted-foreground">{n.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
