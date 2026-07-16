# 前端设计 Skill 套件 · 跨境支付原型

为「跨境支付系统（结汇 / 发卡 / 收单）」前端原型量身准备的一组 skill。目标：**国际化审美、好看、便于多方案对比**。

## 技术与设计基线（已定）

- **技术栈**：React + Vite + Tailwind v4 + shadcn/ui + lucide-react
- **审美**：Wise 风为旗舰（亮绿 `#9FE870` / 森林绿 `#163300`），并做成 **4 套可切换主题**用于对比
- **语言**：中英双语，金额/数字强制拉丁字体，配套中西混排规范

## 四个 skill 及加载顺序

| 顺序 | Skill | 作用 | 何时读 |
|---|---|---|---|
| 1 | **`frontend-design`** | 通用设计地基：避开"一眼假"的 AI 模板脸，做有意图的取舍 | 任何页面开工前 |
| 2 | **`fintech-payment-ui`** | 支付域 UX 模式 + 4 套 fintech 审美锚点 + 双语排版；含可用的 `themes.css` | 做支付相关界面时 |
| 3 | **`design-compare`** | "多对比"工作流：一次并列产出多套方案供挑选，并落库决策 | 需要比选方案 / 定风格时 |
| 4 | **`mock-scaffold`** | React+Vite+Tailwind v4+shadcn 脚手架约定、假数据、双语与主题接入 | 搭/扩原型工程时 |

一般路径：`frontend-design`（定调）→ `fintech-payment-ui`（选锚点+域模式）→ `design-compare`（比选）→ `mock-scaffold`（落地）。

## 来源与授权

- `frontend-design` 的核心原则改写自 [Anthropic 官方 frontend-design skill](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design)，按本项目裁剪、用自己的话重写。
- 多锚点/token 锁定的思路参考 [Ilm-Alan/frontend-design](https://github.com/Ilm-Alan/frontend-design)，token 值为本项目重新挑选。
- 审美方向参考 Wise / Mercury / Ramp / Revolut / Monzo / Stripe / Linear 等公开产品。

## 安全说明

社区 skill 存在 prompt-injection / 恶意脚本风险（见 [Snyk ToxicSkills](https://snyk.io/articles/top-claude-skills-ui-ux-engineers/)）。本套件**全部为纯 Markdown/CSS 指令，无任何可执行脚本**，内容均经人工审阅后重写。引入其它第三方 skill 前，请先审 `SKILL.md` 与其捆绑脚本。
