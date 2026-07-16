---
name: mock-scaffold
description: 前端原型脚手架约定。搭建或扩展本项目原型工程时使用——规定 React + Vite + Tailwind v4 + shadcn/ui 技术栈、目录结构、多主题接入（themes.css + ThemeSwitcher）、中英双语 i18n、假数据规范（一眼可辨示例）、以及原型路由与质量底线。
---

# Mock Scaffold（原型脚手架约定）

搭/扩跨境支付原型工程时读它。技术栈已定：**React + Vite + Tailwind v4 + shadcn/ui + lucide-react + recharts**。

## 一、初始化命令

```bash
pnpm create vite@latest . --template react-ts
pnpm add -D tailwindcss @tailwindcss/vite
pnpm add lucide-react recharts clsx tailwind-merge class-variance-authority
pnpm dlx shadcn@latest init            # 选 CSS variables 方案
# 字体（双语）：拉丁自托管，CJK 走系统/自托管
pnpm add @fontsource-variable/inter @fontsource/geist-mono
```

`vite.config.ts` 挂 `@tailwindcss/vite` 插件；`src/index.css`：
```css
@import "tailwindcss";
@import "./styles/themes.css";   /* ← 从 fintech-payment-ui skill 复制 themes.css 到此 */
@import "@fontsource-variable/inter";
@import "@fontsource/geist-mono";
```

> **关键**：直接复用 `fintech-payment-ui/themes.css`，别自己重写一套 token。shadcn 组件默认吃这些语义变量。

## 二、目录结构

```
src/
├── main.tsx  App.tsx
├── index.css                 # 引 tailwind + themes.css + 字体
├── styles/themes.css         # ← 复制自 fintech-payment-ui skill
├── components/
│   ├── ui/                   # shadcn 生成的原子组件
│   ├── theme/ThemeSwitcher.tsx
│   └── pay/                  # 业务组件：QuoteCard / CardVisual / TxnTable …
├── pages/
│   ├── settlement/           # 结汇
│   ├── issuing/              # 发卡
│   ├── acquiring/            # 收单
│   ├── compare/              # 多方案对比页（配合 design-compare）
│   └── gallery/              # 组件画廊/design tokens 预览
├── mock/                     # 假数据（见第五节）
├── i18n/                     # zh / en 词典（见第四节）
└── lib/format.ts             # 金额/日期/币种格式化
docs/DESIGN.md                # 设计决策记录（见 design-compare skill）
```

## 三、多主题接入（可实时切换对比）

`ThemeSwitcher` 改 `<html>` 的 `data-theme` 与 `dark` class，并存 `localStorage`：

```tsx
type Theme = "wise" | "mercury" | "revolut" | "stripe";
function applyTheme(theme: Theme, dark: boolean) {
  const el = document.documentElement;
  el.setAttribute("data-theme", theme);
  el.classList.toggle("dark", dark);
  localStorage.setItem("theme", theme);
  localStorage.setItem("dark", String(dark));
}
```
默认 `data-theme="wise"`。对比页放一个可见的主题切换器，方便一键翻 4 套。

## 四、双语 i18n

- 轻量方案：`src/i18n/{zh,en}.ts` 导出词典 + 一个 `t(key)` hook；复杂再上 `i18next`。
- **所有可见文案走词典**，别硬编码中文在 JSX 里。
- 数字/金额/日期用 `lib/format.ts`，不进 i18n（它们跨语言一致，走拉丁 + `tabular-nums`）。
- 遵守 `fintech-payment-ui/typography-bilingual.md`：CJK–拉丁间空隙、真字重、行高。

## 五、假数据规范（一眼可辨示例，不冒充真实）

- 放 `src/mock/`，用**明显是示例**的实体名：`Acme（示例）`、`示例商户 001`、`demo@example.com`。
- 金额/汇率**真实合理**（USD→CNY ≈ 7.18，费率 0.3–1%），让界面可信；但整体标注 SAMPLE，别伪造"实时遥测/真实用户"。
- 空槽宁可留空，别为填满而编造（见 `frontend-design` 内容纪律）。
- 需要请求态时用 MSW 或静态 fixtures 模拟延迟/失败，练空/错/载三态。

## 六、质量底线（每个页面）
- 响应式下探移动端；键盘焦点可见；`prefers-reduced-motion` 已在 `themes.css` 尊重；深色模式可用。
- 金额 `tabular-nums`；状态色走语义 token；无假"安全"文案；敏感信息脱敏。
- 交付前对照 `fintech-payment-ui/SKILL.md` 的发货清单自查。

## 七、原型页面清单（建议）
结汇：报价/下单、结算时间线、回执 · 发卡：卡片墙、开卡流程、卡详情/额度 · 收单：商户仪表盘、交易表、对账/清算 · 通用：登录/KYC、组件画廊、`/compare` 对比页。
