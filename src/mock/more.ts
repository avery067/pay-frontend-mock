import type { PayStatus } from "./data";

// 多币种余额（示例）
export type Balance = { currency: string; available: number; pending: number; usdEq: number; reserved?: number };
export const balances: Balance[] = [
  { currency: "USD", available: 842190.55, pending: 12400, reserved: 1252, usdEq: 855842.55 },
  { currency: "CNY", available: 1288650.0, pending: 45000, usdEq: 185700.0 },
  { currency: "EUR", available: 210480.0, pending: 3200, usdEq: 232900.0 },
  { currency: "GBP", available: 54200.0, pending: 0, usdEq: 68870.0 },
  { currency: "HKD", available: 320900.0, pending: 8000, usdEq: 42110.0 },
  { currency: "SGD", available: 96750.0, pending: 1500, usdEq: 72760.0 },
];
export const totalUsdEq = balances.reduce((s, b) => s + b.usdEq, 0);

// 收款人（受益人）
export type Recipient = { id: string; name: string; account: string; country: string; currency: string };
export const recipients: Recipient[] = [
  { id: "r1", name: "Acme Inc.（示例）", account: "•••• 4021", country: "US", currency: "USD" },
  { id: "r2", name: "Globex GmbH（示例）", account: "DE •• 8842", country: "DE", currency: "EUR" },
  { id: "r3", name: "示例商户 001", account: "•••• 6610", country: "CN", currency: "CNY" },
  { id: "r4", name: "Contoso KK（示例）", account: "JP •• 2093", country: "JP", currency: "JPY" },
  { id: "r5", name: "Initech Ltd.（示例）", account: "GB •• 5567", country: "GB", currency: "GBP" },
];

// 统一台账（所有资金流）
export type LedgerType = "payment" | "payout" | "convert" | "card" | "refund";
export type LedgerTxn = {
  id: string;
  type: LedgerType;
  desc: string;
  dir: "in" | "out";
  amount: number;
  currency: string;
  status: PayStatus;
  date: string;
  live?: boolean;
};
export const ledger: LedgerTxn[] = [
  { id: "TX-90231", type: "payment", desc: "Acme Inc.（示例）", dir: "in", amount: 1200, currency: "USD", status: "settled", date: "07-16 09:24" },
  { id: "TX-90230", type: "payment", desc: "示例商户 001", dir: "in", amount: 3450, currency: "USD", status: "processing", date: "07-16 09:12" },
  { id: "TX-90229", type: "convert", desc: "USD → CNY", dir: "out", amount: 10000, currency: "USD", status: "settled", date: "07-16 09:05" },
  { id: "TX-90228", type: "payout", desc: "Globex GmbH（示例）", dir: "out", amount: 24000, currency: "EUR", status: "processing", date: "07-16 08:41" },
  { id: "TX-90227", type: "card", desc: "AWS（示例）· 市场投放卡", dir: "out", amount: 1280.4, currency: "USD", status: "settled", date: "07-16 08:22" },
  { id: "TX-90226", type: "payment", desc: "Contoso（示例）", dir: "in", amount: 12000, currency: "USD", status: "pending", date: "07-16 08:30" },
  { id: "TX-90225", type: "refund", desc: "示例网店 · 退款", dir: "out", amount: 220, currency: "USD", status: "failed", date: "07-16 08:02" },
  { id: "TX-90224", type: "payout", desc: "示例商户 001", dir: "out", amount: 42560, currency: "CNY", status: "settled", date: "07-15 17:10" },
  { id: "TX-90223", type: "card", desc: "Figma（示例）· SaaS 订阅卡", dir: "out", amount: 45, currency: "USD", status: "settled", date: "07-15 16:03" },
  { id: "TX-90222", type: "payment", desc: "Initech（示例）", dir: "in", amount: 5400, currency: "USD", status: "settled", date: "07-15 14:41" },
];

// 报表：交易额趋势（近 14 天，示例）
export const volumeSeries = [
  { d: "07-03", v: 68000 }, { d: "07-04", v: 72400 }, { d: "07-05", v: 61200 },
  { d: "07-06", v: 83900 }, { d: "07-07", v: 91500 }, { d: "07-08", v: 87200 },
  { d: "07-09", v: 96800 }, { d: "07-10", v: 102400 }, { d: "07-11", v: 88600 },
  { d: "07-12", v: 94100 }, { d: "07-13", v: 108900 }, { d: "07-14", v: 121500 },
  { d: "07-15", v: 116300 }, { d: "07-16", v: 128450 },
];

