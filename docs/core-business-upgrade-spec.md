# 三大核心业务深化规格（结汇 / 发卡 / 收单）

> 来源：团队模式 Workflow 并行调研 **14 家竞品**（Adyen · Marqeta · Checkout.com · Nium · Revolut Business · Brex · PingPong · 连连国际 · dLocal + 补研 Airwallex · Stripe · Wise · Payoneer · Ramp）→ 按业务线缺口分析 → 综合路线图。目标：把"装饰性"的三条核心业务升级为接近真实产品的可演示闭环，全部纯内存 mock、零后端、tick 驱动。

## 架构约束（cross-cutting，先行）
1. **唯一 tick 引擎**：把 store 现有单条 2600ms setInterval 扩为"遍历所有处理中集合"的通用调度器（结汇 records / 结算 batches / spotRates 抖动 / fxOrders 越线 / fxForwards M2M / 卡 authorized→cleared / rateAlerts / fraudAlert）。所有"实时/自动推进"只挂这一个 loop，禁止各起定时器。seqRef 在更新函数外自增防 StrictMode 跳号。
2. **spotRates 实时行情源**：store 新增 `spotRates`（初值 quote.ts RATES），每 tick ±0.15% 抖动；fx-ticker 组件渲染。被结汇挂单/远期 M2M/预警比价共用。
3. **共享 Timeline/Stepper + 瀑布 Row**：从 acquiring-txn-drawer 抽出，供结汇记录/远期交割/实体卡履约/卡授权清算/争议四阶段/提现链路复用。
4. **StatusBadge MAP 单点扩展**：集中登记所有新状态 → variant + i18n key + 拒绝原因/理由码文案表。
5. **near-limit 三态进度条**：within→near(≥80/90% warning)→exceeded 统一组件。结汇额度/卡限额/拒付率/卡资金油量灯复用。
6. **CSV 导出**：统一 `lib/export-csv` exportCsv，多 sheet = 多次调用、带 BOM。
7. **资金动账 helper 泛化**：creditCny/creditUsd/holdReserveBal → 通用 `creditBal(bs,currency,amt)`/`debitBal`/`holdReserve`/`release`。
8. **通用审批链件**：多级 approvals 顺序点亮 + 通过/驳回 ApprovalDrawer。结汇批量审批与发卡开卡审批共用。
9. **两段式生命周期范式**：预占 hold→最终（卡 authorized→cleared、收单 authorized→partially_captured→captured、远期 booked→drawn）+ 统一额度释放。
10. **i18n 前缀约定**：结汇 stl./fxo./fwd./recv.，发卡 iss.，收单 acq./pm./risk./recon./price./chan./payset./alert.。

## 结汇（settlement）
- **P0 F1 限价结汇单（挂单/委托锁汇）** ★最出彩：spotRates 抖动 → fxOrders(watching) 越线 triggered → 调 initiateSettlement 转五阶段闭环。`FxOrder{id,kind limit|target,targetRate,direction gte/lte,expiry,createdRate,status}`。
- **P0 F2 远期/择期结汇合约**：接管 settle-fx-dialog 失效的 forward 分支。bookForward/drawForward/terminateForward/expireForward，markToMarket 每 tick 重算。forward-drawer + 『远期合约』Tab。`booked→active→partially_drawn→settled/defaulted/cancelled`。
- **P0 F3 合规问询(RFI 补件) + 额度用尽处置**：SettleRec.status 增 `need_info`；额度 settleQuota 入 store，超额拦截 + 处置指引；额度条 ≥90% warning。
- **P1 F4 对账明细（三列对齐+双口径+CSV）** ★快赢·纯派生：initiateSettlement 补 grossRmb/spread；『对账』Tab 三列对齐 + 双口径切换 + 合计 + exportCsv。无新 action。
- **P1 F5 批量结汇 + 多级审批流**：待结汇资金复选 + 浮动操作条；createSettleBatch/approveBatch/rejectBatch；batch-approval-drawer。
- **P1 F6 多币种虚拟收款账户（本地路由）**：/app/receiving；receivingAccounts(USD ACH/GBP Sort/EUR IBAN/HKD/SGD) + simulateIncoming→前插 funds，打通『收→结汇』上游。
- **P1 F7 汇率预警 + 比价工具**：rateAlerts + armAlert/disarmAlert；rate-compare（我方报价 vs 银行现钞价）。
- **P2 F8 提现路径细分（优享/快速/加急）+ 中间行扣费透明**；**P2 F9 企业名录生命周期 + SAFE 申报凭证 + KYC 分级额度**。

