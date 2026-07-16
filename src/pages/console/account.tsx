import { Link } from "react-router-dom";
import { ShieldCheck, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const INFO = [
  { k: "acc.legalName", v: "示例商户 001" },
  { k: "acc.uscc", v: "91310000MA1FL… （示例）" },
  { k: "acc.legalRep", v: "张伟（示例）" },
  { k: "acc.country", v: "CN" },
  { k: "acc.entityType", v: "有限责任公司" },
];

export default function AccountPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={t("acc.title")}
        subtitle={t("acc.subtitle")}
        actions={
          <Button size="sm" variant="outline">
            <Pencil />
            {t("acc.edit")}
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-success/15 text-success">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <div className="text-sm text-muted-foreground">{t("acc.kyb")}</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{t("acc.kybVerified")}</span>
                <Badge variant="success">A</Badge>
              </div>
            </div>
          </div>
          <Link to="/onboarding" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            {t("acc.reverify")}
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("acc.business")}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border pt-0">
          {INFO.map((row) => (
            <div key={row.k} className="flex items-center justify-between py-3 text-sm">
              <span className="text-muted-foreground">{t(row.k)}</span>
              <span className="tabular-nums font-medium">{row.v}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
