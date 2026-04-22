<template>
  <div class="product-view">
    <!-- Search & Filter -->
    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" class="kimi-input" placeholder="搜索商品名称、条码..." @keyup.enter="loadProducts" />
      </div>
      <button class="btn-primary" @click="openAddModal">
        <span>➕ 新增商品</span>
      </button>
    </div>

    <!-- Category Filter -->
    <div class="filter-tabs">
      <button
        v-for="cat in categories"
        :key="cat.value"
        class="filter-tab"
        :class="{ active: selectedCategory === cat.value }"
        @click="selectedCategory = cat.value"
      >
        {{ cat.label }}
      </button>
    </div>

    <!-- Supplier Filter -->
    <div class="supplier-filter">
      <span class="filter-label">供应商:</span>
      <select v-model.number="selectedSupplier" class="kimi-select supplier-select">
        <option :value="null">全部供应商</option>
        <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">加载中...</div>

    <!-- Product Grid -->
    <div v-else class="product-grid">
      <div v-for="product in filteredProducts" :key="product.id" class="product-card">
        <div class="product-icon">{{ product.icon }}</div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-meta">
            <span class="product-code">{{ product.code }}</span>
            <span class="product-unit">{{ product.spec }}</span>
          </div>
          <div class="product-supplier">
            <span class="supplier-label">供应商:</span>
            <span class="supplier-name">{{ product.supplierName || '未关联' }}</span>
          </div>
          <div class="product-bottom">
            <span class="product-price amount">¥{{ product.price }}</span>
            <span class="product-stock" :class="stockClass(product.stock, product.minStock)">
              库存 {{ product.stock }}
            </span>
          </div>
        </div>
        <div class="card-actions">
          <button class="more-btn" @click="editProduct(product)">✏️</button>
          <button class="more-btn delete" @click="deleteProduct(product)">🗑️</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>{{ editingProduct ? '编辑商品' : '新增商品' }}</h3>
          <button class="close-btn" @click="showAddModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>商品名称</label>
            <input v-model="form.name" class="kimi-input" placeholder="请输入商品名称" />
          </div>
          <div class="form-group">
            <label>条码</label>
            <input v-model="form.code" class="kimi-input" placeholder="扫描或输入条码" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>销售价</label>
              <input v-model.number="form.price" type="number" class="kimi-input" placeholder="0.00" />
            </div>
            <div class="form-group">
              <label>进货价</label>
              <input v-model.number="form.cost" type="number" class="kimi-input" placeholder="0.00" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>规格</label>
              <input v-model="form.spec" class="kimi-input" placeholder="如 250ml*24" />
            </div>
            <div class="form-group">
              <label>单位</label>
              <input v-model="form.unit" class="kimi-input" placeholder="件 / 箱 / 瓶" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类</label>
              <select v-model.number="form.categoryId" class="kimi-select">
                <option v-for="cat in categories.slice(1)" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>供应商 <span style="color: var(--color-danger)">*</span></label>
              <select v-model.number="form.supplierId" class="kimi-select">
                <option :value="null">请选择供应商</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>库存预警值</label>
            <input v-model.number="form.minStock" type="number" class="kimi-input" placeholder="10" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn-primary" @click="saveProduct">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { productApi, partnerApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import type { Product } from '@/api/product'

const toast = useToastStore()

const searchQuery = ref('')
const selectedCategory = ref(0)
const selectedSupplier = ref<number | null>(null)
const showAddModal = ref(false)
const editingProduct = ref<Product | null>(null)
const products = ref<Product[]>([])
const suppliers = ref<Array<{ id: number; name: string }>>([])
const loading = ref(false)

const categories = [
  { value: 0, label: '全部' },
  { value: 1, label: '饮料' },
  { value: 2, label: '零食' },
  { value: 3, label: '粮油' },
  { value: 4, label: '日用' },
  { value: 5, label: '其他' }
]

const iconMap: Record<number, string> = {
  1: '🥤', 2: '🍪', 3: '🍚', 4: '🧴', 5: '📦'
}

const filteredProducts = computed(() => {
  return products.value.map(p => ({
    id: p.id,
    name: p.name,
    code: p.barcode || '',
    price: p.salePrice,
    cost: p.purchasePrice,
    spec: p.specs || '',
    unit: p.unit,
    categoryId: p.categoryId ?? 5,
    supplierId: p.supplierId,
    supplierName: p.supplierName,
    stock: p.stockQty,
    minStock: p.minStock,
    icon: iconMap[p.categoryId ?? 5] || '📦'
  }))
})

async function loadSuppliers() {
  try {
    const res = await partnerApi.list({ type: 'supplier' })
    suppliers.value = res.data.map((s: any) => ({ id: s.id, name: s.name }))
  } catch (e: any) {
    console.error('加载供应商失败', e.message)
  }
}

