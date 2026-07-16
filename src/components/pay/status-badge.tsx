import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

type Variant = "success" | "warning" | "danger" | "info";

const MAP: Record<string, { variant: Variant; key: string }> = {
  settled: { variant: "success", key: "status.settled" },
  processing: { variant: "warning", key: "status.processing" },
  pending: { variant: "info", key: "status.pending" },
  failed: { variant: "danger", key: "status.failed" },
  active: { variant: "success", key: "iss.active" },
  frozen: { variant: "info", key: "iss.frozen" },
  issuing: { variant: "warning", key: "iss.issuing" },
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const s = MAP[status] ?? MAP.pending;
  return <Badge variant={s.variant}>{t(s.key)}</Badge>;
}
