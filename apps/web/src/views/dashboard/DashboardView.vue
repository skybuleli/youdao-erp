<template>
  <div class="dashboard-view">
    <!-- Stats Cards - Bento Grid -->
    <div class="stats-grid">
      <div class="stat-card spotlight" @mousemove="handleSpotlight" @mouseleave="resetSpotlight">
        <div class="stat-icon" style="background: var(--color-brand-muted);">
          <TrendingUp class="w-6 h-6" style="color: var(--color-brand);" />
        </div>
        <div class="stat-info">
          <span class="stat-label">今日销售</span>
          <span class="stat-value gradient-text amount">¥{{ formatNumber(stats.todaySales) }}</span>
          <span class="stat-change positive">↑ 12%</span>
        </div>
      </div>
      <div class="stat-card spotlight" @mousemove="handleSpotlight" @mouseleave="resetSpotlight">
        <div class="stat-icon" style="background: var(--color-success-muted);">
          <ArrowDownLeft class="w-6 h-6" style="color: var(--color-success);" />
        </div>
        <div class="stat-info">
          <span class="stat-label">今日采购</span>
          <span class="stat-value amount" style="color: var(--color-success);">¥{{ formatNumber(stats.todayPurchases) }}</span>
          <span class="stat-change negative">↓ 5%</span>
        </div>
      </div>
      <div class="stat-card spotlight" @mousemove="handleSpotlight" @mouseleave="resetSpotlight">
        <div class="stat-icon" style="background: var(--color-warning-muted);">
          <AlertTriangle class="w-6 h-6" style="color: var(--color-warning);" />
        </div>
        <div class="stat-info">
          <span class="stat-label">库存预警</span>
          <span class="stat-value amount" style="color: var(--color-warning);">{{ stats.warningCount }}种</span>
          <span class="stat-hint">需补货</span>
        </div>
      </div>
    </div>

    <!-- Charts Area -->
    <div class="charts-grid">
      <div class="chart-card bento-item-large">
        <div class="chart-header">
          <BarChart3 class="w-4 h-4" />
          <h3>近7天销售趋势</h3>
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
          <div v-else class="empty-state">
            <BarChart3 class="w-8 h-8 opacity-40" />
            <span>暂无销售数据</span>
          </div>
        </div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <Flame class="w-4 h-4" />
          <h3>今日畅销 TOP 5</h3>
        </div>
        <div class="top-products">
          <div v-for="(item, i) in topProducts" :key="i" class="top-item">
            <span class="rank">{{ i + 1 }}</span>
            <span class="name">{{ item.name }}</span>
            <span class="amount amount">¥{{ item.amount }}</span>
          </div>
          <div v-if="topProducts.length === 0" class="empty-state">
            <Package class="w-8 h-8 opacity-40" />
            <span>暂无数据</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="recent-card card">
      <div class="section-header">
        <div class="section-title">
          <FileText class="w-4 h-4" />
          <h3>最近开单</h3>
        </div>
        <router-link to="/sale" class="link">
          查看全部
          <ChevronRight class="w-4 h-4" />
        </router-link>
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
        <div v-if="recentOrders.length === 0" class="empty-state">
          <FileText class="w-8 h-8 opacity-40" />
          <span>暂无订单</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions card">
      <div class="section-header">
        <div class="section-title">
          <Zap class="w-4 h-4" />
          <h3>快捷操作</h3>
        </div>
      </div>
      <div class="action-grid">
        <router-link to="/sale/pos" class="action-btn primary">
          <Store class="action-icon" />
          <span>销售开单</span>
        </router-link>
        <router-link to="/purchase/new" class="action-btn">
          <ShoppingCart class="action-icon" />
          <span>采购入库</span>
        </router-link>
        <router-link to="/inventory" class="action-btn">
          <Search class="action-icon" />
          <span>库存查询</span>
        </router-link>
        <router-link to="/inventory" class="action-btn">
          <ClipboardList class="action-icon" />
          <span>库存盘点</span>
        </router-link>
        <router-link to="/finance" class="action-btn">
          <CreditCard class="action-icon" />
          <span>收款</span>
        </router-link>
        <router-link to="/report" class="action-btn">
          <BarChart3 class="action-icon" />
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
import {
  TrendingUp,
  ArrowDownLeft,
  AlertTriangle,
  BarChart3,
  Flame,
  FileText,
  ChevronRight,
  Zap,
  Store,
  ShoppingCart,
  Search,
  ClipboardList,
  CreditCard,
  Package
} from 'lucide-vue-next'

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

