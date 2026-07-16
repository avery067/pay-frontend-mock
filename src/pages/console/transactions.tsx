import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/format";
import { ledger, type LedgerTxn } from "@/mock/more";
import { PageHeader } from "@/components/console/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/pay/status-badge";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const TYPES = ["payment", "payout", "convert", "card", "refund"] as const;
const TYPE_KEY: Record<string, string> = {
  payment: "txn.tPayment",
  payout: "txn.tPayout",
  convert: "txn.tConvert",
  card: "txn.tCard",
  refund: "txn.tRefund",
};

export default function TransactionsPage() {
  const { t } = useI18n();
  const [type, setType] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<LedgerTxn | null>(null);

  const rows = ledger.filter(
    (x) =>
      (type === "all" || x.type === type) &&
      (q === "" ||
        x.desc.toLowerCase().includes(q.toLowerCase()) ||
        x.id.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t("txn.title")} subtitle={t("txn.subtitle")} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={type} onValueChange={setType}>
          <TabsList>
            <TabsTrigger value="all">{t("txn.typeAll")}</TabsTrigger>
            {TYPES.map((tp) => (
              <TabsTrigger key={tp} value={tp}>
                {t(TYPE_KEY[tp])}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("txn.searchPh")}
            className="h-9 w-full rounded-full border border-border bg-muted/50 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 text-left font-medium">{t("txn.colType")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("txn.colDesc")}</th>
                  <th className="px-3 py-2.5 text-right font-medium">{t("console.colAmount")}</th>
                  <th className="px-3 py-2.5 text-left font-medium">{t("console.colStatus")}</th>
                  <th className="px-6 py-2.5 text-right font-medium">{t("txn.colDate")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr
                    key={x.id}
                    onClick={() => setSel(x)}
                    className="cursor-pointer border-b border-border/60 transition last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-3">
                      <Badge variant="outline">{t(TYPE_KEY[x.type])}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{x.desc}</div>
                      <div className="tabular-nums text-xs text-muted-foreground">{x.id}</div>
                    </td>
                    <td className={cn("px-3 py-3 text-right font-medium tabular-nums", x.dir === "in" ? "text-pos" : "text-neg")}>
                      {x.dir === "in" ? "+ " : "− "}
                      {formatMoney(x.amount, x.currency)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={x.status} />
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">{x.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent>
          {sel && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <SheetTitle>{t("txn.detailTitle")}</SheetTitle>
                  <StatusBadge status={sel.status} />
                </div>
                <SheetDescription className="tabular-nums">{sel.id}</SheetDescription>
              </SheetHeader>
              <SheetBody className="space-y-4">
                <div className="rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground">{sel.desc}</div>
                  <div className={cn("mt-1 tabular-nums text-2xl font-semibold", sel.dir === "in" ? "text-pos" : "text-neg")}>
                    {sel.dir === "in" ? "+ " : "− "}
                    {formatMoney(sel.amount, sel.currency)}
                  </div>
                </div>
                <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("txn.colType")}</span>
                    <Badge variant="outline">{t(TYPE_KEY[sel.type])}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("txn.colDate")}</span>
                    <span className="tabular-nums">{sel.date}</span>
                  </div>
                </div>
              </SheetBody>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
