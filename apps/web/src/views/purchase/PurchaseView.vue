<template>
  <div class="purchase-view">
    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-label">本月采购</span>
        <span class="stat-value amount gradient-text">¥{{ formatNumber(monthTotal) }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">采购单数</span>
        <span class="stat-value amount">{{ orders.length }}</span>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="filter-group">
        <select v-model="statusFilter" class="kimi-select">
          <option value="all">全部状态</option>
          <option value="pending">待入库</option>
          <option value="partial">部分入库</option>
          <option value="completed">已完成</option>
        </select>
      </div>
      <router-link to="/purchase/new" class="btn-primary">
        <span>➕ 新增采购单</span>
      </router-link>
    </div>

    <!-- Order List -->
    <div class="order-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-no">{{ order.no }}</div>
          <div class="order-status" :class="order.status">{{ statusText(order.status) }}</div>
        </div>
        <div class="order-body">
          <div class="order-supplier">
            <span class="label">供应商</span>
            <span class="value">{{ order.supplier }}</span>
          </div>
          <div class="order-items-preview">
            <span class="label">商品</span>
            <span class="value">{{ order.items.map(i => i.name).join('、') }}</span>
          </div>
          <div class="order-meta">
            <div>
              <span class="label">数量</span>
              <span class="value amount">{{ order.totalQty }} 件</span>
            </div>
            <div>
              <span class="label">金额</span>
              <span class="value amount" style="color: #8B5CF6;">¥{{ order.totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-date">{{ order.date }}</span>
          <div class="order-actions">
            <button v-if="order.status !== 'completed'" class="action-btn primary" @click="receiveOrder(order)">
              入库
            </button>
            <button class="action-btn" @click="viewDetail(order)">详情</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { orderApi } from '@/api'

const statusFilter = ref('all')
const orders = ref<Array<{ id: number; no: string; status: string; supplier: string; items: Array<{ name: string }>; totalQty: number; totalAmount: number; date: string }>>([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await orderApi.list({
      type: 'purchase',
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined
    })
    orders.value = res.data.map((o: any) => ({
      id: o.id,
      no: o.orderNo,
      status: o.status,
      supplier: `往来单位#${o.partnerId}`,
      items: (o.items || []).map((i: any) => ({ name: `商品#${i.productId}` })),
      totalQty: (o.items || []).reduce((sum: number, i: any) => sum + i.qty, 0),
      totalAmount: o.totalAmount,
      date: o.orderDate || o.createdAt?.slice(0, 10) || ''
    }))
  } catch (e: any) {
    alert(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const monthTotal = computed(() => orders.value.reduce((sum, o) => sum + o.totalAmount, 0))

const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') return orders.value
  return orders.value.filter(o => o.status === statusFilter.value)
})

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: '待入库',
    partial: '部分入库',
    completed: '已完成'
  }
  return map[status] || status
}

function formatNumber(n: number) {
  return n.toLocaleString('zh-CN')
}

function receiveOrder(order: any) {
  alert(`入库 ${order.no}（待实现）`)
}

function viewDetail(order: any) {
  alert(`查看 ${order.no} 详情（待实现）`)
}

watch(statusFilter, loadData)
onMounted(loadData)
</script>

<style scoped>
.purchase-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-group {
  flex: 1;
}

.kimi-select {
  width: 100%;
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 12px;
  color: var(--text-primary);
  font-size: 14px;
}

.btn-primary {
  height: 44px;
  padding: 0 16px;
  background: var(--gradient-primary);
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
  box-shadow: var(--shadow-glow-purple);
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

.order-no {
  font-size: 14px;
  font-weight: 600;
  font-family: monospace;
}

.order-status {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: var(--radius-full);
}

.order-status.pending {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.order-status.partial {
  background: rgba(59, 130, 246, 0.15);
  color: var(--color-info);
}

.order-status.completed {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
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

.order-supplier,
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
  height: 32px;
  padding: 0 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}

.action-btn.primary {
  background: var(--gradient-subtle);
  border-color: #8B5CF6;
  color: var(--text-primary);
}
</style>