// Spotlight effect handler
function handleSpotlight(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  card.style.setProperty('--mouse-x', `${x}%`)
  card.style.setProperty('--mouse-y', `${y}%`)
}

function resetSpotlight(e: MouseEvent) {
  const card = e.currentTarget as HTMLElement
  card.style.removeProperty('--mouse-x')
  card.style.removeProperty('--mouse-y')
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
  gap: 1rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.stat-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--color-muted-foreground);
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-mono);
  line-height: 1.2;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: var(--color-success);
}

.stat-change.negative {
  color: var(--color-danger);
}

.stat-hint {
  font-size: 0.75rem;
  color: var(--color-warning);
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .charts-grid {
    grid-template-columns: 2fr 1fr;
  }
}

.chart-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  transition: box-shadow 0.2s ease;
}

.chart-card:hover {
  box-shadow: var(--shadow-sm);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--color-foreground);
}

.chart-header h3 {
  font-size: 0.9375rem;
  font-weight: 600;
}

.mock-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  height: 180px;
  padding-bottom: 0.5rem;
}

.bar {
  flex: 1;
  display: flex;
  align-items: flex-end;
  border-radius: 0.375rem 0.375rem 0 0;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, var(--color-brand) 0%, rgba(124, 92, 252, 0.4) 100%);
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.bar:hover .bar-fill {
  opacity: 1;
}

.mock-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 0.25rem;
}

.mock-labels span {
  font-size: 0.6875rem;
  color: var(--color-muted-foreground);
  flex: 1;
  text-align: center;
}

/* Top Products */
.top-products {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  background: var(--color-secondary);
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
}

.top-item:hover {
  background: var(--color-accent);
}

.rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c5cfc 0%, #5b8def 100%);
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.name {
  flex: 1;
  font-size: 0.8125rem;
  color: var(--color-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount {
  font-weight: 600;
  color: var(--color-foreground);
  font-size: 0.8125rem;
}

/* Recent Orders */
.recent-card {
  padding: 1.25rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-foreground);
}

.section-title h3 {
  font-size: 0.9375rem;
  font-weight: 600;
}

.link {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  color: var(--color-brand);
  font-size: 0.8125rem;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.15s ease;
}

.link:hover {
  opacity: 0.8;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.order-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-secondary);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  transition: background 0.15s ease;
}

.order-item:hover {
  background: var(--color-accent);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.order-no {
  font-size: 0.6875rem;
  color: var(--color-muted-foreground);
  font-family: var(--font-mono);
}

.order-type {
  font-size: 0.6875rem;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-full);
  width: fit-content;
  font-weight: 500;
}

.order-type.sale {
  background: var(--color-brand-muted);
  color: var(--color-brand);
}

.order-type.purchase {
  background: var(--color-success-muted);
  color: var(--color-success);
}

.order-type.return {
  background: var(--color-warning-muted);
  color: var(--color-warning);
}

.order-partner {
  color: var(--color-muted-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-amount {
  font-weight: 600;
  font-family: var(--font-mono);
}

.order-time {
  font-size: 0.6875rem;
  color: var(--color-muted-foreground);
  font-family: var(--font-mono);
}

/* Quick Actions */
.quick-actions {
  padding: 1.25rem;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
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
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  background: var(--color-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-foreground);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--color-accent);
  transform: translateY(-1px);
}

.action-btn.primary {
  background: var(--color-brand);
  border-color: var(--color-brand);
  color: white;
}

.action-btn.primary:hover {
  opacity: 0.9;
}

.action-icon {
  width: 24px;
  height: 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2.5rem 1.25rem;
  color: var(--color-muted-foreground);
  font-size: 0.8125rem;
}

.bar-tooltip {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-popover);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
  color: var(--color-popover-foreground);
  box-shadow: var(--shadow-sm);
  font-family: var(--font-mono);
}

.bar:hover .bar-tooltip {
  opacity: 1;
}
</style>
