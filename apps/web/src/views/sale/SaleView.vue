<template>
  <div class="flex flex-col gap-4">
    <!-- Stats -->
    <div class="grid grid-cols-3 gap-3">
      <AppCard class="p-4 flex flex-col gap-1">
        <span class="text-xs text-[var(--color-muted-foreground)]">本月销售</span>
        <span class="text-lg font-bold gradient-text font-[var(--font-mono)]">¥{{ formatNumber(monthTotal) }}</span>
      </AppCard>
      <AppCard class="p-4 flex flex-col gap-1">
        <span class="text-xs text-[var(--color-muted-foreground)]">销售单数</span>
        <span class="text-lg font-bold font-[var(--font-mono)]">{{ orders.length }}</span>
      </AppCard>
      <AppCard class="p-4 flex flex-col gap-1">
        <span class="text-xs text-[var(--color-muted-foreground)]">毛利润</span>
        <span class="text-lg font-bold text-[var(--color-success)] font-[var(--font-mono)]">¥{{ formatNumber(profit) }}</span>
      </AppCard>
    </div>

    <!-- Toolbar -->
    <div class="flex gap-3 items-center">
      <AppSearch v-model="searchQuery" placeholder="搜索单号、客户..." class="flex-1" />
      <AppButton variant="secondary" as-child>
        <router-link to="/sale/return">退货</router-link>
      </AppButton>
      <AppButton as-child>
        <router-link to="/sale/pos">开单</router-link>
      </AppButton>
    </div>

    <AppLoading v-if="loading" />

    <div v-else class="flex flex-col gap-3">
      <AppCard v-for="order in filteredOrders" :key="order.id" hoverable class="p-4">
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-2">
            <span class="text-sm font-semibold font-[var(--font-mono)]">{{ order.no }}</span>
            <AppBadge :variant="order.type === 'sale' ? 'default' : 'warning'">{{ order.typeName }}</AppBadge>
          </div>
          <span class="text-lg font-bold gradient-text font-[var(--font-mono)]">¥{{ order.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="flex flex-col gap-2 py-3 border-t border-b border-[var(--color-border)] mb-3 text-sm">
          <div class="flex gap-2">
            <span class="text-[var(--color-muted-foreground)] text-xs">客户</span>
            <span>{{ order.customer }}</span>
          </div>
          <div class="flex gap-2">
            <span class="text-[var(--color-muted-foreground)] text-xs">商品</span>
            <span class="truncate">{{ order.items.map((i: any) => i.name).join('、') }}</span>
          </div>
          <div class="flex justify-between mt-1">
            <div class="flex gap-2">
              <span class="text-[var(--color-muted-foreground)] text-xs">数量</span>
              <span class="font-medium font-[var(--font-mono)]">{{ order.totalQty }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-[var(--color-muted-foreground)] text-xs">支付方式</span>
              <span>{{ order.payment }}</span>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-xs text-[var(--color-muted-foreground)]">{{ order.date }}</span>
          <div class="flex gap-2">
            <AppButton variant="secondary" size="sm" @click="printReceipt(order)">打印</AppButton>
            <AppButton variant="ghost" size="sm" @click="viewDetail(order)">详情</AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { orderApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import { AppButton, AppCard, AppSearch, AppBadge, AppLoading } from '@/components/ui'

const toast = useToastStore()
const searchQuery = ref('')
const orders = ref<any[]>([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const res = await orderApi.list({ type: 'sale' })
    orders.value = res.data.map((o: any) => ({
      id: o.id, no: o.orderNo,
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
  return orders.value.filter(o => o.no.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q))
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
