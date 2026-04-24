<template>
  <div class="flex flex-col gap-4 pb-5">
    <AppSearch v-model="searchQuery" placeholder="搜索商品名称、条码..." />

    <AppSelect v-model.number="selectedSupplier" class="max-w-[280px]">
      <option :value="null">全部供应商</option>
      <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
    </AppSelect>

    <AppTabs v-model="activeTab" :tabs="tabs" />

    <AppLoading v-if="loading" />

    <div v-else class="flex flex-col gap-3">
      <AppCard
        v-for="item in filteredItems"
        :key="item.id"
        hoverable
        class="p-4"
        :class="item.stock <= 0 ? 'border-[var(--color-danger)]/40' : item.stock <= item.minStock ? 'border-[var(--color-warning)]/30' : ''"
      >
        <div class="flex items-center gap-3 mb-3">
          <div class="w-11 h-11 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] flex-shrink-0">
            <Package class="h-5 w-5 text-[var(--color-brand)]" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-[15px] truncate">{{ item.name }}</div>
            <div class="text-xs text-[var(--color-muted-foreground)] font-[var(--font-mono)]">{{ item.code }} | 供应商: {{ item.supplierName || '-' }}</div>
          </div>
          <AppBadge :variant="stockVariant(item)">{{ stockText(item) }}</AppBadge>
        </div>

        <div class="mb-3">
          <div class="h-2 rounded-full bg-[var(--color-secondary)] overflow-hidden mb-1.5">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="item.stock <= 0 ? 'bg-[var(--color-danger)]' : item.stock <= item.minStock ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-success)]'"
              :style="{ width: Math.min(100, (item.stock / item.maxStock) * 100) + '%' }"
            />
          </div>
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-bold font-[var(--font-mono)]">{{ item.stock }}</span>
            <span class="text-sm text-[var(--color-muted-foreground)]">/ {{ item.maxStock }}</span>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 py-3 border-t border-b border-[var(--color-border)] mb-3 text-center text-sm">
          <div class="flex flex-col items-center gap-0.5">
            <span class="text-[11px] text-[var(--color-muted-foreground)]">规格</span>
            <span class="font-medium text-xs">{{ item.spec }}</span>
          </div>
          <div class="flex flex-col items-center gap-0.5">
            <span class="text-[11px] text-[var(--color-muted-foreground)]">预警值</span>
            <span class="font-medium">{{ item.minStock }}</span>
          </div>
          <div class="flex flex-col items-center gap-0.5">
            <span class="text-[11px] text-[var(--color-muted-foreground)]">进价</span>
            <span class="font-medium font-[var(--font-mono)]">¥{{ item.cost }}</span>
          </div>
          <div class="flex flex-col items-center gap-0.5">
            <span class="text-[11px] text-[var(--color-muted-foreground)]">售价</span>
            <span class="font-medium font-[var(--font-mono)]">¥{{ item.price }}</span>
          </div>
        </div>

        <div class="flex gap-2">
          <AppButton variant="secondary" size="sm" class="flex-1" @click="adjustStock(item)">调整库存</AppButton>
          <AppButton size="sm" class="flex-1" @click="viewHistory(item)">出入库记录</AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Warning Banner -->
    <div v-if="warningItems.length > 0" class="fixed bottom-20 left-4 right-4 md:static md:mt-2 flex justify-between items-center p-3 rounded-xl bg-[var(--color-warning-muted)] border border-[var(--color-warning)]/30 text-[var(--color-warning)] text-sm backdrop-blur-lg z-50">
      <span class="flex items-center gap-2"><AlertTriangle class="h-4 w-4" /> {{ warningItems.length }} 种商品库存不足</span>
      <AppButton size="sm" variant="secondary" class="bg-[var(--color-warning)] text-white border-none" @click="activeTab = 'warning'">查看</AppButton>
    </div>

    <!-- Adjust Modal -->
    <AppDialog :open="showAdjustModal" @close="showAdjustModal = false">
      <div class="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
        <h3 class="text-lg font-semibold">库存调整 - {{ adjustItem?.name }}</h3>
        <AppButton variant="ghost" size="icon-sm" @click="showAdjustModal = false"><X class="h-4 w-4" /></AppButton>
      </div>
      <div class="p-5 flex flex-col gap-4">
        <AppFormGroup label="调整类型">
          <div class="flex gap-2">
            <AppButton :variant="adjustType === 'in' ? 'default' : 'secondary'" class="flex-1" @click="adjustType = 'in'">入库</AppButton>
            <AppButton :variant="adjustType === 'out' ? 'default' : 'secondary'" class="flex-1" @click="adjustType = 'out'">出库</AppButton>
            <AppButton :variant="adjustType === 'count' ? 'default' : 'secondary'" class="flex-1" @click="adjustType = 'count'">盘点</AppButton>
          </div>
        </AppFormGroup>
        <AppFormGroup label="当前库存"><AppInput :value="adjustItem?.stock" disabled /></AppFormGroup>
        <AppFormGroup label="调整数量"><AppInput v-model.number="adjustQty" type="number" placeholder="正数增加，负数减少" /></AppFormGroup>
        <AppFormGroup label="备注"><AppInput v-model="adjustRemark" placeholder="调整原因..." /></AppFormGroup>
      </div>
      <div class="p-4 border-t border-[var(--color-border)] flex gap-3">
        <AppButton variant="secondary" class="flex-1" @click="showAdjustModal = false">取消</AppButton>
        <AppButton class="flex-1" @click="confirmAdjust">确认调整</AppButton>
      </div>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { productApi, partnerApi, inventoryApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import { Package, AlertTriangle, X } from 'lucide-vue-next'
import { AppButton, AppCard, AppInput, AppSelect, AppSearch, AppDialog, AppFormGroup, AppBadge, AppTabs, AppLoading } from '@/components/ui'

const toast = useToastStore()
const searchQuery = ref('')
const activeTab = ref('all')
const selectedSupplier = ref<number | null>(null)
const showAdjustModal = ref(false)
const adjustItem = ref<any>(null)
const adjustQty = ref(0)
const adjustRemark = ref('')
const adjustType = ref('in')
const loading = ref(false)
const items = ref<Array<any>>([])
const suppliers = ref<Array<{ id: number; name: string }>>([])

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'warning', label: '库存预警' },
  { value: 'normal', label: '库存正常' }
]

