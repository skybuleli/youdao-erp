<template>
  <div class="inventory-view">
    <!-- Search -->
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input v-model="searchQuery" class="kimi-input" placeholder="搜索商品名称、条码..." />
    </div>

    <!-- Supplier Filter -->
    <div class="supplier-filter-row">
      <select v-model.number="selectedSupplier" class="kimi-select supplier-select">
        <option :value="null">全部供应商</option>
        <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="tab-count">({{ tab.count }})</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">加载中...</div>

    <!-- Inventory List -->
    <div v-else class="inventory-list">
      <div v-for="item in filteredItems" :key="item.id" class="inventory-card" :class="stockClass(item)">
        <div class="item-header">
          <div class="item-icon"><Icon :name="item.icon" class="w-5 h-5" /></div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-code">{{ item.code }} | 供应商: {{ item.supplierName || '-' }}</div>
          </div>
          <div class="item-status">
            <span class="status-badge" :class="stockClass(item)">{{ statusText(item) }}</span>
          </div>
        </div>

        <div class="stock-bar">
          <div class="stock-track">
            <div
              class="stock-fill"
              :class="stockClass(item)"
              :style="{ width: Math.min(100, (item.stock / item.maxStock) * 100) + '%' }"
            ></div>
          </div>
          <div class="stock-labels">
            <span class="stock-current amount">{{ item.stock }}</span>
            <span class="stock-max">/ {{ item.maxStock }}</span>
          </div>
        </div>

        <div class="item-details">
          <div class="detail-col">
            <span class="detail-label">规格</span>
            <span class="detail-value">{{ item.spec }}</span>
          </div>
          <div class="detail-col">
            <span class="detail-label">预警值</span>
            <span class="detail-value">{{ item.minStock }}</span>
          </div>
          <div class="detail-col">
            <span class="detail-label">进价</span>
            <span class="detail-value amount">¥{{ item.cost }}</span>
          </div>
          <div class="detail-col">
            <span class="detail-label">售价</span>
            <span class="detail-value amount">¥{{ item.price }}</span>
          </div>
        </div>

        <div class="item-actions">
          <button class="action-btn" @click="adjustStock(item)"><Icon name="BarChart3" class="w-5 h-5" /> 调整库存</button>
          <button class="action-btn primary" @click="viewHistory(item)">📜 出入库记录</button>
        </div>
      </div>
    </div>

    <!-- Stock Warning Banner -->
    <div v-if="warningItems.length > 0" class="warning-banner">
      <span><Icon name="AlertTriangle" class="w-4 h-4" /> {{ warningItems.length }} 种商品库存不足，请及时补货</span>
      <button class="warning-btn" @click="activeTab = 'warning'">查看</button>
    </div>

    <!-- Adjust Modal -->
    <div v-if="showAdjustModal" class="modal-overlay" @click.self="showAdjustModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>库存调整 - {{ adjustItem?.name }}</h3>
          <button class="close-btn" @click="showAdjustModal = false"><Icon name="X" class="w-4 h-4" /></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>调整类型</label>
            <div class="type-selector">
              <button class="type-btn" :class="{ active: adjustType === 'in' }" @click="adjustType = 'in'"><Icon name="ArrowDownLeft" class="w-4 h-4" /> 入库</button>
              <button class="type-btn" :class="{ active: adjustType === 'out' }" @click="adjustType = 'out'">📤 出库</button>
              <button class="type-btn" :class="{ active: adjustType === 'count' }" @click="adjustType = 'count'"><Icon name="FileText" class="w-4 h-4" /> 盘点</button>
            </div>
          </div>
          <div class="form-group">
            <label>当前库存</label>
            <input :value="adjustItem?.stock" class="kimi-input" disabled />
          </div>
          <div class="form-group">
            <label>调整数量</label>
            <input v-model.number="adjustQty" type="number" class="kimi-input" placeholder="正数增加，负数减少" />
          </div>
          <div class="form-group">
            <label>备注</label>
            <input v-model="adjustRemark" class="kimi-input" placeholder="调整原因..." />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAdjustModal = false">取消</button>
          <button class="btn-primary" @click="confirmAdjust">确认调整</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Icon from '@/components/Icon.vue'
import { productApi, partnerApi, inventoryApi } from '@/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const searchQuery = ref('')
const activeTab = ref('all')
const selectedSupplier = ref<number | null>(null)
const showAdjustModal = ref(false)
const adjustItem = ref<any>(null)
const adjustQty = ref(0)
const adjustRemark = ref('')
const adjustType = ref('in')
const loading = ref(false)
const items = ref<Array<any>>([])
const suppliers = ref<Array<{ id: number; name: string }>>([])

const tabs = [
  { value: 'all', label: '全部', count: 0 },
  { value: 'warning', label: '库存预警', count: 0 },
  { value: 'normal', label: '库存正常', count: 0 }
]

