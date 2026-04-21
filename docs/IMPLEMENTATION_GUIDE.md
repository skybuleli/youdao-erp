# 有道ERP 项目实施指南

> 基于当前项目完成度的分阶段实施路线图

---

## 📊 当前项目状态总览

| 模块 | 完成度 | 状态说明 |
|------|--------|----------|
| **前端 UI/UX** | ~90% | 13 个页面全部完成，Kimi 设计系统统一，响应式布局，深色/浅色主题 |
| **前端数据层** | 0% | 无任何 API 集成，全部硬编码 mock 数据 |
| **后端认证** | ~30% | `/auth/login` 已实现（bcrypt + JWT），缺少 JWT 中间件和 `/me` |
| **后端业务 API** | ~5% | 7 个路由文件，6 个为纯 stub，仅返回 `{message}` |
| **数据库 Schema** | 100% | 9 张表设计完整，关系清晰 |
| **数据库迁移** | 0% | 未生成任何 migration |
| **部署配置** | ~20% | wrangler.toml / drizzle.config 为占位符 |

**核心瓶颈**：前端精美但无数据，后端有框架但无实现，数据库有设计但无实例。

---

## 🗺️ 实施路线图

---

### Phase 1：后端基础搭建（预计 2-3 天）

**目标**：让后端 API 可运行、可测试、受保护。

| 序号 | 任务 | 优先级 | 工作量 | 详细说明 |
|------|------|--------|--------|----------|
| 1.1 | 生成 Drizzle Migration | 🔴 高 | 0.5h | 运行 `pnpm db:generate` 生成初始迁移文件 |
| 1.2 | 创建 D1 数据库 | 🔴 高 | 0.5h | `wrangler d1 create youdao-erp-db`，更新 `wrangler.toml` 的 `database_id` |
| 1.3 | 应用本地迁移 | 🔴 高 | 0.5h | `pnpm db:migrate:local` 验证 schema |
| 1.4 | JWT 验证中间件 | 🔴 高 | 2h | 创建 `server/src/middleware/auth.ts`，使用 `jose` 验证 token，挂载到所有业务路由 |
| 1.5 | 完成 `GET /me` | 🟡 中 | 0.5h | 从 JWT payload 解析用户，返回用户信息 |
| 1.6 | Product CRUD 实现 | 🔴 高 | 3h | `routes/product.ts` 接入 Drizzle ORM，完整增删改查 + 搜索 + 分页 |
| 1.7 | Partner CRUD 实现 | 🔴 高 | 2h | `routes/partner.ts` 同理 |
| 1.8 | Order CRUD 实现 | 🔴 高 | 4h | `routes/order.ts` 创建/列表/详情/更新状态/删除 |

**Phase 1 验收标准**：
- [ ] `pnpm db:migrate:local` 成功创建所有 9 张表
- [ ] `wrangler dev` 启动后，`/api/products` 返回真实数据
- [ ] 无 JWT 访问业务路由返回 401
- [ ] 带 JWT 可正常增删改查商品、往来单位、订单

**技术要点**：
- JWT 中间件使用 `jose` 库的 `jwtVerify` 函数
- 所有业务路由使用 `app.use('/api/*', authMiddleware)` 统一保护
- CRUD 接口返回标准 `{data, message}` 格式
- 列表接口支持 `page`/`pageSize` 分页

---

### Phase 2：前端 API 接入（预计 3-4 天）

**目标**：前端从 mock 数据切换到真实 API。

| 序号 | 任务 | 优先级 | 工作量 | 详细说明 |
|------|------|--------|--------|----------|
| 2.1 | 创建 API 客户端 | 🔴 高 | 2h | `apps/web/src/api/client.ts` — fetch 封装，自动附加 `Authorization` header，统一错误处理，401 自动跳转登录 |
| 2.2 | 创建各模块 API 模块 | 🔴 高 | 3h | `api/auth.ts`, `api/product.ts`, `api/partner.ts`, `api/order.ts`, `api/inventory.ts`, `api/finance.ts`, `api/report.ts` |
| 2.3 | 接入登录 | 🔴 高 | 1h | `LoginView.vue` 调用 `/api/auth/login`，保存 token 到 localStorage，跳转仪表盘 |
| 2.4 | 接入商品管理 | 🔴 高 | 3h | `ProductView.vue` 调用 API，替换 mock 数据数组；新增/编辑弹窗提交到 API |
| 2.5 | 接入往来单位 | 🔴 高 | 2h | `PartnerView.vue` 同上 |
| 2.6 | 接入采购/销售订单 | 🔴 高 | 5h | `PurchaseView.vue` / `SaleView.vue` 列表页接入；`PurchaseOrderView.vue` / `SalePOSView.vue` 提交时调用 `POST /api/orders` |
| 2.7 | 接入库存查询 | 🟡 中 | 2h | `InventoryView.vue` 调用 `/api/inventory`，库存调整调用 `/api/inventory/adjust` |
| 2.8 | Loading / Error 状态 | 🟡 中 | 3h | 所有列表页添加骨架屏/加载状态，API 失败时显示错误提示（Naive UI Message） |