async function loadSuppliers() {
  try {
    const res = await partnerApi.list({ type: 'supplier' })
    suppliers.value = res.data.map((s: any) => ({ id: s.id, name: s.name }))
  } catch (e: any) { console.error('加载供应商失败', e.message) }
}

async function loadData() {
  loading.value = true
  try {
    const res = await productApi.list({ supplier: selectedSupplier.value ? String(selectedSupplier.value) : undefined })
    items.value = res.data.map((p: any) => ({
      id: p.id, name: p.name, code: p.barcode || '', spec: p.specs || '',
      stock: p.stockQty, minStock: p.minStock, maxStock: p.maxStock || 100,
      cost: p.purchasePrice, price: p.salePrice, supplierName: p.supplierName
    }))
  } catch (e: any) { toast.error(e.message || '加载失败') }
  finally { loading.value = false }
}

const warningItems = computed(() => items.value.filter(i => i.stock <= i.minStock))

const filteredItems = computed(() => {
  let result = items.value
  if (activeTab.value === 'warning') result = result.filter(i => i.stock <= i.minStock)
  else if (activeTab.value === 'normal') result = result.filter(i => i.stock > i.minStock)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(i => i.name.toLowerCase().includes(q) || i.code.includes(q))
  }
  return result
})

function stockVariant(item: any) {
  if (item.stock <= 0) return 'danger'
  if (item.stock <= item.minStock) return 'warning'
  return 'success'
}

function stockText(item: any) {
  if (item.stock <= 0) return '缺货'
  if (item.stock <= item.minStock) return '预警'
  return '正常'
}

function adjustStock(item: any) {
  adjustItem.value = item
  adjustQty.value = 0
  adjustRemark.value = ''
  adjustType.value = 'in'
  showAdjustModal.value = true
}

async function confirmAdjust() {
  if (!adjustItem.value || adjustQty.value === 0) { toast.warning('调整数量不能为 0'); return }
  try {
    const qty = adjustType.value === 'out' ? -Math.abs(adjustQty.value) : Math.abs(adjustQty.value)
    await inventoryApi.adjust({
      productId: adjustItem.value.id, qty,
      type: adjustType.value === 'in' ? '入库' : adjustType.value === 'out' ? '出库' : '盘点',
      remark: adjustRemark.value || undefined
    })
    showAdjustModal.value = false
    toast.success('库存调整成功！')
    await loadData()
  } catch (err: any) { toast.error(err.message || '库存调整失败') }
}

function viewHistory(item: any) {
  toast.info(`查看 ${item.name} 的出入库记录（待实现）`)
}

watch(selectedSupplier, loadData)
onMounted(() => { loadSuppliers(); loadData() })
</script>
