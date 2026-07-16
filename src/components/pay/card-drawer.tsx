import { useEffect, useState } from "react";
import { Snowflake, Sun, Zap } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatAmount, formatMoney } from "@/lib/format";
import { acquiringTxns } from "@/mock/data";
import { useMock } from "@/mock/store";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { CardVisual } from "./card-visual";
import { StatusBadge } from "./status-badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CardDrawer({
  cardId,
  onOpenChange,
}: {
  cardId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { cards, cardTxns, spendOnCard, setCardFrozen, terminateCard } = useMock();
  const card = cardId ? cards.find((c) => c.id === cardId) ?? null : null;

  const [online, setOnline] = useState(true);
  const [atm, setAtm] = useState(false);
  const [intl, setIntl] = useState(true);

  useEffect(() => {
    if (card) {
      setOnline(true);
      setAtm(false);
      setIntl(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  const frozen = card?.status === "frozen";
  const issuing = card?.status === "issuing";
  const pct = card ? Math.min(100, Math.round((card.spent / card.limit) * 100)) : 0;
  const txns = card
    ? [
        ...(cardTxns[card.id] || []),
        ...acquiringTxns.slice(0, 3).map((x) => ({ id: x.order, merchant: x.merchant, amount: x.gross })),
      ]
    : [];

  return (
    <Sheet open={!!cardId} onOpenChange={onOpenChange}>
      <SheetContent>
        {card && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{t("iss.detailTitle")}</SheetTitle>
                <StatusBadge status={card.status} />
              </div>
              <SheetDescription>{card.name}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <CardVisual name={card.name} brand={card.brand} last4={card.last4} currency={card.currency} frozen={frozen} className="max-w-xs" />

              <div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{t("iss.spent")}</span>
                  <span className="tabular-nums">
                    <span className="font-semibold">{formatMoney(card.spent, card.currency)}</span>
                    <span className="text-muted-foreground"> / {formatAmount(card.limit)}</span>
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {!issuing && !frozen && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    spendOnCard({ cardId: card.id, currency: card.currency, merchant: "AWS（示例）", amount: 128.4 });
                    toast(t("iss.charged"));
                  }}
                >
                  <Zap />
                  {t("iss.spend")}
                </Button>
              )}

              <div>
                <div className="mb-2 text-sm font-medium">{t("iss.controls")}</div>
                <div className="divide-y divide-border rounded-xl border border-border">
                  <ControlRow label={t("iss.onlinePay")} checked={online} onChange={setOnline} disabled={frozen || issuing} />
                  <ControlRow label={t("iss.atm")} checked={atm} onChange={setAtm} disabled={frozen || issuing} />
                  <ControlRow label={t("iss.intl")} checked={intl} onChange={setIntl} disabled={frozen || issuing} />
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">{t("iss.recent")}</div>
                <div className="space-y-1">
                  {txns.map((x) => (
                    <div key={x.id} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-muted/50">
                      <span className="truncate text-muted-foreground">{x.merchant}</span>
                      <span className="tabular-nums font-medium text-neg">− {formatMoney(x.amount, card.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SheetBody>

            {!issuing && (
              <SheetFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCardFrozen(card.id, !frozen);
                    toast(frozen ? t("iss.unfreeze") : t("iss.freeze"));
                  }}
                >
                  {frozen ? <Sun /> : <Snowflake />}
                  {frozen ? t("iss.unfreeze") : t("iss.freeze")}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">{t("iss.terminate")}</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>{t("iss.terminateTitle")}</DialogTitle>
                      <DialogDescription>{t("iss.terminateDesc")}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">{t("common.cancel")}</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            onOpenChange(false);
                            terminateCard(card.id);
                            toast(t("iss.terminate"));
                          }}
                        >
                          {t("iss.terminate")}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ControlRow({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