// 报表：支付方式占比（示例）
export const methodBreakdown = [
  { name: "Visa", value: 42 },
  { name: "Mastercard", value: 31 },
  { name: "Alipay", value: 14 },
  { name: "SEPA", value: 8 },
  { name: "Others", value: 5 },
];

// 报表：通道分布（示例）
export const corridorVolume = [
  { name: "US → CN", v: 452000 },
  { name: "US → EU", v: 318000 },
  { name: "SG → CN", v: 214000 },
  { name: "UK → CN", v: 176000 },
  { name: "US → JP", v: 132000 },
];

// B2B 结汇：待核查账户中的待结汇资金（示例）
export type SettleFund = {
  id: string;
  source: string;
  currency: string;
  amount: number;
  usdEq: number;
  arrived: string;
  tradeVerified: boolean;
};
export const settleFunds: SettleFund[] = [
  { id: "SF-77012", source: "Acme Inc.（示例）", currency: "USD", amount: 48200, usdEq: 48200, arrived: "07-16", tradeVerified: true },
  { id: "SF-77008", source: "Globex GmbH（示例）", currency: "EUR", amount: 21500, usdEq: 23450, arrived: "07-15", tradeVerified: true },
  { id: "SF-77003", source: "Initech Ltd.（示例）", currency: "GBP", amount: 12800, usdEq: 16270, arrived: "07-15", tradeVerified: false },
  { id: "SF-76991", source: "Contoso KK（示例）", currency: "JPY", amount: 3600000, usdEq: 22960, arrived: "07-14", tradeVerified: true },
];

// 多币种虚拟收款账户（本地清算路由）：收款方可按本地方式直汇，省中间行转汇与扣费；模拟入账打通“收→结汇”上游
export type ReceivingAccount = {
  id: string;
  currency: string;
  holder: string;
  bankName: string;
  localFields: { label: string; value: string }[];
  local: boolean;
};
export const receivingAccountsSeed: ReceivingAccount[] = [
  {
    id: "RA-1001",
    currency: "USD",
    holder: "示例商户 001",
    bankName: "Meridian Bank N.A.（示例）",
    localFields: [
      { label: "ACH Routing Number", value: "026073150" },
      { label: "Account Number", value: "8801234567" },
    ],
    local: true,
  },
  {
    id: "RA-1002",
    currency: "GBP",
    holder: "示例商户 001",
    bankName: "Meridian Bank UK Ltd.（示例）",
    localFields: [
      { label: "Sort Code", value: "04-00-75" },
      { label: "Account Number", value: "31926819" },
    ],
    local: true,
  },
  {
    id: "RA-1003",
    currency: "EUR",
    holder: "示例商户 001",
    bankName: "Meridian Europe SA（示例）",
    localFields: [
      { label: "IBAN", value: "BE71 9670 1234 5678" },
      { label: "BIC / SWIFT", value: "MRDNBEBB" },
    ],
    local: true,
  },
  {
    id: "RA-1004",
    currency: "HKD",
    holder: "示例商户 001",
    bankName: "Meridian Bank (HK) Ltd.（示例）",
    localFields: [
      { label: "Bank Code", value: "015" },
      { label: "Account Number", value: "816-542931-001" },
    ],
    local: true,
  },
  {
    id: "RA-1005",
    currency: "SGD",
    holder: "示例商户 001",
    bankName: "Meridian Bank Asia Pte Ltd.（示例）",
    localFields: [
      { label: "SWIFT Code", value: "MRDNSGSG" },
      { label: "Account Number", value: "701-039284-6" },
    ],
    local: true,
  },
];

// ── 提现路径细分：优享 / 快速 / 加急，中间行扣费透明（结汇 P2-F8）──
export type WithdrawChannel = "preferred" | "fast" | "express";
export type WithdrawChannelInfo = {
  key: WithdrawChannel;
  etaZh: string;
  etaEn: string;
  /** 费率徽标文案（百分比，语言无关） */
  feeLabel: string;
  /** 加急费率：按提现金额计提，叠加在中间行扣费之上 */
  rate: number;
};
export const WITHDRAW_CHANNELS: WithdrawChannelInfo[] = [
  { key: "preferred", etaZh: "1–2 个工作日", etaEn: "1–2 business days", feeLabel: "0%", rate: 0 },
  { key: "fast", etaZh: "当日到账（工作时间内）", etaEn: "Same-day (business hours)", feeLabel: "0.10%", rate: 0.001 },
  { key: "express", etaZh: "实时到账 · 7×24", etaEn: "Real-time · 24/7", feeLabel: "0.50%", rate: 0.005 },
];

