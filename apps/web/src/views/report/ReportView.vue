<template>
  <div class="report-view">
    <!-- Date Range -->
    <div class="date-bar">
      <button
        v-for="range in dateRanges"
        :key="range.value"
        class="date-btn"
        :class="{ active: dateRange === range.value }"
        @click="dateRange = range.value"
      >
        {{ range.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">加载中...</div>

    <template v-else>
    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--color-brand-muted);">
          <TrendingUp class="w-5 h-5" style="color: var(--color-brand);" />
        </div>
        <div class="stat-info">
          <span class="stat-label">销售收入</span>
          <span class="stat-value amount gradient-text">¥{{ formatNumber(report.sales) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--color-success-muted);">
          <TrendingDown class="w-5 h-5" style="color: var(--color-success);" />
        </div>
        <div class="stat-info">
          <span class="stat-label">采购支出</span>
          <span class="stat-value amount" style="color: var(--color-success);">¥{{ formatNumber(report.purchases) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--color-info-muted);">
          <CreditCard class="w-5 h-5" style="color: var(--color-info);" />
        </div>
        <div class="stat-info">
          <span class="stat-label">毛利润</span>
          <span class="stat-value amount" style="color: var(--color-info);">¥{{ formatNumber(report.profit) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--color-warning-muted);">
          <BarChart3 class="w-5 h-5" style="color: var(--color-warning);" />
        </div>
        <div class="stat-info">
          <span class="stat-label">利润率</span>
          <span class="stat-value amount" style="color: var(--color-warning);">{{ report.margin }}%</span>
        </div>
      </div>
    </div>

    <!-- Sales Trend -->
    <div class="chart-card">
      <div class="chart-header">
        <h3><TrendingUp class="w-4 h-4" /> 销售趋势</h3>
        <span class="chart-subtitle">{{ dateRangeLabel }}</span>
      </div>
      <div v-if="trendData.length > 0" class="mock-chart">
        <div v-for="(bar, i) in trendData" :key="i" class="bar-group">
          <div class="bar-stack">
            <div class="bar-income" :style="{ height: bar.income + '%' }"></div>
            <div class="bar-expense" :style="{ height: bar.expense + '%' }"></div>
          </div>
          <span class="bar-label">{{ bar.label }}</span>
        </div>
      </div>
      <div v-else class="empty-state">暂无销售趋势数据</div>
    </div>

    <!-- Top Products -->
    <div class="chart-card">
      <div class="chart-header">
        <h3><Flame class="w-4 h-4" /> 商品销售排行</h3>
      </div>
      <div class="rank-list">
        <div v-for="(item, i) in topProducts" :key="i" class="rank-item">
          <span class="rank-num" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <div class="rank-info">
            <span class="rank-name">{{ item.name }}</span>
            <div class="rank-bar">
              <div class="rank-fill" :style="{ width: (item.amount / (topProducts[0]?.amount || 1) * 100) + '%' }"></div>
            </div>
          </div>
          <span class="rank-amount amount">¥{{ formatNumber(item.amount) }}</span>
        </div>
        <div v-if="topProducts.length === 0" class="empty-state">暂无商品排行数据</div>
      </div>
    </div>

    <!-- Category Breakdown -->
    <div class="chart-card">
      <div class="chart-header">
        <h3><PieChart class="w-4 h-4" /> 分类销售占比</h3>
      </div>
      <div class="category-list">
        <div v-for="(cat, i) in categoryData" :key="i" class="category-item">
          <div class="category-info">
            <span class="category-dot" :style="{ background: cat.color }"></span>
            <span class="category-name">{{ cat.name }}</span>
          </div>
          <div class="category-bar">
            <div class="category-fill" :style="{ width: cat.percent + '%', background: cat.color }"></div>
          </div>
          <span class="category-percent">{{ cat.percent }}%</span>
        </div>
        <div v-if="categoryData.length === 0" class="empty-state">暂无分类数据</div>
      </div>
    </div>

    <!-- Partner Summary -->
    <div class="chart-card">
      <div class="chart-header">
        <h3><Users class="w-4 h-4" /> 客户销售排行</h3>
      </div>
      <div class="partner-list">
        <div v-for="(p, i) in partnerRanking" :key="i" class="partner-row">
          <div class="partner-avatar-small">{{ p.name.charAt(0) }}</div>
          <div class="partner-info">
            <span class="partner-name">{{ p.name }}</span>
          </div>
          <span class="partner-amount amount">¥{{ formatNumber(p.amount) }}</span>
          <span class="partner-count">{{ p.orders }}单</span>
        </div>
        <div v-if="partnerRanking.length === 0" class="empty-state">暂无客户排行数据</div>
      </div>
    </div>

    <!-- Supplier Inventory Summary -->
    <div class="chart-card">
      <div class="chart-header">
        <h3><Package class="w-4 h-4" /> 供应商库存统计</h3>
      </div>
      <div class="supplier-list">
        <div v-for="(s, i) in supplierInventory" :key="i" class="supplier-row">
          <div class="supplier-info">
            <span class="supplier-name">{{ s.supplier }}</span>
          </div>
          <div class="supplier-meta">
            <span class="supplier-sku">{{ s.sku }} SKU</span>
            <span class="supplier-value amount">¥{{ formatNumber(s.value) }}</span>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { reportApi, productApi } from '@/api'
import { TrendingUp, TrendingDown, CreditCard, BarChart3, Flame, PieChart, Users, Package } from 'lucide-vue-next'

const dateRange = ref('week')
const loading = ref(false)

const dateRanges = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季' }
]

const dateRangeLabel = computed(() => {
  const map: Record<string, string> = {
    today: '今日数据',
    week: '近7天',
    month: '近30天',
    quarter: '近90天'
  }
  return map[dateRange.value] || ''
})

const report = ref({
  sales: 0,
  purchases: 0,
  profit: 0,
  margin: 0
})

const trendData = ref<{ label: string; income: number; expense: number }[]>([])
const topProducts = ref<{ name: string; amount: number }[]>([])
const categoryData = ref<{ name: string; percent: number; color: string }[]>([])
const partnerRanking = ref<{ name: string; amount: number; orders: number }[]>([])
const supplierInventory = ref<Array<{ supplier: string; sku: number; value: number }>>([])

const categoryNameMap = ref<Map<string, string>>(new Map())

async function loadCategoryMap() {
  try {
    const res = await productApi.list({ pageSize: 1000 })
    const map = new Map<string, string>()
    for (const p of res.data || []) {
      if (p.categoryId && !map.has(String(p.categoryId))) {
        map.set(String(p.categoryId), p.name.split(' ')[0] || `分类${p.categoryId}`)
      }
    }
    categoryNameMap.value = map
  } catch {
    // ignore
  }
}

async function loadData() {
  loading.value = true
  try {
    const [profitRes, salesRes, inventoryRes] = await Promise.all([
      reportApi.profit().catch(() => ({ data: null })),
      reportApi.sales(dateRange.value).catch(() => ({ data: null })),
      reportApi.inventory().catch(() => ({ data: null }))
    ])

    if (profitRes.data) {
      report.value.sales = profitRes.data.totalSales || 0
      report.value.purchases = profitRes.data.totalCost || 0
      report.value.profit = profitRes.data.grossProfit || 0
      report.value.margin = profitRes.data.margin ? Math.round(profitRes.data.margin * 10) / 10 : 0
    }

    if (profitRes.data?.byCategory && profitRes.data.byCategory.length > 0) {
      const total = profitRes.data.totalSales || 1
      categoryData.value = profitRes.data.byCategory.map((c: any, i: number) => ({
        name: categoryNameMap.value.get(String(c.category)) || c.category || '未分类',
        percent: Math.round((c.sales || 0) / total * 100),
        color: ['#7C5CFC', '#5B8DEF', '#3B82F6', '#10B981', '#F59E0B'][i % 5]
      }))
    } else {
      categoryData.value = []
    }

    if (salesRes.data && salesRes.data.length > 0) {
      const maxSales = Math.max(...salesRes.data.map((s: any) => s.sales || 0), 1)
      trendData.value = salesRes.data.slice(-7).map((s: any) => ({
        label: s.date?.slice(5) || '',
        income: Math.max(5, Math.round(((s.sales || 0) / maxSales) * 100)),
        expense: Math.max(5, Math.round(((s.sales || 0) / maxSales) * 50))
      }))
    } else {
      trendData.value = []
    }

    if (inventoryRes.data?.bySupplier) {
      supplierInventory.value = inventoryRes.data.bySupplier
    } else {
      supplierInventory.value = []
    }

    // TOP 商品和客户排行暂无 API，保持为空
    topProducts.value = []
    partnerRanking.value = []
  } catch (err: any) {
    console.error('Report load failed:', err.message)
  } finally {
    loading.value = false
  }
}

watch(dateRange, () => loadData())

function formatNumber(n: number) {
  return n.toLocaleString('zh-CN')
}

onMounted(async () => {
  await loadCategoryMap()
  await loadData()
})
</script>

<style scoped>
.report-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-bar {
  display: flex;
  gap: 8px;
}

.date-btn {
  flex: 1;
  height: 36px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.date-btn.active {
  background: var(--accent-subtle); border: 1px solid var(--accent-border); color: var(--accent-primary);
  border-color: transparent;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
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
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
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
  font-size: 18px;
  font-weight: 700;
}

.chart-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.chart-subtitle {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* Mock Chart */
.mock-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  height: 160px;
  padding-bottom: 24px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;
  justify-content: flex-end;
}

.bar-stack {
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  border-radius: 4px 4px 0 0;
  overflow: hidden;
}

.bar-income {
  width: 100%;
  background: var(--gradient-primary);
  opacity: 0.85;
  min-height: 4px;
  transition: height 0.3s;
}

.bar-expense {
  width: 100%;
  background: var(--color-success);
  opacity: 0.5;
  min-height: 4px;
  transition: height 0.3s;
}

.bar-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Rank List */
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.rank-num.top {
  background: var(--gradient-primary);
  color: white;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name {
  font-size: 14px;
  display: block;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-bar {
  height: 6px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.rank-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  transition: width 0.3s;
}

.rank-amount {
  font-size: 14px;
  font-weight: 600;
  min-width: 80px;
  text-align: right;
}

/* Category */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80px;
  flex-shrink: 0;
}

.category-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.category-name {
  font-size: 14px;
}

.category-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.category-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s;
}

.category-percent {
  font-size: 14px;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

/* Partner Ranking */
.partner-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.partner-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.partner-row:last-child {
  border-bottom: none;
}

.partner-avatar-small {
  width: 36px;
  height: 36px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.partner-info {
  flex: 1;
}

.partner-name {
  font-size: 14px;
  font-weight: 500;
}

.partner-amount {
  font-size: 14px;
  font-weight: 600;
  min-width: 80px;
  text-align: right;
}

.partner-count {
  font-size: 12px;
  color: var(--text-tertiary);
  min-width: 50px;
  text-align: right;
}

/* Supplier Inventory */
.supplier-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.supplier-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.supplier-row:last-child {
  border-bottom: none;
}

.supplier-name {
  font-size: 14px;
  font-weight: 500;
}

.supplier-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.supplier-sku {
  font-size: 12px;
  color: var(--text-tertiary);
}

.supplier-value {
  font-size: 14px;
  font-weight: 600;
  min-width: 80px;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}
</style>
