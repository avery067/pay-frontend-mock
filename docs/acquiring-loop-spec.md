# 收单业务闭环 · 落地实现规格

> 面向 `src/pages/console/payments.tsx`（收单 `/app/payments`）与 `src/mock/store.tsx`（`useMock`）。
> 目标：把收单从**静态假数据**升级为与结汇 / 发卡同级的**实时资金闭环**——
> 收款交易 → 待结算池（扣手续费与储备金）→ 结算批次（T+N）→ 打款（即时 / 按账期）→ 商户 USD 余额 `available` 入账 → 实时联动余额页 / 概览。
>
> 约束：不引入后端 / 新框架；沿用现有 store 模式（`useState` + `useRef` 镜像 + `setInterval` 自动推进 + 手动 `advance` 动作 + `creditCny` 式入账）、命名（camelCase 动作、`acq.*` 点号 i18n）、`<StatusBadge>` 语义映射、金额 `tabular-nums` + `formatMoney`。

---

## 一、竞品要点小结

| 竞品 | 交易状态机 | 结算 / 账期 | 储备金 | 打款到余额 | 对账 |
|---|---|---|---|---|---|
| **Airwallex** | PaymentIntent（订单唯一真相源）+ 多次 Attempt；REQUIRES_CAPTURE→SUCCEEDED | 净额结算，按币种成批，默认日终跑批；T+N 由支付方式决定 | rolling / delayed / fixed 三类，reserved 桶到期批量释放 available；「较长者规则」 | **原生多币种闭环钱包**：收 USD 即入 USD 余额，结算即打款/发卡余额 | 逐笔「金额/费用/储备/净额」四列 + Batch ID 串联明细↔批次 |
| **Stripe** | PaymentIntent：requires_capture→succeeded；partial/multi capture、增额授权、到期兜底 | 每币种 pending / available 双余额，`available_on` 转可用；payout schedule≠结算速度 | rolling(FIFO 到期释放) / fixed，Balance 页 Reserve 面板 | 每个 automatic payout = 一个结算批次；**Instant Payout**（1.5%、约 30 分钟） | payout reconciliation report：批次→逐笔，Summary/Itemized 双导出 |
| **Adyen** | **Payment lifecycle 时间轴**（Received→Authorised→SentForSettle→Settled，按 Journal type 逐条） | **Sales-day 批次**：一销售日 capture 聚为一个 net 批次，2 小时后关批，T+N | rolling reserve（ReserveAdjustment），Balance Overview 多桶 | 多桶余额（Pending / On the way / Reserve / Deposit）；On-demand & Instant payout（选优先级） | Settlement details report（批次级 + 交易级 journal） |
| **Payoneer** | 双码模型 status+interaction；交易时间线 授权→charged→sent for settlement→paid out | T+2 快速结算，净额入多币种余额 | rolling reserve，交易详情逐笔显示扣留 | 净额入统一余额中枢→提现/发卡/刷卡；自动提现排期 | 逐笔经济账瀑布：毛额→费用→储备→净额 + 换汇率 |
| **PingPong** | paymentType(SALE/AUTH)+status 组合；captureDelayHours(0/-1/N)、预授权 VOID | T+N / 每周 / 每月三种账期 | Reserve(滚动)+Deposit(固定) 双保证金 | 净额入余额→提现出金 | **9-sheet 结算报表**（Settlement/Purchase/Refund/Chargeback/Reserve/Deposit/Withdrawal/…） |
| **Lianlian** | PI/WP→PS→结算；Webhook 幂等重推 | T+14 结算，美国 ACH 可 T+1 | 循环保证金约 10%×180 天 | 多通道即时打款（FPS/RTGS 近实时）、提现锁汇「0 汇损」 | 明细 + 批次业务对账文件 + 月账单三件套 |