/** 中间行逐跳扣费示例（国际电汇途经中转行，每跳固定扣费）：到手 = 提现金额 − 各跳扣费 − 加急费 */
export type WithdrawHop = { bank: string; deduct: number; label: string };
export const WITHDRAW_HOPS: WithdrawHop[] = [
  { bank: "中转行 A", deduct: 15, label: "SWIFT 手续费" },
  { bank: "中转行 B", deduct: 8, label: "电报费" },
];

/** 通用多级审批步骤 */
export type ApprovalStep = { role: string; done: boolean };
/** 批量结汇批次（超阈值需多级审批） */
export type SettleBatch = {
  id: string;
  fundIds: string[];
  count: number;
  totalUsd: number;
  status: "pending_approval" | "approved" | "rejected" | "done";
  approvals: ApprovalStep[];
  created: string;
};
export const settleBatchesSeed: SettleBatch[] = [
  { id: "BSTL-3301", fundIds: [], count: 4, totalUsd: 186400, status: "pending_approval", approvals: [{ role: "财务复核", done: true }, { role: "合规审批", done: false }], created: "07-16" },
];

/** 持卡人 + 开卡审批 */
export type Cardholder = { id: string; name: string; email: string; dept: string; status: "active" | "disabled" };
export const cardholdersSeed: Cardholder[] = [
  { id: "H-201", name: "Alex Chen（示例）", email: "alex@example.com", dept: "市场部", status: "active" },
  { id: "H-202", name: "Sam Lee（示例）", email: "sam@example.com", dept: "运营部", status: "active" },
  { id: "H-203", name: "Jordan Wu（示例）", email: "jordan@example.com", dept: "采购部", status: "active" },
];
export type CardRequest = {
  id: string;
  holderId: string;
  holderName: string;
  cardName: string;
  limit: number;
  status: "pending_approval" | "approved" | "rejected";
  approvals: ApprovalStep[];
  created: string;
};
export const cardRequestsSeed: CardRequest[] = [
  { id: "CR-4410", holderId: "H-203", holderName: "Jordan Wu（示例）", cardName: "采购专用卡", limit: 15000, status: "pending_approval", approvals: [{ role: "部门主管", done: true }, { role: "财务审批", done: false }], created: "07-16" },
];
export const settlePendingUsd = settleFunds.reduce((s, f) => s + f.usdEq, 0);

// 结汇记录（示例）
export type SettleRecord = {
  ref: string;
  from: string;
  amount: number;
  rmb: number;
  rate: number;
  declared: boolean;
  status: PayStatus;
  date: string;
};

/** 限价结汇委托（挂单锁汇）：外币越过目标价自动触发结汇 */
export type FxOrder = {
  id: string;
  from: string;
  amount: number;
  targetRate: number;
  direction: "gte" | "lte";
  createdRate: number;
  expiry: string;
  status: "watching" | "triggered" | "cancelled" | "expired";
};
export const fxOrdersSeed: FxOrder[] = [
  { id: "FXO-1042", from: "USD", amount: 50000, targetRate: 7.19, direction: "gte", createdRate: 7.182, expiry: "GTC", status: "watching" },
  { id: "FXO-1039", from: "EUR", amount: 20000, targetRate: 7.85, direction: "gte", createdRate: 7.836, expiry: "GTC", status: "watching" },
  { id: "FXO-1031", from: "GBP", amount: 12000, targetRate: 9.05, direction: "gte", createdRate: 9.124, expiry: "2026-07-31", status: "triggered" },
];

