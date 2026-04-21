# 有道食品经销存管理系统

> **Youdao ERP** — 面向食品/日用品行业的智能进销存管理解决方案
> 
> 设计风格：Kimi AI 科技风（深色默认 + 可切换浅色）

---

## 📖 项目简介

有道ERP是一款专为食品、日用品经销商打造的**全栈进销存管理系统**，支持：

- 📦 **商品管理** — 条码管理、分类筛选、库存预警
- 🤝 **往来单位** — 客户/供应商管理、应收应付跟踪
- 📥 **采购管理** — 采购单创建、入库确认、供应商对账
- 🛒 **销售管理** — POS 快速开单、多种支付方式、退货处理
- 🏭 **库存管理** — 实时库存查询、盘点调整、预警提醒
- 💰 **财务管理** — 应收应付、收付款记录、收支分析
- 📊 **报表分析** — 销售趋势、商品排行、利润分析、客户排行
- ⚙️ **系统设置** — 店铺信息、打印配置、主题切换

**多端支持**：PC 网页端 + Android 移动端（Capacitor）

---

## 🛠 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5 | 渐进式框架 |
| Vite | ^6.0 | 构建工具 |
| Pinia | ^2.3 | 状态管理 |
| Vue Router | ^4.5 | 路由管理 |
| Naive UI | ^2.41 | UI 组件库 |
| ECharts | ^5.6 | 图表库 |
| Capacitor | ^6.2 | 移动端打包 |

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Hono | ^4.6 | 轻量 Web 框架 |
| Drizzle ORM | ^0.38 | 类型安全 ORM |
| D1 (SQLite) | — | 无服务器数据库 |
| jose | ^5.9 | JWT 认证 |
| bcryptjs | ^2.4 | 密码哈希 |
| Zod | ^3.24 | 数据校验 |

### 部署
| 平台 | 用途 |
|------|------|
| Cloudflare Workers | 后端 API 托管 |
| Cloudflare Pages | 前端静态托管 |
| Cloudflare D1 | 数据库 |

---

## 📁 项目结构

```
youdao-erp/
├── apps/
│   └── web/                    # Vue 3 前端
│       ├── src/
│       │   ├── views/          # 页面视图（13个）
│       │   ├── layouts/        # 布局组件
│       │   ├── stores/         # Pinia 状态（auth, theme）
│       │   ├── router/         # 路由配置
│       │   ├── styles/         # 主题 & 全局样式
│       │   └── api/            # API 客户端（7个模块）
│       ├── vite.config.ts
│       └── capacitor.config.ts # Android 配置
├── server/                     # Hono 后端
│   ├── src/
│   │   ├── index.ts            # 入口 & 中间件
│   │   ├── schema/             # Drizzle ORM 数据模型
│   │   └── routes/             # API 路由（7个模块）
│   └── wrangler.toml
├── packages/
│   └── shared/                 # 前后端共享类型
├── docs/                       # 项目文档
│   ├── design/
│   │   └── ui-design-spec.md   # UI 设计规范
│   ├── API.md                  # 接口文档
│   ├── DEPLOY.md               # 部署手册
│   ├── SEED.md                 # 种子数据
│   └── IMPLEMENTATION_GUIDE.md # 实施指南
├── drizzle.config.ts           # Drizzle Kit 配置
├── package.json                # Workspace 根配置
├── pnpm-workspace.yaml         # pnpm 工作区
├── tsconfig.base.json          # TypeScript 基础配置
└── eslint.config.js            # ESLint 统一配置
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 20
- pnpm >= 9（项目已配置 `corepack`）

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置本地数据库

```bash
# 创建本地 D1 数据库（首次）
wrangler d1 create youdao-erp-db

# 应用数据库迁移
pnpm db:migrate:local
```

> 将生成的 `database_id` 填入 `server/wrangler.toml`

### 3. 启动开发服务器

```bash
# 同时启动前端 (localhost:3000) + 后端 (localhost:8787)
pnpm dev
```

前端会自动代理 `/api` 请求到后端。

### 4. 访问系统

打开 http://localhost:3000

默认账号：`admin` / `admin123`

---

## 📜 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动前端开发服务器 |
| `pnpm --filter @youdao-erp/server dev` | 单独启动后端 |
| `pnpm check` | 全项目类型检查 + ESLint |
| `pnpm build` | 构建前端 + 后端 |
| `pnpm test` | 运行测试 |
| `pnpm db:generate` | 生成数据库迁移 |
| `pnpm db:migrate:local` | 应用本地迁移 |
| `pnpm db:migrate` | 应用生产迁移 |
| `pnpm db:studio` | 启动 Drizzle Studio GUI |
| `pnpm deploy` | 部署前端 + 后端到生产 |

---

## 🔐 环境变量

### 开发环境
在 `server/.dev.vars` 中配置：

```env
JWT_SECRET=your-secret-key-here
```

### 生产环境
使用 Wrangler Secrets：

```bash
wrangler secret put JWT_SECRET
```

---

## 🎨 设计规范

详见 [docs/design/ui-design-spec.md](./design/ui-design-spec.md)

核心设计元素：
- **品牌渐变**：紫色 `#8B5CF6` → 粉色 `#EC4899`
- **深色模式**：默认主题，支持一键切换浅色
- **字体**：Outfit + Noto Sans SC
- **圆角**：12px-16px 大圆角卡片
- **动效**：页面过渡、按钮悬停发光、库存预警脉冲

---

## 📚 相关文档

| 文档 | 内容 |
|------|------|
| [API.md](./API.md) | 完整接口文档（含 Request/Response 示例） |
| [DEPLOY.md](./DEPLOY.md) | 生产环境部署操作手册 |
| [SEED.md](./SEED.md) | 数据库种子数据说明 |
| [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | 项目实施路线图 |
| [design/ui-design-spec.md](./design/ui-design-spec.md) | UI 视觉设计规范 |

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feat/xxx`
3. 提交代码：`git commit -m "feat: xxx"`
4. 推送分支：`git push origin feat/xxx`
5. 创建 Pull Request

代码规范：
- 使用 `pnpm check` 确保类型和 ESLint 通过
- 遵循现有代码风格
- Vue 组件使用 `<script setup lang="ts">`

---

## 📄 开源协议

MIT License

---

> 有道ERP — 让食品经销更智能
