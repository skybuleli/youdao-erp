<template>
  <div class="flex flex-col gap-4">
    <!-- Date Range -->
    <div class="flex gap-2">
      <AppButton
        v-for="range in dateRanges"
        :key="range.value"
        :variant="dateRange === range.value ? 'default' : 'secondary'"
        size="sm"
        class="flex-1"
        @click="dateRange = range.value"
      >
        {{ range.label }}
      </AppButton>
    </div>

    <AppLoading v-if="loading" />

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AppStatCard label="销售收入" :value="`¥${formatNumber(report.sales)}`" icon-bg="var(--color-brand-muted)" icon-color="var(--color-brand)">
          <template #icon><TrendingUp class="h-5 w-5" /></template>
        </AppStatCard>
        <AppStatCard label="采购支出" :value="`¥${formatNumber(report.purchases)}`" icon-bg="var(--color-success-muted)" icon-color="var(--color-success)">
          <template #icon><TrendingDown class="h-5 w-5" /></template>
        </AppStatCard>
        <AppStatCard label="毛利润" :value="`¥${formatNumber(report.profit)}`" icon-bg="var(--color-info-muted)" icon-color="var(--color-info)">
          <template #icon><CreditCard class="h-5 w-5" /></template>
        </AppStatCard>
        <AppStatCard label="利润率" :value="`${report.margin}%`" icon-bg="var(--color-warning-muted)" icon-color="var(--color-warning)">
          <template #icon><BarChart3 class="h-5 w-5" /></template>
        </AppStatCard>
      </div>

      <!-- Sales Trend -->
      <AppCard class="p-5" hoverable>
        <div class="flex justify-between items-center mb-5">
          <h3 class="flex items-center gap-2 text-base font-semibold"><TrendingUp class="h-4 w-4" /> 销售趋势</h3>
          <span class="text-sm text-[var(--color-muted-foreground)]">{{ dateRangeLabel }}</span>
        </div>
        <div v-if="trendData.length > 0" class="flex items-end justify-between gap-3 h-[160px] pb-6">
          <div v-for="(bar, i) in trendData" :key="i" class="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div class="w-full flex flex-col-reverse items-center rounded-t overflow-hidden" style="height: 100%;">
              <div class="w-full bg-[var(--color-success)] opacity-50 min-h-[4px] transition-all" :style="{ height: bar.expense + '%' }" />
              <div class="w-full bg-[var(--color-brand)] opacity-85 min-h-[4px] transition-all" :style="{ height: bar.income + '%' }" />
            </div>
            <span class="text-xs text-[var(--color-muted-foreground)]">{{ bar.label }}</span>
          </div>
        </div>
        <AppEmpty v-else message="暂无销售趋势数据" />
      </AppCard>

      <!-- Top Products -->
      <AppCard class="p-5" hoverable>
        <h3 class="flex items-center gap-2 text-base font-semibold mb-5"><Flame class="h-4 w-4" /> 商品销售排行</h3>
        <div v-if="topProducts.length > 0" class="flex flex-col gap-3">
          <div v-for="(item, i) in topProducts" :key="i" class="flex items-center gap-3">
            <span class="w-6 h-6 flex items-center justify-center rounded text-xs font-bold flex-shrink-0" :class="i < 3 ? 'text-white' : 'bg-[var(--color-secondary)] text-[var(--color-muted-foreground)]'" :style="i < 3 ? { background: 'var(--color-brand-gradient)' } : {}">{{ i + 1 }}</span>
            <div class="flex-1 min-w-0">
              <span class="text-sm block mb-1.5 truncate">{{ item.name }}</span>
              <div class="h-1.5 rounded-full bg-[var(--color-secondary)] overflow-hidden">
                <div class="h-full rounded-full bg-[var(--color-brand)] transition-all" :style="{ width: (item.amount / (topProducts[0]?.amount || 1) * 100) + '%' }" />
              </div>
            </div>
            <span class="text-sm font-semibold min-w-[80px] text-right font-[var(--font-mono)]">¥{{ formatNumber(item.amount) }}</span>
          </div>
        </div>
        <AppEmpty v-else message="暂无商品排行数据" />
      </AppCard>

      <!-- Category Breakdown -->
      <AppCard class="p-5" hoverable>
        <h3 class="flex items-center gap-2 text-base font-semibold mb-5"><PieChart class="h-4 w-4" /> 分类销售占比</h3>
        <div v-if="categoryData.length > 0" class="flex flex-col gap-3.5">
          <div v-for="(cat, i) in categoryData" :key="i" class="flex items-center gap-3">
            <div class="flex items-center gap-2 w-20 flex-shrink-0">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ background: cat.color }" />
              <span class="text-sm">{{ cat.name }}</span>
            </div>
            <div class="flex-1 h-2 rounded-full bg-[var(--color-secondary)] overflow-hidden">
              <div class="h-full rounded-full transition-all" :style="{ width: cat.percent + '%', background: cat.color }" />
            </div>
            <span class="text-sm font-semibold min-w-[50px] text-right">{{ cat.percent }}%</span>
          </div>
        </div>
        <AppEmpty v-else message="暂无分类数据" />
      </AppCard>

      <!-- Partner Ranking -->
      <AppCard class="p-5" hoverable>
        <h3 class="flex items-center gap-2 text-base font-semibold mb-5"><Users class="h-4 w-4" /> 客户销售排行</h3>
        <div v-if="partnerRanking.length > 0" class="flex flex-col gap-3">
          <div v-for="(p, i) in partnerRanking" :key="i" class="flex items-center gap-3 py-2.5 border-b border-[var(--color-border)] last:border-0">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0" style="background: var(--color-brand-gradient)">
              {{ p.name.charAt(0) }}
            </div>
            <div class="flex-1">
              <span class="text-sm font-medium">{{ p.name }}</span>
            </div>
            <span class="text-sm font-semibold min-w-[80px] text-right font-[var(--font-mono)]">¥{{ formatNumber(p.amount) }}</span>
            <span class="text-xs text-[var(--color-muted-foreground)] min-w-[50px] text-right">{{ p.orders }}单</span>
          </div>
        </div>
        <AppEmpty v-else message="暂无客户排行数据" />
      </AppCard>

      <!-- Supplier Inventory -->
      <AppCard class="p-5" hoverable>
        <h3 class="flex items-center gap-2 text-base font-semibold mb-5"><Package class="h-4 w-4" /> 供应商库存统计</h3>
        <div class="flex flex-col gap-3">
          <div v-for="(s, i) in supplierInventory" :key="i" class="flex items-center justify-between py-2.5 border-b border-[var(--color-border)] last:border-0">
            <span class="text-sm font-medium">{{ s.supplier }}</span>
            <div class="flex items-center gap-4">
              <span class="text-xs text-[var(--color-muted-foreground)]">{{ s.sku }} SKU</span>
              <span class="text-sm font-semibold min-w-[80px] text-right font-[var(--font-mono)]">¥{{ formatNumber(s.value) }}</span>
            </div>
          </div>
        </div>
      </AppCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { reportApi, productApi } from '@/api'