**横向提炼（本原型直接采纳）**
1. **两层生命周期**：交易级（授权→请款）+ 批次级（入批→结算→打款→入账），批次驱动 T+N —— 对应 Adyen sales-day、Stripe automatic_payout。
2. **四列净额可追溯**：`gross / fee / reserve / net` 逐笔与批次一屏钩稽 —— Airwallex / Stripe / PingPong 一致好评点。
3. **available / reserved 双桶余额**：储备金单列，到期 reserved→available 释放 —— Airwallex / Stripe / Adyen。
4. **即时打款差异化**：一键 30 分钟到账、收 1.5% 费、立即入 USD available —— Stripe / Adyen / Lianlian。
5. **生命周期时间轴 UX**：交易详情竖向状态机（复用结汇 `Timeline`）—— Adyen 招牌。

---

## 二、生命周期状态机（lifecycle）

**happy path（6 阶段，交易 `stage` 0–5 驱动竖向时间轴）**

```
authorized ─▶ captured ─▶ in_batch ─▶ settling ─▶ paid_out ─▶ credited
 已授权       已请款       已入批       结算中       已打款       已入账
```

| # | 阶段 | 触发 | 改动的 state |
|---|---|---|---|
| 0 | `authorized` 已授权 | 预授权占用资金（`captureMode:"manual"`），未请款 | 交易入表，`status:"authorized"` |
| 1 | `captured` 已请款 | 自动（`auto`）或手动 `captureTxn` | 扣 `fee`、预扣 `reserve`，`net=gross−fee−reserve` 进**待结算池** |
| 2 | `in_batch` 已入批 | 归入当销售日的 T+N 结算批次 | 写 `batchId`；批次 `gross/fee/reserve/net` 累加 |
| 3 | `settling` 结算中 | 批次到账期，锁批清算 | 批次 `status:"settling"` |
| 4 | `paid_out` 已打款 | 生成 `PayoutRecord` 向 USD 余额发起打款 | payout `in_transit` |
| 5 | `credited` 已入账 | 打款到账 | **USD `available += net`**、`usdEq += net`；`reserve` 转入 `reserved` 桶；联动余额页/概览 |

**分支态（不在 6 节点主线，用于 StatusBadge 与动作可用性）**
- `voided` 已撤销：`authorized` 未请款时 `voidTxn` 撤销 / 授权过期。
- `refunded` 已退款：`captured`–`credited` 间 `refundTxn`；已入账则冲减 USD `available`，未打款则冲减批次 `net`。
- `disputed` 争议中：拒付，从下一批次借记（联动现有 `disputes` 页）。
- `failed` 失败：授权/请款失败。

**储备金旁路（独立于主线，另有释放时间轴）**
```
reserve 预扣(captured) ─▶ reserved 桶(credited) ─▶ 到期 releaseReserve ─▶ available
```

---

## 三、数据模型（dataModel）

新增/扩展放 `src/mock/more.ts`（类型 + 种子）与 `src/mock/store.tsx`（运行态）。种子实体名一眼可辨为示例，金额取合理值。

```ts
// 1) 扩展 Balance：新增 reserved 桶（可选，默认 0）—— available/pending/reserved 三桶
export type Balance = { currency: string; available: number; pending: number; reserved?: number; usdEq: number };

// 2) 收单交易（store 运行态，取代静态 acquiringTxns；沿用 order/merchant/method/gross/fee/net/time）
export type AcqStage = 0 | 1 | 2 | 3 | 4 | 5;
export type AcqStatus =
  | "authorized" | "captured" | "in_batch" | "settling" | "paid_out" | "credited"
  | "voided" | "refunded" | "disputed" | "failed";
export type AcqTxn = {
  order: string; merchant: string; method: string; currency: string; // 受理币种
  gross: number; fee: number; reserve: number; net: number;           // 四列：net = gross − fee − reserve
  captureMode: "auto" | "manual";
  stage: AcqStage; status: AcqStatus;
  batchId?: string;            // 归属结算批次
  reserveReleaseOn?: string;   // 该笔储备金释放日
  time: string;
};

// 3) 结算批次（T+N；Adyen sales-day 语义）
export type BatchStatus = "scheduled" | "settling" | "paid_out" | "credited";
export type SettlementBatch = {
  id: string;                  // PO-YYYYMMDD
  currency: string;            // 结算币种，默认 USD
  saleDate: string;            // 销售日
  payoutDate: string;          // 账期到账日（T+N 展示）
  termDays: number;            // N
  gross: number; fee: number; reserve: number; net: number; // 批次四列净额 = Σ 交易
  txnOrders: string[];         // 批次内交易 order[]
  status: BatchStatus;
  instant: boolean;            // 是否走即时打款
};

// 4) 打款记录
export type PayoutRecord = {
  id: string;                  // PAY-YYYYMMDD-NN
  batchId: string;
  amount: number;              // 实到 USD（即时打款已扣 instantFee）
  currency: string;
  method: "standard" | "instant";
  fee: number;                 // 即时打款费（standard=0）
  status: "in_transit" | "paid";
  arrivedAt?: string;
};

// 5) 储备金留存（reserved 桶→available 释放）
export type ReserveHold = {
  id: string;                  // RSV-…
  batchId: string; amount: number; currency: string;
  heldOn: string; releaseOn: string; released: boolean;
};
```

