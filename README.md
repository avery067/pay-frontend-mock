# pay-frontend-mock

跨境支付系统（**结汇 · 发卡 · 收单**）前端原型 mock。目标：国际化审美、好看、便于多方案对比。

## 技术与设计基线

- **技术栈**：React + Vite + Tailwind v4 + shadcn/ui + lucide-react + recharts
- **审美**：Wise 风旗舰（亮绿 `#9FE870` / 森林绿 `#163300`），并做成 **4 套可切换主题**用于对比
  （Wise / Mercury·Ramp / Revolut·Monzo / Stripe·Linear）
- **语言**：中英双语，金额/数字强制拉丁字体 + `tabular-nums`

## 设计规范（Claude Code Skills）

设计规范以 skill 形式内置在 [`.claude/skills/`](.claude/skills/)，详见 [套件说明](.claude/skills/README.md)：

| Skill | 作用 |
|---|---|
| `frontend-design` | 通用设计地基，避开"一眼假"的 AI 模板脸 |
| `fintech-payment-ui` | 支付域 UX 模式 + 4 套审美锚点（含可用的 `themes.css`）+ 双语排版 |
| `design-compare` | "多对比"工作流：并列产出多套方案供挑选 |
| `mock-scaffold` | React+Vite+Tailwind+shadcn 脚手架、假数据、主题接入约定 |

## 状态

🚧 原型搭建中。当前已完成设计 skill 套件；下一步初始化前端工程（见 `mock-scaffold`）。
