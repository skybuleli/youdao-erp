<template>
  <div class="dashboard-view">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(124, 92, 252, 0.15);">💰</div>
        <div class="stat-info">
          <span class="stat-label">今日销售</span>
          <span class="stat-value gradient-text amount">¥{{ formatNumber(stats.todaySales) }}</span>
          <span class="stat-change positive">↑ 12%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15);">📥</div>
        <div class="stat-info">
          <span class="stat-label">今日采购</span>
          <span class="stat-value amount" style="color: var(--color-success);">¥{{ formatNumber(stats.todayPurchases) }}</span>
          <span class="stat-change negative">↓ 5%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15);">⚠️</div>
        <div class="stat-info">
          <span class="stat-label">库存预警</span>
          <span class="stat-value amount" style="color: var(--color-warning);">{{ stats.warningCount }}种</span>
          <span class="stat-hint">需补货</span>
        </div>
      </div>
    </div>

    <!-- Charts Area -->
    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <h3>📈 近7天销售趋势</h3>
        </div>
        <div class="chart-placeholder">
          <div v-if="salesTrend.length > 0" class="mock-chart">
            <div v-for="(bar, i) in salesTrend" :key="i" class="bar" :style="{ height: bar.height + '%' }">
              <div class="bar-fill"></div>
              <div class="bar-tooltip">¥{{ formatNumber(bar.sales) }}</div>
            </div>
          </div>
          <div v-if="salesTrend.length > 0" class="mock-labels">
            <span v-for="(bar, i) in salesTrend" :key="i">{{ bar.label }}</span>
          </div>
          <div v-else class="empty-state">暂无销售数据</div>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <h3>🔥 今日畅销 TOP 5</h3>
        </div>
        <div class="top-products">
          <div v-for="(item, i) in topProducts" :key="i" class="top-item">
            <span class="rank">{{ i + 1 }}</span>
            <span class="name">{{ item.name }}</span>
            <span class="amount amount">¥{{ item.amount }}</span>
          </div>
          <div v-if="topProducts.length === 0" class="empty-state">暂无数据</div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="recent-card">
      <div class="section-header">
        <h3>📝 最近开单</h3>
        <router-link to="/sale" class="link">查看全部 →</router-link>
      </div>
      <div class="order-list">
        <div v-for="order in recentOrders" :key="order.id" class="order-item">
          <div class="order-info">
            <span class="order-no">{{ order.no }}</span>
            <span class="order-type" :class="order.type">{{ order.typeName }}</span>
          </div>
          <div class="order-partner">{{ order.partner }}</div>
          <div class="order-amount amount">¥{{ formatNumber(order.amount) }}</div>
          <div class="order-time">{{ order.time }}</div>
        </div>
        <div v-if="recentOrders.length === 0" class="empty-state">暂无订单</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3>⚡ 快捷操作</h3>
      <div class="action-grid">
        <router-link to="/sale/pos" class="action-btn primary">
          <span class="action-icon">🛒</span>
          <span>销售开单</span>
        </router-link>
        <router-link to="/purchase/new" class="action-btn">
          <span class="action-icon">📥</span>
          <span>采购入库</span>
        </router-link>
        <router-link to="/inventory" class="action-btn">
          <span class="action-icon">📦</span>
          <span>库存查询</span>
        </router-link>
        <router-link to="/inventory" class="action-btn">
          <span class="action-icon">📋</span>
          <span>库存盘点</span>
        </router-link>
        <router-link to="/finance" class="action-btn">
          <span class="action-icon">💰</span>
          <span>收款</span>
        </router-link>
        <router-link to="/report" class="action-btn">
          <span class="action-icon">📊</span>
          <span>报表</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { reportApi, orderApi, partnerApi } from '@/api'
import type { DashboardStats } from '@/api/report'

const stats = reactive<DashboardStats>({
  todaySales: 0,
  todayPurchases: 0,
  warningCount: 0,
  receivableAmount: 0,
  payableAmount: 0,
  totalProducts: 0,
  totalPartners: 0
})
const loading = ref(false)