种子：约 8–10 笔 `acqTxns`（覆盖 authorized/captured/in_batch/credited/refunded/disputed 各态）、3 个 `settlementBatches`（复用现有 `PO-20260717 / 18 / 23`，补 gross/fee/reserve/net + termDays 1/2/7）、1–2 条 `payoutRecords`、2 条 `reserveHolds`（一条 30 天后释放、一条已释放）。

---

## 四、store 动作与推进机制（storeActions）

**新增到 `MockValue` 的 state**：`acqTxns`、`batches`、`payoutRecords`、`reserves`；镜像 `acqTxnsRef` / `batchesRef`；`poSeqRef`。
**派生值**：`pendingPoolUsd`（Σ 未入账批次 net）、`reservedUsd`（Σ 未释放 reserve）、`instantAvailableUsd`（Σ 可即时打款批次 net）。

**入账辅助（镜像 `creditCny`）**
```ts
const creditUsd = (bs, amt) => bs.map(b => b.currency === "USD"
  ? { ...b, available: b.available + amt, usdEq: b.usdEq + amt } : b);
const holdReserveBal = (bs, amt) => bs.map(b => b.currency === "USD"
  ? { ...b, reserved: (b.reserved ?? 0) + amt } : b);           // reserve 入 reserved 桶
const releaseReserveBal = (bs, amt) => bs.map(b => b.currency === "USD"
  ? { ...b, reserved: Math.max(0,(b.reserved ?? 0)-amt), available: b.available+amt, usdEq: b.usdEq+amt } : b);
```

| 动作 | 行为 & 改动的 state |
|---|---|
| `captureTxn(order)` | `authorized`→`captured`：算 `fee/reserve/net`，交易入**待结算池**；改 `acqTxns`。 |
| `voidTxn(order)` | `authorized`→`voided`（撤销/过期解冻）；改 `acqTxns`。 |
| `refundTxn({order, amount})` | 冲正：已 `credited` 则 `setBalances(creditUsd(bs, −amount))`；未打款则冲减所属批次 `net`；交易→`refunded`。RefundDialog 提交调它（替换纯 toast）。 |
| `advanceBatch(batchId)` | 手动「推进一步（示例）」：`scheduled`→`settling`→`paid_out`→`credited`。到 `paid_out` 生成 `PayoutRecord(standard,in_transit)`；到 `credited`→`setBalances(creditUsd(net))` + `holdReserveBal(reserve)` + payout `paid`，批次内交易 `stage=5/status=credited`。 |
| `instantPayout(batchId)` | 即时打款差异化：任意未打款批次立即 `credited`，`fee=max(net*0.015, 0.5)`，`setBalances(creditUsd(net−fee))`，生成 `PayoutRecord(instant)`；批次 `instant:true`。 |
| `releaseReserve(reserveId)` | 到期释放：`setBalances(releaseReserveBal(amount))`，`reserve.released=true`。 |

