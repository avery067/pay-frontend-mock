import { useEffect, useRef, useState } from "react";
import { Snowflake, Sun, Zap, Wallet, RefreshCw, Timer } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { formatAmount, formatMoney } from "@/lib/format";
import { MCC_CATEGORIES, type CardChannel } from "@/mock/data";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

/** JIT 中继实时授权：本地倒计时上限（组件内计时器，不影响 store 全局 2600ms tick） */
const JIT_TIMEOUT_MS = 2000;

const CHANNELS: { key: CardChannel; label: string }[] = [
  { key: "online", label: "iss.chOnline" },
  { key: "pos", label: "iss.chPos" },
  { key: "atm", label: "iss.chAtm" },
  { key: "crossBorder", label: "iss.chCross" },
];

export function CardDrawer({
  cardId,
  onOpenChange,
}: {
  cardId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const {
    cards,
    cardTxns,
    spendOnCard,
    updateCardControls,
    topupCard,
    setAutoTopup,
    activateCard,
    setCardFrozen,
    terminateCard,
    resolveAuthorization,
    provisionWallet,
    verifyToken,
    removeToken,
    rotateCardNumber,
  } = useMock();
  const card = cardId ? cards.find((c) => c.id === cardId) ?? null : null;

  const [amount, setAmount] = useState(128.4);
  const [mcc, setMcc] = useState(MCC_CATEGORIES[0].code);
  const [channel, setChannel] = useState<CardChannel>("online");
  const [jit, setJit] = useState<{
    txnId: string;
    amount: number;
    merchant: string;
    startedAt: number;
    remainingMs: number;
    result: { decision: "approve" | "decline"; decidedBy: "merchant" | "fallback"; decisionMs: number } | null;
  } | null>(null);
  const [walletCodes, setWalletCodes] = useState<Record<string, string>>({});
  const jitTimerRef = useRef<{ tick?: number; timeout?: number }>({});

  useEffect(() => {
    if (card) {
      setAmount(128.4);
      setMcc(card.controls.mccList[0] ?? MCC_CATEGORIES[0].code);
      setChannel("online");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId]);

  // 组件内本地计时器清理：与 store 的全局 2600ms tick 完全独立，卸载时清掉即可
  useEffect(() => {
    return () => {
      if (jitTimerRef.current.tick) window.clearInterval(jitTimerRef.current.tick);
      if (jitTimerRef.current.timeout) window.clearTimeout(jitTimerRef.current.timeout);
    };
  }, []);

  if (!card) {
    return (
      <Sheet open={!!cardId} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  const c = card.controls;
  const frozen = card.status === "frozen";
  const issuing = card.status === "issuing";
  const inactive = card.status === "inactive";
  const editable = !issuing && !inactive;
  const FULFILL = ["personalization", "manufacturing", "shipped"] as const;
  const FULFILL_KEY: Record<string, string> = { personalization: "iss.fPersonalization", manufacturing: "iss.fManufacturing", shipped: "iss.fShipped" };
  const txns = cardTxns[card.id] || [];
  const mccName = (code: string) => {
    const m = MCC_CATEGORIES.find((x) => x.code === code);
    return m ? (lang === "zh" ? m.zh : m.en) : code;
  };

  const clearJitTimer = () => {
    if (jitTimerRef.current.tick) window.clearInterval(jitTimerRef.current.tick);
    if (jitTimerRef.current.timeout) window.clearTimeout(jitTimerRef.current.timeout);
    jitTimerRef.current = {};
  };

  // JIT 决策落地：批准/拒绝/超时兜底统一走这里，仅更新组件本地倒计时状态，
  // 交易层面的清算/拒付委托给 store 的 resolveAuthorization
  const decideJit = (decision: "approve" | "decline", decidedBy: "merchant" | "fallback") => {
    setJit((prev) => {
      if (!prev || prev.result) return prev;
      const decisionMs = Date.now() - prev.startedAt;
      clearJitTimer();
      resolveAuthorization(card.id, prev.txnId, decision, { decisionMs, decidedBy });
      return { ...prev, remainingMs: 0, result: { decision, decidedBy, decisionMs } };
    });
  };

  const openJit = (txnId: string, jitAmount: number, merchant: string) => {
    clearJitTimer();
    const startedAt = Date.now();
    setJit({ txnId, amount: jitAmount, merchant, startedAt, remainingMs: JIT_TIMEOUT_MS, result: null });
    jitTimerRef.current.tick = window.setInterval(() => {
      setJit((prev) => (prev && !prev.result ? { ...prev, remainingMs: Math.max(0, JIT_TIMEOUT_MS - (Date.now() - prev.startedAt)) } : prev));
    }, 50);
    jitTimerRef.current.timeout = window.setTimeout(() => {
      decideJit(card.jitFallback ?? "decline", "fallback");
    }, JIT_TIMEOUT_MS);
  };

  const runSpend = () => {
    const merchant = `${mccName(mcc)}（示例）`;
    const res = spendOnCard({ cardId: card.id, currency: card.currency, merchant, amount, mcc, channel });
    if (res.ok && card.jitEnabled && res.txnId) {
      openJit(res.txnId, amount, merchant);
      return;
    }
    if (res.ok) toast(t("iss.approveToast"));
    else toast(`${t("iss.declineToast")}：${t("iss.r" + (res.reason ?? "").charAt(0).toUpperCase() + (res.reason ?? "").slice(1))}`);
  };

  const toggleMcc = (code: string) => {
    const has = c.mccList.includes(code);
    updateCardControls(card.id, { mccList: has ? c.mccList.filter((x) => x !== code) : [...c.mccList, code] });
  };

  const addWallet = (wallet: "apple" | "google") => {
    provisionWallet(card.id, wallet);
    toast(t("iss.walletAdding"));
  };

  const setWalletCode = (tokenId: string, v: string) => {
    setWalletCodes((prev) => ({ ...prev, [tokenId]: v.replace(/\D/g, "").slice(0, 6) }));
  };

  const runVerify = (tokenId: string) => {
    const code = walletCodes[tokenId] || "";
    if (code.length !== 6) {
      toast(t("iss.walletCodeHint"));
      return;
    }
    verifyToken(card.id, tokenId);
    setWalletCodes((prev) => ({ ...prev, [tokenId]: "" }));
    toast(t("iss.walletVerified"));
  };

  return (
    <>
    <Sheet open={!!cardId} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>{t("iss.detailTitle")}</SheetTitle>
            <StatusBadge status={card.status} />
          </div>
          <SheetDescription>{card.name}</SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-6">
          <CardVisual name={card.name} brand={card.brand} last4={card.last4} currency={card.currency} frozen={frozen} type={card.type} className="max-w-xs" />

          {/* 绑定商户 / 一次性用后即焚 / 供应商卡号轮换（发卡 P2-F10） */}
          {(card.boundMerchant || card.type === "single_use" || card.type === "vendor") && (
            <div className="space-y-2 rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("iss.type")}</span>
                <div className="flex items-center gap-1.5">
                  {card.type === "single_use" && <Badge variant="outline">{t("iss.singleUse")}</Badge>}
                  {card.type === "vendor" && <Badge variant="outline">{t("iss.vendorCard")}</Badge>}
                </div>
              </div>
              {card.boundMerchant && (
                <div className="text-xs text-muted-foreground">{t("iss.boundMerchant")}：{card.boundMerchant}</div>
              )}
              {card.type === "single_use" && card.consumedAt && (
                <div className="text-xs font-medium text-warning">{t("iss.consumedLabel")} · {card.consumedAt}</div>
              )}
              {card.type === "vendor" && editable && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => { rotateCardNumber(card.id); toast(t("iss.rotateDone")); }}
                >
                  <RefreshCw className="size-3.5" />
                  {t("iss.rotateNumber")}
                </Button>
              )}
            </div>
          )}

          {/* 实体卡制卡履约 + 激活 */}
          {card.fulfillment && (
            <div className="space-y-3 rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("iss.fulfillment")}</span>
                <span className="text-xs text-muted-foreground">{t("iss.eta")} {card.fulfillment.eta}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {FULFILL.map((s, i) => {
                  const idx = inactive ? FULFILL.length : FULFILL.indexOf(card.fulfillment!.stage);
                  return (
                    <div key={s} className="flex flex-1 flex-col items-center gap-1">
                      <div className={cn("h-1.5 w-full rounded-full", i <= idx ? "bg-brand" : "bg-secondary")} />
                      <span className={cn("text-[10px]", i <= idx ? "text-foreground" : "text-muted-foreground")}>{t(FULFILL_KEY[s])}</span>
                    </div>
                  );
                })}
              </div>
              {inactive && (
                <>
                  <p className="text-xs text-muted-foreground">{t("iss.activateHint")}</p>
                  <Button className="w-full" onClick={() => { activateCard(card.id); toast(t("iss.activated")); }}>{t("iss.activate")}</Button>
                </>
              )}
            </div>
          )}

          {/* 限额与用量 */}
          <div className="space-y-3">
            <div className="text-sm font-medium">{t("iss.limits")}</div>
            <UsageBar label={t("iss.monthly")} used={card.spent} cap={c.monthlyLimit} currency={card.currency} />
            <UsageBar label={t("iss.daily")} used={card.spentToday} cap={c.dailyLimit} currency={card.currency} />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Meta label={t("iss.perTxn")} value={formatMoney(c.perTxnLimit, card.currency)} />
              <Meta label={t("iss.velocity")} value={`${card.monthCount} / ${c.velocity.maxCount} ${t("iss.velocityUnit")}`} />
            </div>
          </div>

          {/* 卡资金账户 + 自动充值 */}
          <div className="space-y-3 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("iss.funding")}</span>
              {editable && (
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => { topupCard(card.id, card.autoTopup.target); toast(t("iss.topupDone")); }}>
                  {t("iss.topup")}
                </Button>
              )}
            </div>
            <div>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">{t("iss.cardBalance")}</span>
                <span className="tabular-nums font-semibold">{formatMoney(card.cardBalance, card.currency)}</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-500", card.cardBalance < card.autoTopup.threshold ? "bg-warning" : "bg-brand")}
                  style={{ width: `${Math.min(100, Math.round((card.cardBalance / Math.max(1, card.autoTopup.target)) * 100))}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted-foreground tabular-nums">
                {t("iss.threshold")} {formatAmount(card.autoTopup.threshold)} · {t("iss.autoTopup")} → {formatAmount(card.autoTopup.target)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">{t("iss.autoTopup")}</div>
                <div className="text-xs text-muted-foreground">{t("iss.autoTopupDesc")}</div>
              </div>
              <Switch checked={card.autoTopup.on} onCheckedChange={(v) => setAutoTopup(card.id, { on: v })} disabled={!editable} />
            </div>
          </div>

          {/* 类目策略 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{t("iss.mccPolicy")}</span>
              <div className="flex rounded-lg border border-border p-0.5 text-xs">
                {(["allow", "deny"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    disabled={!editable}
                    onClick={() => updateCardControls(card.id, { mccMode: m })}
                    className={cn("rounded-md px-2 py-1 font-medium transition", c.mccMode === m ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground")}
                  >
                    {m === "allow" ? t("iss.mccAllow") : t("iss.mccDeny")}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MCC_CATEGORIES.map((m) => {
                const on = c.mccList.includes(m.code);
                return (
                  <button
                    key={m.code}
                    type="button"
                    disabled={!editable}
                    onClick={() => toggleMcc(m.code)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                      on ? "border-brand bg-brand/10 text-foreground" : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {lang === "zh" ? m.zh : m.en}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 交易渠道 */}
          <div>
            <div className="mb-2 text-sm font-medium">{t("iss.channels")}</div>
            <div className="divide-y divide-border rounded-xl border border-border">
              {CHANNELS.map((ch) => (
                <div key={ch.key} className="flex items-center justify-between px-3 py-3">
                  <span className="text-sm">{t(ch.label)}</span>
                  <Switch
                    checked={c.channels[ch.key]}
                    onCheckedChange={(v) => updateCardControls(card.id, { channels: { ...c.channels, [ch.key]: v } })}
                    disabled={!editable}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 数字钱包绑定：Apple Pay / Google Pay + 网络令牌（发卡 P2-F7） */}
          <div className="space-y-3 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t("iss.walletTitle")}</span>
              <Wallet className="size-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => addWallet("apple")} disabled={!editable}>
                {t("iss.walletAddApple")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => addWallet("google")} disabled={!editable}>
                {t("iss.walletAddGoogle")}
              </Button>
            </div>
            {!!card.tokens?.length && (
              <div className="space-y-2">
                {card.tokens.map((tk) => (
                  <div key={tk.id} className="space-y-2 rounded-lg bg-muted/40 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{tk.wallet === "apple" ? "Apple Pay" : "Google Pay"}</span>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={tk.status} />
                        <button
                          type="button"
                          onClick={() => { removeToken(card.id, tk.id); toast(t("iss.walletRemoved")); }}
                          className="text-xs text-muted-foreground underline-offset-2 hover:text-danger hover:underline"
                        >
                          {t("iss.walletRemove")}
                        </button>
                      </div>
                    </div>
                    {tk.needs2fa && tk.status === "inactive" && (
                      <div className="space-y-1.5">
                        <div className="text-xs text-warning">{t("iss.walletNeeds2fa")}</div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={walletCodes[tk.id] || ""}
                            onChange={(e) => setWalletCode(tk.id, e.target.value)}
                            placeholder={t("iss.walletVerifyPh")}
                            inputMode="numeric"
                            className="h-8 tabular-nums"
                          />
                          <Button size="sm" className="h-8 shrink-0 px-2.5 text-xs" onClick={() => runVerify(tk.id)}>
                            {t("iss.walletVerify")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 模拟授权（消费管控引擎生效） */}
          {editable && (
            <div className="space-y-3 rounded-xl border border-border p-3">
              <div className="text-sm font-medium">{t("iss.simSpend")}</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t("iss.simAmount")}</span>
                  <Input type="number" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))} className="h-9 tabular-nums" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t("iss.simCategory")}</span>
                  <select value={mcc} onChange={(e) => setMcc(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                    {MCC_CATEGORIES.map((m) => (
                      <option key={m.code} value={m.code}>{lang === "zh" ? m.zh : m.en}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">{t("iss.simChannel")}</span>
                <select value={channel} onChange={(e) => setChannel(e.target.value as CardChannel)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                  {CHANNELS.map((ch) => (
                    <option key={ch.key} value={ch.key}>{t(ch.label)}</option>
                  ))}
                </select>
              </label>
              {card.jitEnabled && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Timer className="size-3.5" />
                  {t("iss.jitEnabledHint")} · {(JIT_TIMEOUT_MS / 1000).toFixed(1)}s → {card.jitFallback === "approve" ? t("iss.jitApprove") : t("iss.jitDecline")}
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={runSpend} disabled={frozen}>
                <Zap />
                {t("iss.simGo")}
              </Button>
            </div>
          )}

          {/* 卡交易（含拒付原因） */}
          <div>
            <div className="mb-2 text-sm font-medium">{t("iss.recent")}</div>
            <div className="space-y-1">
              {txns.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">{t("common.empty")}</div>}
              {txns.map((x) => (
                <div key={x.id} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-muted/50">
                  <span className="min-w-0 flex-1 truncate">
                    <span className="text-muted-foreground">{x.merchant}</span>
                    {x.status === "authorized" && (
                      <span className="ml-2 rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">{t("iss.txAuthorized")}</span>
                    )}
                    {x.status === "declined" && x.reason && (
                      <span className="ml-2 rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-danger">
                        {t("iss.txDeclined")} · {t("iss.r" + x.reason.charAt(0).toUpperCase() + x.reason.slice(1))}
                      </span>
                    )}
                    {x.jit && (
                      <span className="ml-2 rounded bg-info/10 px-1.5 py-0.5 text-[10px] font-medium text-info">
                        JIT {(x.jit.decisionMs / 1000).toFixed(1)}s · {x.jit.decidedBy === "fallback" ? t("iss.jitDecidedFallback") : t("iss.jitDecidedMerchant")}
                      </span>
                    )}
                  </span>
                  <span className={cn("tabular-nums font-medium", x.status === "declined" ? "text-muted-foreground line-through" : x.status === "authorized" ? "text-warning" : "text-neg")}>
                    − {formatMoney(x.amount, card.currency)}
                  </span>
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
      </SheetContent>
    </Sheet>

    {/* JIT 中继实时授权弹窗：与 Sheet 同级渲染（两者底层都基于 Radix Dialog Root，嵌套会导致
        焦点陷阱 / Esc 冲突），倒计时期间禁止通过遮罩点击、Esc 或右上角关闭按钮退出 */}
    <Dialog open={!!jit} onOpenChange={(o) => { if (!o && (!jit || jit.result)) setJit(null); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("iss.jitTitle")}</DialogTitle>
          <DialogDescription>{jit?.merchant}</DialogDescription>
        </DialogHeader>

        {jit && !jit.result && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Timer className="size-4 animate-pulse" />
              {t("iss.jitCountdown")}
            </div>
            <div className="text-center text-2xl font-semibold tabular-nums">{formatMoney(jit.amount, card.currency)}</div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-75"
                style={{ width: `${Math.round((jit.remainingMs / JIT_TIMEOUT_MS) * 100)}%` }}
              />
            </div>
            <div className="text-center text-xs text-muted-foreground tabular-nums">{(jit.remainingMs / 1000).toFixed(1)}s</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="border-danger text-danger hover:bg-danger/10" onClick={() => decideJit("decline", "merchant")}>
                {t("iss.jitDecline")}
              </Button>
              <Button onClick={() => decideJit("approve", "merchant")}>
                {t("iss.jitApprove")}
              </Button>
            </div>
          </div>
        )}

        {jit?.result && (
          <div className="space-y-4">
            <div className={cn("rounded-xl border p-4 text-center", jit.result.decision === "approve" ? "border-pos/30 bg-pos/5" : "border-danger/30 bg-danger/5")}>
              <div className={cn("text-lg font-semibold", jit.result.decision === "approve" ? "text-pos" : "text-danger")}>
                {jit.result.decision === "approve" ? t("iss.jitApprove") : t("iss.jitDecline")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {jit.result.decidedBy === "fallback" ? t("iss.jitDecidedFallback") : t("iss.jitDecidedMerchant")} · {t("iss.jitDecisionTime")} {(jit.result.decisionMs / 1000).toFixed(2)}s
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full">{t("common.confirm")}</Button>
              </DialogClose>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

function UsageBar({ label, used, cap, currency }: { label: string; used: number; cap: number; currency: string }) {
  const pct = Math.min(100, Math.round((used / cap) * 100));
  const tone = pct >= 90 ? "bg-danger" : pct >= 75 ? "bg-warning" : "bg-brand";
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          <span className="font-medium">{formatMoney(used, currency)}</span>
          <span className="text-muted-foreground"> / {formatAmount(cap)}</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-[width] duration-500", tone)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium tabular-nums">{value}</div>
    </div>
  );
}