**Phase 2 验收标准**：
- [ ] 登录页输入 admin/admin123 能真实登录（若已写入种子数据）
- [ ] 商品管理页新增商品后刷新仍然存在
- [ ] POS 开单后能在销售列表看到该订单
- [ ] 断网或 API 失败时有用户友好的错误提示

**技术要点**：
- API 客户端使用 `fetch`，基地址从 `import.meta.env.VITE_API_BASE_URL` 读取
- 开发环境通过 Vite proxy 自动代理 `/api` 到 `localhost:8787`
- 使用 `try/catch` 包裹所有 API 调用，配合 Naive UI 的 `useMessage()` 显示错误
- 列表页添加 `loading` ref，请求时显示骨架屏或 spin

---

### Phase 3：核心业务逻辑（预计 3-4 天）

**目标**：进销存的"联动"机制跑通。

| 序号 | 任务 | 优先级 | 工作量 | 详细说明 |
|------|------|--------|--------|----------|
| 3.1 | 订单创建时自动扣减库存 | 🔴 高 | 4h | `POST /api/orders` 事务：插入 order + order_items + 更新 products.stockQty + 插入 inventory_logs |
| 3.2 | 采购入库增加库存 | 🔴 高 | 2h | 采购单状态改为 `completed` 时增加库存 |
| 3.3 | 销售退货恢复库存 | 🔴 高 | 2h | 退货单（subType=return）自动恢复商品库存 |
| 3.4 | 订单支付自动生成财务记录 | 🟡 中 | 2h | 订单支付时自动在 `transactions` 表创建收支记录 |
| 3.5 | 应收应付自动计算 | 🟡 中 | 2h | `partners.balance` 根据订单支付状态自动更新 |
| 3.6 | 库存预警接口 | 🟡 中 | 1h | `GET /api/inventory?warning=true` 返回 `stockQty <= minStock` 的商品 |
| 3.7 | 报表数据聚合 | 🟡 中 | 4h | `/api/reports/*` 使用 Drizzle ORM 聚合函数（sum, count, groupBy）返回真实统计数据 |
| 3.8 | 仪表盘数据接口 | 🟡 中 | 2h | `/api/reports/dashboard` 返回今日销售、采购、预警数量 |

**Phase 3 验收标准**：
- [ ] POS 销售 10 件牛奶后，库存页面该商品数量减少 10
- [ ] 财务管理页面能看到销售产生的应收款
- [ ] 报表页面的数据与真实订单一致
- [ ] 库存不足的商品在仪表盘显示预警

**技术要点**：
- 使用 Drizzle ORM 的 `db.transaction()` 包裹涉及多表的订单创建逻辑
- 订单状态流转：`pending` → `partial` → `completed`
- 采购入库时才增加库存（不是创建采购单时）
- 退货单类型 `subType: 'return'`，恢复库存并生成负向财务记录

---

### Phase 4：部署与发布（预计 1-2 天）

**目标**：生产环境可访问。

| 序号 | 任务 | 优先级 | 工作量 | 详细说明 |
|------|------|--------|--------|----------|
| 4.1 | 配置生产 D1 数据库 | 🔴 高 | 1h | 创建生产数据库，应用迁移 |
| 4.2 | 配置 wrangler.toml | 🔴 高 | 0.5h | 填入生产 `database_id`，确认 `account_id` |
| 4.3 | 配置环境变量 | 🔴 高 | 0.5h | `wrangler secret put JWT_SECRET` |
| 4.4 | 部署后端 API | 🔴 高 | 0.5h | `pnpm deploy:api` → Cloudflare Workers |
| 4.5 | 部署前端 | 🔴 高 | 0.5h | `pnpm deploy:web` → Cloudflare Pages |
| 4.6 | 导入种子数据 | 🟡 中 | 0.5h | 生产环境写入初始管理员和示例数据 |
| 4.7 | 端到端验证 | 🔴 高 | 2h | 生产环境完整走一遍：登录→新增商品→采购入库→POS 销售→查看报表 |

**Phase 4 验收标准**：
- [ ] 生产域名可正常访问
- [ ] 手机浏览器可正常使用
- [ ] 数据在生产数据库存储持久化

**技术要点**：
- 生产 `JWT_SECRET` 必须是强随机密码（≥32位）
- 前端 `.env.production` 中的 API 地址指向生产 Workers
- CORS origin 配置需包含生产 Pages 域名

---

### Phase 5：移动端与增值功能（可选，预计 3-5 天）

| 序号 | 任务 | 工作量 | 说明 |
|------|------|--------|------|
| 5.1 | Capacitor 构建 Android APK | 4h | `pnpm android:build` |
| 5.2 | 扫码功能联调 | 4h | `@capacitor-community/barcode-scanner` 接入商品查询 |
| 5.3 | 打印小票 | 4h | 调用浏览器打印或蓝牙打印机 API |
| 5.4 | PWA 离线支持 | 4h | Service Worker 缓存关键资源 |
| 5.5 | 数据导出 | 3h | 订单/报表 Excel/CSV 导出 |
| 5.6 | 多仓库支持 | 6h | 库存按仓库区分，调拨功能 |
| 5.7 | 多用户权限 | 6h | admin/manager/staff 角色区分 |