/** 远期/择期结汇合约：锁定未来结汇汇率对冲；flexible 可窗口内分批交割 */
export type FxForward = {
  id: string;
  from: string;
  notional: number;
  lockedRate: number;
  kind: "fixed" | "flexible";
  termLabel: string;
  drawn: number;
  status: "active" | "partially_drawn" | "settled" | "cancelled";
};
export const fxForwardsSeed: FxForward[] = [
  { id: "FWD-2041", from: "USD", notional: 200000, lockedRate: 7.21, kind: "fixed", termLabel: "T+90 · 到期 10-14", drawn: 0, status: "active" },
  { id: "FWD-2038", from: "EUR", notional: 80000, lockedRate: 7.88, kind: "flexible", termLabel: "择期窗口 30 天", drawn: 30000, status: "partially_drawn" },
];
export const settleRecords: SettleRecord[] = [
  { ref: "STL-20260716-0042", from: "USD", amount: 10000, rmb: 71482.45, rate: 7.182, declared: true, status: "settled", date: "07-16 09:24" },
  { ref: "STL-20260715-0031", from: "EUR", amount: 8000, rmb: 62592.0, rate: 7.824, declared: true, status: "settled", date: "07-15 16:10" },
  { ref: "STL-20260715-0022", from: "USD", amount: 15000, rmb: 107235.0, rate: 7.182, declared: false, status: "processing", date: "07-15 11:03" },
  { ref: "STL-20260715-0019", from: "GBP", amount: 6000, rmb: 54810.0, rate: 9.135, declared: false, status: "failed", date: "07-15 15:03" },
];

// 年度便利化额度（RMB，示例）
export const settleQuota = { usedRmb: 22_400_000, totalRmb: 35_000_000 };

// 收款链接（示例）
export type PayLink = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  type: "once" | "reuse";
  status: "active" | "paid";
  created: string;
  slug: string;
  methods?: string[];
};
export const paymentLinks: PayLink[] = [
  { id: "PL-3021", name: "订阅费 Pro（示例）", amount: 299, currency: "USD", type: "reuse", status: "active", created: "07-14", slug: "pro" },
  { id: "PL-3018", name: "定金 · 订单 8842（示例）", amount: 1500, currency: "USD", type: "once", status: "paid", created: "07-12", slug: "dep-8842" },
  { id: "PL-3010", name: "设计服务费（示例）", amount: 800, currency: "EUR", type: "once", status: "active", created: "07-10", slug: "design" },
];

// 争议 / 拒付（示例）
export type DisputeStage = "chargeback" | "representment" | "pre_arb" | "arbitration";
export type DisputeCategory = "duty" | "not_received" | "not_as_described" | "other";
export type Dispute = {
  id: string;
  order: string;
  reason: "fraud" | "product" | "dup";
  amount: number;
  currency: string;
  status: "need" | "review" | "won" | "lost";
  deadline: string;
  date: string;
  stage?: DisputeStage;
  evidenceUploaded?: string[];
};
/** 卡组织理由码 → 归一化类别 + 所需举证清单（示例） */
export const REASON_CODES: Record<string, { code: string; network: string; category: DisputeCategory; docs: { zh: string; en: string }[] }> = {
  fraud: { code: "10.4", network: "Visa", category: "duty", docs: [{ zh: "AVS / CVV 验证结果", en: "AVS / CVV result" }, { zh: "3DS 认证记录", en: "3DS authentication" }, { zh: "历史交易记录", en: "Prior transaction history" }] },
  product: { code: "13.3", network: "Visa", category: "not_as_described", docs: [{ zh: "商品 / 服务描述", en: "Item / service description" }, { zh: "发货与签收凭证", en: "Proof of delivery" }, { zh: "服务条款", en: "Terms of service" }] },
  dup: { code: "12.6.1", network: "Mastercard", category: "other", docs: [{ zh: "两笔交易凭证", en: "Both transaction records" }, { zh: "退款证明（如已退）", en: "Refund proof (if any)" }] },
};
export const disputes: Dispute[] = [
  { id: "DP-5521", order: "OD-88231", reason: "fraud", amount: 1200, currency: "USD", status: "need", deadline: "07-20", date: "07-16", stage: "chargeback", evidenceUploaded: [] },
  { id: "DP-5510", order: "OD-88190", reason: "product", amount: 640, currency: "USD", status: "lost", deadline: "07-18", date: "07-14", stage: "representment", evidenceUploaded: ["商品 / 服务描述"] },
  { id: "DP-5498", order: "OD-88102", reason: "dup", amount: 220, currency: "USD", status: "won", deadline: "07-10", date: "07-08", stage: "representment", evidenceUploaded: [] },
];

// 月度对账单（示例）
export type Statement = { period: string; txns: number; volume: number; fees: number; net: number };
export const statements: Statement[] = [
  { period: "2026-06", txns: 1284, volume: 3820500, fees: 41200, net: 3779300 },
  { period: "2026-05", txns: 1156, volume: 3210400, fees: 35600, net: 3174800 },
  { period: "2026-04", txns: 998, volume: 2740900, fees: 30100, net: 2710800 },
];