**自动推进（`setInterval`，复用 2.6s 节奏，仿现有 records effect）**
```ts
useEffect(() => {
  const id = window.setInterval(() => {
    // A. 推进任一非终态批次一步（scheduled→settling→paid_out→credited），到 credited 走 creditUsd + holdReserveBal
    // B. 扫描 reserves：releaseOn ≤ today 且未释放 → releaseReserveBal（reserved→available）
    // 无可推进项则直接 return（同现有 records 守卫）
  }, 2600);
  return () => window.clearInterval(id);
}, []);
```
即：**批次到账即给 USD `available` 入账**，`totalUsdEq`/balances 变化被余额页与概览实时读取；储备金到期自动从 `reserved` 回流 `available`。手动 `advanceBatch` / `instantPayout` 与之等价，供演示即时看到效果。

---

## 五、UI 改动（uiChanges）

**收单页 `payments.tsx`（改为读 `useMock`，KPI 动态化）**
- KPI：`今日交易额`(Σgross)｜`待结算池`(pendingPoolUsd)｜`储备金占款`(reservedUsd) 新增｜`可即时打款`(instantAvailableUsd) 新增。
- 交易 Tab：`status` 列换成 `<StatusBadge>` 展示新生命周期态；行内对 `authorized` 提供「请款 / 撤销」按钮（调 `captureTxn/voidTxn`）；净额列旁补 `reserve` 小字。
- 结算 Tab（批次）：四列 `gross/fee/reserve/net` + `账期(T+N · 日期)` + `<StatusBadge>`；每个未打款批次一枚「即时打款」按钮（`instantPayout`）；上方加「待结算池」汇总卡。
- 新增 储备金 卡/子 Tab：`reserved` 总额 + 释放时间轴（reserved→available，逐条 `releaseOn`），到期项「释放」按钮。

**交易详情抽屉 `acquiring-txn-drawer.tsx`（增强）**
- 竖向 **生命周期 Timeline**（授权→请款→入批→结算→打款→入账），直接复用 `settle-record-drawer.tsx` 的 `Timeline`（传 `stage/status`）。
- 净额**瀑布**：`gross → −fee → −reserve → net` 四行（新增 reserve 行）；显示 `batchId` 跳转 + 储备金释放日。
- 按阶段出动作：`authorized`→请款/撤销；`captured`+→退款（RefundDialog 接 `refundTxn`）。

**结算抽屉 `payout-drawer.tsx`（增强）**
- 批次头部四列 `gross/fee/reserve/net`（取代单一 `batchTotal`）。
- 明细列真实 `batch.txnOrders`（不再 `acquiringTxns.slice(0,4)`），每笔展示 net。
- 加批次 Timeline + `PayoutRecord`（method 标准/即时、in_transit/paid、到账时间）。
- 底部：未打款→「即时打款 / 推进一步」；CSV 用 `exportCsv` 导出真实批次交易并含 `reserve` 列。

**概览 `overview.tsx` / 余额页 `balances.tsx`（联动）**
- 概览「即将结算」卡改读 store `batches`；批次 `credited` 后 USD 余额跳变即时反映在概览总额与余额页。
- 余额页 USD 卡在 `available` 下补 `储备 reserved` 小字（>0 时）；沿用现有 `pending` 展示模式。
- 批次入账时 `toast` + 可选写入 `notifications`（「结算批次 … 已入账」）。

---

## 六、竞品启发新特性（newFeatures，按优先级）

**high**
- 交易生命周期时间轴（Adyen Payment lifecycle）：复用现成 `Timeline`，把 6 阶段状态机可视化，成本极低、信息密度高。
- 结算批次四列对账 `gross/fee/reserve/net` + 批次内真实交易 + CSV（Airwallex/Stripe/PingPong 最获好评的明细↔批次可追溯）。
- 即时打款 Instant Payout（Stripe/Adyen/Lianlian）：一键 30 分钟到账 + 1.5% 费，立即入 USD `available`，是区别于 T+N 的增值亮点。
- 储备金可视化（Airwallex/Stripe reserve 面板）：reserved 占款 + 到期释放时间轴，讲清「钱为什么没到、几号释放」。
- Auth-Capture 手动请款 + 预授权撤销/到期（Stripe/Airwallex/PingPong）：让状态机可交互，贴合押金/预售场景。

