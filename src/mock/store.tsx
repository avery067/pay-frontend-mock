import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getRate, RATES } from "@/lib/quote";
import {
  balances as initialBalances,
  settleFunds as initialFunds,
  settleRecords as seedRecordsRaw,
  settleQuota as settleQuotaSeed,
  acqTxnsSeed,
  batchesSeed,
  payoutRecordsSeed,
  reservesSeed,
  type Balance,
  type SettleFund,
  type AcqTxn,
  type SettlementBatch,
  type PayoutRecord,
  type ReserveHold,
  disputes as disputesSeed,
  type Dispute,
  type DisputeStage,
  ledger as ledgerSeed,
  type LedgerTxn,
  paymentLinks as linksSeed,
  type PayLink,
  recipients as recipientsSeed,
  type Recipient,
  fxOrdersSeed,
  type FxOrder,
  fxForwardsSeed,
  type FxForward,
  riskRulesSeed,
  type RiskRule,
  riskProfileSeed,
  paymentMethodsSeed,
  type PaymentMethod,
  type MethodKind,
} from "./more";
import { cards as initialCards, notifications as notificationsSeed, type Card, type CardControls, type CardChannel, type CardAutoTopup } from "./data";

/** 结汇阶段：0 发起 · 1 合规审核 · 2 兑换 · 3 汇出 · 4 到账 */
export type SettleStage = 0 | 1 | 2 | 3 | 4;
export type SettleRec = {
  ref: string;
  fundId?: string;
  from: string;
  amount: number;
  rmb: number;
  rate: number;
  stage: SettleStage;
  status: "processing" | "settled" | "failed" | "need_info";
  declared: boolean;
  rfi?: { reason: string; docs: string[] };
};

export type CardTxn = {
  id: string;
  merchant: string;
  amount: number;
  mcc?: string;
  channel?: CardChannel;
  status: "authorized" | "cleared" | "declined";
  reason?: string;
};

/** 发卡消费管控引擎：授权前校验 MCC / 渠道 / 单笔·日·月限额 / 频次 */
export type SpendCheck = { ok: boolean; reason?: string };
function evaluateControls(card: Card, p: { amount: number; mcc: string; channel: CardChannel }): SpendCheck {
  if (card.status === "frozen") return { ok: false, reason: "frozen" };
  if (card.status !== "active") return { ok: false, reason: "inactive" };
  const c = card.controls;
  if (!c.channels[p.channel]) return { ok: false, reason: "channel" };
  const inList = c.mccList.includes(p.mcc);
  if (c.mccMode === "allow" && !inList) return { ok: false, reason: "mcc" };
  if (c.mccMode === "deny" && inList) return { ok: false, reason: "mcc" };
  if (p.amount > c.perTxnLimit) return { ok: false, reason: "perTxn" };
  if (card.spentToday + p.amount > c.dailyLimit) return { ok: false, reason: "daily" };
  if (card.spent + p.amount > c.monthlyLimit) return { ok: false, reason: "monthly" };
  if (card.monthCount + 1 > c.velocity.maxCount) return { ok: false, reason: "velocity" };
  const funds = card.autoTopup.on ? Math.max(card.cardBalance, card.autoTopup.target) : card.cardBalance;
  if (funds < p.amount) return { ok: false, reason: "insufficient" };
  return { ok: true };
}

/** 通知：loop 事件（到账 / 打款 / 争议 / 开卡）会实时推入 */
export type Notif = { id: string; type: string; zh: string; en: string; time: string; live?: boolean; unread?: boolean };

const seedRecords: SettleRec[] = [
  ...seedRecordsRaw.map((r) => {
    const failed = r.status === "failed";
    return {
      ref: r.ref,
      from: r.from,
      amount: r.amount,
      rmb: r.rmb,
      rate: r.rate,
      stage: (failed ? 1 : 4) as SettleStage,
      status: failed ? ("failed" as const) : ("settled" as const),
      declared: !failed,
    };
  }),
  {
    ref: "STL-20260715-0018",
    from: "USD",
    amount: 120000,
    rmb: 862584,
    rate: 7.182,
    stage: 1,
    status: "need_info",
    declared: false,
    rfi: { reason: "大额结汇触发贸易背景复核，请补充单据", docs: ["提单 B/L", "报关单", "外汇合同"] },
  },
];

const seedNotifs: Notif[] = notificationsSeed.map((n) => ({ ...n }));

