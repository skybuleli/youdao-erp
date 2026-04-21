-- 创建默认供应商（如果不存在）
INSERT INTO partners (type, name, contact, phone, remark, created_at)
SELECT 'supplier', '默认供应商', '系统', '-', '历史数据自动绑定', strftime('%s','now') * 1000
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE type = 'supplier' LIMIT 1);

-- 将所有现有商品的 supplier_id 设为第一个供应商的 id
UPDATE products
SET supplier_id = (SELECT id FROM partners WHERE type = 'supplier' ORDER BY id LIMIT 1)
WHERE supplier_id IS NULL;
