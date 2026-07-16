import { useEffect, useState } from "react";
import { Snowflake, Sun } from "lucide-react";
import { useI18n } from "@/i18n";
import { formatAmount, formatMoney } from "@/lib/format";
import type { Card as CardType } from "@/mock/data";
import { acquiringTxns } from "@/mock/data";
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
  item,
  onOpenChange,
}: {
  item: CardType | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [frozen, setFrozen] = useState(false);
  const [online, setOnline] = useState(true);
  const [atm, setAtm] = useState(false);
  const [intl, setIntl] = useState(true);

  useEffect(() => {
    if (item) {
      setFrozen(item.status === "frozen");
      setOnline(true);
      setAtm(false);
      setIntl(true);
    }
  }, [item]);

  const pct = item ? Math.min(100, Math.round((item.spent / item.limit) * 100)) : 0;

  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent>
        {item && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2">
                <SheetTitle>{t("iss.detailTitle")}</SheetTitle>
              </div>
              <SheetDescription>{item.name}</SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <CardVisual
                name={item.name}
                brand={item.brand}
                last4={item.last4}
                currency={item.currency}
                frozen={frozen}
                className="max-w-xs"
              />

              <div>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{t("iss.spent")}</span>
                  <span className="tabular-nums">
                    <span className="font-semibold">{formatMoney(item.spent, item.currency)}</span>
                    <span className="text-muted-foreground"> / {formatAmount(item.limit)}</span>
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">{t("iss.controls")}</div>
                <div className="divide-y divide-border rounded-xl border border-border">
                  <ControlRow label={t("iss.onlinePay")} checked={online} onChange={setOnline} disabled={frozen} />
                  <ControlRow label={t("iss.atm")} checked={atm} onChange={setAtm} disabled={frozen} />
                  <ControlRow label={t("iss.intl")} checked={intl} onChange={setIntl} disabled={frozen} />
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium">{t("iss.recent")}</div>
                <div className="space-y-1">
                  {acquiringTxns.slice(0, 3).map((x) => (
                    <div key={x.order} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-muted/50">
                      <span className="truncate text-muted-foreground">{x.merchant}</span>
                      <span className="tabular-nums font-medium text-neg">− {formatMoney(x.gross, item.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SheetBody>

            <SheetFooter className="flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFrozen((f) => !f);
                  toast(frozen ? t("iss.unfreeze") : t("iss.freeze"));
                }}
              >
                {frozen ? <Sun /> : <Snowflake />}
                {frozen ? t("iss.unfreeze") : t("iss.freeze")}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    {t("iss.terminate")}
                  </Button>
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
