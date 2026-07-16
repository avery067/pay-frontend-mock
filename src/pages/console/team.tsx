import { UserPlus } from "lucide-react";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const members = [
  { name: "示例商户 001", email: "demo@example.com", role: "team.roleOwner" },
  { name: "Alex Chen（示例）", email: "alex@example.com", role: "team.roleAdmin" },
  { name: "Sam Lee（示例）", email: "sam@example.com", role: "team.roleView" },
];

export default function TeamPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("team.title")}
        subtitle={t("team.subtitle")}
        actions={
          <Button size="sm" onClick={() => toast(t("team.invite"))}>
            <UserPlus />
            {t("team.invite")}
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("team.colMember")}</th>
                  <th className="px-6 py-2.5 text-right font-medium">{t("team.colRole")}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.email} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                          {m.name.slice(0, 1)}
                        </span>
                        <div>
                          <div className="font-medium">{m.name}</div>
                          <div className="tabular-nums text-xs text-muted-foreground">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Badge variant="outline">{t(m.role)}</Badge>
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
