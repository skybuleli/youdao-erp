<template>
  <div class="flex flex-col gap-4">
    <!-- Stats -->
    <div class="grid grid-cols-2 gap-3">
      <AppCard class="p-4 flex flex-col gap-1">
        <span class="text-xs text-[var(--color-muted-foreground)]">本月采购</span>
        <span class="text-2xl font-bold gradient-text font-[var(--font-mono)]">¥{{ formatNumber(monthTotal) }}</span>
      </AppCard>
      <AppCard class="p-4 flex flex-col gap-1">
        <span class="text-xs text-[var(--color-muted-foreground)]">采购单数</span>
        <span class="text-2xl font-bold font-[var(--font-mono)]">{{ orders.length }}</span>
      </AppCard>
    </div>

    <!-- Toolbar -->
    <div class="flex gap-3 items-center">
      <AppSelect v-model="statusFilter" class="flex-1">
        <option value="all">全部状态</option>
        <option value="pending">待入库</option>
        <option value="partial">部分入库</option>
        <option value="completed">已完成</option>
      </AppSelect>
      <AppButton as-child>
        <router-link to="/purchase/new" class="flex items-center gap-1">
          <Plus class="h-4 w-4" /> 新增采购单
        </router-link>
      </AppButton>
    </div>

    <AppLoading v-if="loading" />

    <div v-else class="flex flex-col gap-3">
      <AppCard v-for="order in filteredOrders" :key="order.id" hoverable class="p-4">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-semibold font-[var(--font-mono)]">{{ order.no }}</span>
          <AppBadge :variant="statusVariant(order.status)">{{ statusText(order.status) }}</AppBadge>
        </div>
        <div class="flex flex-col gap-2 py-3 border-t border-b border-[var(--color-border)] mb-3 text-sm">
          <div class="flex gap-2">
            <span class="text-[var(--color-muted-foreground)] text-xs">供应商</span>
            <span class="font-medium">{{ order.supplier }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-[var(--color-muted-foreground)] text-xs">商品</span>
            <span class="truncate">{{ order.items.map((i: any) => i.name).join('、') }}</span>
          </div>
          <div class="flex justify-between mt-1">
            <div class="flex gap-2">
              <span class="text-[var(--color-muted-foreground)] text-xs">数量</span>
              <span class="font-medium font-[var(--font-mono)]">{{ order.totalQty }} 件</span>
            </div>
            <div class="flex gap-2">
              <span class="text-[var(--color-muted-foreground)] text-xs">金额</span>
              <span class="font-medium font-[var(--font-mono)] text-[var(--color-brand)]">¥{{ order.totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-[var(--color-muted-foreground)]">{{ order.date }}</span>
          <div class="flex gap-2">
            <AppButton v-if="order.status !== 'completed'" size="sm" @click="receiveOrder(order)">入库</AppButton>
            <AppButton variant="secondary" size="sm" @click="viewDetail(order)">详情</AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { orderApi, partnerApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import { Plus } from 'lucide-vue-next'
import { AppButton, AppCard, AppSelect, AppBadge, AppLoading } from '@/components/ui'

const toast = useToastStore()
const statusFilter = ref('all')
const orders = ref<any[]>([])
const partnerMap = ref<Map<number, string>>(new Map())
const loading = ref(false)

async function loadPartners() {
  try {
    const res = await partnerApi.list()
    partnerMap.value = new Map(res.data.map((p: any) => [p.id, p.name]))
  } catch (e: any) {
    console.error('加载往来单位失败', e.message)
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await orderApi.list({ type: 'purchase', status: statusFilter.value !== 'all' ? statusFilter.value : undefined })
    orders.value = res.data.map((o: any) => ({
      id: o.id, no: o.orderNo, status: o.status,
      supplier: partnerMap.value.get(o.partnerId) || `往来单位#${o.partnerId}`,
      items: (o.items || []).map((i: any) => ({ name: `商品#${i.productId}` })),
      totalQty: (o.items || []).reduce((sum: number, i: any) => sum + i.qty, 0),
      totalAmount: o.totalAmount,
      date: o.orderDate || o.createdAt?.slice(0, 10) || ''
    }))
  } catch (e: any) {
    toast.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const monthTotal = computed(() => orders.value.reduce((sum, o) => sum + o.totalAmount, 0))
const filteredOrders = computed(() => statusFilter.value === 'all' ? orders.value : orders.value.filter(o => o.status === statusFilter.value))

function statusText(status: string) {
  const map: Record<string, string> = { pending: '待入库', partial: '部分入库', completed: '已完成' }
  return map[status] || status
}

function statusVariant(status: string) {
  const map: Record<string, any> = { pending: 'warning', partial: 'info', completed: 'success' }
  return map[status] || 'default'
}

function formatNumber(n: number) {
  return n.toLocaleString('zh-CN')
}

async function receiveOrder(order: any) {
  if (!confirm(`确认入库 ${order.no}？\n入库后将增加对应商品库存。`)) return
  try {
    await orderApi.updateStatus(order.id, 'completed')
    toast.success('入库成功！')
    await loadData()
  } catch (e: any) {
    toast.error(e.message || '入库失败')
  }
}

function viewDetail(order: any) {
  toast.info(`查看 ${order.no} 详情（待实现）`)
}

watch(statusFilter, loadData)
onMounted(async () => {
  await loadPartners()
  await loadData()
})
</script>
