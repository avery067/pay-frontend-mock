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
  authorized: { variant: "info", key: "status.authorized" },
  captured: { variant: "warning", key: "status.captured" },
  in_batch: { variant: "warning", key: "status.inBatch" },
  scheduled: { variant: "info", key: "status.pending" },
  settling: { variant: "warning", key: "status.settling" },
  paid_out: { variant: "info", key: "status.paidOut" },
  credited: { variant: "success", key: "status.credited" },
  voided: { variant: "info", key: "status.voided" },
  refunded: { variant: "info", key: "status.refunded" },
  disputed: { variant: "danger", key: "status.disputed" },
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n();
  const s = MAP[status] ?? MAP.pending;
  return <Badge variant={s.variant}>{t(s.key)}</Badge>;
}
