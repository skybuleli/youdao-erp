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

    <!-- Partner List -->
    <div class="partner-list">
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
          <button class="action-btn primary" @click="viewBills(partner)">📋 查看账单</button>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button class="fab" @click="showAddModal = true">
      <span>➕</span>
    </button>

    <!-- Add Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>新增往来单位</h3>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { partnerApi } from '@/api'

const activeTab = ref('all')
const searchQuery = ref('')
const showAddModal = ref(false)
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
    alert(e.message || '加载失败')
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

function callPartner(phone: string) {
  window.location.href = `tel:${phone}`
}

function viewBills(partner: any) {
  alert(`查看 ${partner.name} 的账单（待实现）`)
}

async function savePartner() {
  if (!form.name) {
    alert('请输入单位名称')
    return
  }
  try {
    await partnerApi.create({
      type: form.type as 'customer' | 'supplier',
      name: form.name,
      contact: form.contact,
      phone: form.phone,
      address: form.address
    })
    showAddModal.value = false
    Object.assign(form, { type: 'customer', name: '', contact: '', phone: '', address: '' })
    await loadData()
    alert('保存成功')
  } catch (e: any) {
    alert(e.message || '保存失败')
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
  background: var(--gradient-primary);
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
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
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
  background: rgba(139, 92, 246, 0.15);
  color: #8B5CF6;
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
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  height: 40px;
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
  border-color: #8B5CF6;
  color: var(--text-primary);
}

.fab {
  position: fixed;
  right: 20px;
  bottom: 84px;
  width: 56px;
  height: 56px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: var(--shadow-glow-purple);
  z-index: 50;
  transition: all 0.2s;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow-pink);
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
  background: var(--gradient-primary);
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
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-glow-purple);
}
</style>
