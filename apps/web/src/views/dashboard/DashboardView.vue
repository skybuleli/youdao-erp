<template>
  <div class="flex flex-col gap-4">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <AppStatCard
        label="今日销售"
        :value="`¥${formatNumber(stats.todaySales)}`"
        hint="↑ 12%"
        hint-type="positive"
        icon-bg="var(--color-brand-muted)"
        icon-color="var(--color-brand)"
      >
        <template #icon><TrendingUp class="h-6 w-6" /></template>
      </AppStatCard>
      <AppStatCard
        label="今日采购"
        :value="`¥${formatNumber(stats.todayPurchases)}`"
        hint="↓ 5%"
        hint-type="negative"
        icon-bg="var(--color-success-muted)"
        icon-color="var(--color-success)"
      >
        <template #icon><ArrowDownLeft class="h-6 w-6" /></template>
      </AppStatCard>
      <AppStatCard
        label="库存预警"
        :value="`${stats.warningCount}种`"
        hint="需补货"
        hint-type="warning"
        icon-bg="var(--color-warning-muted)"
        icon-color="var(--color-warning)"
      >
        <template #icon><AlertTriangle class="h-6 w-6" /></template>
      </AppStatCard>
    </div>

    <!-- Charts Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <AppCard class="lg:col-span-2 p-5" hoverable>
        <div class="flex items-center gap-2 mb-4 text-[var(--color-foreground)]">
          <BarChart3 class="h-4 w-4" />
          <h3 class="text-[0.9375rem] font-semibold">近7天销售趋势</h3>
        </div>
        <div v-if="salesTrend.length > 0" class="flex items-end gap-3 h-[180px] pb-2">
          <div v-for="(bar, i) in salesTrend" :key="i" class="flex-1 flex flex-col items-center gap-2 group">
            <div class="relative w-full flex items-end h-[140px] rounded-t-md overflow-hidden">
              <div
                class="w-full transition-all duration-300 opacity-80 group-hover:opacity-100"
                :style="{ height: bar.height + '%', background: 'linear-gradient(180deg, var(--color-brand) 0%, rgba(0,114,245,0.4) 100%)' }"
              />
              <div class="absolute -top-7 left-1/2 -translate-x-1/2 bg-[var(--color-popover)] border border-[var(--color-border)] px-2 py-0.5 rounded text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm font-[var(--font-mono)]">
                ¥{{ formatNumber(bar.sales) }}
              </div>
            </div>
            <span class="text-[11px] text-[var(--color-muted-foreground)]">{{ bar.label }}</span>
          </div>
        </div>
        <AppEmpty v-else icon="BarChart3" message="暂无销售数据" />
      </AppCard>

      <AppCard class="p-5" hoverable>
        <div class="flex items-center gap-2 mb-4 text-[var(--color-foreground)]">
          <Flame class="h-4 w-4" />
          <h3 class="text-[0.9375rem] font-semibold">今日畅销 TOP 5</h3>
        </div>
        <div v-if="topProducts.length > 0" class="flex flex-col gap-2">
          <div v-for="(item, i) in topProducts" :key="i" class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] transition-colors">
            <span class="w-[22px] h-[22px] flex items-center justify-center rounded text-[11px] font-bold text-white flex-shrink-0" style="background: var(--color-brand-gradient)">{{ i + 1 }}</span>
            <span class="flex-1 text-[13px] text-[var(--color-foreground)] truncate">{{ item.name }}</span>
            <span class="text-[13px] font-semibold font-[var(--font-mono)]">¥{{ item.amount }}</span>
          </div>
        </div>
        <AppEmpty v-else icon="Package" message="暂无数据" />
      </AppCard>

      <AppCard class="p-5" hoverable>
        <div class="flex items-center gap-2 mb-4 text-[var(--color-foreground)]">
          <Flame class="h-4 w-4" />
          <h3 class="text-[0.9375rem] font-semibold">今日畅销 TOP 5</h3>
        </div>
        <div v-if="topProducts.length > 0" class="flex flex-col gap-2">
          <div v-for="(item, i) in topProducts" :key="i" class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] transition-colors">
            <span class="w-[22px] h-[22px] flex items-center justify-center rounded text-[11px] font-bold text-white flex-shrink-0" style="background: var(--color-brand-gradient)">{{ i + 1 }}</span>
            <span class="flex-1 text-[13px] text-[var(--color-foreground)] truncate">{{ item.name }}</span>
            <span class="text-[13px] font-semibold font-[var(--font-mono)]">¥{{ item.amount }}</span>
          </div>
        </div>
        <AppEmpty v-else icon="Package" message="暂无数据" />
      </AppCard>
    </div>

    <!-- Recent Orders -->
    <AppCard class="p-5">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-2 text-[var(--color-foreground)]">
          <FileText class="h-4 w-4" />
          <h3 class="text-[0.9375rem] font-semibold">最近开单</h3>
        </div>
        <router-link to="/sale" class="flex items-center gap-0.5 text-[var(--color-brand)] text-[13px] font-medium hover:opacity-80 transition-opacity">
          查看全部 <ChevronRight class="h-4 w-4" />
        </router-link>
      </div>
      <div v-if="recentOrders.length > 0" class="flex flex-col gap-1.5">
        <div v-for="order in recentOrders" :key="order.id" class="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center p-3 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] transition-colors text-[13px]">
          <div class="flex flex-col gap-0.5">
            <span class="text-[11px] text-[var(--color-muted-foreground)] font-[var(--font-mono)]">{{ order.no }}</span>
            <AppBadge :variant="order.type === 'sale' ? 'default' : order.type === 'purchase' ? 'success' : 'warning'" class="w-fit">
              {{ order.typeName }}
            </AppBadge>
          </div>
          <div class="text-[var(--color-muted-foreground)] truncate">{{ order.partner }}</div>
          <div class="font-semibold font-[var(--font-mono)]">¥{{ formatNumber(order.amount) }}</div>
          <div class="text-[11px] text-[var(--color-muted-foreground)] font-[var(--font-mono)]">{{ order.time }}</div>
        </div>
      </div>
      <AppEmpty v-else icon="FileText" message="暂无订单" />
    </AppCard>

    <!-- Quick Actions -->
    <AppCard class="p-5">
      <div class="flex items-center gap-2 mb-4 text-[var(--color-foreground)]">
        <Zap class="h-4 w-4" />
        <h3 class="text-[0.9375rem] font-semibold">快捷操作</h3>
      </div>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
        <router-link
          v-for="action in quickActions"
          :key="action.to"
          :to="action.to"
          class="flex flex-col items-center gap-2 py-4 px-2 rounded-xl text-[13px] font-medium transition-all duration-150"
          :class="action.primary
            ? 'bg-[var(--color-brand)] text-white hover:opacity-90'
            : 'bg-[var(--color-secondary)] border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)]'"
        >
          <component :is="action.icon" class="h-6 w-6" />
          <span>{{ action.label }}</span>
        </router-link>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { reportApi, orderApi, partnerApi } from '@/api'