**med**
- available/pending/reserved 三桶余额概览（Adyen Balance Overview）：扩 Balance 类型即可。
- 待结算池汇总 + T+N 到账预估「较长者规则」（reserve vs 账期取长者）。
- 争议联动资金（拒付从下一批次借记 / 申诉回补），打通现有 `disputes` 页与批次 net。
- 净额瀑布图（Payoneer 逐笔经济账）。

**low**
- Sales-day 结算引擎语义标签（批次 = 销售日 + 2 小时关批 + T+N）。
- Like-for-like 多币种结算 + 不支持币种回落 fallback（按币种分批）。
- 对账报表 zip（多 sheet / 多 CSV，仿 PingPong 9-sheet、Airwallex 4 文件）。

---

## 七、实现步骤（implementationSteps）

1. **数据模型**：`more.ts` 给 `Balance` 加 `reserved?`；新增 `AcqTxn/SettlementBatch/PayoutRecord/ReserveHold` 类型与种子（含各生命周期态）。
2. **store 状态**：`store.tsx` 加 `acqTxns/batches/payoutRecords/reserves` 的 `useState` + `useRef` 镜像 + `poSeqRef`。
3. **入账辅助**：加 `creditUsd/holdReserveBal/releaseReserveBal`（镜像 `creditCny`）。
4. **动作**：实现 `captureTxn/voidTxn/refundTxn/advanceBatch/instantPayout/releaseReserve`，挂进 `MockValue` 与 Provider value。
5. **自动推进**：加 `setInterval` effect（2.6s）推进非终态批次并在 `credited` 入账 USD、扫描到期储备金释放；派生 `pendingPoolUsd/reservedUsd/instantAvailableUsd`。
6. **i18n**：`zh.ts`/`en.ts` 的 `acq.*` 补：生命周期步骤、批次/储备/即时打款/请款/撤销词条；`status.*` 补新态文案（双语对齐）。
7. **StatusBadge**：`status-badge.tsx` 的 `MAP` 补 `authorized/captured/in_batch/scheduled/settling/paid_out/credited/refunded/voided/disputed` → variant。
8. **收单页**：`payments.tsx` 改读 `useMock`，KPI 动态化，交易 Tab 加请款/撤销行内动作，结算 Tab 四列 + 即时打款，加储备金卡/子 Tab。
9. **交易抽屉**：`acquiring-txn-drawer.tsx` 接生命周期 Timeline + 四行瀑布 + 阶段动作，RefundDialog 接 `refundTxn`。
10. **结算抽屉**：`payout-drawer.tsx` 四列头 + 真实批次交易 + PayoutRecord/Timeline + 即时/推进按钮 + CSV 含 reserve。
11. **联动**：`overview.tsx` 即将结算卡与总额、`balances.tsx` USD reserved 小字接 store；批次入账 toast/notification。
12. **验证**：`pnpm dev` 走查 请款→入批→即时打款/自动推进→USD `available` 跳变，确认余额页 / 概览实时联动，储备金到期释放回 available。

---

## 附录 · StatusBadge 语义映射建议

| status | variant | i18n key |
|---|---|---|
| authorized | info | `status.authorized` 已授权 |
| captured | warning | `status.captured` 已请款 |
| in_batch / scheduled | warning / info | `status.inBatch` 已入批 / `status.scheduled` 待结算 |
| settling | warning | `status.settling` 结算中 |
| paid_out | info | `status.paidOut` 已打款 |
| credited | success | `status.credited` 已入账 |
| refunded | info | `status.refunded` 已退款 |
| voided | info | `status.voided` 已撤销 |
| disputed | danger | `status.disputed` 争议中 |
| failed | danger | `status.failed` 失败 |