import { TrendingUp, TrendingDown, CreditCard, BarChart3, Flame, PieChart, Users, Package } from 'lucide-vue-next'
import { AppButton, AppCard, AppStatCard, AppLoading, AppEmpty } from '@/components/ui'

const dateRange = ref('week')
const loading = ref(false)

const dateRanges = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: 'month', label: '本月' },
  { value: 'quarter', label: '本季' }
]

const dateRangeLabel = computed(() => {
  const map: Record<string, string> = { today: '今日数据', week: '近7天', month: '近30天', quarter: '近90天' }
  return map[dateRange.value] || ''
})

const report = ref({ sales: 0, purchases: 0, profit: 0, margin: 0 })
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
      if (p.categoryId && !map.has(String(p.categoryId))) map.set(String(p.categoryId), p.name.split(' ')[0] || `分类${p.categoryId}`)
    }
    categoryNameMap.value = map
  } catch { /* ignore */ }
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
        color: ['#0072F5', '#06B6D4', '#3B82F6', '#22C55E', '#F59E0B'][i % 5]
      }))
    } else categoryData.value = []

    if (salesRes.data && salesRes.data.length > 0) {
      const maxSales = Math.max(...salesRes.data.map((s: any) => s.sales || 0), 1)
      trendData.value = salesRes.data.slice(-7).map((s: any) => ({
        label: s.date?.slice(5) || '',
        income: Math.max(5, Math.round(((s.sales || 0) / maxSales) * 100)),
        expense: Math.max(5, Math.round(((s.sales || 0) / maxSales) * 50))
      }))
    } else trendData.value = []

    supplierInventory.value = inventoryRes.data?.bySupplier || []
    topProducts.value = []
    partnerRanking.value = []
  } catch (err: any) { console.error('Report load failed:', err.message) }
  finally { loading.value = false }
}

watch(dateRange, () => loadData())

function formatNumber(n: number) { return n.toLocaleString('zh-CN') }

onMounted(async () => { await loadCategoryMap(); await loadData() })
</script>
