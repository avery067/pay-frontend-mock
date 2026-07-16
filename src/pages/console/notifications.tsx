import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { useMock } from "@/mock/store";
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
  const { notifications, unreadCount, markNotifsRead } = useMock();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t("notif.title")}
        subtitle={t("notif.subtitle")}
        actions={
          <Button
            size="sm"
            variant="outline"
            disabled={unreadCount === 0}
            onClick={() => { markNotifsRead(); toast(t("notif.allRead")); }}
          >
            <Check />
            {t("notif.markAll")}
            {unreadCount > 0 ? ` · ${unreadCount}` : ""}
          </Button>
        }
      />
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {notifications.map((n) => (
            <div key={n.id} className={cn("flex items-start gap-3 px-6 py-4 transition", n.unread && "bg-muted/40")}>
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", DOT[n.type] ?? "bg-muted-foreground")} />
              <div className="min-w-0 flex-1 text-sm">
                {lang === "zh" ? n.zh : n.en}
                {n.unread && (
                  <span className="ml-2 rounded bg-brand/15 px-1.5 py-0.5 align-middle text-[10px] font-medium text-brand">
                    {t("notif.unread")}
                  </span>
                )}
              </div>
              <span className="tabular-nums text-xs text-muted-foreground">{n.live ? t("notif.now") : n.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
