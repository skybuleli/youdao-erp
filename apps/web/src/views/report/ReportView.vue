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

    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15);">📈</div>
        <div class="stat-info">
          <span class="stat-label">销售收入</span>
          <span class="stat-value amount gradient-text">¥{{ formatNumber(report.sales) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15);">📉</div>
        <div class="stat-info">
          <span class="stat-label">采购支出</span>
          <span class="stat-value amount" style="color: var(--color-success);">¥{{ formatNumber(report.purchases) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15);">💰</div>
        <div class="stat-info">
          <span class="stat-label">毛利润</span>
          <span class="stat-value amount" style="color: var(--color-info);">¥{{ formatNumber(report.profit) }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15);">📊</div>
        <div class="stat-info">
          <span class="stat-label">利润率</span>
          <span class="stat-value amount" style="color: var(--color-warning);">{{ report.margin }}%</span>
        </div>
      </div>
    </div>

    <!-- Sales Trend -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>📈 销售趋势</h3>
        <span class="chart-subtitle">{{ dateRangeLabel }}</span>
      </div>
      <div class="mock-chart">
        <div v-for="(bar, i) in trendData" :key="i" class="bar-group">
          <div class="bar-stack">
            <div class="bar-income" :style="{ height: bar.income + '%' }"></div>
            <div class="bar-expense" :style="{ height: bar.expense + '%' }"></div>
          </div>
          <span class="bar-label">{{ bar.label }}</span>
        </div>
      </div>
    </div>

    <!-- Top Products -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>🔥 商品销售排行</h3>
      </div>
      <div class="rank-list">
        <div v-for="(item, i) in topProducts" :key="i" class="rank-item">
          <span class="rank-num" :class="{ top: i < 3 }">{{ i + 1 }}</span>
          <div class="rank-info">
            <span class="rank-name">{{ item.name }}</span>
            <div class="rank-bar">
              <div class="rank-fill" :style="{ width: (item.amount / topProducts[0].amount * 100) + '%' }"></div>
            </div>
          </div>
          <span class="rank-amount amount">¥{{ formatNumber(item.amount) }}</span>
        </div>
      </div>
    </div>

    <!-- Category Breakdown -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>🥧 分类销售占比</h3>
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
      </div>
    </div>

    <!-- Partner Summary -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>🤝 客户销售排行</h3>
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { reportApi } from '@/api'

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
  sales: 32400,
  purchases: 21800,
  profit: 10600,
  margin: 32.7
})

const trendData = ref([
  { label: '周一', income: 60, expense: 40 },
  { label: '周二', income: 75, expense: 50 },
  { label: '周三', income: 45, expense: 35 },
  { label: '周四', income: 85, expense: 55 },
  { label: '周五', income: 70, expense: 45 },
  { label: '周六', income: 90, expense: 60 },
  { label: '周日', income: 65, expense: 40 }
])

const topProducts = ref([
  { name: '伊利纯牛奶 250ml*24', amount: 4500 },
  { name: '可口可乐 330ml*6', amount: 3200 },
  { name: '五常大米 5kg', amount: 2800 },
  { name: '海飞丝洗发水 400ml', amount: 2100 },
  { name: '农夫山泉 550ml*24', amount: 1800 },
  { name: '奥利奥夹心饼干 116g', amount: 1500 },
  { name: '乐事薯片 70g', amount: 1200 },
  { name: '康师傅红烧牛肉面', amount: 800 }
])

const categoryData = ref([
  { name: '饮料', percent: 35, color: '#8B5CF6' },
  { name: '零食', percent: 25, color: '#EC4899' },
  { name: '粮油', percent: 20, color: '#3B82F6' },
  { name: '日用', percent: 15, color: '#10B981' },
  { name: '其他', percent: 5, color: '#F59E0B' }
])

const partnerRanking = ref([
  { name: '张老板', amount: 8500, orders: 12 },
  { name: '客户C', amount: 6200, orders: 8 },
  { name: '李老板', amount: 4800, orders: 6 },
  { name: '王老板', amount: 3200, orders: 4 },
  { name: '赵老板', amount: 2100, orders: 3 }
])

async function loadData() {
  loading.value = true
  try {
    const [, profitRes, salesRes] = await Promise.all([
      reportApi.dashboard().catch(() => ({ data: null })),
      reportApi.profit().catch(() => ({ data: null })),
      reportApi.sales(dateRange.value).catch(() => ({ data: null }))
    ])
    if (profitRes.data && profitRes.data.totalSales > 0) {
      report.value.sales = profitRes.data.totalSales
      report.value.purchases = profitRes.data.totalCost
      report.value.profit = profitRes.data.grossProfit
      report.value.margin = Math.round(profitRes.data.margin * 10) / 10
    }
    if (profitRes.data && profitRes.data.byCategory && profitRes.data.byCategory.length > 0) {
      categoryData.value = profitRes.data.byCategory.map((c: any, i: number) => ({
        name: c.category,
        percent: Math.round(c.sales / profitRes.data.totalSales * 100),
        color: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][i % 5]
      }))
    }
    if (salesRes.data && salesRes.data.length > 0) {
      trendData.value = salesRes.data.slice(-7).map((s: any, i: number) => ({
        label: s.date?.slice(5) || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
        income: Math.min(100, Math.max(5, s.sales / 100)),
        expense: Math.min(100, Math.max(5, s.sales / 200))
      }))
    }
  } catch {
    console.log('Report API not ready, using mock data')
  } finally {
    loading.value = false
  }
}

function formatNumber(n: number) {
  return n.toLocaleString('zh-CN')
}

onMounted(loadData)
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
  background: var(--gradient-primary);
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
</style>