// ── 收单闭环（acquiring）：交易生命周期 + 结算批次 + 打款 + 储备金 ──
export type AcqStatus =
  | "authorized" | "partially_captured" | "captured" | "in_batch" | "settling" | "paid_out" | "credited"
  | "voided" | "refunded" | "disputed" | "failed" | "review";
export type CaptureRecord = { id: string; amount: number };
export type AcqTxn = {
  order: string;
  merchant: string;
  method: string;
  gross: number;
  fee: number;
  reserve: number;
  net: number;
  currency: string;
  captureMode: "auto" | "manual";
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  status: AcqStatus;
  time: string;
  batchId?: string;
  // 预授权 / 部分请款
  authAmount?: number;
  capturedAmount?: number;
  captures?: CaptureRecord[];
  // 风控
  riskScore?: number;
  riskRules?: string[];
  threeDS?: "none" | "frictionless" | "challenged";
  // 本地支付方式
  methodKind?: MethodKind;
  payerCountry?: string;
  // 定价透明：Interchange++ 三段拆解（发卡行手续费 / 卡组织费 / 我方加价），三段之和 = fee
  feeBreakdown?: { interchange: number; scheme: number; markup: number };
};
export const acqTxnsSeed: AcqTxn[] = [
  { order: "OD-88234", merchant: "Hooli（示例）", method: "Visa •••• 0198", gross: 4200, fee: 121.8, reserve: 0, net: 4078.2, currency: "USD", captureMode: "manual", stage: 0, status: "review", time: "09:31", riskScore: 82, riskRules: ["velocity", "geoMismatch"], feeBreakdown: { interchange: 73.08, scheme: 18.27, markup: 30.45 } },
  { order: "OD-88233", merchant: "Vandelay（示例）", method: "Mastercard •••• 7741", gross: 980, fee: 28.4, reserve: 0, net: 951.6, currency: "USD", captureMode: "auto", stage: 0, status: "review", time: "09:18", riskScore: 66, riskRules: ["newDevice"], feeBreakdown: { interchange: 17.04, scheme: 4.26, markup: 7.10 } },
  { order: "OD-88231", merchant: "Contoso（示例）", method: "Visa •••• 4242", gross: 12000, fee: 348, reserve: 0, net: 11652, currency: "USD", captureMode: "manual", stage: 0, status: "authorized", time: "09:24", riskScore: 24, threeDS: "frictionless", feeBreakdown: { interchange: 208.80, scheme: 52.20, markup: 87.00 } },
  { order: "OD-88230", merchant: "Umbrella（示例）", method: "Mastercard •••• 5100", gross: 2600, fee: 75.4, reserve: 0, net: 2524.6, currency: "USD", captureMode: "manual", stage: 0, status: "authorized", time: "09:12", riskScore: 51, threeDS: "challenged", feeBreakdown: { interchange: 45.24, scheme: 11.31, markup: 18.85 } },
  { order: "OD-88229", merchant: "Acme Inc.（示例）", method: "Visa •••• 4242", gross: 1200, fee: 34.8, reserve: 0, net: 1165.2, currency: "USD", captureMode: "auto", stage: 1, status: "captured", time: "08:57", feeBreakdown: { interchange: 20.88, scheme: 5.22, markup: 8.70 } },
  { order: "OD-88228", merchant: "示例商户 001", method: "Alipay", gross: 3450, fee: 20.7, reserve: 0, net: 3429.3, currency: "USD", captureMode: "auto", stage: 1, status: "captured", time: "08:30", feeBreakdown: { interchange: 12.42, scheme: 3.11, markup: 5.17 } },
  { order: "OD-88227", merchant: "Globex（示例）", method: "Mastercard •••• 5100", gross: 880, fee: 25.5, reserve: 70.4, net: 784.1, currency: "USD", captureMode: "auto", stage: 2, status: "in_batch", batchId: "PO-20260718", time: "08:02", feeBreakdown: { interchange: 15.30, scheme: 3.83, markup: 6.37 } },
  { order: "OD-88226", merchant: "Stark Ind.（示例）", method: "Amex •••• 1004", gross: 9800, fee: 284.2, reserve: 0, net: 9515.8, currency: "USD", captureMode: "auto", stage: 3, status: "settling", batchId: "PO-20260717", time: "07:41", feeBreakdown: { interchange: 170.52, scheme: 42.63, markup: 71.05 } },
  { order: "OD-88225", merchant: "示例网店", method: "WeChat Pay", gross: 220, fee: 1.3, reserve: 0, net: 218.7, currency: "USD", captureMode: "auto", stage: 0, status: "refunded", time: "07:20", feeBreakdown: { interchange: 0.78, scheme: 0.20, markup: 0.32 } },
  { order: "OD-88224", merchant: "Wayne Co.（示例）", method: "Visa •••• 9002", gross: 640, fee: 18.6, reserve: 0, net: 621.4, currency: "USD", captureMode: "auto", stage: 0, status: "disputed", time: "06:40", feeBreakdown: { interchange: 11.16, scheme: 2.79, markup: 4.65 } },
  { order: "OD-88220", merchant: "Initech（示例）", method: "Visa •••• 7788", gross: 5400, fee: 156.6, reserve: 432, net: 4811.4, currency: "USD", captureMode: "auto", stage: 5, status: "credited", batchId: "PO-20260710", time: "昨日", feeBreakdown: { interchange: 93.96, scheme: 23.49, markup: 39.15 } },
];

