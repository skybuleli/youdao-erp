# 有道ERP 种子数据说明

> 种子数据用于快速初始化开发/演示环境，包含管理员账号、商品分类、示例商品、往来单位和示例订单。

---

## 📋 数据清单

### 1. 管理员账号

| 字段 | 值 |
|------|-----|
| 用户名 | `admin` |
| 密码 | `admin123` |
| 姓名 | 管理员 |
| 角色 | admin（超级管理员）|

> ⚠️ **安全提醒**：生产环境部署后，务必第一时间修改默认密码！

---

### 2. 商品分类

| ID | 名称 | 说明 |
|----|------|------|
| 1 | 饮料 | 牛奶、可乐、矿泉水等 |
| 2 | 零食 | 饼干、薯片、方便面等 |
| 3 | 粮油 | 大米、食用油等 |
| 4 | 日用 | 洗发水、牙膏等日用品 |
| 5 | 其他 | 未分类商品 |

---

### 3. 示例商品

| 条码 | 名称 | 分类 | 规格 | 单位 | 进货价 | 销售价 | 库存 | 预警值 | 上限 |
|------|------|------|------|------|--------|--------|------|--------|------|
| 6901234567890 | 伊利纯牛奶 250ml*24 | 饮料 | 250ml*24 | 箱 | 38.00 | 45.00 | 120 | 20 | 200 |
| 6901234567891 | 可口可乐 330ml*6 | 饮料 | 330ml*6 | 组 | 12.00 | 15.00 | 8 | 15 | 100 |
| 6901234567892 | 五常大米 5kg | 粮油 | 5kg | 袋 | 55.00 | 68.00 | 45 | 10 | 80 |
| 6901234567893 | 奥利奥夹心饼干 116g | 零食 | 116g | 袋 | 5.50 | 7.00 | 200 | 50 | 300 |
| 6901234567894 | 康师傅红烧牛肉面 | 零食 | 100g | 桶 | 3.00 | 4.00 | 3 | 30 | 150 |
| 6901234567895 | 海飞丝洗发水 400ml | 日用 | 400ml | 瓶 | 30.00 | 38.00 | 25 | 10 | 60 |
| 6901234567896 | 农夫山泉 550ml*24 | 饮料 | 550ml*24 | 箱 | 26.00 | 32.00 | 60 | 15 | 120 |
| 6901234567897 | 乐事薯片 70g | 零食 | 70g | 袋 | 6.00 | 8.00 | 80 | 20 | 150 |

> 库存预警商品（库存 ≤ 预警值）：可口可乐（8/15）、康师傅面（3/30）

---

### 4. 往来单位

#### 客户

| 名称 | 联系人 | 电话 | 地址 | 应收余额 |
|------|--------|------|------|----------|
| 张老板 | 张先生 | 13800138001 | 北京市朝阳区建国路88号 | 2450.00 |
| 李老板 | 李先生 | 13800138002 | 北京市海淀区中关村大街1号 | 880.00 |
| 客户C | 陈女士 | 13800138005 | 北京市东城区王府井大街 | 0.00 |

#### 供应商

| 名称 | 联系人 | 电话 | 地址 | 应付余额 |
|------|--------|------|------|----------|
| 供应商A | 王经理 | 13800138003 | 北京市丰台区南四环西路 | 3250.00 |
| 供应商B | 赵经理 | 13800138004 | 北京市通州区物资学院路 | 2350.00 |

---

### 5. 示例订单

#### 销售单

| 单号 | 客户 | 商品 | 数量 | 金额 | 状态 | 日期 |
|------|------|------|------|------|------|------|
| XS20250422001 | 张老板 | 伊利纯牛奶、奥利奥 | 10件 | 450.00 | 已完成 | 2025-04-22 |
| XS20250422002 | 客户C | 可口可乐 | 5组 | 180.00 | 已完成 | 2025-04-22 |
| XS20250420003 | 张老板 | 五常大米、农夫山泉 | 8件 | 680.00 | 已完成 | 2025-04-20 |

#### 采购单

| 单号 | 供应商 | 商品 | 数量 | 金额 | 状态 | 日期 |
|------|--------|------|------|------|------|------|
| CG20250422001 | 供应商A | 伊利纯牛奶、可口可乐 | 50件 | 3250.00 | 待入库 | 2025-04-22 |
| CG20250421002 | 供应商B | 五常大米、海飞丝 | 30件 | 2650.00 | 部分入库 | 2025-04-21 |
| CG20250420003 | 供应商A | 奥利奥、乐事薯片 | 100件 | 1500.00 | 已完成 | 2025-04-20 |

