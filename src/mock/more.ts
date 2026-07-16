import type { PayStatus } from "./data";

// 多币种余额（示例）
export type Balance = { currency: string; available: number; pending: number; usdEq: number };
export const balances: Balance[] = [
  { currency: "USD", available: 842190.55, pending: 12400, usdEq: 854590.55 },
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