async function loadProducts() {
  loading.value = true
  try {
    const res = await productApi.list({
      search: searchQuery.value || undefined,
      category: selectedCategory.value === 0 ? undefined : String(selectedCategory.value),
      supplier: selectedSupplier.value ? String(selectedSupplier.value) : undefined
    })
    products.value = res.data
  } catch (err: any) {
    toast.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

watch([searchQuery, selectedCategory, selectedSupplier], () => {
  loadProducts()
}, { debounce: 300 } as any)

onMounted(() => {
  loadSuppliers()
  loadProducts()
})

const form = reactive({
  name: '', code: '', price: 0, cost: 0, spec: '', unit: '', categoryId: 5, supplierId: null as number | null, minStock: 10
})

function stockClass(stock: number, min: number) {
  if (stock <= 0) return 'danger'
  if (stock <= min) return 'warning'
  return 'normal'
}

function openAddModal() {
  editingProduct.value = null
  Object.assign(form, { name: '', code: '', price: 0, cost: 0, spec: '', unit: '', categoryId: 5, supplierId: null, minStock: 10 })
  showAddModal.value = true
}

function editProduct(product: any) {
  editingProduct.value = products.value.find(p => p.id === product.id) || null
  Object.assign(form, {
    name: product.name,
    code: product.code || '',
    price: product.price,
    cost: product.cost,
    spec: product.spec || '',
    unit: product.unit,
    categoryId: product.categoryId,
    supplierId: product.supplierId,
    minStock: product.minStock
  })
  showAddModal.value = true
}

async function saveProduct() {
  if (!form.name || !form.code) {
    toast.warning('请填写商品名称和条码')
    return
  }
  if (!form.supplierId) {
    toast.warning('请选择供应商')
    return
  }
  const payload = {
    name: form.name,
    barcode: form.code,
    salePrice: form.price,
    purchasePrice: form.cost,
    specs: form.spec,
    unit: form.unit,
    categoryId: form.categoryId,
    supplierId: form.supplierId,
    minStock: form.minStock
  }
  try {
    if (editingProduct.value) {
      await productApi.update(editingProduct.value.id, payload)
    } else {
      await productApi.create(payload)
    }
    showAddModal.value = false
    editingProduct.value = null
    Object.assign(form, { name: '', code: '', price: 0, cost: 0, spec: '', unit: '', categoryId: 5, supplierId: null, minStock: 10 })
    await loadProducts()
  } catch (err: any) {
    toast.error(err.message || '保存失败')
  }
}

async function deleteProduct(product: any) {
  if (!confirm(`确定要删除商品「${product.name}」吗？删除后不可恢复。`)) return
  try {
    await productApi.delete(product.id)
    await loadProducts()
  } catch (err: any) {
    toast.error(err.message || '删除失败')
  }
}
</script>

<style scoped>
.product-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.search-box .kimi-input {
  width: 100%;
  padding-left: 40px;
}

.btn-primary {
  height: 48px;
  padding: 0 20px;
  background: var(--accent-primary);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
}

.btn-primary:hover {
  transform: translateY(-1px);
  
}

.btn-primary:active {
  transform: scale(0.97);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.loading-state::before {
  content: '';
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-subtle);
  border-top-color: #7C5CFC;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-tab {
  padding: 8px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filter-tab.active {
  background: var(--accent-subtle); border: 1px solid var(--accent-border); color: var(--accent-primary);
  border-color: transparent;
  color: white;
}

.supplier-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.supplier-select {
  flex: 1;
  max-width: 240px;
}

.product-supplier {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}

.supplier-label {
  color: var(--text-tertiary);
}

.supplier-name {
  color: var(--text-secondary);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.product-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.2s;
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.product-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-subtle);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.product-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #7C5CFC;
}

.product-stock {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.product-stock.normal {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.product-stock.warning {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
  animation: pulse-yellow 2s infinite;
}

.product-stock.danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
}

.card-actions {
  position: absolute;
  right: 8px;
  top: 8px;
  display: flex;
  gap: 4px;
}

.more-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  transition: all 0.15s;
}

.more-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.more-btn.delete:hover {
  color: var(--color-danger);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-panel {
  background: var(--bg-elevated);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slide-up 0.3s ease-out;
}

@media (min-width: 768px) {
  .modal-panel {
    border-radius: var(--radius-xl);
  }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.kimi-input,
.kimi-select {
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 12px;
  color: var(--text-primary);
  font-size: 15px;
  width: 100%;
}

.kimi-input:focus,
.kimi-select:focus {
  border-color: #7C5CFC;
  box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.15);
  outline: none;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
}

.btn-secondary {
  flex: 1;
  height: 48px;
  background: var(--bg-surface);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
}

.modal-footer .btn-primary {
  flex: 1;
}

@keyframes pulse-yellow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
