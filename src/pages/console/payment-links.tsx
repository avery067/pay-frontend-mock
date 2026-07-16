import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, QrCode, Copy, ExternalLink, Zap } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { type PayLink } from "@/mock/more";
import { useMock } from "@/mock/store";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CreateLinkDialog } from "@/components/pay/create-link-dialog";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/toast";

const HOST = "pay.meridian.example/l";

export default function PaymentLinksPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const { paymentLinks, collectLink } = useMock();
  const [selId, setSelId] = useState<string | null>(null);
  const sel: PayLink | null = selId ? paymentLinks.find((l) => l.id === selId) ?? null : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("links.title")}
        subtitle={t("links.subtitle")}
        actions={
          <CreateLinkDialog>
            <Button size="sm">
              <Plus />
              {t("links.create")}
            </Button>
          </CreateLinkDialog>
        }
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("links.name")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("links.amount")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("links.type")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("links.colCreated")}</th>
                  <th className="px-6 py-2.5 text-right font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {paymentLinks.map((l) => (
                  <tr key={l.id} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3">
                      <div className="font-medium">{l.name}</div>
                      <div className="tabular-nums text-xs text-muted-foreground">{HOST}/{l.slug}</div>
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{formatMoney(l.amount, l.currency)}</td>
                    <td className="px-3 py-3">
                      <Badge variant="default">{l.type === "once" ? t("links.typeOnce") : t("links.typeReuse")}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={l.status === "paid" ? "success" : "info"}>
                        {l.status === "paid" ? t("links.statusPaid") : t("links.statusActive")}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">{l.created || t("txn.now")}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {l.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-pos hover:text-pos"
                            onClick={() => { collectLink(l.id); toast(t("links.collected")); }}
                          >
                            <Zap className="size-3.5" />
                            {t("links.collect")}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => toast(t("links.copied"))} aria-label={t("links.copy")}>
                          <Copy />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelId(l.id)}>
                          {t("links.view")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSelId(null)}>
        <SheetContent>
          {sel && (
            <>
              <SheetHeader>
                <SheetTitle>{t("links.detailTitle")}</SheetTitle>
                <SheetDescription>{sel.name}</SheetDescription>
              </SheetHeader>
              <SheetBody className="space-y-6">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-border p-6">
                  <div className="grid size-32 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                    <QrCode className="size-16" />
                  </div>
                  <div className="tabular-nums text-3xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                    {formatMoney(sel.amount, sel.currency)}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-border p-3">
                  <span className="min-w-0 flex-1 truncate tabular-nums text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                    {HOST}/{sel.slug}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => toast(t("links.copied"))} aria-label={t("links.copy")}>
                    <Copy />
                  </Button>
                </div>

                <Link to={`/checkout?link=${sel.id}`} className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  <ExternalLink />
                  {t("links.preview")}
                </Link>

                {sel.status === "active" ? (
                  <Button className="w-full" onClick={() => { collectLink(sel.id); toast(t("links.collected")); }}>
                    <Zap />
                    {t("links.collect")}
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-2.5 text-sm font-medium text-success">
                    {t("links.statusPaid")}
                  </div>
                )}
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
