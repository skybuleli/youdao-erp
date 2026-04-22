<template>
  <div class="partner-view">
    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Search -->
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input v-model="searchQuery" class="kimi-input" placeholder="搜索名称、联系人、电话..." />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">加载中...</div>

    <!-- Partner List -->
    <div v-else class="partner-list">
      <div v-for="partner in filteredPartners" :key="partner.id" class="partner-card">
        <div class="partner-header">
          <div class="partner-avatar">{{ partner.name.charAt(0) }}</div>
          <div class="partner-info">
            <div class="partner-name">{{ partner.name }}</div>
            <div class="partner-tag" :class="partner.type">{{ partner.typeName }}</div>
          </div>
          <div class="partner-amount">
            <div class="amount-label">{{ partner.type === 'customer' ? '应收' : '应付' }}</div>
            <div class="amount-value amount" :class="{ positive: partner.balance > 0 }">
              ¥{{ partner.balance.toFixed(2) }}
            </div>
          </div>
        </div>
        <div class="partner-details">
          <div class="detail-item">
            <span class="detail-label">👤 联系人</span>
            <span>{{ partner.contact }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">📞 电话</span>
            <span>{{ partner.phone }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">📍 地址</span>
            <span>{{ partner.address }}</span>
          </div>
        </div>
        <div class="partner-actions">
          <button class="action-btn" @click="callPartner(partner.phone)">📞 打电话</button>
          <button class="action-btn" @click="openDetail(partner)">📦 供应商品</button>
          <button class="action-btn primary" @click="editPartner(partner)">✏️ 编辑</button>
          <button class="action-btn danger" @click="deletePartner(partner)">🗑️ 删除</button>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button class="fab" @click="openAddModal">
      <span>➕</span>
    </button>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>{{ editingPartner ? '编辑往来单位' : '新增往来单位' }}</h3>
          <button class="close-btn" @click="showAddModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>类型</label>
            <div class="type-selector">
              <button
                v-for="t in [{v:'customer',l:'客户'},{v:'supplier',l:'供应商'}]"
                :key="t.v"
                class="type-btn"
                :class="{ active: form.type === t.v }"
                @click="form.type = t.v"
              >
                {{ t.l }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>名称</label>
            <input v-model="form.name" class="kimi-input" placeholder="单位名称" />
          </div>
          <div class="form-group">
            <label>联系人</label>
            <input v-model="form.contact" class="kimi-input" placeholder="联系人姓名" />
          </div>
          <div class="form-group">
            <label>电话</label>
            <input v-model="form.phone" class="kimi-input" placeholder="联系电话" />
          </div>
          <div class="form-group">
            <label>地址</label>
            <input v-model="form.address" class="kimi-input" placeholder="详细地址" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn-primary" @click="savePartner">保存</button>
        </div>
      </div>
    </div>

    <!-- Detail Modal: Supplier Products -->
    <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>📦 {{ detailPartner?.name }} — 供应商品</h3>
          <button class="close-btn" @click="showDetailModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="detailProducts.length === 0" class="empty-state">
            <span class="empty-icon">📦</span>
            <span>该供应商暂无商品</span>
          </div>
          <div v-else class="detail-product-list">
            <div v-for="p in detailProducts" :key="p.id" class="detail-product-item">
              <div class="dp-name">{{ p.name }}</div>
              <div class="dp-meta">
                <span>条码: {{ p.barcode || '-' }}</span>
                <span>库存: {{ p.stockQty }}</span>
                <span>进价: ¥{{ p.purchasePrice }}</span>
                <span>售价: ¥{{ p.salePrice }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDetailModal = false">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { partnerApi, productApi } from '@/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const activeTab = ref('all')
const searchQuery = ref('')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const editingPartner = ref<any>(null)
const detailPartner = ref<any>(null)
const detailProducts = ref<Array<any>>([])
const loading = ref(false)
const partners = ref<Array<any>>([])

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'customer', label: '客户' },
  { value: 'supplier', label: '供应商' }
]

async function loadData() {
  loading.value = true
  try {
    const type = activeTab.value === 'all' ? undefined : activeTab.value
    const res = await partnerApi.list({ type, search: searchQuery.value || undefined })
    partners.value = res.data.map((p: any) => ({
      ...p,
      typeName: p.type === 'customer' ? '客户' : '供应商'
    }))
  } catch (e: any) {
    toast.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const filteredPartners = computed(() => {
  let result = partners.value
  if (activeTab.value !== 'all') {
    result = result.filter((p: any) => p.type === activeTab.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p: any) =>
      p.name.toLowerCase().includes(q) ||
      (p.contact && p.contact.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q))
    )
  }
  return result
})

const form = reactive({
  type: 'customer',
  name: '',
  contact: '',
  phone: '',
  address: ''
})

function openAddModal() {
  editingPartner.value = null
  Object.assign(form, { type: 'customer', name: '', contact: '', phone: '', address: '' })
  showAddModal.value = true
}

function editPartner(partner: any) {
  editingPartner.value = partner
  Object.assign(form, {
    type: partner.type,
    name: partner.name,
    contact: partner.contact || '',
    phone: partner.phone || '',
    address: partner.address || ''
  })
  showAddModal.value = true
}

async function deletePartner(partner: any) {
  if (!confirm(`确定要删除「${partner.name}」吗？如果该供应商下还有商品，将无法删除。`)) return
  try {
    await partnerApi.delete(partner.id)
    await loadData()
    toast.success('删除成功')
  } catch (e: any) {
    toast.error(e.message || '删除失败')
  }
}

async function openDetail(partner: any) {
  detailPartner.value = partner
  showDetailModal.value = true
  detailProducts.value = []
  if (partner.type === 'supplier') {
    try {
      const res = await productApi.list({ supplier: String(partner.id) })
      detailProducts.value = res.data
    } catch (e: any) {
      toast.error(e.message || '加载商品失败')
    }
  }
}

function callPartner(phone: string) {
  window.location.href = `tel:${phone}`
}

async function savePartner() {
  if (!form.name) {
    toast.warning('请输入单位名称')
    return
  }
  try {
    if (editingPartner.value) {
      await partnerApi.update(editingPartner.value.id, {
        type: form.type as 'customer' | 'supplier',
        name: form.name,
        contact: form.contact,
        phone: form.phone,
        address: form.address
      })
    } else {
      await partnerApi.create({
        type: form.type as 'customer' | 'supplier',
        name: form.name,
        contact: form.contact,
        phone: form.phone,
        address: form.address
      })
    }
    showAddModal.value = false
    editingPartner.value = null
    Object.assign(form, { type: 'customer', name: '', contact: '', phone: '', address: '' })
    await loadData()
    toast.success('保存成功')
  } catch (e: any) {
    toast.error(e.message || '保存失败')
  }
}

watch([activeTab, searchQuery], loadData)
onMounted(loadData)
</script>

<style scoped>
.partner-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab {
  flex: 1;
  height: 40px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: var(--accent-subtle); border: 1px solid var(--accent-border); color: var(--accent-primary);
  border-color: transparent;
  color: white;
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
  box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.15);
  outline: none;
}

.partner-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.partner-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: all 0.2s;
}

.partner-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.partner-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.partner-avatar {
  width: 44px;
  height: 44px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.partner-info {
  flex: 1;
}

.partner-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.partner-tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.partner-tag.customer {
  background: rgba(124, 92, 252, 0.15);
  color: #7C5CFC;
}

.partner-tag.supplier {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.partner-amount {
  text-align: right;
}

.amount-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

.amount-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-secondary);
}

.amount-value.positive {
  color: var(--color-danger);
}

.partner-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-label {
  color: var(--text-tertiary);
}

.partner-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.action-btn {
  height: 36px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn.primary {
  background: var(--gradient-subtle);
  border-color: #7C5CFC;
  color: var(--text-primary);
}

.action-btn.danger {
  color: var(--color-danger);
}

.action-btn.danger:hover {
  background: rgba(239, 74, 74, 0.1);
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 84px;
  width: 56px;
  height: 56px;
  background: var(--accent-primary);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 50;
  transition: all 0.2s;
}

.fab:hover {
  transform: scale(1.05);
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
  font-size: 14px;
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

/* Detail product list */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.detail-product-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-product-item {
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.dp-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}

.dp-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
