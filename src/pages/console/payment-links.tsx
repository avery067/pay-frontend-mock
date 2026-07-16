import { Link2, Plus } from "lucide-react";
import { useI18n } from "@/i18n";
import { PageHeader } from "@/components/console/page-header";
import { EmptyState } from "@/components/console/empty-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export default function PaymentLinksPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("links.title")}
        subtitle={t("links.subtitle")}
        actions={
          <Button size="sm" onClick={() => toast(t("links.create"))}>
            <Plus />
            {t("links.create")}
          </Button>
        }
      />
      <EmptyState
        icon={<Link2 className="size-6" />}
        title={t("links.empty")}
        desc={t("links.emptyDesc")}
        action={
          <Button onClick={() => toast(t("links.create"))}>
            <Plus />
            {t("links.create")}
          </Button>
        }
      />
    </div>
  );
}
