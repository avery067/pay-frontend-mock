import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

export function PageHeader({
  title,
  subtitle,
  sample = true,
  actions,
}: {
  title: string;
  subtitle?: string;
  sample?: boolean;
  actions?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">{title}</h1>
          {sample && <Badge variant="info">{t("console.sample")}</Badge>}
        </div>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