type MockValue = {
  balances: Balance[];
  funds: SettleFund[];
  records: SettleRec[];
  pendingUsd: number;
  totalUsdEq: number;
  initiateSettlement: (params: { fundId?: string; from: string; amount: number; rate?: number }) => string;
  advance: (ref: string) => void;
  retrySettlement: (ref: string) => void;
  submitRfi: (ref: string) => void;
  settleQuota: { usedRmb: number; totalRmb: number };
  // 实时行情 + 限价结汇委托
  spotRates: Record<string, number>;
  fxOrders: FxOrder[];
  placeFxOrder: (p: { from: string; amount: number; targetRate: number; direction: "gte" | "lte" }) => void;
  cancelFxOrder: (id: string) => void;
  // 远期结汇合约
  fxForwards: FxForward[];
  bookForward: (p: { from: string; notional: number; kind: "fixed" | "flexible"; termDays: number }) => void;
  drawForward: (id: string, amount?: number) => void;
  terminateForward: (id: string) => void;
  cards: Card[];
  cardTxns: Record<string, CardTxn[]>;
  issueCard: (p: { name: string; type: "virtual" | "physical"; brand: string; last4: string; currency: string; limit: number }) => string;
  activateCard: (id: string) => void;
  spendOnCard: (p: { cardId: string; currency: string; merchant: string; amount: number; mcc: string; channel: CardChannel }) => SpendCheck;
  updateCardControls: (cardId: string, patch: Partial<CardControls>) => void;
  topupCard: (cardId: string, amount: number) => void;
  setAutoTopup: (cardId: string, patch: Partial<CardAutoTopup>) => void;
  setCardFrozen: (cardId: string, frozen: boolean) => void;
  terminateCard: (cardId: string) => void;
  // 收单闭环
  acqTxns: AcqTxn[];
  batches: SettlementBatch[];
  payoutRecords: PayoutRecord[];
  reserves: ReserveHold[];
  pendingPoolUsd: number;
  reservedUsd: number;
  instantAvailableUsd: number;
  captureTxn: (p: { order: string; amount?: number }) => void;
  incrementAuth: (p: { order: string; delta: number }) => void;
  endAuth: (order: string) => void;
  // 风控与拒付率
  riskRules: RiskRule[];
  toggleRule: (id: string) => void;
  approveReview: (order: string) => void;
  declineReview: (order: string) => void;
  disputeRatio: number;
  riskThreshold: number;
  riskTier: "normal" | "watch" | "restricted";
  voidTxn: (order: string) => void;
  refundTxn: (p: { order: string; amount: number }) => void;
  advanceBatch: (batchId: string) => void;
  instantPayout: (batchId: string) => void;
  releaseReserve: (reserveId: string) => void;
  // 争议闭环
  disputes: Dispute[];
  submitDisputeEvidence: (id: string) => void;
  acceptDispute: (id: string) => void;
  escalateDispute: (id: string) => void;
  uploadEvidence: (id: string, doc: string) => void;
  withdraw: (p: { currency: string; amount: number }) => void;
  // 统一实时台账 + 资金转出闭环
  ledger: LedgerTxn[];
  convert: (p: { from: string; to: string; pay: number; get: number }) => void;
  transfer: (p: { recipient: string; amount: number; currency: string; note?: string }) => void;
  // 收款链接闭环
  paymentLinks: PayLink[];
  createLink: (p: { name: string; amount: number; currency: string; type: "once" | "reuse" }) => void;
  collectLink: (id: string, methodInfo?: { method: string; methodKind?: MethodKind; payerCountry?: string }) => void;
  // 本地支付方式矩阵
  paymentMethods: PaymentMethod[];
  toggleMethod: (code: string) => void;
  // 收款人
  recipients: Recipient[];
  addRecipient: (p: { name: string; account: string; country: string; currency: string }) => void;
  // 通知
  notifications: Notif[];
  unreadCount: number;
  markNotifsRead: () => void;
  reset: () => void;
};

const MockCtx = createContext<MockValue | null>(null);

// 实时行情：以 USD 为桥用 spot 图算任意币对
function spotUsdPer(spot: Record<string, number>, cur: string): number {
  if (cur === "USD") return 1;
  const r = spot[`USD/${cur}`];
  return r ? 1 / r : 1 / (RATES[`USD/${cur}`] ?? 1);
}
export function spotRate(spot: Record<string, number>, from: string, to: string): number {
  if (from === to) return 1;
  return spotUsdPer(spot, from) / spotUsdPer(spot, to);
}
// 每 tick ±0.25% 随机游走，限制在种子价 ±3% 内
function jitterRates(spot: Record<string, number>): Record<string, number> {
  const next: Record<string, number> = {};
  for (const k in spot) {
    const seed = RATES[k] ?? spot[k];
    const walk = spot[k] * (1 + (Math.random() - 0.5) * 0.005);
    next[k] = Math.round(Math.min(seed * 1.03, Math.max(seed * 0.97, walk)) * 1e6) / 1e6;
  }
  return next;
}

function creditCny(bs: Balance[], rmb: number): Balance[] {
  const usdPerCny = getRate("CNY", "USD");
  return bs.map((b) => (b.currency === "CNY" ? { ...b, available: b.available + rmb, usdEq: b.usdEq + rmb * usdPerCny } : b));
}
function creditUsd(bs: Balance[], amt: number): Balance[] {
  return bs.map((b) => (b.currency === "USD" ? { ...b, available: b.available + amt, usdEq: b.usdEq + amt } : b));
}
function holdReserveBal(bs: Balance[], amt: number): Balance[] {
  if (!amt) return bs;
  return bs.map((b) => (b.currency === "USD" ? { ...b, reserved: (b.reserved || 0) + amt } : b));
}
function releaseReserveBal(bs: Balance[], amt: number): Balance[] {
  return bs.map((b) =>
    b.currency === "USD"
      ? { ...b, reserved: Math.max(0, (b.reserved || 0) - amt), available: b.available + amt, usdEq: b.usdEq + amt }
      : b,
  );
}

