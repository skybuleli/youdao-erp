<template>
  <div class="dashboard-view">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15);">💰</div>
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
          <div class="mock-chart">
            <div v-for="(bar, i) in mockChartData" :key="i" class="bar" :style="{ height: bar + '%' }">
              <div class="bar-fill"></div>
            </div>
          </div>
          <div class="mock-labels">
            <span v-for="(day, i) in ['周一', '周二', '周三', '周四', '周五', '周六', '周日']" :key="i">{{ day }}</span>
          </div>
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
          <div class="order-amount amount">¥{{ order.amount }}</div>
          <div class="order-time">{{ order.time }}</div>
        </div>
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
import { reportApi } from '@/api'
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

const mockChartData = [45, 62, 38, 75, 55, 88, 65]

const topProducts = [
  { name: '伊利纯牛奶 250ml*24', amount: 450 },
  { name: '可口可乐 330ml*6', amount: 320 },
  { name: '五常大米 5kg', amount: 280 },
  { name: '奥利奥夹心饼干 116g', amount: 210 },
  { name: '康师傅红烧牛肉面', amount: 180 }
]

const recentOrders = [
  { id: 1, no: 'XS20250422001', type: 'sale', typeName: '销售出库', partner: '张老板', amount: 450, time: '14:30' },
  { id: 2, no: 'CG20250422003', type: 'purchase', typeName: '采购入库', partner: '供应商B', amount: 1200, time: '11:20' },
  { id: 3, no: 'XS20250422002', type: 'sale', typeName: '销售出库', partner: '客户C', amount: 180, time: '09:45' },
  { id: 4, no: 'TH20250422001', type: 'return', typeName: '销售退货', partner: '李老板', amount: 85, time: '昨天' }
]

async function loadDashboard() {
  loading.value = true
  try {
    const res = await reportApi.dashboard()
    Object.assign(stats, res.data)
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
  color: #8B5CF6;
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
  background: rgba(139, 92, 246, 0.15);
  color: #8B5CF6;
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
  background: var(--gradient-primary);
  border: none;
  color: white;
  box-shadow: var(--shadow-glow-purple);
}

.action-btn.primary:hover {
  box-shadow: var(--shadow-glow-pink);
}

.action-icon {
  font-size: 28px;
}
</style>