// 定价方案：拆分定价 blended（统一费率）vs Interchange++ 分层定价（interchange + scheme 透传 + 我方 markup）
export type PricingModel = "blended" | "ic_plus";
export type PricingPlan = { model: PricingModel; percent: number; fixed: number };
export const pricingPlanSeed: PricingPlan = { model: "blended", percent: 2.9, fixed: 0.3 };

// IC+ 加价费率规则：渠道 × 支付方式 × 币种 唯一，用于按维度自定义 markup（固定费 + 比例 bps）
export type FeeChannel = "online" | "pos" | "link" | "moto";
export type FeeRule = { id: string; channel: FeeChannel; method: string; currency: string; fixed: number; rateBps: number };
export const feeRulesSeed: FeeRule[] = [
  { id: "FR-01", channel: "online", method: "Visa", currency: "USD", fixed: 0.10, rateBps: 20 },
  { id: "FR-02", channel: "online", method: "Mastercard", currency: "USD", fixed: 0.10, rateBps: 25 },
  { id: "FR-03", channel: "online", method: "Alipay", currency: "USD", fixed: 0.05, rateBps: 15 },
];

// 风控规则（示例）：开关即刻影响新交易打分演示
export type RiskRule = { id: string; zh: string; en: string; on: boolean };
export const riskRulesSeed: RiskRule[] = [
  { id: "velocity", zh: "速度规则（同卡短时高频拦截）", en: "Velocity (burst on same card)", on: true },
  { id: "geoMismatch", zh: "一致性规则（IP 与卡国不符）", en: "Consistency (IP vs card country)", on: true },
  { id: "dynamic3ds", zh: "动态 3DS（高风险触发挑战验证）", en: "Dynamic 3DS (challenge on high risk)", on: true },
  { id: "newDevice", zh: "新设备加验", en: "New-device step-up", on: false },
  { id: "highTicket", zh: "大额人工复核（≥ $5,000）", en: "High-ticket manual review (≥ $5,000)", on: true },
];
// 拒付率画像（示例）
export type RiskProfile = { disputeRatio: number; threshold: number };
export const riskProfileSeed: RiskProfile = { disputeRatio: 0.72, threshold: 0.9 };