export function MockProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances] = useState<Balance[]>(initialBalances);
  const [funds, setFunds] = useState<SettleFund[]>(initialFunds);
  const [records, setRecords] = useState<SettleRec[]>(seedRecords);
  const [settleQuota, setSettleQuota] = useState<{ usedRmb: number; totalRmb: number }>({ ...settleQuotaSeed });
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [cardTxns, setCardTxns] = useState<Record<string, CardTxn[]>>({});
  const [acqTxns, setAcqTxns] = useState<AcqTxn[]>(acqTxnsSeed);
  const [batches, setBatches] = useState<SettlementBatch[]>(batchesSeed);
  const [payoutRecords, setPayoutRecords] = useState<PayoutRecord[]>(payoutRecordsSeed);
  const [reserves, setReserves] = useState<ReserveHold[]>(reservesSeed);
  const [disputes, setDisputes] = useState<Dispute[]>(disputesSeed);
  const [notifs, setNotifs] = useState<Notif[]>(seedNotifs);
  const [ledger, setLedger] = useState<LedgerTxn[]>(ledgerSeed);
  const [links, setLinks] = useState<PayLink[]>(linksSeed);
  const [recipientList, setRecipientList] = useState<Recipient[]>(recipientsSeed);
  const [spotRates, setSpotRates] = useState<Record<string, number>>({ ...RATES });
  const [fxOrders, setFxOrders] = useState<FxOrder[]>(fxOrdersSeed);
  const [fxForwards, setFxForwards] = useState<FxForward[]>(fxForwardsSeed);
  const [riskRules, setRiskRules] = useState<RiskRule[]>(riskRulesSeed);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(paymentMethodsSeed);

  const recordsRef = useRef(records);
  recordsRef.current = records;
  const cardsRef = useRef(cards);
  cardsRef.current = cards;
  const cardTxnsRef = useRef(cardTxns);
  cardTxnsRef.current = cardTxns;
  const batchesRef = useRef(batches);
  batchesRef.current = batches;
  const acqTxnsRef = useRef(acqTxns);
  acqTxnsRef.current = acqTxns;
  const reservesRef = useRef(reserves);
  reservesRef.current = reserves;
  const disputesRef = useRef(disputes);
  disputesRef.current = disputes;
  const linksRef = useRef(links);
  linksRef.current = links;
  const spotRatesRef = useRef(spotRates);
  spotRatesRef.current = spotRates;
  const fxOrdersRef = useRef(fxOrders);
  fxOrdersRef.current = fxOrders;
  const fxForwardsRef = useRef(fxForwards);
  fxForwardsRef.current = fxForwards;
  const fxSeqRef = useRef(1042);
  const fwdSeqRef = useRef(2041);
  const seqRef = useRef(43);
  const cardSeqRef = useRef(0);
  const poSeqRef = useRef(1);
  const notifSeqRef = useRef(0);
  const ledgerSeqRef = useRef(90231);
  const linkSeqRef = useRef(3021);
  const acqSeqRef = useRef(88231);
  const rcpSeqRef = useRef(100);

  // ── 通知：loop 事件实时推送到铃铛 + 通知页 ──
  // 注：id 在更新函数外自增，避免 StrictMode 双调用导致序号跳号（保持更新函数纯净）
  const pushNotif = (type: string, zh: string, en: string) => {
    const id = `n${100 + ++notifSeqRef.current}`;
    setNotifs((prev) => [{ id, type, zh, en, time: "", live: true, unread: true }, ...prev].slice(0, 40));
  };
  const markNotifsRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));

  // ── 统一台账：所有资金流实时入账，交易页/命令面板可见 ──
  const pushLedger = (e: Omit<LedgerTxn, "id" | "date" | "live">) => {
    const id = `TX-${++ledgerSeqRef.current}`;
    setLedger((prev) => [{ ...e, id, date: "", live: true }, ...prev].slice(0, 60));
  };

  // ── 结汇 ──
  const initiateSettlement: MockValue["initiateSettlement"] = ({ fundId, from, amount, rate: rateOverride }) => {
    const seq = ++seqRef.current;
    const ref = `STL-20260716-${String(seq).padStart(4, "0")}`;
    const rate = rateOverride ?? getRate(from, "CNY");
    const rmb = amount * rate * (1 - 0.0025);
    const rec: SettleRec = { ref, fundId, from, amount, rmb, rate, stage: 0, status: "processing", declared: false };
    setRecords((prev) => [rec, ...prev]);
    if (fundId) setFunds((prev) => prev.filter((f) => f.id !== fundId));
    setSettleQuota((q) => ({ ...q, usedRmb: Math.round((q.usedRmb + rmb) * 100) / 100 }));
    return ref;
  };
  // 合规问询补件：need_info → 续跑结汇闭环
  const submitRfi: MockValue["submitRfi"] = (ref) =>
    setRecords((prev) => prev.map((x) => (x.ref === ref && x.status === "need_info" ? { ...x, status: "processing" } : x)));
  const advance: MockValue["advance"] = (ref) => {
    const r = recordsRef.current.find((x) => x.ref === ref);
    if (!r || r.status !== "processing") return;
    const stage = Math.min(4, r.stage + 1) as SettleStage;
    if (stage === 4) {
      setRecords((prev) => prev.map((x) => (x.ref === ref ? { ...x, stage, status: "settled", declared: true } : x)));
      setBalances((bs) => creditCny(bs, r.rmb));
      pushNotif("success", `结汇 ${ref} 已到账`, `Settlement ${ref} arrived`);
      pushLedger({ type: "convert", desc: `结汇 ${ref}`, dir: "in", amount: r.rmb, currency: "CNY", status: "settled" });
    } else {
      setRecords((prev) => prev.map((x) => (x.ref === ref ? { ...x, stage } : x)));
    }
  };
  // 结汇失败重试：失败单回到发起态，由自动推进重跑闭环
  const retrySettlement: MockValue["retrySettlement"] = (ref) => {
    setRecords((prev) =>
      prev.map((x) => (x.ref === ref && x.status === "failed" ? { ...x, stage: 0, status: "processing", declared: false } : x)),
    );
  };
  // 限价结汇委托：外币→CNY 越过目标价，tick 内自动触发结汇
  const placeFxOrder: MockValue["placeFxOrder"] = ({ from, amount, targetRate, direction }) => {
    const id = `FXO-${++fxSeqRef.current}`;
    const order: FxOrder = { id, from, amount, targetRate, direction, createdRate: spotRate(spotRatesRef.current, from, "CNY"), expiry: "GTC", status: "watching" };
    setFxOrders((prev) => [order, ...prev]);
  };
  const cancelFxOrder: MockValue["cancelFxOrder"] = (id) =>
    setFxOrders((prev) => prev.map((o) => (o.id === id && o.status === "watching" ? { ...o, status: "cancelled" } : o)));

  // 远期结汇合约：签约锁定即期价；交割按锁定价结汇；flexible 可分批
  const bookForward: MockValue["bookForward"] = ({ from, notional, kind, termDays }) => {
    const id = `FWD-${++fwdSeqRef.current}`;
    const lockedRate = Math.round(spotRate(spotRatesRef.current, from, "CNY") * (1 + termDays * 0.00015) * 10000) / 10000;
    const fwd: FxForward = { id, from, notional, lockedRate, kind, termLabel: kind === "fixed" ? `T+${termDays} · 到期交割` : `择期窗口 ${termDays} 天`, drawn: 0, status: "active" };
    setFxForwards((prev) => [fwd, ...prev]);
  };
  const drawForward: MockValue["drawForward"] = (id, amount) => {
    const f = fxForwardsRef.current.find((x) => x.id === id);
    if (!f || f.status === "settled" || f.status === "cancelled") return;
    const remaining = f.notional - f.drawn;
    const draw = Math.min(amount ?? remaining, remaining);
    if (draw <= 0) return;
    initiateSettlement({ from: f.from, amount: draw, rate: f.lockedRate });
    const newDrawn = Math.round((f.drawn + draw) * 100) / 100;
    setFxForwards((prev) => prev.map((x) => (x.id === id ? { ...x, drawn: newDrawn, status: newDrawn >= f.notional - 0.001 ? "settled" : "partially_drawn" } : x)));
    pushNotif("success", `远期合约 ${id} 已交割 ${f.from} ${draw.toLocaleString()}`, `Forward ${id} drawn down`);
  };
  const terminateForward: MockValue["terminateForward"] = (id) =>
    setFxForwards((prev) => prev.map((x) => (x.id === id && (x.status === "active" || x.status === "partially_drawn") ? { ...x, status: "cancelled" } : x)));

  // ── 发卡 ──
  const issueCard: MockValue["issueCard"] = (p) => {
    const id = `cx${++cardSeqRef.current}`;
    const isPhysical = p.type === "physical";
    const card: Card = {
      id,
      ...p,
      spent: 0,
      status: "issuing",
      spentToday: 0,
      monthCount: 0,
      cardBalance: Math.round(p.limit / 4),
      autoTopup: { on: true, threshold: Math.round(p.limit / 10), target: Math.round(p.limit / 4) },
      fulfillment: isPhysical ? { stage: "personalization", eta: "3-5 个工作日" } : undefined,
      controls: {
        channels: { online: true, atm: false, pos: true, crossBorder: true },
        mccMode: "deny",
        mccList: [],
        perTxnLimit: Math.max(1000, Math.round(p.limit / 4)),
        dailyLimit: Math.max(2000, Math.round(p.limit / 2)),
        monthlyLimit: p.limit,
        velocity: { maxCount: 60, window: "month" },
      },
    };
    setCards((prev) => [card, ...prev]);
    if (isPhysical) {
      // 实体卡制卡履约链：制卡 → 生产 → 寄出 → 待激活
      window.setTimeout(() => setCards((prev) => prev.map((c) => (c.id === id ? { ...c, fulfillment: { stage: "manufacturing", eta: "3-5 个工作日" } } : c))), 2600);
      window.setTimeout(() => setCards((prev) => prev.map((c) => (c.id === id ? { ...c, fulfillment: { stage: "shipped", eta: "3-5 个工作日" } } : c))), 5200);
      window.setTimeout(() => {
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status: "inactive" } : c)));
        pushNotif("success", `${p.name} 已寄出，待激活`, `Card “${p.name}” shipped — activate on arrival`);
      }, 7800);
    } else {
      window.setTimeout(() => {
        setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status: "active" } : c)));
        pushNotif("success", `${p.name} 开卡成功`, `Card “${p.name}” issued`);
      }, 4200);
    }
    return id;
  };
  const activateCard: MockValue["activateCard"] = (id) => {
    setCards((prev) => prev.map((c) => (c.id === id && c.status === "inactive" ? { ...c, status: "active", fulfillment: undefined } : c)));
    pushNotif("success", `实体卡 ${id} 已激活`, `Card ${id} activated`);
  };
  // 消费管控引擎生效：命中规则则拒付并记录原因，通过则扣款 + 计数
  const spendOnCard: MockValue["spendOnCard"] = ({ cardId, currency, merchant, amount, mcc, channel }) => {
    const card = cardsRef.current.find((c) => c.id === cardId);
    if (!card) return { ok: false, reason: "inactive" };
    const check = evaluateControls(card, { amount, mcc, channel });
    const tid = `ct${++cardSeqRef.current}`;
    if (!check.ok) {
      setCardTxns((prev) => ({ ...prev, [cardId]: [{ id: tid, merchant, amount, mcc, channel, status: "declined", reason: check.reason }, ...(prev[cardId] || [])] }));
      return check;
    }
    // 卡资金账户：从卡内余额扣款；开启自动充值且不足则先从主账户加油到目标
    const topupAmt = card.autoTopup.on && card.cardBalance < amount ? Math.round((card.autoTopup.target - card.cardBalance) * 100) / 100 : 0;
    if (topupAmt > 0) {
      const usdPer = getRate(currency, "USD");
      setBalances((bs) => bs.map((b) => (b.currency === currency ? { ...b, available: Math.max(0, b.available - topupAmt), usdEq: Math.max(0, b.usdEq - topupAmt * usdPer) } : b)));
    }
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, cardBalance: Math.round((c.cardBalance + topupAmt - amount) * 100) / 100, spent: c.spent + amount, spentToday: c.spentToday + amount, monthCount: c.monthCount + 1 } : c)));
    // 两段式：先授权(预占额度)，由 tick 自动清算入账
    setCardTxns((prev) => ({ ...prev, [cardId]: [{ id: tid, merchant, amount, mcc, channel, status: "authorized" }, ...(prev[cardId] || [])] }));
    pushLedger({ type: "card", desc: merchant, dir: "out", amount, currency, status: "settled" });
    return check;
  };
  const updateCardControls: MockValue["updateCardControls"] = (cardId, patch) =>
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, controls: { ...c.controls, ...patch } } : c)));
  // 卡片充值：从主账户划入卡内余额
  const topupCard: MockValue["topupCard"] = (cardId, amount) => {
    const card = cardsRef.current.find((c) => c.id === cardId);
    if (!card || amount <= 0) return;
    const usdPer = getRate(card.currency, "USD");
    setBalances((bs) => bs.map((b) => (b.currency === card.currency ? { ...b, available: Math.max(0, b.available - amount), usdEq: Math.max(0, b.usdEq - amount * usdPer) } : b)));
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, cardBalance: Math.round((c.cardBalance + amount) * 100) / 100 } : c)));
  };
  const setAutoTopup: MockValue["setAutoTopup"] = (cardId, patch) =>
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, autoTopup: { ...c.autoTopup, ...patch } } : c)));
  const setCardFrozen: MockValue["setCardFrozen"] = (cardId, frozen) =>
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status: frozen ? "frozen" : "active" } : c)));
  const terminateCard: MockValue["terminateCard"] = (cardId) => setCards((prev) => prev.filter((c) => c.id !== cardId));

  // ── 收单闭环 ──
  // 预授权 → 部分/多次请款：capturedAmount 累加，未满额为 partially_captured，满额转 captured
  const captureTxn: MockValue["captureTxn"] = ({ order, amount }) =>
    setAcqTxns((prev) =>
      prev.map((t) => {
        if (t.order !== order || (t.status !== "authorized" && t.status !== "partially_captured")) return t;
        const authAmt = t.authAmount ?? t.gross;
        const already = t.capturedAmount ?? 0;
        const cap = Math.min(amount ?? authAmt - already, authAmt - already);
        if (cap <= 0) return t;
        const newCaptured = Math.round((already + cap) * 100) / 100;
        const remaining = Math.round((authAmt - newCaptured) * 100) / 100;
        const captures = [...(t.captures ?? []), { id: `CAP-${order.replace(/^OD-?/, "")}-${(t.captures?.length ?? 0) + 1}`, amount: cap }];
        return { ...t, authAmount: authAmt, capturedAmount: newCaptured, captures, status: remaining <= 0.001 ? "captured" : "partially_captured", stage: 1 };
      }),
    );
  // 增额授权（预授权最终金额前上调）
  const incrementAuth: MockValue["incrementAuth"] = ({ order, delta }) =>
    setAcqTxns((prev) =>
      prev.map((t) => (t.order === order && (t.status === "authorized" || t.status === "partially_captured") ? { ...t, authAmount: Math.round(((t.authAmount ?? t.gross) + delta) * 100) / 100 } : t)),
    );
  // 结束授权：已部分请款则剩余释放并入结算，未请款则整单撤销
  const endAuth: MockValue["endAuth"] = (order) =>
    setAcqTxns((prev) =>
      prev.map((t) => {
        if (t.order !== order) return t;
        if (t.status === "partially_captured") return { ...t, status: "captured" };
        if (t.status === "authorized") return { ...t, status: "voided" };
        return t;
      }),
    );
  // 风控人工审核队列：放行→进请款主线；拒绝→撤销
  const approveReview: MockValue["approveReview"] = (order) =>
    setAcqTxns((prev) => prev.map((t) => (t.order === order && t.status === "review" ? { ...t, status: "captured", stage: 1 } : t)));
  const declineReview: MockValue["declineReview"] = (order) =>
    setAcqTxns((prev) => prev.map((t) => (t.order === order && t.status === "review" ? { ...t, status: "voided" } : t)));
  const toggleRule: MockValue["toggleRule"] = (id) =>
    setRiskRules((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));

  const voidTxn: MockValue["voidTxn"] = (order) =>
    setAcqTxns((prev) => prev.map((t) => (t.order === order && t.status === "authorized" ? { ...t, status: "voided" } : t)));
  // 退款：已入账 → 从 USD 扣回；未打款且在批次内 → 冲减该批次毛额/净额（及在途打款额）
  const refundTxn: MockValue["refundTxn"] = ({ order, amount }) => {
    const tx = acqTxnsRef.current.find((x) => x.order === order);
    setAcqTxns((prev) => prev.map((x) => (x.order === order ? { ...x, status: "refunded" } : x)));
    if (!tx) return;
    pushLedger({ type: "refund", desc: `退款 · ${order}`, dir: "out", amount, currency: tx.currency, status: "settled" });
    if (tx.status === "credited") {
      setBalances((bs) => creditUsd(bs, -amount));
      return;
    }
    if (tx.batchId) {
      const b = batchesRef.current.find((x) => x.id === tx.batchId);
      if (b && b.status !== "credited") {
        setBatches((prev) => prev.map((x) => (x.id === b.id ? { ...x, gross: Math.max(0, x.gross - amount), net: Math.max(0, x.net - amount) } : x)));
        setPayoutRecords((prev) =>
          prev.map((p) => (p.batchId === b.id && p.status === "in_transit" ? { ...p, amount: Math.max(0, p.amount - amount) } : p)),
        );
      }
    }
  };

  const finishBatch = (b: SettlementBatch, method: "standard" | "instant", fee: number) => {
    const creditAmt = b.net - fee;
    setBatches((prev) => prev.map((x) => (x.id === b.id ? { ...x, status: "credited", instant: method === "instant" ? true : x.instant } : x)));
    setBalances((bs) => holdReserveBal(creditUsd(bs, creditAmt), b.reserve));
    setPayoutRecords((prev) => {
      const inTransit = prev.find((p) => p.batchId === b.id && p.status === "in_transit");
      if (inTransit) return prev.map((p) => (p === inTransit ? { ...p, status: "paid", method, fee, amount: creditAmt } : p));
      const pid = `PAY-${b.id.slice(3)}-${String(++poSeqRef.current).padStart(2, "0")}`;
      return [{ id: pid, batchId: b.id, amount: creditAmt, currency: b.currency, method, fee, status: "paid" as const }, ...prev];
    });
    if (b.reserve > 0) {
      setReserves((prev) => [
        { id: `RSV-${b.id.replace("PO-", "")}`, batchId: b.id, amount: b.reserve, currency: b.currency, heldOn: b.saleDate, releaseOn: "T+30", released: false },
        ...prev,
      ]);
    }
    setAcqTxns((prev) => prev.map((t) => (b.txnOrders.includes(t.order) ? { ...t, stage: 5, status: "credited" } : t)));
    pushNotif("success", `结算批次 ${b.id} 已打款入账`, `Payout ${b.id} credited`);
    pushLedger({ type: "payment", desc: `结算批次 ${b.id}`, dir: "in", amount: creditAmt, currency: b.currency, status: "settled" });
  };

  const advanceBatch: MockValue["advanceBatch"] = (id) => {
    const b = batchesRef.current.find((x) => x.id === id);
    if (!b || b.status === "credited") return;
    if (b.status === "paid_out") {
      finishBatch(b, "standard", 0);
      return;
    }
    const next: SettlementBatch["status"] = b.status === "scheduled" ? "settling" : "paid_out";
    setBatches((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
    if (next === "paid_out") {
      const pid = `PAY-${b.id.slice(3)}-${String(++poSeqRef.current).padStart(2, "0")}`;
      setPayoutRecords((prev) => [{ id: pid, batchId: b.id, amount: b.net, currency: b.currency, method: "standard", fee: 0, status: "in_transit" }, ...prev]);
    }
    setAcqTxns((prev) => prev.map((t) => (b.txnOrders.includes(t.order) ? { ...t, stage: next === "settling" ? 3 : 4, status: next } : t)));
  };

  const instantPayout: MockValue["instantPayout"] = (id) => {
    const b = batchesRef.current.find((x) => x.id === id);
    if (!b || b.status === "credited") return;
    finishBatch(b, "instant", Math.max(b.net * 0.015, 0.5));
  };

  const releaseReserve: MockValue["releaseReserve"] = (id) => {
    const r = reservesRef.current.find((x) => x.id === id);
    if (!r || r.released) return;
    setReserves((prev) => prev.map((x) => (x.id === id ? { ...x, released: true } : x)));
    setBalances((bs) => releaseReserveBal(bs, r.amount));
  };

  // ── 争议闭环：举证 → 审核中 → 胜诉；接受 → 败诉(从 USD 余额扣回) ──
  const submitDisputeEvidence: MockValue["submitDisputeEvidence"] = (id) => {
    setDisputes((prev) => prev.map((d) => (d.id === id && d.status === "need" ? { ...d, status: "review", stage: d.stage === "chargeback" ? "representment" : d.stage ?? "representment" } : d)));
    window.setTimeout(() => {
      setDisputes((prev) => prev.map((d) => (d.id === id && d.status === "review" ? { ...d, status: "won" } : d)));
      pushNotif("success", `争议 ${id} 已胜诉`, `Dispute ${id} won`);
    }, 6000);
  };
  const acceptDispute: MockValue["acceptDispute"] = (id) => {
    const d = disputesRef.current.find((x) => x.id === id);
    if (!d || d.status !== "need") return;
    setDisputes((prev) => prev.map((x) => (x.id === id ? { ...x, status: "lost" } : x)));
    setBalances((bs) => creditUsd(bs, -d.amount));
    pushNotif("warning", `争议 ${id} 已接受拒付`, `Dispute ${id} — chargeback accepted`);
  };
  // 争议升级：败诉后升级预仲裁 → 仲裁（仲裁为终局）
  const escalateDispute: MockValue["escalateDispute"] = (id) => {
    const order: DisputeStage[] = ["chargeback", "representment", "pre_arb", "arbitration"];
    setDisputes((prev) =>
      prev.map((d) => {
        if (d.id !== id || d.status !== "lost") return d;
        const i = order.indexOf(d.stage ?? "representment");
        if (i >= order.length - 1) return d;
        return { ...d, stage: order[i + 1], status: "need" };
      }),
    );
  };
  const uploadEvidence: MockValue["uploadEvidence"] = (id, doc) =>
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, evidenceUploaded: (d.evidenceUploaded ?? []).includes(doc) ? d.evidenceUploaded : [...(d.evidenceUploaded ?? []), doc] } : d)));

  const withdraw: MockValue["withdraw"] = ({ currency, amount }) => {
    const usdPer = getRate(currency, "USD");
    setBalances((bs) =>
      bs.map((b) => (b.currency === currency ? { ...b, available: Math.max(0, b.available - amount), usdEq: Math.max(0, b.usdEq - amount * usdPer) } : b)),
    );
    pushLedger({ type: "payout", desc: `提现到银行 · ${currency}`, dir: "out", amount, currency, status: "settled" });
  };

  // ── 兑换闭环：扣兑出币种、增兑入币种、记入台账 ──
  const convert: MockValue["convert"] = ({ from, to, pay, get }) => {
    const fromUsd = getRate(from, "USD");
    const toUsd = getRate(to, "USD");
    setBalances((bs) =>
      bs.map((b) => {
        if (b.currency === from) return { ...b, available: Math.max(0, b.available - pay), usdEq: Math.max(0, b.usdEq - pay * fromUsd) };
        if (b.currency === to) return { ...b, available: b.available + get, usdEq: b.usdEq + get * toUsd };
        return b;
      }),
    );
    pushLedger({ type: "convert", desc: `${from} → ${to}`, dir: "out", amount: pay, currency: from, status: "settled" });
  };

  // ── 付款闭环：扣余额、记入台账（处理中 → ~4s 到账 + 通知）──
  const transfer: MockValue["transfer"] = ({ recipient, amount, currency, note }) => {
    const usdPer = getRate(currency, "USD");
    setBalances((bs) =>
      bs.map((b) => (b.currency === currency ? { ...b, available: Math.max(0, b.available - amount), usdEq: Math.max(0, b.usdEq - amount * usdPer) } : b)),
    );
    const id = `TX-${++ledgerSeqRef.current}`;
    const desc = note ? `${recipient} · ${note}` : recipient;
    const entry: LedgerTxn = { id, type: "payout", desc, dir: "out", amount, currency, status: "processing", date: "", live: true };
    setLedger((prev) => [entry, ...prev].slice(0, 60));
    window.setTimeout(() => {
      setLedger((prev) => prev.map((x) => (x.id === id ? { ...x, status: "settled" } : x)));
      pushNotif("success", `付款 ${recipient} 已到账`, `Transfer to ${recipient} settled`);
    }, 4200);
  };

  // ── 收款链接闭环：创建链接；模拟客户支付 → 净额入账 + 台账 + 通知 + 一次性置为已支付 ──
  const createLink: MockValue["createLink"] = ({ name, amount, currency, type }) => {
    const seq = ++linkSeqRef.current;
    const link: PayLink = { id: `PL-${seq}`, name, amount, currency, type, status: "active", created: "", slug: `link-${seq}` };
    setLinks((prev) => [link, ...prev]);
  };
  const collectLink: MockValue["collectLink"] = (id, methodInfo) => {
    const l = linksRef.current.find((x) => x.id === id);
    if (!l || l.status === "paid") return;
    const fee = Math.round((l.amount * 0.029 + 0.3) * 100) / 100;
    const net = Math.round((l.amount - fee) * 100) / 100;
    const usdPer = getRate(l.currency, "USD");
    setBalances((bs) => bs.map((b) => (b.currency === l.currency ? { ...b, available: b.available + net, usdEq: b.usdEq + net * usdPer } : b)));
    const order = `OD-${++acqSeqRef.current}`;
    setAcqTxns((prev) => [
      { order, merchant: l.name, method: methodInfo?.method ?? "收款链接", methodKind: methodInfo?.methodKind, payerCountry: methodInfo?.payerCountry, gross: l.amount, fee, reserve: 0, net, currency: l.currency, captureMode: "auto", stage: 5, status: "credited", time: "", batchId: undefined },
      ...prev,
    ]);
    pushLedger({ type: "payment", desc: `收款链接 · ${l.name}`, dir: "in", amount: net, currency: l.currency, status: "settled" });
    pushNotif("success", `收款链接「${l.name}」收到付款 ${l.currency} ${net.toLocaleString()}`, `Payment link “${l.name}” collected`);
    if (l.type === "once") setLinks((prev) => prev.map((x) => (x.id === id ? { ...x, status: "paid" } : x)));
  };
  const toggleMethod: MockValue["toggleMethod"] = (code) =>
    setPaymentMethods((prev) => prev.map((m) => (m.code === code ? { ...m, enabled: !m.enabled } : m)));

  // ── 收款人：新增受益人（付款对话框实时可选）──
  const addRecipient: MockValue["addRecipient"] = ({ name, account, country, currency }) => {
    const rcp: Recipient = { id: `r${++rcpSeqRef.current}`, name, account, country, currency };
    setRecipientList((prev) => [rcp, ...prev]);
  };

  // 一键重置所有示例状态到初始（原型 mock）
  const reset = () => {
    setBalances(initialBalances);
    setFunds(initialFunds);
    setRecords(seedRecords);
    setSettleQuota({ ...settleQuotaSeed });
    setCards(initialCards);
    setCardTxns({});
    setAcqTxns(acqTxnsSeed);
    setBatches(batchesSeed);
    setPayoutRecords(payoutRecordsSeed);
    setReserves(reservesSeed);
    setDisputes(disputesSeed);
    setNotifs(seedNotifs);
    setLedger(ledgerSeed);
    setLinks(linksSeed);
    setRecipientList(recipientsSeed);
    setSpotRates({ ...RATES });
    setFxOrders(fxOrdersSeed);
    setFxForwards(fxForwardsSeed);
    setRiskRules(riskRulesSeed);
    setPaymentMethods(paymentMethodsSeed);
  };

  // 自动推进：结汇处理中的记录 + 已开始结算的批次
  useEffect(() => {
    const id = window.setInterval(() => {
      const recs = recordsRef.current;
      if (recs.some((r) => r.status === "processing")) {
        let creditRmb = 0;
        const settled: { ref: string; rmb: number }[] = [];
        const next = recs.map((r) => {
          if (r.status !== "processing") return r;
          const stage = Math.min(4, r.stage + 1) as SettleStage;
          if (stage === 4) {
            creditRmb += r.rmb;
            settled.push({ ref: r.ref, rmb: r.rmb });
            return { ...r, stage, status: "settled" as const, declared: true };
          }
          return { ...r, stage };
        });
        setRecords(next);
        if (creditRmb > 0) setBalances((bs) => creditCny(bs, creditRmb));
        settled.forEach(({ ref, rmb }) => {
          pushNotif("success", `结汇 ${ref} 已到账`, `Settlement ${ref} arrived`);
          pushLedger({ type: "convert", desc: `结汇 ${ref}`, dir: "in", amount: rmb, currency: "CNY", status: "settled" });
        });
      }
      const mv = batchesRef.current.find((b) => b.status === "settling" || b.status === "paid_out");
      if (mv) advanceBatch(mv.id);

      // 发卡两段式：已授权卡交易自动清算入账
      const ct = cardTxnsRef.current;
      if (Object.values(ct).some((list) => list.some((x) => x.status === "authorized"))) {
        setCardTxns((prev) => {
          const next: Record<string, CardTxn[]> = {};
          for (const k in prev) next[k] = prev[k].map((x) => (x.status === "authorized" ? { ...x, status: "cleared" } : x));
          return next;
        });
      }

      // 卡资金账户油量灯：开启自动充值且低于阈值 → 从主账户加油到目标
      cardsRef.current
        .filter((c) => c.autoTopup.on && c.cardBalance < c.autoTopup.threshold)
        .forEach((c) => {
          const amt = Math.round((c.autoTopup.target - c.cardBalance) * 100) / 100;
          if (amt > 0) {
            const usdPer = getRate(c.currency, "USD");
            setBalances((bs) => bs.map((b) => (b.currency === c.currency ? { ...b, available: Math.max(0, b.available - amt), usdEq: Math.max(0, b.usdEq - amt * usdPer) } : b)));
            setCards((prev) => prev.map((x) => (x.id === c.id ? { ...x, cardBalance: c.autoTopup.target } : x)));
            pushNotif("success", `${c.name} 自动充值 ${c.currency} ${amt.toLocaleString()}`, `${c.name} auto-topped up`);
          }
        });

      // 实时行情随机游走 + 限价委托越线触发结汇
      const nextSpot = jitterRates(spotRatesRef.current);
      setSpotRates(nextSpot);
      fxOrdersRef.current
        .filter((o) => o.status === "watching")
        .forEach((o) => {
          const cur = spotRate(nextSpot, o.from, "CNY");
          const hit = o.direction === "gte" ? cur >= o.targetRate : cur <= o.targetRate;
          if (hit) {
            setFxOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: "triggered" } : x)));
            initiateSettlement({ from: o.from, amount: o.amount });
            pushNotif("success", `限价委托 ${o.id} 已触发结汇（${o.from}→CNY @ ${o.targetRate}）`, `FX order ${o.id} triggered`);
          }
        });
    }, 2600);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingUsd = funds.reduce((s, f) => s + f.usdEq, 0);
  const totalUsdEq = balances.reduce((s, b) => s + b.usdEq, 0);
  const reservedUsd = balances.find((b) => b.currency === "USD")?.reserved ?? 0;
  const nonCreditedNet = batches.filter((b) => b.status !== "credited").reduce((s, b) => s + b.net, 0);
  const capturedNet = acqTxns.filter((t) => t.status === "captured").reduce((s, t) => s + t.net, 0);
  const pendingPoolUsd = nonCreditedNet + capturedNet;
  const instantAvailableUsd = nonCreditedNet;
  const unreadCount = notifs.filter((n) => n.unread).length;
  const disputeRatio = Math.round((riskProfileSeed.disputeRatio + disputes.filter((d) => d.status === "lost").length * 0.06) * 100) / 100;
  const riskThreshold = riskProfileSeed.threshold;
  const riskTier: MockValue["riskTier"] = disputeRatio >= riskThreshold ? "restricted" : disputeRatio >= riskThreshold * 0.85 ? "watch" : "normal";

  return (
    <MockCtx.Provider
      value={{
        balances,
        funds,
        records,
        pendingUsd,
        totalUsdEq,
        initiateSettlement,
        advance,
        retrySettlement,
        submitRfi,
        settleQuota,
        spotRates,
        fxOrders,
        placeFxOrder,
        cancelFxOrder,
        fxForwards,
        bookForward,
        drawForward,
        terminateForward,
        cards,
        cardTxns,
        issueCard,
        activateCard,
        spendOnCard,
        updateCardControls,
        topupCard,
        setAutoTopup,
        setCardFrozen,
        terminateCard,
        acqTxns,
        batches,
        payoutRecords,
        reserves,
        pendingPoolUsd,
        reservedUsd,
        instantAvailableUsd,
        captureTxn,
        incrementAuth,
        endAuth,
        riskRules,
        toggleRule,
        approveReview,
        declineReview,
        disputeRatio,
        riskThreshold,
        riskTier,
        voidTxn,
        refundTxn,
        advanceBatch,
        instantPayout,
        releaseReserve,
        disputes,
        submitDisputeEvidence,
        acceptDispute,
        escalateDispute,
        uploadEvidence,
        withdraw,
        ledger,
        convert,
        transfer,
        paymentLinks: links,
        createLink,
        collectLink,
        paymentMethods,
        toggleMethod,
        recipients: recipientList,
        addRecipient,
        notifications: notifs,
        unreadCount,
        markNotifsRead,
        reset,
      }}
    >
      {children}
    </MockCtx.Provider>
  );
}

export function useMock() {
  const ctx = useContext(MockCtx);
  if (!ctx) throw new Error("useMock must be used within MockProvider");
  return ctx;
}