async function loadSuppliers() {
  try {
    const res = await partnerApi.list({ type: 'supplier' })
    suppliers.value = res.data.map((s: any) => ({ id: s.id, name: s.name }))
  } catch (e: any) {
    console.error('加载供应商失败', e.message)
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await productApi.list({
      supplier: selectedSupplier.value ? String(selectedSupplier.value) : undefined
    })
    items.value = res.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      code: p.barcode || '',
      spec: p.specs || '',
      stock: p.stockQty,
      minStock: p.minStock,
      maxStock: p.maxStock,
      cost: p.purchasePrice,
      price: p.salePrice,
      supplierName: p.supplierName,
      icon: 'Package'
    }))
  } catch (e: any) {
    toast.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const warningItems = computed(() => items.value.filter(i => i.stock <= i.minStock))

const filteredItems = computed(() => {
  let result = items.value
  if (activeTab.value === 'warning') {
    result = result.filter(i => i.stock <= i.minStock)
  } else if (activeTab.value === 'normal') {
    result = result.filter(i => i.stock > i.minStock)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i => i.name.toLowerCase().includes(q) || i.code.includes(q))
  }
  return result
})

function stockClass(item: any) {
  if (item.stock <= 0) return 'danger'
  if (item.stock <= item.minStock) return 'warning'
  return 'normal'
}

function statusText(item: any) {
  if (item.stock <= 0) return '缺货'
  if (item.stock <= item.minStock) return '预警'
  return '正常'
}

function adjustStock(item: any) {
  adjustItem.value = item
  adjustQty.value = 0
  adjustRemark.value = ''
  adjustType.value = 'in'
  showAdjustModal.value = true
}

async function confirmAdjust() {
  if (!adjustItem.value) return
  if (adjustQty.value === 0) {
    toast.warning('调整数量不能为 0')
    return
  }
  try {
    const qty = adjustType.value === 'out' ? -Math.abs(adjustQty.value) : Math.abs(adjustQty.value)
    await inventoryApi.adjust({
      productId: adjustItem.value.id,
      qty,
      type: adjustType.value === 'in' ? '入库' : adjustType.value === 'out' ? '出库' : '盘点',
      remark: adjustRemark.value || undefined
    })
    showAdjustModal.value = false
    toast.success('库存调整成功！')
    await loadData()
  } catch (err: any) {
    toast.error(err.message || '库存调整失败')
  }
}

function viewHistory(item: any) {
  toast.info(`查看 ${item.name} 的出入库记录（待实现）`)
}

watch(selectedSupplier, loadData)

onMounted(() => {
  loadSuppliers()
  loadData()
})
</script>

<style scoped>
.inventory-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.kimi-input {
  width: 100%;
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 12px 0 40px;
  color: var(--text-primary);
  font-size: 15px;
}

.kimi-input:focus {
  border-color: #7C5CFC;
  outline: none;
}

.supplier-filter-row {
  margin-bottom: 8px;
}

.supplier-select {
  width: 100%;
  max-width: 280px;
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

.tab-count {
  font-size: 12px;
  opacity: 0.8;
}

.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inventory-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: all 0.2s;
}

.inventory-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.inventory-card.warning {
  border-color: rgba(245, 158, 11, 0.3);
}

.inventory-card.danger {
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.1);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.item-icon {
  width: 44px;
  height: 44px;
  background: var(--gradient-subtle);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
}

.item-code {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: monospace;
}

.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.status-badge.normal {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
  animation: pulse-yellow 2s infinite;
}

.status-badge.danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.2);
}

.stock-bar {
  margin-bottom: 12px;
}

.stock-track {
  height: 8px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 6px;
}

.stock-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.stock-fill.normal {
  background: var(--color-success);
}

.stock-fill.warning {
  background: var(--color-warning);
}

.stock-fill.danger {
  background: var(--color-danger);
}

.stock-labels {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stock-current {
  font-size: 18px;
  font-weight: 700;
}

.stock-max {
  font-size: 13px;
  color: var(--text-tertiary);
}

.item-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 12px;
}

.detail-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

.detail-value {
  font-size: 13px;
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  height: 36px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: var(--gradient-subtle);
  border-color: #7C5CFC;
  color: var(--text-primary);
}

.warning-banner {
  position: fixed;
  bottom: 76px;
  left: 16px;
  right: 16px;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-warning);
  font-size: 14px;
  backdrop-filter: blur(8px);
  z-index: 50;
}

@media (min-width: 1024px) {
  .warning-banner {
    position: static;
    margin-top: 8px;
  }
}

.warning-btn {
  background: var(--color-warning);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
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

.type-selector {
  display: flex;
  gap: 8px;
}

.type-btn {
  flex: 1;
  height: 40px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}

.type-btn.active {
  background: var(--accent-subtle); border: 1px solid var(--accent-border); color: var(--accent-primary);
  border-color: transparent;
  color: white;
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

.btn-primary {
  flex: 1;
  height: 48px;
  background: var(--accent-primary);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  
}

@keyframes pulse-yellow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
