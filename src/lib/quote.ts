// 示例汇率与报价计算（mock）。以 USD 为桥计算任意币对。
export const RATES: Record<string, number> = {
  "USD/CNY": 7.182,
  "USD/EUR": 0.917,
  "USD/JPY": 156.8,
  "USD/HKD": 7.81,
  "USD/GBP": 0.787,
  "USD/SGD": 1.35,
  "USD/AUD": 1.508,
};

export const CURRENCIES = ["USD", "EUR", "GBP", "SGD", "AUD", "CNY", "JPY", "HKD"];

/** 1 单位该币种值多少 USD */
function usdPer(cur: string): number {
  if (cur === "USD") return 1;
  if (RATES[`USD/${cur}`]) return 1 / RATES[`USD/${cur}`];
  if (RATES[`${cur}/USD`]) return RATES[`${cur}/USD`];
  return 1;
}

/** from → to 的汇率（1 from = ? to） */
export function getRate(from: string, to: string): number {
  if (from === to) return 1;
  return usdPer(from) / usdPer(to);
}

export function computeQuote(pay: number, from: string, to: string) {
  const rate = getRate(from, to);
  const spread = pay * 0.0035; // 0.35% 点差
  const fee = 12; // 固定手续费（以 from 计）
  const net = Math.max(0, pay - spread - fee);
  return { rate, spread, fee, get: net * rate };
}
