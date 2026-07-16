/** 金额/数字格式化：始终走拉丁 en-US 分组 + 固定小数，配合 tabular-nums 使用 */
export function formatAmount(
  value: number,
  opts: { min?: number; max?: number } = {},
): string {
  const { min = 2, max = 2 } = opts;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  }).format(value);
}

/** 货币代码前置，全站统一（如 USD 1,234.56） */
export function formatMoney(value: number, currency = "USD"): string {
  return `${currency} ${formatAmount(value)}`;
}

/** 卡号脱敏 */
export function maskCard(last4: string): string {
  return `•••• ${last4}`;
}