---

## 🚀 导入种子数据

### 方式一：使用 SQL 文件

创建文件 `server/seed.sql`：

```sql
-- 管理员账号（密码：admin123，bcrypt hash）
INSERT INTO users (username, passwordHash, name, role, createdAt) VALUES
('admin', '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', '管理员', 'admin', datetime('now'));

-- 商品分类
INSERT INTO categories (id, name, sortOrder) VALUES
(1, '饮料', 1),
(2, '零食', 2),
(3, '粮油', 3),
(4, '日用', 4),
(5, '其他', 5);

-- 仓库
INSERT INTO warehouses (id, name, address) VALUES
(1, '总仓', '北京市朝阳区建国路88号');

-- 示例商品
INSERT INTO products (barcode, name, categoryId, specs, unit, purchasePrice, salePrice, stockQty, minStock, maxStock, status, createdAt) VALUES
('6901234567890', '伊利纯牛奶 250ml*24', 1, '250ml*24', '箱', 38.00, 45.00, 120, 20, 200, 1, datetime('now')),
('6901234567891', '可口可乐 330ml*6', 1, '330ml*6', '组', 12.00, 15.00, 8, 15, 100, 1, datetime('now')),
('6901234567892', '五常大米 5kg', 3, '5kg', '袋', 55.00, 68.00, 45, 10, 80, 1, datetime('now')),
('6901234567893', '奥利奥夹心饼干 116g', 2, '116g', '袋', 5.50, 7.00, 200, 50, 300, 1, datetime('now')),
('6901234567894', '康师傅红烧牛肉面', 2, '100g', '桶', 3.00, 4.00, 3, 30, 150, 1, datetime('now')),
('6901234567895', '海飞丝洗发水 400ml', 4, '400ml', '瓶', 30.00, 38.00, 25, 10, 60, 1, datetime('now')),
('6901234567896', '农夫山泉 550ml*24', 1, '550ml*24', '箱', 26.00, 32.00, 60, 15, 120, 1, datetime('now')),
('6901234567897', '乐事薯片 70g', 2, '70g', '袋', 6.00, 8.00, 80, 20, 150, 1, datetime('now'));

-- 往来单位
INSERT INTO partners (type, name, contact, phone, address, balance, createdAt) VALUES
('customer', '张老板', '张先生', '13800138001', '北京市朝阳区建国路88号', 2450.00, datetime('now')),
('customer', '李老板', '李先生', '13800138002', '北京市海淀区中关村大街1号', 880.00, datetime('now')),
('customer', '客户C', '陈女士', '13800138005', '北京市东城区王府井大街', 0.00, datetime('now')),
('supplier', '供应商A', '王经理', '13800138003', '北京市丰台区南四环西路', -3250.00, datetime('now')),
('supplier', '供应商B', '赵经理', '13800138004', '北京市通州区物资学院路', -2350.00, datetime('now'));
```

> 注意：`passwordHash` 需要替换为真实的 bcrypt hash。可使用以下方式生成：

```bash
node -e "const bcrypt=require('bcryptjs');console.log(bcrypt.hashSync('admin123',10))"
```

### 方式二：通过 Wrangler 执行

#### 本地环境

```bash
wrangler d1 execute youdao-erp-db --local --file=./server/seed.sql
```

#### 生产环境

```bash
wrangler d1 execute youdao-erp-db --file=./server/seed.sql
```

---

## ✅ 验证导入

### 检查用户

```bash
wrangler d1 execute youdao-erp-db --command "SELECT username, name, role FROM users;"
```

### 检查商品

```bash
wrangler d1 execute youdao-erp-db --command "SELECT name, stockQty, minStock FROM products WHERE stockQty <= minStock;"
```

应返回：可口可乐（8/15）、康师傅面（3/30）

### 检查往来单位

```bash
wrangler d1 execute youdao-erp-db --command "SELECT name, type, balance FROM partners;"
```

---

## 🔄 重置数据

如需清空数据重新导入：

```sql
-- 按依赖顺序删除（先删子表，再删主表）
DELETE FROM inventory_logs;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM transactions;
DELETE FROM products;
DELETE FROM partners;
DELETE FROM categories;
DELETE FROM warehouses;
DELETE FROM users;
```

> ⚠️ 生产环境慎用！会删除所有数据！

---

## 📚 相关文档

- [README.md](./README.md) — 项目简介和快速开始
- [API.md](./API.md) — 完整接口文档
- [DEPLOY.md](./DEPLOY.md) — 部署操作手册
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) — 项目实施路线图
