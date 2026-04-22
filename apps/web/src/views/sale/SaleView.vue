<template>
  <div class="sale-view">
    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-label">本月销售</span>
        <span class="stat-value amount gradient-text">¥{{ formatNumber(monthTotal) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">销售单数</span>
        <span class="stat-value amount">{{ orders.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">毛利润</span>
        <span class="stat-value amount" style="color: var(--color-success);">¥{{ formatNumber(profit) }}</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" class="kimi-input" placeholder="搜索单号、客户..." />
      </div>
      <router-link to="/sale/return" class="btn-warning">
        <span>🔄 退货</span>
      </router-link>
      <router-link to="/sale/pos" class="btn-primary">
        <span>🛒 开单</span>
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">加载中...</div>

    <!-- Order List -->
    <div v-else class="order-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">{{ order.no }}</span>
            <span class="order-type" :class="order.type">{{ order.typeName }}</span>
          </div>
          <span class="order-amount amount gradient-text">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="order-body">
          <div class="order-customer">
            <span class="label">客户</span>
            <span class="value">{{ order.customer }}</span>
          </div>
          <div class="order-items-preview">
            <span class="label">商品</span>
            <span class="value">{{ order.items.map(i => i.name).join('、') }}</span>
          </div>
          <div class="order-meta">
            <div>
              <span class="label">数量</span>
              <span class="value amount">{{ order.totalQty }}</span>
            </div>
            <div>
              <span class="label">支付方式</span>
              <span class="value">{{ order.payment }}</span>
            </div>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-date">{{ order.date }}</span>
          <div class="order-actions">
            <button class="action-btn" @click="printReceipt(order)">🖨️ 打印</button>
            <button class="action-btn" @click="viewDetail(order)">详情</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { orderApi } from '@/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const searchQuery = ref('')
const orders = ref<Array<{ id: number; no: string; type: string; typeName: string; customer: string; items: Array<{ name: string }>; totalQty: number; totalAmount: number; payment: string; date: string }>>([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await orderApi.list({ type: 'sale' })
    orders.value = res.data.map((o: any) => ({
      id: o.id,
      no: o.orderNo,
      type: o.subType || 'sale',
      typeName: o.subType ? '销售退货' : '销售出库',
      customer: `往来单位#${o.partnerId}`,
      items: (o.items || []).map((i: any) => ({ name: `商品#${i.productId}` })),
      totalQty: (o.items || []).reduce((sum: number, i: any) => sum + i.qty, 0),
      totalAmount: o.totalAmount,
      payment: o.paymentMethod || '-',
      date: o.orderDate || o.createdAt?.slice(0, 10) || ''
    }))
  } catch (e: any) {
    toast.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const monthTotal = computed(() => orders.value.filter(o => o.type === 'sale').reduce((sum, o) => sum + o.totalAmount, 0))
const profit = computed(() => Math.round(monthTotal.value * 0.2))

const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value
  const q = searchQuery.value.toLowerCase()
  return orders.value.filter(o =>
    o.no.toLowerCase().includes(q) ||
    o.customer.toLowerCase().includes(q)
  )
})

function formatNumber(n: number) {
  return n.toLocaleString('zh-CN')
}

function printReceipt(order: any) {
  toast.info(`打印 ${order.no} 小票（待实现）`)
}

function viewDetail(order: any) {
  toast.info(`查看 ${order.no} 详情（待实现）`)
}

onMounted(loadData)
</script>

<style scoped>
.sale-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-item {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
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

.btn-primary,
.btn-warning {
  height: 44px;
  padding: 0 16px;
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  text-decoration: none;
}

.btn-primary {
  background: var(--accent-primary);
}

.btn-warning {
  background: var(--color-warning);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  transition: all 0.2s;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-no {
  font-size: 14px;
  font-weight: 600;
  font-family: monospace;
}

.order-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.order-type.sale {
  background: rgba(124, 92, 252, 0.15);
  color: #7C5CFC;
}

.order-type.return {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.order-amount {
  font-size: 18px;
  font-weight: 700;
}

.order-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 12px;
}

.order-customer,
.order-items-preview {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.order-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.label {
  color: var(--text-tertiary);
  font-size: 13px;
}

.value {
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-date {
  font-size: 13px;
  color: var(--text-tertiary);
}

.order-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  height: 36px;
  padding: 0 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}

@media (max-width: 640px) {
  .action-btn {
    min-height: 44px;
    padding: 0 18px;
    font-size: 14px;
  }
}
</style>