// 本地支付方式矩阵（示例）：卡 / 钱包 / APM / BNPL / 现金码
export type MethodKind = "card" | "wallet" | "apm" | "bnpl" | "cash";
export type PaymentMethod = {
  code: string;
  name: string;
  kind: MethodKind;
  regions: string[];
  currencies: string[];
  enabled: boolean;
  refundable: boolean;
  async: boolean;
};
export const paymentMethodsSeed: PaymentMethod[] = [
  { code: "visa", name: "Visa", kind: "card", regions: ["全球"], currencies: ["USD", "EUR", "CNY"], enabled: true, refundable: true, async: false },
  { code: "mastercard", name: "Mastercard", kind: "card", regions: ["全球"], currencies: ["USD", "EUR", "CNY"], enabled: true, refundable: true, async: false },
  { code: "amex", name: "American Express", kind: "card", regions: ["US", "EU"], currencies: ["USD", "EUR"], enabled: true, refundable: true, async: false },
  { code: "unionpay", name: "UnionPay 银联", kind: "card", regions: ["CN", "APAC"], currencies: ["CNY", "HKD"], enabled: false, refundable: true, async: false },
  { code: "applepay", name: "Apple Pay", kind: "wallet", regions: ["全球"], currencies: ["USD", "EUR", "GBP"], enabled: true, refundable: true, async: false },
  { code: "googlepay", name: "Google Pay", kind: "wallet", regions: ["全球"], currencies: ["USD", "EUR", "GBP"], enabled: true, refundable: true, async: false },
  { code: "alipay", name: "支付宝 Alipay", kind: "wallet", regions: ["CN", "APAC"], currencies: ["CNY", "USD"], enabled: true, refundable: true, async: false },
  { code: "wechat", name: "微信支付 WeChat Pay", kind: "wallet", regions: ["CN", "APAC"], currencies: ["CNY", "USD"], enabled: true, refundable: true, async: false },
  { code: "grabpay", name: "GrabPay", kind: "wallet", regions: ["SG", "MY", "APAC"], currencies: ["SGD", "MYR"], enabled: false, refundable: true, async: false },
  { code: "ideal", name: "iDEAL", kind: "apm", regions: ["NL"], currencies: ["EUR"], enabled: true, refundable: true, async: true },
  { code: "sepa", name: "SEPA Direct Debit", kind: "apm", regions: ["EU"], currencies: ["EUR"], enabled: true, refundable: true, async: true },
  { code: "fpx", name: "FPX", kind: "apm", regions: ["MY"], currencies: ["MYR"], enabled: false, refundable: false, async: true },
  { code: "paynow", name: "PayNow", kind: "apm", regions: ["SG"], currencies: ["SGD"], enabled: false, refundable: false, async: true },
  { code: "klarna", name: "Klarna", kind: "bnpl", regions: ["US", "EU"], currencies: ["USD", "EUR"], enabled: false, refundable: true, async: true },
  { code: "afterpay", name: "Afterpay", kind: "bnpl", regions: ["US", "AU"], currencies: ["USD", "AUD"], enabled: false, refundable: true, async: true },
  { code: "boleto", name: "Boleto", kind: "cash", regions: ["BR"], currencies: ["BRL"], enabled: false, refundable: false, async: true },
  { code: "pix", name: "PIX", kind: "cash", regions: ["BR"], currencies: ["BRL"], enabled: true, refundable: true, async: true },
  { code: "oxxo", name: "OXXO", kind: "cash", regions: ["MX"], currencies: ["MXN"], enabled: false, refundable: false, async: true },
];

export type BatchStatus = "scheduled" | "settling" | "paid_out" | "credited";
export type SettlementBatch = {
  id: string;
  currency: string;
  saleDate: string;
  payoutDate: string;
  termDays: number;
  gross: number;
  fee: number;
  reserve: number;
  net: number;
  txnOrders: string[];
  status: BatchStatus;
  instant: boolean;
};
export const batchesSeed: SettlementBatch[] = [
  { id: "PO-20260717", currency: "USD", saleDate: "07-16", payoutDate: "07-17", termDays: 1, gross: 9800, fee: 284.2, reserve: 0, net: 9515.8, txnOrders: ["OD-88226"], status: "scheduled", instant: false },
  { id: "PO-20260718", currency: "USD", saleDate: "07-16", payoutDate: "07-18", termDays: 2, gross: 880, fee: 25.5, reserve: 70.4, net: 784.1, txnOrders: ["OD-88227"], status: "scheduled", instant: false },
  { id: "PO-20260723", currency: "USD", saleDate: "07-15", payoutDate: "07-23", termDays: 7, gross: 128900, fee: 3867, reserve: 0, net: 125033, txnOrders: [], status: "scheduled", instant: false },
];

export type PayoutRecord = {
  id: string;
  batchId: string;
  amount: number;
  currency: string;
  method: "standard" | "instant";
  fee: number;
  status: "in_transit" | "paid";
};
export const payoutRecordsSeed: PayoutRecord[] = [
  { id: "PAY-20260710-01", batchId: "PO-20260710", amount: 4811.4, currency: "USD", method: "standard", fee: 0, status: "paid" },
];