const salesTrend = ref<{ label: string; height: number; sales: number }[]>([])
const topProducts = ref<{ name: string; amount: number }[]>([])
const recentOrders = ref<{ id: number; no: string; type: string; typeName: string; partner: string; amount: number; time: string }[]>([])

const typeNameMap: Record<string, string> = {
  sale: '销售出库',
  purchase: '采购入库',
  return: '销售退货'
}

async function loadDashboard() {
  loading.value = true
  try {
    const [dashRes, salesRes, orderRes, partnerRes] = await Promise.all([
      reportApi.dashboard().catch(() => ({ data: null })),
      reportApi.sales('week').catch(() => ({ data: null })),
      orderApi.list().catch(() => ({ data: [] })),
      partnerApi.list().catch(() => ({ data: [] }))
    ])

    if (dashRes.data) {
      Object.assign(stats, dashRes.data)
    }

    if (salesRes.data && salesRes.data.length > 0) {
      const maxSales = Math.max(...salesRes.data.map((s: any) => s.sales || 0), 1)
      salesTrend.value = salesRes.data.slice(-7).map((s: any) => ({
        label: s.date?.slice(5) || '',
        height: Math.max(5, Math.round(((s.sales || 0) / maxSales) * 100)),
        sales: s.sales || 0
      }))
    }

    const partnerMap = new Map((partnerRes.data || []).map((p: any) => [p.id, p.name]))
    recentOrders.value = (orderRes.data || []).slice(0, 5).map((o: any) => {
      const date = o.createdAt ? new Date(o.createdAt) : null
      const now = new Date()
      const isToday = date && date.toDateString() === now.toDateString()
      const timeStr = date
        ? isToday
          ? date.toTimeString().slice(0, 5)
          : date.toISOString().slice(5, 10)
        : ''
      return {
        id: o.id,
        no: o.orderNo,
        type: o.subType === 'return' ? 'return' : o.type,
        typeName: o.subType === 'return' ? '销售退货' : typeNameMap[o.type] || o.type,
        partner: partnerMap.get(o.partnerId) || `客户#${o.partnerId}`,
        amount: o.totalAmount || 0,
        time: timeStr
      }
    })
  } catch (err: any) {
    console.error('Dashboard load failed:', err.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadDashboard)

function formatNumber(n: number) {
  return n.toLocaleString('zh-CN')
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.stat-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-info {
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
  font-family: var(--font-display);
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--color-success);
}

.stat-change.negative {
  color: var(--color-danger);
}

.stat-hint {
  font-size: 12px;
  color: var(--color-warning);
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 768px) {
  .charts-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.chart-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.mock-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 180px;
  padding-bottom: 8px;
}

.bar {
  flex: 1;
  display: flex;
  align-items: flex-end;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  height: 100%;
  background: var(--gradient-primary);
  opacity: 0.8;
  transition: opacity 0.2s;
}

.bar:hover .bar-fill {
  opacity: 1;
}

.mock-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
}

.mock-labels span {
  font-size: 12px;
  color: var(--text-tertiary);
  flex: 1;
  text-align: center;
}

/* Top Products */
.top-products {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}

.rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.name {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount {
  font-weight: 600;
  color: var(--text-primary);
}

/* Recent Orders */
.recent-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.link {
  color: #7C5CFC;
  font-size: 14px;
  text-decoration: none;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-no {
  font-size: 12px;
  color: var(--text-tertiary);
  font-family: monospace;
}

.order-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  width: fit-content;
}

.order-type.sale {
  background: rgba(124, 92, 252, 0.15);
  color: #7C5CFC;
}

.order-type.purchase {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.order-type.return {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.order-partner {
  color: var(--text-secondary);
}

.order-amount {
  font-weight: 600;
}

.order-time {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Quick Actions */
.quick-actions {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.quick-actions h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .action-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
}

.action-btn.primary {
  background: var(--accent-primary);
  border: none;
  color: white;
  
}

.action-btn.primary:hover {
  
}

.action-icon {
  font-size: 28px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.bar-tooltip {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.bar {
  position: relative;
}

.bar:hover .bar-tooltip {
  opacity: 1;
}
</style>
