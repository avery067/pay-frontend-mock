// 全部为原型示例数据（SAMPLE）。金额/汇率取真实合理值以便演示，实体名一眼可辨为示例。

export type PayStatus = "settled" | "processing" | "pending" | "failed";
export type CardStatus = "active" | "frozen";

export type Settlement = {
  ref: string;
  from: string;
  to: string;
  pay: number;
  get: number;
  rate: number;
  spread: number;
  fee: number;
  corridor: string;
  recipient: string;
  purpose: string;
  status: PayStatus;
  created: string;
};

export const settlements: Settlement[] = [
  { ref: "STL-20260716-0042", from: "USD", to: "CNY", pay: 10000, get: 71676.86, rate: 7.182, spread: 25.14, fee: 12, corridor: "US → CN", recipient: "Acme Inc.（示例）", purpose: "货款 Goods", status: "settled", created: "07-16 09:24" },
  { ref: "STL-20260716-0041", from: "USD", to: "EUR", pay: 24000, get: 22008.0, rate: 0.917, spread: 61.2, fee: 18, corridor: "US → EU", recipient: "Globex GmbH（示例）", purpose: "服务费 Service", status: "processing", created: "07-16 08:57" },
  { ref: "STL-20260716-0039", from: "SGD", to: "CNY", pay: 8000, get: 42560.0, rate: 5.32, spread: 21.3, fee: 9, corridor: "SG → CN", recipient: "示例商户 001", purpose: "货款 Goods", status: "settled", created: "07-16 08:30" },
  { ref: "STL-20260715-0088", from: "USD", to: "JPY", pay: 15000, get: 2352000, rate: 156.8, spread: 47.0, fee: 15, corridor: "US → JP", recipient: "Contoso KK（示例）", purpose: "采购 Purchase", status: "pending", created: "07-15 17:12" },
  { ref: "STL-20260715-0071", from: "GBP", to: "CNY", pay: 6000, get: 54810.0, rate: 9.135, spread: 16.5, fee: 8, corridor: "UK → CN", recipient: "示例网店", purpose: "退款 Refund", status: "failed", created: "07-15 15:03" },
];

export type Card = {
  id: string;
  name: string;
  type: "virtual" | "physical";
  brand: string;
  last4: string;
  currency: string;
  limit: number;
  spent: number;
  status: CardStatus;
};

export const cards: Card[] = [
  { id: "c1", name: "市场投放卡", type: "virtual", brand: "Visa", last4: "4242", currency: "USD", limit: 20000, spent: 12480, status: "active" },
  { id: "c2", name: "SaaS 订阅卡", type: "virtual", brand: "Mastercard", last4: "5100", currency: "USD", limit: 5000, spent: 3260.5, status: "active" },
  { id: "c3", name: "差旅实体卡", type: "physical", brand: "Visa", last4: "8817", currency: "EUR", limit: 10000, spent: 1890, status: "frozen" },
  { id: "c4", name: "供应商付款卡", type: "virtual", brand: "Mastercard", last4: "3390", currency: "USD", limit: 50000, spent: 41200, status: "active" },
];

export type AcquiringTxn = {
  order: string;
  merchant: string;
  method: string;
  gross: number;
  fee: number;
  net: number;
  status: PayStatus;
  time: string;
};

export const acquiringTxns: AcquiringTxn[] = [
  { order: "OD-88231", merchant: "Acme Inc.（示例）", method: "Visa •••• 4242", gross: 1200, fee: 34.8, net: 1165.2, status: "settled", time: "09:24" },
  { order: "OD-88230", merchant: "示例商户 001", method: "Alipay", gross: 3450, fee: 20.7, net: 3429.3, status: "processing", time: "09:12" },
  { order: "OD-88229", merchant: "Globex（示例）", method: "Mastercard •••• 5100", gross: 880, fee: 25.5, net: 854.5, status: "settled", time: "08:57" },
  { order: "OD-88228", merchant: "Contoso（示例）", method: "SEPA", gross: 12000, fee: 24, net: 11976, status: "pending", time: "08:30" },
  { order: "OD-88227", merchant: "示例网店", method: "WeChat Pay", gross: 220, fee: 1.3, net: 218.7, status: "failed", time: "08:02" },
  { order: "OD-88226", merchant: "Initech（示例）", method: "Visa •••• 7788", gross: 5400, fee: 156.6, net: 5243.4, status: "settled", time: "07:41" },
];

export const payouts = [
  { batch: "PO-20260717", date: "T+1 · 07-17", amount: 84250, status: "pending" as PayStatus },
  { batch: "PO-20260718", date: "T+2 · 07-18", amount: 32120.5, status: "pending" as PayStatus },
  { batch: "PO-20260723", date: "T+7 · 07-23", amount: 128900, status: "pending" as PayStatus },
];

export const notifications = [
  { id: "n1", type: "success", zh: "结汇 STL-…0042 已到账", en: "Settlement STL-…0042 has arrived", time: "09:25" },
  { id: "n2", type: "warning", zh: "差旅实体卡触发地区限制", en: "Travel card hit a region limit", time: "08:48" },
  { id: "n3", type: "info", zh: "结算批次 PO-20260717 已生成", en: "Payout batch PO-20260717 created", time: "07:30" },
  { id: "n4", type: "warning", zh: "订单 OD-88231 收到拒付争议", en: "Chargeback opened on order OD-88231", time: "07-15" },
  { id: "n5", type: "success", zh: "市场投放卡 开卡成功", en: "Card “Marketing” issued", time: "07-15" },
  { id: "n6", type: "info", zh: "企业认证（KYB）已通过", en: "Business verification (KYB) approved", time: "07-14" },
];

// FX 行情条（示例）
export const fxTicker = [
  { pair: "USD / CNY", rate: "7.1820", up: true },
  { pair: "EUR / CNY", rate: "7.8240", up: false },
  { pair: "USD / EUR", rate: "0.9170", up: true },
  { pair: "GBP / CNY", rate: "9.1350", up: true },
  { pair: "USD / JPY", rate: "156.80", up: false },
  { pair: "SGD / CNY", rate: "5.3200", up: true },
  { pair: "USD / HKD", rate: "7.8100", up: false },
  { pair: "AUD / CNY", rate: "4.7600", up: true },
];

export const networks = ["Visa", "Mastercard", "UnionPay", "Amex", "SEPA", "Alipay", "WeChat Pay", "Swift"];
