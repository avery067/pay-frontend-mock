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
  type Balance,
  type SettleFund,
} from "./more";

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

// 历史记录作为终态种子（不自动推进）；实时闭环由用户发起
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
};

const MockCtx = createContext<MockValue | null>(null);

function creditCny(bs: Balance[], rmb: number): Balance[] {
  const usdPerCny = getRate("CNY", "USD");
  return bs.map((b) =>
    b.currency === "CNY"
      ? { ...b, available: b.available + rmb, usdEq: b.usdEq + rmb * usdPerCny }
      : b,
  );
}

export function MockProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances] = useState<Balance[]>(initialBalances);
  const [funds, setFunds] = useState<SettleFund[]>(initialFunds);
  const [records, setRecords] = useState<SettleRec[]>(seedRecords);

  const recordsRef = useRef(records);
  recordsRef.current = records;
  const seqRef = useRef(43);

  // 自动推进处理中的结汇单（每 ~2.6s 一步），到账时给 CNY 余额入账
  useEffect(() => {
    const id = window.setInterval(() => {
      const recs = recordsRef.current;
      if (!recs.some((r) => r.status === "processing")) return;
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
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  const initiateSettlement: MockValue["initiateSettlement"] = ({ fundId, from, amount }) => {
    const seq = ++seqRef.current;
    const ref = `STL-20260716-${String(seq).padStart(4, "0")}`;
    const rate = getRate(from, "CNY");
    const rmb = amount * rate * (1 - 0.0025);
    const rec: SettleRec = {
      ref,
      fundId,
      from,
      amount,
      rmb,
      rate,
      stage: 0,
      status: "processing",
      declared: false,
    };
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

  const pendingUsd = funds.reduce((s, f) => s + f.usdEq, 0);
  const totalUsdEq = balances.reduce((s, b) => s + b.usdEq, 0);

  return (
    <MockCtx.Provider value={{ balances, funds, records, pendingUsd, totalUsdEq, initiateSettlement, advance }}>
      {children}
    </MockCtx.Provider>
  );
}

export function useMock() {
  const ctx = useContext(MockCtx);
  if (!ctx) throw new Error("useMock must be used within MockProvider");
  return ctx;
}
