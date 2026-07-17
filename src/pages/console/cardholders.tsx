import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatAmount } from "@/lib/format";
import { useMock } from "@/mock/store";
import { usePageLoading } from "@/hooks/use-page-loading";
import { LoadingSkeleton } from "@/components/console/loading-skeleton";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApprovalDrawer } from "@/components/pay/approval-drawer";
import { useToast } from "@/components/ui/toast";

export default function CardholdersPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { cardholders, cardRequests, cards, requestCard, approveCardRequest, rejectCardRequest } = useMock();
  const loading = usePageLoading();

  const [open, setOpen] = useState(false);
  const [holderId, setHolderId] = useState(cardholders[0]?.id ?? "");
  const [cardName, setCardName] = useState("");
  const [limit, setLimit] = useState(10000);
  const [openReq, setOpenReq] = useState<string | null>(null);

  if (loading) return <LoadingSkeleton rows={5} />;

  const pending = cardRequests.filter((r) => r.status === "pending_approval");
  const req = openReq ? cardRequests.find((r) => r.id === openReq) ?? null : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    requestCard({ holderId, cardName: cardName.trim() || t("ch.cardNamePh"), limit });
    setOpen(false);
    setCardName("");
    setLimit(10000);
    toast(t("ch.requested"));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("ch.title")}
        subtitle={t("ch.subtitle")}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><UserPlus />{t("ch.request")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("ch.reqTitle")}</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="chSel">{t("ch.holder")}</Label>
                  <select id="chSel" value={holderId} onChange={(e) => setHolderId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                    {cardholders.map((h) => (<option key={h.id} value={h.id}>{h.name} · {h.dept}</option>))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chName">{t("ch.cardName")}</Label>
                  <Input id="chName" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder={t("ch.cardNamePh")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="chLimit">{t("ch.limit")}</Label>
                  <Input id="chLimit" type="number" value={limit} onChange={(e) => setLimit(Math.max(0, Number(e.target.value) || 0))} className="tabular-nums" />
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">{t("common.cancel")}</Button></DialogClose>
                  <Button type="submit">{t("ch.request")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {pending.length > 0 && (
        <Card>
          <div className="border-b border-border px-6 py-2.5 text-xs font-medium text-muted-foreground">{t("ch.requests")}</div>
          <CardContent className="divide-y divide-border p-0">
            {pending.map((r) => (
              <button key={r.id} type="button" onClick={() => setOpenReq(r.id)} className="flex w-full items-center justify-between px-6 py-3 text-left text-sm transition hover:bg-muted/50">
                <span>
                  <span className="font-medium">{r.cardName}</span>
                  <span className="ml-2 text-muted-foreground">{r.holderName} · {formatAmount(r.limit)}/月</span>
                </span>
                <span className="flex items-center gap-1.5">
                  {r.approvals.map((a) => (<span key={a.role} className={"size-2 rounded-full " + (a.done ? "bg-success" : "bg-border")} title={a.role} />))}
                  <Badge variant="warning">{t("approval.pending")}</Badge>
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("ch.colHolder")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("ch.colDept")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("ch.cardCount")}</th>
                  <th className="px-6 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {cardholders.map((h) => (
                  <tr key={h.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{h.name.slice(0, 1)}</span>
                        <div>
                          <div className="font-medium">{h.name}</div>
                          <div className="tabular-nums text-xs text-muted-foreground">{h.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{h.dept}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{cards.filter((c) => c.name.includes(h.dept)).length || "—"}</td>
                    <td className="px-6 py-3"><Badge variant={h.status === "active" ? "success" : "info"}>{h.status === "active" ? t("ch.active") : t("ch.disabled")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {req && (
        <ApprovalDrawer
          open={!!openReq}
          onOpenChange={(o) => { if (!o) setOpenReq(null); }}
          title={t("ch.reqTitle")}
          refId={`${req.id} · ${req.holderName}`}
          statusVariant={req.status === "approved" ? "success" : req.status === "rejected" ? "danger" : "warning"}
          statusLabel={req.status === "approved" ? t("approval.stDone") : req.status === "rejected" ? t("approval.stRejected") : t("approval.pending")}
          lines={[
            { label: t("ch.cardName"), value: req.cardName },
            { label: t("ch.limit"), value: formatAmount(req.limit) },
          ]}
          approvals={req.approvals}
          canAct={req.status === "pending_approval"}
          onApprove={() => { approveCardRequest(req.id); toast(t("approval.approved")); }}
          onReject={() => { rejectCardRequest(req.id); setOpenReq(null); toast(t("approval.rejected")); }}
        />
      )}
    </div>
  );
}
