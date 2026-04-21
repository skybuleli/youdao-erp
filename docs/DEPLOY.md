# 有道ERP 部署操作手册

> 本手册指导您将 有道ERP 从零部署到 Cloudflare 生产环境。

---

## 📋 前置准备

### 1. 账号与工具

- [Cloudflare 账号](https://dash.cloudflare.com/sign-up)（免费版即可）
- [Node.js](https://nodejs.org/) >= 20
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)：`npm install -g wrangler`

### 2. 登录 Wrangler

```bash
wrangler login
```

浏览器会弹出授权页面，登录您的 Cloudflare 账号并授权。

---

## 🗄 步骤一：创建 D1 数据库

D1 是 Cloudflare 的无服务器 SQLite 数据库，用于存储所有业务数据。

### 1.1 创建数据库

```bash
wrangler d1 create youdao-erp-db
```

输出示例：

```
✅ Successfully created DB 'youdao-erp-db' in region ENAM
Created your database using D1's new storage backend. The new storage backend
improves query throughput and latency.

[[d1_databases]]
binding = "DB"
database_name = "youdao-erp-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 1.2 记录 database_id

将输出的 `database_id` 复制下来，稍后填入配置。

---

## ⚙ 步骤二：更新配置文件

### 2.1 更新 `server/wrangler.toml`

打开 `server/wrangler.toml`，填入以下内容：

```toml
name = "youdao-erp-api"
main = "src/index.ts"
compatibility_date = "2025-04-01"

# 你的 Cloudflare Account ID
# 获取方式：Cloudflare 控制台右下角，或运行 wrangler whoami
account_id = "你的_account_id"

[[d1_databases]]
binding = "DB"
database_name = "youdao-erp-db"
database_id = "你的_database_id"

# 可选：KV 缓存（如需要）
# [[kv_namespaces]]
# binding = "CACHE"
# id = "你的_kv_id"

# 可选：R2 文件存储（如需要上传图片）
# [[r2_buckets]]
# binding = "FILES"
# bucket_name = "youdao-erp-files"
```

> `account_id` 获取方式：
> - 方法1：Cloudflare 控制台任意页面右下角
> - 方法2：命令行 `wrangler whoami`

### 2.2 更新 `drizzle.config.ts`

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/src/schema/index.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    databaseId: '你的_database_id',
    token: '你的_api_token', // 从 Cloudflare 控制台获取
  },
})
```

> **获取 API Token**：
> 1. 打开 [Cloudflare Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
> 2. 点击 "Create Token"
> 3. 使用 "Custom token" 模板
> 4. 权限：Account / Cloudflare D1 / Edit
> 5. 复制生成的 Token 填入上方配置

---

## 🔐 步骤三：配置环境变量

### 3.1 设置 JWT Secret

```bash
cd server
wrangler secret put JWT_SECRET
```

输入一个强密码（至少 32 位随机字符），例如：

```
youdao-erp-jwt-secret-2025-04-22-xxxxxxxx
```

> 生产环境务必使用随机生成的强密码！

---

## 🔄 步骤四：生成并应用数据库迁移

### 4.1 生成迁移文件

```bash
cd /Users/liliang/NeonSwarm/youdao-erp
pnpm db:generate
```

这会读取 `server/src/schema/index.ts` 中的表定义，在 `drizzle/migrations/` 目录生成 SQL 迁移文件。

### 4.2 应用迁移到本地（验证）

```bash
pnpm db:migrate:local
```

### 4.3 应用迁移到生产环境

```bash
pnpm db:migrate
```

确认数据库表已创建：

```bash
wrangler d1 execute youdao-erp-db --command "SELECT name FROM sqlite_master WHERE type='table';"
```

应输出 9 张表：users, categories, products, partners, warehouses, orders, order_items, inventory_logs, transactions

---

## 🌱 步骤五：导入种子数据

详见 [SEED.md](./SEED.md)

```bash
wrangler d1 execute youdao-erp-db --file=./server/seed.sql
```

---

## 🚀 步骤六：部署后端 API

```bash
pnpm deploy:api
```

或手动进入 server 目录部署：

```bash
cd server
wrangler deploy
```

部署成功后，会输出 Workers 的访问地址：

```
✨ Successfully published your script to:
https://youdao-erp-api.你的子域.workers.dev
```

记录这个 URL，前端部署时需要使用。

---

## 🎨 步骤七：部署前端

### 7.1 配置生产环境 API 地址

创建 `apps/web/.env.production`：

```env
VITE_API_BASE_URL=https://youdao-erp-api.你的子域.workers.dev
```

### 7.2 构建前端

```bash
pnpm build:web
```

### 7.3 部署到 Cloudflare Pages

```bash
pnpm deploy:web
```

或手动部署：

```bash
cd apps/web
wrangler pages deploy dist
```

部署成功后，会输出 Pages 的访问地址：

```
✨ Successfully published your script to:
https://youdao-erp.pages.dev
```

---

## ✅ 步骤八：生产环境验证

打开前端地址，完成以下验证 checklist：

- [ ] 首页可正常访问
- [ ] 使用种子数据账号登录成功
- [ ] 新增商品后刷新页面数据仍然存在
- [ ] 创建采购单后库存增加
- [ ] POS 销售后库存减少、销售列表显示新订单
- [ ] 财务管理显示应收应付
- [ ] 报表页面数据与订单一致

---

## 📱 步骤九：构建 Android APK（可选）

### 9.1 同步 Capacitor

```bash
cd apps/web
pnpm build
npx cap sync android
```

### 9.2 打开 Android Studio

```bash
npx cap open android
```

### 9.3 构建 APK

在 Android Studio 中选择：`Build → Build Bundle(s) / APK(s) → Build APK(s)`

生成的 APK 位于：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔄 回滚与更新

### 更新后端

```bash
pnpm deploy:api
```

Wrangler 会自动保留最近 10 个部署版本，可在 Cloudflare 控制台一键回滚。

### 更新前端

```bash
pnpm deploy:web
```

### 数据库变更

修改 `server/src/schema/index.ts` 后：

```bash
pnpm db:generate
pnpm db:migrate
```

> ⚠️ 生产环境数据库迁移前务必备份！

---

## 🛠 故障排查

### 问题：部署后 API 返回 500

排查步骤：
1. `wrangler tail` 查看实时日志
2. 检查 `wrangler.toml` 中的 `account_id` 是否正确
3. 确认 D1 数据库已绑定到 Workers

### 问题：前端无法连接 API

排查步骤：
1. 检查 CORS 配置中的 origin 是否包含前端域名
2. 确认 `.env.production` 中的 `VITE_API_BASE_URL` 正确
3. 浏览器 DevTools Network 面板查看具体错误

### 问题：数据库迁移失败

排查步骤：
1. `wrangler d1 execute youdao-erp-db --command "SELECT name FROM sqlite_master WHERE type='table';"` 确认表是否存在
2. 检查 `drizzle.config.ts` 中的 `databaseId` 和 `token`
3. 查看 `drizzle/migrations/` 目录是否有生成迁移文件

---

## 📚 相关文档

- [README.md](./README.md) — 项目简介和快速开始
- [API.md](./API.md) — 完整接口文档
- [SEED.md](./SEED.md) — 种子数据说明
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) — 项目实施路线图
