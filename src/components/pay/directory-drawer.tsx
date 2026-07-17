import { useState } from "react";
import { AlertTriangle, Check, Clock, Shield, ShieldCheck, TrendingUp } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { useMock, type DirectoryStatus } from "@/mock/store";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

/** 企业名录生命周期展示顺序（结汇 P2-F9）：备案中 → 正常 → 关注 → 货物贸易 A 类 */
export const DIRECTORY_ORDER: DirectoryStatus[] = ["filing", "normal", "watch", "classA"];
export const DIRECTORY_META: Record<
  DirectoryStatus,
  { labelKey: string; descKey: string; icon: typeof ShieldCheck; tone: string; badge: "default" | "success" | "warning" | "info" }
> = {
  filing: { labelKey: "dir.stFiling", descKey: "dir.stFilingDesc", icon: Clock, tone: "text-muted-foreground", badge: "default" },
  normal: { labelKey: "dir.stNormal", descKey: "dir.stNormalDesc", icon: Shield, tone: "text-info", badge: "info" },
  watch: { labelKey: "dir.stWatch", descKey: "dir.stWatchDesc", icon: AlertTriangle, tone: "text-warning", badge: "warning" },
  classA: { labelKey: "dir.stClassA", descKey: "dir.stClassADesc", icon: ShieldCheck, tone: "text-success", badge: "success" },
};

export function DirectoryDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { directoryStatus, setDirectoryStatus, collectionLimit, upgradeCollectionTier } = useMock();
  const [upgradeStep, setUpgradeStep] = useState(0); // 0 空闲，1-3 演示中的加验步骤
  const meta = DIRECTORY_META[directoryStatus];
  const idx = DIRECTORY_ORDER.indexOf(directoryStatus);
  const upgrading = upgradeStep > 0;

  const runUpgrade = () => {
    if (collectionLimit.tier !== "basic" || upgrading) return;
    setUpgradeStep(1);
    window.setTimeout(() => setUpgradeStep(2), 650);
    window.setTimeout(() => setUpgradeStep(3), 1300);
    window.setTimeout(() => {
      upgradeCollectionTier();
      setUpgradeStep(0);
      toast(t("dir.upgradeDone"));
    }, 1950);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>{t("dir.title")}</SheetTitle>
            <Badge variant={meta.badge}>{t(meta.labelKey)}</Badge>
          </div>
          <SheetDescription>{t("dir.subtitle")}</SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-6">
          <div>
            <div className="mb-2 text-sm font-medium">{t("dir.lifecycleTitle")}</div>
            <div className="grid grid-cols-4 gap-1.5">
              {DIRECTORY_ORDER.map((s, i) => {
                const m = DIRECTORY_META[s];
                const Icon = m.icon;
                const current = s === directoryStatus;
                const passed = i < idx;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDirectoryStatus(s)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition",
                      current ? "border-primary bg-primary/5" : passed ? "border-border bg-muted/40" : "border-border hover:bg-muted/40",
                    )}
                  >
                    <Icon className={cn("size-4", current ? m.tone : "text-muted-foreground")} />
                    <span className={cn("text-[11px] font-medium leading-tight", current ? "text-foreground" : "text-muted-foreground")}>
                      {t(m.labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t(meta.descKey)}</p>
            {directoryStatus === "watch" && (
              <p className="mt-2 flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-warning">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {t("dir.watchWarn")}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">{t("dir.demoSwitchHint")}</p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{t("dir.tierTitle")}</span>
              <Badge variant={collectionLimit.tier === "verified" ? "success" : "default"}>
                {t(collectionLimit.tier === "verified" ? "dir.tierVerified" : "dir.tierBasic")}
              </Badge>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("dir.annualCap")}</span>
                <span className="tabular-nums text-lg font-semibold">{formatMoney(collectionLimit.capUsd)}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t(collectionLimit.tier === "verified" ? "dir.tierVerifiedDesc" : "dir.tierBasicDesc")}
              </p>
            </div>

            {collectionLimit.tier === "basic" && (
              <div className="mt-3 space-y-2">
                {upgrading && (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="flex flex-1 items-center gap-1.5">
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                            upgradeStep > n
                              ? "bg-success text-success-foreground"
                              : upgradeStep === n
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {upgradeStep > n ? <Check className="size-3" /> : n}
                        </span>
                        <span className="hidden truncate text-[11px] text-muted-foreground sm:block">{t(`dir.upgradeStep${n}`)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Button size="sm" className="w-full" disabled={upgrading} onClick={runUpgrade}>
                  <TrendingUp className="size-3.5" />
                  {upgrading ? t("dir.upgrading") : t("dir.upgradeTier")}
                </Button>
              </div>
            )}
          </div>
        </SheetBody>

        <SheetFooter>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