## 发卡（issuing）
- **P0 F1 消费管控引擎** ★整条线地基：Card.controls{channels,mccMode allow|deny,mccList,perTxnLimit,dailyLimit,monthlyLimit,velocity{window,maxCount,resetDay},计数器}；updateCardControls + 纯函数 evaluateControls(card,{amount,mcc,channel})→{ok,reason}；card-drawer 假开关接真 + MCC 多选 + 限额 Input + 剩余额度进度条。
- **P0 F2 卡交易 授权→清算 双消息生命周期 + 拒绝原因透明化**：富 CardTxn{status authorized|cleared|declined|reversed|refunded,declineReason,auth{hold,approvedAmount}}；spendOnCard 重写为 authorizeCard()（先 evaluateControls，命中即 declined+原因）+ clearCardTxn/reverseCardTxn，tick 自动推进 cleared；卡交易列表屏 + 复用共享 Timeline/瀑布。
- **P1 F3 实体卡制卡履约 + 激活 + PIN**：CardStatus 扩 inactive；fulfillment{stage,design,address,tracking,eta}；issueCard 对 physical 走多段 setTimeout；activateCard；履约 Timeline。
- **P1 F4 卡片资金账户 + 自动充值**：topupCard/setAutoTopup；Card.fundingAccount/cardBalance/autoTopup{threshold,target}；authorizeCard 扣 cardBalance；油量灯 pushNotif。
- **P1 F5 持卡人 + 开卡审批流**：Cardholder/CardRequest；/app/cardholders；requestCard/approveCardRequest/rejectCardRequest/freezeHolderCards；复用 ApprovalDrawer。
- **P1 F6 JIT/中继实时授权（2000ms 超时兜底）**：card.jitEnabled；2000ms 倒计时决策 Dialog；resolveAuthorization。
- **P2 F7 数字钱包绑定**（provisionWallet/verifyToken）；**P2 F8 发卡侧争议**（openIssuingDispute 复用争议闭环 + provisional credit）；**P2 F9 消费方案模板 + 批量发卡**；**P2 F10 单次性/供应商专卡（用后即焚）**。

## 收单（acquiring）
- **P0 F1 本地支付方式矩阵 + 结账页多方式收单**：PaymentMethod{code,name,kind card|wallet|apm|bnpl|cash,regions,currencies,enabled,refundable,async}（~16 种子）；AcqTxn 扩 methodKind/payerCountry/dccPair；PayLink.methods；/app/payment-methods；checkout 读 enabled 方式，异步方式 PENDING→2.6s→collectLink。
- **P0 F2 风控与拒付率中心**：AcqTxn 扩 riskScore/riskRules/review/threeDS；RiskProfile{disputeRatio,threshold,tier normal|watch|restricted|suspended,rules}；/app/risk（拒付率仪表 + REVIEW 队列放行/拒绝 + 规则开关）；授权时打分 低放行/中3DS/高审核。
- **P0 F3 预授权 + 部分/多次请款 + 增额授权**：captureTxn({order,amount})；AcqTxn 扩 authAmount/capturedAmount/remainingAuth/captures/authExpiry；incrementAuth/endAuth；capture-dialog；`authorized→partially_captured→captured / voided`。
- **P1 F4 争议深化（理由码 + 举证清单 + 四阶段）**：Dispute 扩 reasonCode/category/stage chargeback|representment|pre_arb|arbitration/evidenceRequired/evidenceUploaded/network；REASON_CODES 表；escalateDispute/uploadEvidence；dispute-drawer 四阶段 Timeline + 证据清单；disputes 四类筛选 Tab。
- **P1 F5 结算与打款设置**：PayoutAccount{currency,country,last4,isDefault,status}；SettlementConfig{schedule instant|tplus|weekly|monthly,termDays,expeditedFee,sweep}；/app/settlement-settings；批次按币种路由 destAccountId。
- **P1 F6 对账中心**：ReconStatement{period,payoutIds,gross,fees,refunds,chargebacks,reserve,netPaid,empty} + Adjustment{type refund|chargeback,amount,originalOrder,deductedFromBatch}；/app/reconciliation 三级下钻 + Payout ID 勾稽 + 差异面板 + 空账期。
- **P1 F7 定价 IC++ 三段拆解**：fee.feeBreakdown{interchange,scheme,markup}；PricingPlan blended|ic_plus；FeeRule 渠道×方式×币种三元组唯一；/app/pricing。
- **P2 F8 事前预警自动止损**（FraudAlert RDR/Ethoca + AutoRule auto_refund，不计入拒付率）；**P2 F9 本地收单渠道路由 + 授权率**（AcquiringChannel local|direct|third_party + 网络令牌/RTAU）。

## 实施顺序（30 步，交错三线，快赢先行）
**阶段0 地基与快赢**：1 抽共享 Timeline/Row + StatusBadge MAP + creditBal helper · 2 收单F3 部分请款 · 3 结汇F4 对账 Tab · 4 发卡F1 消费管控引擎。
**阶段1 实时引擎与双消息**：5 tick 引擎统一化 + spotRates + fx-ticker · 6 结汇F1 限价挂单 · 7 发卡F2 授权→清算双消息 · 8 收单F2 风控中心。
**阶段2 加深闭环**：9 结汇F2 远期合约 · 10 收单F1 本地支付方式矩阵 + 多方式结账 · 11 发卡F4 卡资金账户+自动充值 · 12 结汇F3 RFI+额度用尽。
**阶段3 企业级治理**：13 收单F4 争议深化 · 14 发卡F3 实体卡履约+激活 · 15 结汇F5 批量结汇+审批 · 16 发卡F5 持卡人+开卡审批。
**阶段4 对账/定价/路由**：17 收单F7 定价IC++ · 18 收单F5 结算打款设置 · 19 收单F6 对账中心 · 20 结汇F6 虚拟收款账户 · 21 结汇F7 汇率预警+比价 · 22 发卡F6 JIT。
**阶段5 P2 长尾与观感**：23 发卡F9 方案模板+批量 · 24 发卡F10 单次/供应商卡 · 25 发卡F8 发卡侧争议 · 26 发卡F7 数字钱包 · 27 收单F8 预警止损 · 28 收单F9 渠道路由 · 29 结汇F8 提现细分 · 30 结汇F9 名录+SAFE+KYC。
