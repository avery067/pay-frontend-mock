import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getRate } from "@/lib/quote";
import {
  balances as initialBalances,
  settleFunds as initialFunds,
  settleRecords as seedRecordsRaw,
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
} from "./more";
import { cards as initialCards, type Card } from "./data";

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
  status: "processing" | "settled" | "failed";
  declared: boolean;
};

export type CardTxn = { id: string; merchant: string; amount: number };

const seedRecords: SettleRec[] = seedRecordsRaw.map((r) => {
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
});

type MockValue = {
  balances: Balance[];
  funds: SettleFund[];
  records: SettleRec[];
  pendingUsd: number;
  totalUsdEq: number;
  initiateSettlement: (params: { fundId?: string; from: string; amount: number }) => string;
  advance: (ref: string) => void;
  cards: Card[];
  cardTxns: Record<string, CardTxn[]>;
  issueCard: (p: { name: string; type: "virtual" | "physical"; brand: string; last4: string; currency: string; limit: number }) => string;
  spendOnCard: (p: { cardId: string; currency: string; merchant: string; amount: number }) => void;
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
  captureTxn: (order: string) => void;
  voidTxn: (order: string) => void;
  refundTxn: (p: { order: string; amount: number }) => void;
  advanceBatch: (batchId: string) => void;
  instantPayout: (batchId: string) => void;
  releaseReserve: (reserveId: string) => void;
};

const MockCtx = createContext<MockValue | null>(null);

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
  const [cards, setCards] = useState<Card[]>(initialCards);
  const [cardTxns, setCardTxns] = useState<Record<string, CardTxn[]>>({});
  const [acqTxns, setAcqTxns] = useState<AcqTxn[]>(acqTxnsSeed);
  const [batches, setBatches] = useState<SettlementBatch[]>(batchesSeed);
  const [payoutRecords, setPayoutRecords] = useState<PayoutRecord[]>(payoutRecordsSeed);
  const [reserves, setReserves] = useState<ReserveHold[]>(reservesSeed);

  const recordsRef = useRef(records);
  recordsRef.current = records;
  const batchesRef = useRef(batches);
  batchesRef.current = batches;
  const acqTxnsRef = useRef(acqTxns);
  acqTxnsRef.current = acqTxns;
  const reservesRef = useRef(reserves);
  reservesRef.current = reserves;
  const seqRef = useRef(43);
  const cardSeqRef = useRef(0);
  const poSeqRef = useRef(1);

  // ── 结汇 ──
  const initiateSettlement: MockValue["initiateSettlement"] = ({ fundId, from, amount }) => {
    const seq = ++seqRef.current;
    const ref = `STL-20260716-${String(seq).padStart(4, "0")}`;
    const rate = getRate(from, "CNY");
    const rmb = amount * rate * (1 - 0.0025);
    const rec: SettleRec = { ref, fundId, from, amount, rmb, rate, stage: 0, status: "processing", declared: false };
    setRecords((prev) => [rec, ...prev]);
    if (fundId) setFunds((prev) => prev.filter((f) => f.id !== fundId));
    return ref;
  };
  const advance: MockValue["advance"] = (ref) => {
    const r = recordsRef.current.find((x) => x.ref === ref);
    if (!r || r.status !== "processing") return;
    const stage = Math.min(4, r.stage + 1) as SettleStage;
    if (stage === 4) {
      setRecords((prev) => prev.map((x) => (x.ref === ref ? { ...x, stage, status: "settled", declared: true } : x)));
      setBalances((bs) => creditCny(bs, r.rmb));
    } else {
      setRecords((prev) => prev.map((x) => (x.ref === ref ? { ...x, stage } : x)));
    }
  };

  // ── 发卡 ──
  const issueCard: MockValue["issueCard"] = (p) => {
    const id = `cx${++cardSeqRef.current}`;
    const card: Card = { id, ...p, spent: 0, status: "issuing" };
    setCards((prev) => [card, ...prev]);
    window.setTimeout(() => setCards((prev) => prev.map((c) => (c.id === id ? { ...c, status: "active" } : c))), 4200);
    return id;
  };
  const spendOnCard: MockValue["spendOnCard"] = ({ cardId, currency, merchant, amount }) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, spent: Math.min(c.limit, c.spent + amount) } : c)));
    const usdPer = getRate(currency, "USD");
    setBalances((bs) => bs.map((b) => (b.currency === currency ? { ...b, available: Math.max(0, b.available - amount), usdEq: Math.max(0, b.usdEq - amount * usdPer) } : b)));
    const tid = `ct${++cardSeqRef.current}`;
    setCardTxns((prev) => ({ ...prev, [cardId]: [{ id: tid, merchant, amount }, ...(prev[cardId] || [])] }));
  };
  const setCardFrozen: MockValue["setCardFrozen"] = (cardId, frozen) =>
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, status: frozen ? "frozen" : "active" } : c)));
  const terminateCard: MockValue["terminateCard"] = (cardId) => setCards((prev) => prev.filter((c) => c.id !== cardId));

  // ── 收单闭环 ──
  const captureTxn: MockValue["captureTxn"] = (order) =>
    setAcqTxns((prev) => prev.map((t) => (t.order === order && t.status === "authorized" ? { ...t, status: "captured", stage: 1 } : t)));
  const voidTxn: MockValue["voidTxn"] = (order) =>
    setAcqTxns((prev) => prev.map((t) => (t.order === order && t.status === "authorized" ? { ...t, status: "voided" } : t)));
  const refundTxn: MockValue["refundTxn"] = ({ order, amount }) => {
    const t = acqTxnsRef.current.find((x) => x.order === order);
    setAcqTxns((prev) => prev.map((x) => (x.order === order ? { ...x, status: "refunded" } : x)));
    if (t && t.status === "credited") setBalances((bs) => creditUsd(bs, -amount));
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

  // 自动推进：结汇处理中的记录 + 已开始结算的批次
  useEffect(() => {
    const id = window.setInterval(() => {
      const recs = recordsRef.current;
      if (recs.some((r) => r.status === "processing")) {
        let creditRmb = 0;
        const next = recs.map((r) => {
          if (r.status !== "processing") return r;
          const stage = Math.min(4, r.stage + 1) as SettleStage;
          if (stage === 4) {
            creditRmb += r.rmb;
            return { ...r, stage, status: "settled" as const, declared: true };
          }
          return { ...r, stage };
        });
        setRecords(next);
        if (creditRmb > 0) setBalances((bs) => creditCny(bs, creditRmb));
      }
      const mv = batchesRef.current.find((b) => b.status === "settling" || b.status === "paid_out");
      if (mv) advanceBatch(mv.id);
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
        cards,
        cardTxns,
        issueCard,
        spendOnCard,
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
        voidTxn,
        refundTxn,
        advanceBatch,
        instantPayout,
        releaseReserve,
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