import type { DashboardStats } from '@/api/report'
import {
  TrendingUp, ArrowDownLeft, AlertTriangle, BarChart3, Flame,
  FileText, ChevronRight, Zap, Store, ShoppingCart, Search,
  ClipboardList, CreditCard
} from 'lucide-vue-next'
import { AppCard, AppStatCard, AppBadge, AppEmpty } from '@/components/ui'

const stats = reactive<DashboardStats>({
  todaySales: 0, todayPurchases: 0, warningCount: 0,
  receivableAmount: 0, payableAmount: 0, totalProducts: 0, totalPartners: 0
})

const salesTrend = ref<{ label: string; height: number; sales: number }[]>([])
const topProducts = ref<{ name: string; amount: number }[]>([])
const recentOrders = ref<any[]>([])

const typeNameMap: Record<string, string> = {
  sale: '销售出库', purchase: '采购入库', return: '销售退货'
}

const quickActions = [
  { to: '/sale/pos', label: '销售开单', icon: Store, primary: true },
  { to: '/purchase/new', label: '采购入库', icon: ShoppingCart, primary: false },
  { to: '/inventory', label: '库存查询', icon: Search, primary: false },
  { to: '/inventory', label: '库存盘点', icon: ClipboardList, primary: false },
  { to: '/finance', label: '收款', icon: CreditCard, primary: false },
  { to: '/report', label: '报表', icon: BarChart3, primary: false },
]

async function loadDashboard() {
  try {
    const [dashRes, salesRes, orderRes, partnerRes] = await Promise.all([
      reportApi.dashboard().catch(() => ({ data: null })),
      reportApi.sales('week').catch(() => ({ data: null })),
      orderApi.list().catch(() => ({ data: [] })),
      partnerApi.list().catch(() => ({ data: [] }))
    ])

    if (dashRes.data) Object.assign(stats, dashRes.data)

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
      return {
        id: o.id, no: o.orderNo,
        type: o.subType === 'return' ? 'return' : o.type,
        typeName: o.subType === 'return' ? '销售退货' : typeNameMap[o.type] || o.type,
        partner: partnerMap.get(o.partnerId) || `客户#${o.partnerId}`,
        amount: o.totalAmount || 0,
        time: date ? (isToday ? date.toTimeString().slice(0, 5) : date.toISOString().slice(5, 10)) : ''
      }
    })
  } catch (err: any) {
    console.error('Dashboard load failed:', err.message)
  }
}

onMounted(loadDashboard)

function formatNumber(n: number) {
  return n.toLocaleString('zh-CN')
}
</script>