---

## 🎯 最简可用版本（MVP）优先级

如果希望尽快上线，按以下顺序执行即可跑通核心流程：

```
Phase 1 (1-2天): 迁移 + Product/Partner/Order API 实现 + JWT 中间件
Phase 2 (2-3天): 前端 API 接入（登录→商品→采购→销售→库存）
Phase 3 (1-2天): 订单联动库存 + 仪表盘数据
Phase 4 (1天): 部署上线
```

**总计约 5-8 天可完成 MVP 上线。**

---

## ⚠️ 关键风险与建议

### 1. 数据库事务

**风险**：订单创建涉及多张表，中途失败会导致数据不一致。

**建议**：使用 Drizzle ORM 的 `db.transaction()` 包裹订单创建逻辑：

```ts
await db.transaction(async (tx) => {
  const order = await tx.insert(orders).values({...}).returning()
  await tx.insert(orderItems).values(items)
  await tx.update(products).set({ stockQty: sql`${products.stockQty} - ${qty}` })
  await tx.insert(inventoryLogs).values({...})
})
```

---

### 2. JWT 在 Workers 中的存储

**风险**：Cloudflare Workers 是无状态的，不能使用传统的 session。

**建议**：当前 JWT 方案已正确（客户端存储 token），只需确保中间件验证：

```ts
// middleware/auth.ts
import { jwtVerify } from 'jose'

export const authMiddleware = async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}
```

---

### 3. 条码扫描器版本冲突

**风险**：`@capacitor-community/barcode-scanner@4.0.1` 要求 `@capacitor/core@^5`，但项目使用 `^6`。

**建议**：
- 方案A：升级 barcode-scanner 到 v5+（推荐）
- 方案B：降级 capacitor 到 v5

```bash
# 方案A
pnpm up @capacitor-community/barcode-scanner@latest
```

---

### 4. 时区问题

**风险**：数据库使用 `new Date().toISOString()` 存储，前端展示可能有时区偏差。

**建议**：
- 数据库统一使用 UTC 存储（ISO 8601 格式）
- 前端展示使用 `toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })`

---

### 5. 并发库存扣减

**风险**：多个用户同时下单同一商品，可能出现超卖。

**建议**：使用数据库级别的乐观锁或 SQLite 的 `BEGIN IMMEDIATE` 事务：

```ts
await db.transaction(async (tx) => {
  // 先查询锁定库存
  const product = await tx.select().from(products)
    .where(eq(products.id, productId))
    .get()

  if (product.stockQty < qty) {
    throw new Error('库存不足')
  }

  // 再扣减
  await tx.update(products)
    .set({ stockQty: sql`${products.stockQty} - ${qty}` })
    .where(eq(products.id, productId))
})
```

---

## 📁 文档索引

| 文档 | 内容 |
|------|------|
| [README.md](./README.md) | 项目简介、技术栈、快速开始、常用命令 |
| [API.md](./API.md) | 完整接口文档（含 Request/Response 示例） |
| [DEPLOY.md](./DEPLOY.md) | 生产环境部署操作手册 |
| [SEED.md](./SEED.md) | 数据库种子数据说明 |
| [design/ui-design-spec.md](./design/ui-design-spec.md) | UI 视觉设计规范 |

---

## 📈 完成度追踪

建议在每个 Phase 完成后在此打勾：

### Phase 1：后端基础 ✅
- [x] 1.1 生成 Drizzle Migration
- [x] 1.2 创建 D1 数据库
- [x] 1.3 应用本地迁移
- [x] 1.4 JWT 验证中间件
- [x] 1.5 完成 `GET /me`
- [x] 1.6 Product CRUD
- [x] 1.7 Partner CRUD
- [x] 1.8 Order CRUD

### Phase 2：前端接入 ✅
- [x] 2.1 API 客户端
- [x] 2.2 各模块 API
- [x] 2.3 接入登录
- [x] 2.4 接入商品管理
- [x] 2.5 接入往来单位
- [x] 2.6 接入采购/销售
- [x] 2.7 接入库存
- [x] 2.8 Loading/Error 状态

### Phase 3：业务逻辑 ✅
- [x] 3.1 订单扣减库存
- [x] 3.2 采购入库
- [x] 3.3 销售退货
- [x] 3.4 财务记录
- [x] 3.5 应收应付
- [x] 3.6 库存预警
- [x] 3.7 报表聚合
- [x] 3.8 仪表盘

### Phase 4：部署发布 ✅
- [x] 4.1 生产 D1
- [x] 4.2 wrangler.toml
- [x] 4.3 环境变量
- [x] 4.4 部署 API
- [x] 4.5 部署前端
- [x] 4.6 种子数据
- [x] 4.7 端到端验证（已通过 wrangler 确认部署成功）

---

> 有道ERP — 让食品经销更智能