export type ReserveHold = {
  id: string;
  batchId: string;
  amount: number;
  currency: string;
  heldOn: string;
  releaseOn: string;
  released: boolean;
};
export const reservesSeed: ReserveHold[] = [
  { id: "RSV-0007", batchId: "PO-20260710", amount: 432, currency: "USD", heldOn: "07-10", releaseOn: "08-09", released: false },
  { id: "RSV-0005", batchId: "PO-20260620", amount: 820, currency: "USD", heldOn: "06-20", releaseOn: "07-20", released: false },
];

// ── 对账中心：账期对账单 → 打款批次（Payout ID）→ 逐笔交易 三级下钻 ──
/** 打款批次明细（对账口径，独立于收单在途 batches，覆盖历史已完结批次） */
export type ReconPayout = {
  id: string; // Payout ID
  batchId: string;
  payoutDate: string;
  gross: number;
  fees: number;
  reserve: number;
  net: number;
  txns: { order: string; merchant: string; gross: number; fee: number; reserve: number; net: number }[];
};
export const reconPayoutsSeed: ReconPayout[] = [
  {
    id: "PAY-20260710-01", batchId: "PO-20260710", payoutDate: "07-10", gross: 5400, fees: 156.6, reserve: 432, net: 4811.4,
    txns: [{ order: "OD-88220", merchant: "Initech（示例）", gross: 5400, fee: 156.6, reserve: 432, net: 4811.4 }],
  },
  {
    id: "PAY-20260612-01", batchId: "PO-20260612", payoutDate: "06-12", gross: 3450, fees: 100.1, reserve: 0, net: 3349.9,
    txns: [{ order: "OD-87920", merchant: "示例网店", gross: 3450, fee: 100.1, reserve: 0, net: 3349.9 }],
  },
  {
    id: "PAY-20260610-01", batchId: "PO-20260610", payoutDate: "06-10", gross: 2840, fees: 82.4, reserve: 0, net: 2757.6,
    txns: [
      { order: "OD-87905", merchant: "Acme Inc.（示例）", gross: 2200, fee: 63.8, reserve: 0, net: 2136.2 },
      { order: "OD-87890", merchant: "Wayne Co.（示例）", gross: 640, fee: 18.6, reserve: 0, net: 621.4 },
    ],
  },
  {
    id: "PAY-20260405-01", batchId: "PO-20260405", payoutDate: "04-05", gross: 24100, fees: 698.9, reserve: 0, net: 23401.1,
    txns: [
      { order: "OD-86210", merchant: "Umbrella（示例）", gross: 15200, fee: 440.8, reserve: 0, net: 14759.2 },
      { order: "OD-86188", merchant: "Hooli（示例）", gross: 8900, fee: 258.1, reserve: 0, net: 8641.9 },
    ],
  },
];

/** 对账单（账期级）：周期汇总 + 勾稽（毛额 − 手续费 − 退款 − 拒付 − 储备 = 净打款） */
export type ReconStatement = {
  period: string;
  payoutIds: string[];
  gross: number;
  fees: number;
  refunds: number;
  chargebacks: number;
  reserve: number;
  netPaid: number;
  empty: boolean;
};
export const reconStatementsSeed: ReconStatement[] = [
  { period: "2026-07", payoutIds: ["PAY-20260710-01"], gross: 5400, fees: 156.6, refunds: 0, chargebacks: 0, reserve: 432, netPaid: 4811.4, empty: false },
  { period: "2026-06", payoutIds: ["PAY-20260612-01", "PAY-20260610-01"], gross: 6290, fees: 182.5, refunds: 0, chargebacks: 0, reserve: 0, netPaid: 6107.5, empty: false },
  { period: "2026-05", payoutIds: [], gross: 0, fees: 0, refunds: 0, chargebacks: 0, reserve: 0, netPaid: 0, empty: true },
  { period: "2026-04", payoutIds: ["PAY-20260405-01"], gross: 24100, fees: 698.9, refunds: 356, chargebacks: 0, reserve: 0, netPaid: 23045.1, empty: false },
];

/** 差异：打款后发生的退款 / 拒付倒扣，标明将从哪个后续批次扣减 */
export type Adjustment = {
  id: string;
  type: "refund" | "chargeback";
  amount: number;
  originalOrder: string;
  deductedFromBatch: string;
};
export const adjustmentsSeed: Adjustment[] = [
  { id: "ADJ-9001", type: "refund", amount: 220, originalOrder: "OD-87905", deductedFromBatch: "PO-20260718" },
  { id: "ADJ-9002", type: "chargeback", amount: 640, originalOrder: "OD-87890", deductedFromBatch: "PO-20260723" },
];
