<template>
  <div class="finance-view">
    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(124, 92, 252, 0.15);">💰</div>
        <div class="stat-info">
          <span class="stat-label">应收账款</span>
          <span class="stat-value amount gradient-text">¥{{ formatNumber(receivable) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15);">💵</div>
        <div class="stat-info">
          <span class="stat-label">应付账款</span>
          <span class="stat-value amount" style="color: var(--color-success);">¥{{ formatNumber(payable) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15);">📊</div>
        <div class="stat-info">
          <span class="stat-label">本月收支</span>
          <span class="stat-value amount" style="color: var(--color-info);">¥{{ formatNumber(monthNet) }}</span>
        </div>
      </div>
    </div>

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

    <!-- Receivable List -->
    <div v-if="activeTab === 'receivable'" class="bill-list">
      <div v-for="bill in receivableBills" :key="bill.id" class="bill-card">
        <div class="bill-header">
          <div class="bill-partner">
            <div class="partner-avatar">{{ bill.partner.charAt(0) }}</div>
            <div>
              <div class="partner-name">{{ bill.partner }}</div>
              <div class="bill-no">{{ bill.orderNo }}</div>
            </div>
          </div>
          <div class="bill-amount">
            <span class="amount-label">应收</span>
            <span class="amount-value amount">¥{{ bill.amount.toFixed(2) }}</span>
          </div>
        </div>
        <div class="bill-meta">
          <span>📅 到期: {{ bill.dueDate }}</span>
          <span>⏰ 逾期 {{ bill.overdue }} 天</span>
        </div>
        <div class="bill-actions">
          <button class="action-btn" @click="viewDetail(bill)">查看详情</button>
          <button class="action-btn primary" @click="receivePayment(bill)">💰 收款</button>
        </div>
      </div>
    </div>

    <!-- Payable List -->
    <div v-if="activeTab === 'payable'" class="bill-list">
      <div v-for="bill in payableBills" :key="bill.id" class="bill-card">
        <div class="bill-header">
          <div class="bill-partner">
            <div class="partner-avatar" style="background: var(--color-success);">{{ bill.partner.charAt(0) }}</div>
            <div>
              <div class="partner-name">{{ bill.partner }}</div>
              <div class="bill-no">{{ bill.orderNo }}</div>
            </div>
          </div>
          <div class="bill-amount">
            <span class="amount-label">应付</span>
            <span class="amount-value amount">¥{{ bill.amount.toFixed(2) }}</span>
          </div>
        </div>
        <div class="bill-meta">
          <span>📅 到期: {{ bill.dueDate }}</span>
        </div>
        <div class="bill-actions">
          <button class="action-btn" @click="viewDetail(bill)">查看详情</button>
          <button class="action-btn primary" @click="makePayment(bill)">💳 付款</button>
        </div>
      </div>
    </div>

    <!-- Cash Flow -->
    <div v-if="activeTab === 'cashflow'" class="cashflow-section">
      <div class="flow-card income">
        <div class="flow-header">
          <span class="flow-icon">📈</span>
          <span class="flow-title">本月收入</span>
        </div>
        <div class="flow-amount amount gradient-text">¥{{ formatNumber(monthIncome) }}</div>
        <div class="flow-list">
          <div v-for="(item, i) in incomeItems" :key="i" class="flow-item">
            <span>{{ item.name }}</span>
            <span class="amount">¥{{ item.amount }}</span>
          </div>
        </div>
      </div>
      <div class="flow-card expense">
        <div class="flow-header">
          <span class="flow-icon">📉</span>
          <span class="flow-title">本月支出</span>
        </div>
        <div class="flow-amount amount" style="color: var(--color-danger);">¥{{ formatNumber(monthExpense) }}</div>
        <div class="flow-list">
          <div v-for="(item, i) in expenseItems" :key="i" class="flow-item">
            <span>{{ item.name }}</span>
            <span class="amount">¥{{ item.amount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Receive Payment Modal -->
    <div v-if="showReceiveModal" class="modal-overlay" @click.self="showReceiveModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>收款 - {{ currentBill?.partner }}</h3>
          <button class="close-btn" @click="showReceiveModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>应收金额</label>
            <input :value="currentBill?.amount" class="kimi-input" disabled />
          </div>
          <div class="form-group">
            <label>实收金额</label>
            <input v-model.number="receiveAmount" type="number" class="kimi-input" placeholder="0.00" />
          </div>
          <div class="form-group">
            <label>支付方式</label>
            <div class="payment-selector">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                class="payment-btn"
                :class="{ active: selectedPayment === method.value }"
                @click="selectedPayment = method.value"
              >
                {{ method.icon }} {{ method.label }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>备注</label>
            <input v-model="receiveRemark" class="kimi-input" placeholder="收款备注..." />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showReceiveModal = false">取消</button>
          <button class="btn-primary" @click="confirmReceive">确认收款</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { financeApi } from '@/api'

const activeTab = ref('receivable')
const showReceiveModal = ref(false)
const currentBill = ref<any>(null)
const receiveAmount = ref(0)
const selectedPayment = ref('cash')
const receiveRemark = ref('')
const loading = ref(false)

const tabs = [
  { value: 'receivable', label: '应收' },
  { value: 'payable', label: '应付' },
  { value: 'cashflow', label: '收支' }
]

const receivable = ref(8500)
const payable = ref(5600)
const monthIncome = ref(12800)
const monthExpense = ref(8900)
const monthNet = computed(() => monthIncome.value - monthExpense.value)

const receivableBills = ref([
  { id: 1, partner: '张老板', orderNo: 'XS20250422001', amount: 2450, dueDate: '2025-05-22', overdue: 0 },
  { id: 2, partner: '客户C', orderNo: 'XS20250420003', amount: 880, dueDate: '2025-05-20', overdue: 0 },
  { id: 3, partner: '张老板', orderNo: 'XS20250415002', amount: 3200, dueDate: '2025-05-15', overdue: 7 },
  { id: 4, partner: '李老板', orderNo: 'XS20250410001', amount: 1970, dueDate: '2025-05-10', overdue: 12 }
])

const payableBills = ref([
  { id: 1, partner: '供应商A', orderNo: 'CG20250422001', amount: 3250, dueDate: '2025-05-22' },
  { id: 2, partner: '供应商B', orderNo: 'CG20250421002', amount: 2350, dueDate: '2025-05-21' }
])

const incomeItems = ref([
  { name: '销售收入', amount: 11200 },
  { name: '其他收入', amount: 1600 }
])

const expenseItems = ref([
  { name: '采购支出', amount: 6500 },
  { name: '运费', amount: 800 },
  { name: '房租', amount: 1200 },
  { name: '其他', amount: 400 }
])

const paymentMethods = [
  { value: 'cash', label: '现金', icon: '💵' },
  { value: 'wechat', label: '微信', icon: '💚' },
  { value: 'alipay', label: '支付宝', icon: '🔵' },
  { value: 'bank', label: '银行', icon: '🏦' }
]

async function loadData() {
  loading.value = true
  try {
    const [recRes, payRes] = await Promise.all([
      financeApi.receivables(),
      financeApi.payables()
    ])
    if (recRes.data && recRes.data.length > 0) {
      receivableBills.value = recRes.data.map((r: any) => ({
        id: r.partnerId,
        partner: r.partnerName,
        orderNo: r.orderNo,
        amount: r.amount,
        dueDate: r.dueDate,
        overdue: r.overdue
      }))
      receivable.value = receivableBills.value.reduce((sum, b) => sum + b.amount, 0)
    }
    if (payRes.data && payRes.data.length > 0) {
      payableBills.value = payRes.data.map((r: any) => ({
        id: r.partnerId,
        partner: r.partnerName,
        orderNo: r.orderNo,
        amount: r.amount,
        dueDate: r.dueDate,
        overdue: r.overdue || 0
      }))
      payable.value = payableBills.value.reduce((sum, b) => sum + b.amount, 0)
    }
  } catch {
    console.log('Finance API not ready, using mock data')
  } finally {
    loading.value = false
  }
}

function formatNumber(n: number) {
  return n.toLocaleString('zh-CN')
}

function receivePayment(bill: any) {
  currentBill.value = bill
  receiveAmount.value = bill.amount
  selectedPayment.value = 'cash'
  receiveRemark.value = ''
  showReceiveModal.value = true
}

function confirmReceive() {
  if (currentBill.value && receiveAmount.value > 0) {
    currentBill.value.amount -= receiveAmount.value
    if (currentBill.value.amount <= 0) {
      receivableBills.value = receivableBills.value.filter(b => b.id !== currentBill.value.id)
    }
    showReceiveModal.value = false
    alert('收款成功！')
  }
}

function makePayment(bill: any) {
  alert(`付款给 ${bill.partner}（待实现）`)
}

function viewDetail(bill: any) {
  alert(`查看 ${bill.orderNo} 详情（待实现）`)
}

onMounted(loadData)
</script>

<style scoped>
.finance-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.stat-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
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

.bill-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bill-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: all 0.2s;
}

.bill-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.bill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bill-partner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.partner-avatar {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.partner-name {
  font-size: 15px;
  font-weight: 600;
}

.bill-no {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: monospace;
}

.bill-amount {
  text-align: right;
}

.amount-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

.amount-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-danger);
}

.bill-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 10px 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 12px;
}

.bill-actions {
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
}

.action-btn.primary {
  background: var(--gradient-subtle);
  border-color: #7C5CFC;
  color: var(--text-primary);
}

/* Cash Flow */
.cashflow-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flow-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.flow-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.flow-icon {
  font-size: 20px;
}

.flow-title {
  font-size: 14px;
  color: var(--text-secondary);
}

.flow-amount {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border-subtle);
}

.flow-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
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

.kimi-input {
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 12px;
  color: var(--text-primary);
  font-size: 15px;
  width: 100%;
}

.kimi-input:focus {
  border-color: #7C5CFC;
  outline: none;
}

.payment-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.payment-btn {
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.payment-btn.active {
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
</style>
