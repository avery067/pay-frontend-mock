import { Scale } from "lucide-react";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState } from "@/components/console/empty-state";

export default function DisputesPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("disputes.title")} subtitle={t("disputes.subtitle")} />
      <EmptyState icon={<Scale className="size-6" />} title={t("disputes.empty")} desc={t("disputes.emptyDesc")} />
    </div>
  );
}
