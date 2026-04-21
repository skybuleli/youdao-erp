# 有道ERP 接口文档

> API Base URL: `http://localhost:8787`（开发）/ `https://youdao-erp.pages.dev`（生产）
>
> 所有业务接口（除登录外）需在 Header 中携带：`Authorization: Bearer <token>`

---

## 📋 目录

- [通用规范](#通用规范)
- [认证模块](#认证模块)
- [商品管理](#商品管理)
- [往来单位](#往来单位)
- [订单管理](#订单管理)
- [库存管理](#库存管理)
- [财务管理](#财务管理)
- [报表分析](#报表分析)
- [健康检查](#健康检查)

---

## 通用规范

### 请求格式

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### 响应格式

成功响应：

```json
{
  "data": {},
  "message": "操作成功"
}
```

错误响应：

```json
{
  "error": "错误类型",
  "message": "具体错误描述"
}
```

### HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（Token 缺失或无效）|
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 认证模块

### POST /api/auth/login

用户登录。

**状态**：✅ 已实现

#### Request

```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "role": "admin"
  }
}
```

#### 错误响应

```json
// 400 参数错误
{ "error": "Invalid input" }

// 401 认证失败
{ "error": "Invalid credentials" }
```

---

### GET /api/auth/me

获取当前登录用户信息。

**状态**：📝 待实现（需 JWT 中间件）

#### Request

```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Response

```json
{
  "id": 1,
  "username": "admin",
  "name": "管理员",
  "role": "admin",
  "phone": "13800138000",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

## 商品管理

### GET /api/products

获取商品列表。

**状态**：📝 待实现

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| search | string | 否 | 按名称/条码搜索 |
| category | string | 否 | 分类筛选：drink/snack/grain/daily/other |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20 |

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "barcode": "6901234567890",
      "name": "伊利纯牛奶 250ml*24",
      "categoryId": 1,
      "specs": "250ml*24",
      "unit": "箱",
      "purchasePrice": 38.00,
      "salePrice": 45.00,
      "stockQty": 120,
      "minStock": 20,
      "maxStock": 200,
      "imageUrl": null,
      "status": 1,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

---

### GET /api/products/:id

获取商品详情。

**状态**：📝 待实现

#### Response

```json
{
  "id": 1,
  "barcode": "6901234567890",
  "name": "伊利纯牛奶 250ml*24",
  "categoryId": 1,
  "specs": "250ml*24",
  "unit": "箱",
  "purchasePrice": 38.00,
  "salePrice": 45.00,
  "stockQty": 120,
  "minStock": 20,
  "maxStock": 200,
  "imageUrl": null,
  "status": 1,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### POST /api/products

创建新商品。

**状态**：📝 待实现

#### Request

```json
{
  "barcode": "6901234567890",
  "name": "伊利纯牛奶 250ml*24",
  "categoryId": 1,
  "specs": "250ml*24",
  "unit": "箱",
  "purchasePrice": 38.00,
  "salePrice": 45.00,
  "minStock": 20,
  "maxStock": 200
}
```

#### Response

```json
{
  "id": 1,
  "barcode": "6901234567890",
  "name": "伊利纯牛奶 250ml*24",
  "categoryId": 1,
  "specs": "250ml*24",
  "unit": "箱",
  "purchasePrice": 38.00,
  "salePrice": 45.00,
  "stockQty": 0,
  "minStock": 20,
  "maxStock": 200,
  "status": 1,
  "createdAt": "2025-04-22T10:00:00Z"
}
```

---

### PUT /api/products/:id

更新商品信息。

**状态**：📝 待实现

#### Request

```json
{
  "name": "伊利纯牛奶 250ml*24（新包装）",
  "salePrice": 48.00,
  "minStock": 30
}
```

#### Response

```json
{
  "id": 1,
  "name": "伊利纯牛奶 250ml*24（新包装）",
  "salePrice": 48.00,
  "minStock": 30,
  "updatedAt": "2025-04-22T10:00:00Z"
}
```

---

### DELETE /api/products/:id

删除商品。

**状态**：📝 待实现

#### Response

```json
{
  "message": "商品删除成功"
}
```

---

## 往来单位

### GET /api/partners

获取往来单位列表。

**状态**：📝 待实现

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 类型：customer（客户）/ supplier（供应商）|
| search | string | 否 | 按名称/联系人/电话搜索 |

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "type": "customer",
      "name": "张老板",
      "contact": "张先生",
      "phone": "13800138001",
      "address": "北京市朝阳区建国路88号",
      "balance": 2450.00,
      "remark": "",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### POST /api/partners

创建往来单位。

**状态**：📝 待实现

#### Request

```json
{
  "type": "customer",
  "name": "王老板",
  "contact": "王先生",
  "phone": "13800138006",
  "address": "北京市海淀区中关村"
}
```

#### Response

```json
{
  "id": 5,
  "type": "customer",
  "name": "王老板",
  "contact": "王先生",
  "phone": "13800138006",
  "address": "北京市海淀区中关村",
  "balance": 0,
  "createdAt": "2025-04-22T10:00:00Z"
}
```

---

### PUT /api/partners/:id

更新往来单位。

**状态**：📝 待实现

---

### DELETE /api/partners/:id

删除往来单位。

**状态**：📝 待实现

---

## 订单管理

### GET /api/orders

获取订单列表。

**状态**：📝 待实现

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 类型：purchase（采购）/ sale（销售）|
| status | string | 否 | 状态：pending / partial / completed / cancelled |
| startDate | string | 否 | 开始日期（YYYY-MM-DD）|
| endDate | string | 否 | 结束日期（YYYY-MM-DD）|

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "orderNo": "XS20250422001",
      "type": "sale",
      "subType": "normal",
      "partnerId": 1,
      "partnerName": "张老板",
      "warehouseId": 1,
      "totalAmount": 450.00,
      "discountAmount": 0,
      "payableAmount": 450.00,
      "paidAmount": 450.00,
      "status": "completed",
      "orderDate": "2025-04-22",
      "remark": "",
      "createdAt": "2025-04-22T14:30:00Z",
      "items": [
        {
          "id": 1,
          "productId": 1,
          "productName": "伊利纯牛奶 250ml*24",
          "qty": 5,
          "unitPrice": 45.00,
          "amount": 225.00
        }
      ]
    }
  ]
}
```

---

### GET /api/orders/:id

获取订单详情。

**状态**：📝 待实现

---

### POST /api/orders

创建订单（同时触发库存变动）。

**状态**：📝 待实现

#### Request

```json
{
  "type": "sale",
  "subType": "normal",
  "partnerId": 1,
  "warehouseId": 1,
  "discountAmount": 10.00,
  "paidAmount": 440.00,
  "paymentMethod": "wechat",
  "remark": "",
  "items": [
    {
      "productId": 1,
      "qty": 5,
      "unitPrice": 45.00
    },
    {
      "productId": 2,
      "qty": 10,
      "unitPrice": 15.00
    }
  ]
}
```

#### Response

```json
{
  "id": 2,
  "orderNo": "XS20250422002",
  "type": "sale",
  "partnerId": 1,
  "totalAmount": 375.00,
  "discountAmount": 10.00,
  "payableAmount": 365.00,
  "paidAmount": 365.00,
  "status": "completed",
  "createdAt": "2025-04-22T15:00:00Z"
}
```

> **业务逻辑**：创建销售订单时自动扣减库存，创建采购订单时不立即变动库存，待入库确认后增加库存。

---

### PATCH /api/orders/:id/status

更新订单状态。

**状态**：📝 待实现

#### Request

```json
{
  "status": "completed"
}
```

> 采购订单状态从 `pending` → `completed` 时，触发入库增加库存。

---

### DELETE /api/orders/:id

删除订单（仅限未完成的订单）。

**状态**：📝 待实现

---

## 库存管理

### GET /api/inventory

获取库存列表。

**状态**：📝 待实现

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| search | string | 否 | 按商品名称/条码搜索 |
| warning | boolean | 否 | true 只返回库存预警商品 |

#### Response

```json
{
  "data": [
    {
      "productId": 1,
      "productName": "伊利纯牛奶 250ml*24",
      "barcode": "6901234567890",
      "warehouseId": 1,
      "warehouseName": "总仓",
      "stockQty": 120,
      "minStock": 20,
      "maxStock": 200,
      "warning": false
    },
    {
      "productId": 2,
      "productName": "可口可乐 330ml*6",
      "barcode": "6901234567891",
      "stockQty": 8,
      "minStock": 15,
      "maxStock": 100,
      "warning": true
    }
  ]
}
```

---

### GET /api/inventory/logs

获取出入库记录。

**状态**：📝 待实现

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| productId | number | 否 | 按商品筛选 |
| type | string | 否 | 类型：in / out / adjust / check |

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "productId": 1,
      "productName": "伊利纯牛奶 250ml*24",
      "warehouseId": 1,
      "type": "out",
      "qty": -5,
      "beforeQty": 125,
      "afterQty": 120,
      "refType": "order",
      "refId": 1,
      "createdBy": 1,
      "createdAt": "2025-04-22T14:30:00Z"
    }
  ]
}
```

---

### POST /api/inventory/adjust

库存调整。

**状态**：📝 待实现

#### Request

```json
{
  "productId": 1,
  "warehouseId": 1,
  "qty": 10,
  "type": "adjust",
  "remark": "盘点盈余"
}
```

> `qty` 为正数表示增加，负数表示减少。

---

## 财务管理

### GET /api/finance/receivables

获取应收账款列表。

**状态**：📝 待实现

#### Response

```json
{
  "data": [
    {
      "partnerId": 1,
      "partnerName": "张老板",
      "orderNo": "XS20250422001",
      "amount": 2450.00,
      "dueDate": "2025-05-22",
      "overdue": 0
    }
  ]
}
```

---

### GET /api/finance/payables

获取应付账款列表。

**状态**：📝 待实现

---

### GET /api/finance/transactions

获取收支记录。

**状态**：📝 待实现

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | income / expense |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

#### Response

```json
{
  "data": [
    {
      "id": 1,
      "type": "income",
      "category": "销售收入",
      "amount": 450.00,
      "partnerId": 1,
      "partnerName": "张老板",
      "orderId": 1,
      "account": "微信",
      "remark": "",
      "createdAt": "2025-04-22T14:30:00Z"
    }
  ]
}
```

---

### POST /api/finance/transaction

创建收付款记录。

**状态**：📝 待实现

#### Request

```json
{
  "type": "income",
  "category": "销售收入",
  "amount": 450.00,
  "partnerId": 1,
  "orderId": 1,
  "account": "微信",
  "remark": "张老板货款"
}
```

> 创建收款记录时，自动减少对应客户的应收余额。

---

## 报表分析

### GET /api/reports/dashboard

获取仪表盘统计数据。

**状态**：📝 待实现

#### Response

```json
{
  "todaySales": 3240.00,
  "todayPurchases": 1850.00,
  "warningCount": 5,
  "receivableAmount": 8500.00,
  "payableAmount": 5600.00,
  "totalProducts": 120,
  "totalPartners": 25
}
```

---

### GET /api/reports/sales

销售趋势报表。

**状态**：📝 待实现

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| range | string | 否 | today / week / month / quarter |

#### Response

```json
{
  "data": [
    { "date": "2025-04-16", "sales": 2100.00, "orders": 5 },
    { "date": "2025-04-17", "sales": 1850.00, "orders": 4 },
    { "date": "2025-04-18", "sales": 3200.00, "orders": 7 },
    { "date": "2025-04-19", "sales": 2800.00, "orders": 6 },
    { "date": "2025-04-20", "sales": 3400.00, "orders": 8 },
    { "date": "2025-04-21", "sales": 2900.00, "orders": 6 },
    { "date": "2025-04-22", "sales": 3240.00, "orders": 7 }
  ]
}
```

---

### GET /api/reports/profit

利润分析报表。

**状态**：📝 待实现

#### Response

```json
{
  "totalSales": 19490.00,
  "totalCost": 13643.00,
  "grossProfit": 5847.00,
  "margin": 30.0,
  "byCategory": [
    { "category": "饮料", "sales": 7500.00, "cost": 5250.00, "profit": 2250.00 },
    { "category": "零食", "sales": 4200.00, "cost": 2940.00, "profit": 1260.00 }
  ]
}
```

---

### GET /api/reports/inventory

库存报表。

**状态**：📝 待实现

#### Response

```json
{
  "totalSku": 120,
  "totalValue": 28500.00,
  "warningCount": 5,
  "zeroStockCount": 2,
  "byCategory": [
    { "category": "饮料", "sku": 25, "value": 8500.00 },
    { "category": "零食", "sku": 30, "value": 6200.00 }
  ]
}
```

---

## 健康检查

### GET /

API 根路径。

**状态**：✅ 已实现

#### Response

```json
{
  "message": "Youdao ERP API",
  "version": "0.1.0"
}
```

---

### GET /health

健康检查。

**状态**：✅ 已实现

#### Response

```json
{
  "status": "ok",
  "timestamp": "2025-04-22T10:00:00.000Z"
}
```

---

## 🔄 接口实现状态汇总

| 模块 | 接口数 | 已实现 | 待实现 |
|------|--------|--------|--------|
| 认证 | 2 | 1 | 1 |
| 商品 | 5 | 0 | 5 |
| 往来单位 | 5 | 0 | 5 |
| 订单 | 5 | 0 | 5 |
| 库存 | 4 | 0 | 4 |
| 财务 | 4 | 0 | 4 |
| 报表 | 4 | 0 | 4 |
| 健康 | 2 | 2 | 0 |
| **合计** | **31** | **3** | **28** |

> 目前仅 `/api/auth/login`、`GET /`、`GET /health` 已实现，其余接口均为规划中的设计。
