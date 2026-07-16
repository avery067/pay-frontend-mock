# 中英双语混排规范（去土气 · 保洋气）

配合 `SKILL.md` / `themes.css` 使用。**"国外感"垮掉的头号原因就是 CJK 排版没处理好**——这份规范专治。

## 一、字体栈：拉丁在前，汉字回退

`themes.css` 已定义。原理：**把拉丁字体放在字体栈最前**，浏览器对每个字符按栈回退——ASCII 数字/字母命中 `Inter`，汉字落到 `PingFang SC` / `Source Han Sans SC`。于是数字、单位、代码天然是洋气的 Inter，中文是干净的黑体。

```css
--font-body:    "Inter", "PingFang SC", "Source Han Sans SC", system-ui, sans-serif;
--font-display: "Inter Tight", "Inter", "PingFang SC", "Source Han Sans SC", sans-serif;
--font-mono:    "Geist Mono", "JetBrains Mono", ui-monospace, monospace;
```

- **别用微软雅黑 / 宋体当主字体**——是"土"的最大来源。优先 `PingFang SC`（macOS/iOS）、`Source Han Sans SC / 思源黑体`（跨平台自托管）。
- Windows 无苹方，思源黑体需**自托管**（否则回退到雅黑）。前台建议 `@font-face` 引 `Source Han Sans SC` 的 Regular/Medium 子集。
- 拉丁 `Inter` / `Inter Tight` 用 fontsource 或自托管；`Geist Mono` 用于金额/编号/代码。

## 二、金额、数字、单位、日期 → 一律拉丁 + 等宽
- 用 `.amount` / `.tnum`（`themes.css` 已配 `tabular-nums`）。表格里金额、数量、百分比、日期都加，保证纵向对齐、不跳动。
- 货币代码/单位（USD、CNY、%、bps）跟数字同属拉丁，别让它们掉进中文字体。

## 三、CJK 与拉丁之间加"盘古之白"
中文与英文/数字紧贴会显脏。在两者间插入**窄空隙**（约 0.15–0.25em）：

```css
/* 简易做法：给混排容器加字距级微调，或在构建期用 pangu.js 自动插空格 */
.bilingual { word-spacing: 0.05em; }
/* 更精细：用 <span class="latin"> 包裹拉丁段，margin-inline: 0.15em */
```
- 推荐构建/渲染期用 **pangu** 类库自动在 CJK–拉丁间插空格；或人工在文案里留半角空格：`余额 1,200 USD` 写作 `余额 1,200 USD`。
- 标点用**全角中文标点**（，。：；），但引号内的英文短语用半角；中英混排的括号跟随主语言。

## 四、行高、字距、字重（CJK 的三条铁律）
1. **行高更松**：CJK 正文 `line-height: 1.6–1.75`（纯拉丁可 1.4–1.5）。CJK 字面大、无升降部，太挤会糊。
2. **字距要小心**：拉丁 display 可用负字距（`letter-spacing: -0.02em`）显精致；**CJK 绝不加负字距**（会粘连），需要时用 0 或极小正值。给混排标题时，把负字距只作用在拉丁 span 上。
3. **字重别 faux-bold**：CJK 加粗要用真字重（思源黑体 有 Regular/Medium/Bold/Heavy）。浏览器合成的伪粗体（`font-weight:bold` 但字体无该字重）会发虚发脏。前台正文用 Regular，强调用 Medium，标题用 Semibold/Bold 对应的真字重。

## 五、字号阶梯（双语通用建议）
| 角色 | 拉丁 | CJK 配合 | 用途 |
|---|---|---|---|
| Display | 40–72 / 紧字距 / Inter Tight | 同号或略小、行高 1.2–1.3 | Hero 数字、大标题 |
| H1–H3 | 20–32 | 行高 1.3–1.4，Medium/Semibold | 区块标题 |
| Body | 14–16 | 行高 1.6–1.75，Regular | 正文 |
| Caption/Data | 12–13 | `tabular-nums`，`--muted-foreground` | 说明、表格、时间戳 |

- 移动端正文不小于 14px，金额/关键信息不小于 16px。
- 一屏内字号层级 ≤ 4–5 级，避免"字号大杂烩"。

## 六、去土气总检查
- [ ] 数字/金额/单位/日期都是拉丁 + `tabular-nums`，没掉进中文字体。
- [ ] 主字体是苹方/思源，不是雅黑/宋体。
- [ ] CJK 无负字距、无 faux-bold；正文行高 ≥ 1.6。
- [ ] CJK 与拉丁/数字之间有空隙（盘古之白）。
- [ ] 标点为全角中文标点（除非英文短语内）。
- [ ] 留白充足，别把 CJK 挤满整行；一屏字号层级克制。
