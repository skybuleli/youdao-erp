<template>
  <div class="flex flex-col gap-3 pb-24">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-1">
      <AppButton variant="ghost" size="icon-sm" @click="$router.back()">
        <ChevronLeft class="h-5 w-5" />
      </AppButton>
      <h2 class="text-xl font-semibold flex-1">新增采购单</h2>
    </div>

    <!-- Info Card -->
    <AppCard class="p-4">
      <div class="grid grid-cols-2 gap-3">
        <AppFormGroup label="供应商" required>
          <AppSelect v-model.number="form.supplierId" @change="onSupplierChange">
            <option :value="null">选择供应商</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
          </AppSelect>
        </AppFormGroup>
        <AppFormGroup label="入库仓库">
          <AppSelect v-model="form.warehouse">
            <option>总仓</option>
            <option>分仓A</option>
          </AppSelect>
        </AppFormGroup>
      </div>
    </AppCard>

    <!-- Product Selection -->
    <AppCard class="p-4">
      <div class="flex justify-between items-center mb-3">
        <span class="font-semibold">采购商品</span>
        <AppButton size="sm" :disabled="!form.supplierId" @click="showProductPicker = true">
          <Plus class="h-4 w-4" /> 添加商品
        </AppButton>
      </div>
      <AppEmpty v-if="items.length === 0" message="点击添加商品开始采购" />
      <div v-else class="flex flex-col gap-3">
        <AppCard v-for="(item, index) in items" :key="index" class="p-3 relative">
          <AppButton variant="ghost" size="icon-sm" class="absolute right-2 top-2 text-[var(--color-danger)]" @click="removeItem(index)">
            <X class="h-4 w-4" />
          </AppButton>
          <div class="mb-2">
            <div class="font-medium text-sm">{{ item.name }}</div>
            <div class="text-xs text-[var(--color-muted-foreground)]">{{ item.spec }} | 库存 {{ item.stock }}</div>
          </div>
          <div class="flex items-end gap-3">
            <AppFormGroup label="单价" class="w-20">
              <AppInput v-model.number="item.price" type="number" class="text-center" />
            </AppFormGroup>
            <AppFormGroup label="数量" class="w-28">
              <div class="flex items-center gap-1">
                <AppButton variant="secondary" size="icon-sm" @click="decreaseQty(index)"><Minus class="h-3 w-3" /></AppButton>
                <AppInput v-model.number="item.qty" type="number" class="text-center" />
                <AppButton variant="secondary" size="icon-sm" @click="increaseQty(index)"><Plus class="h-3 w-3" /></AppButton>
              </div>
            </AppFormGroup>
            <div class="flex-1 text-right">
              <div class="text-xs text-[var(--color-muted-foreground)]">小计</div>
              <div class="font-semibold font-[var(--font-mono)]">¥{{ (item.price * item.qty).toFixed(2) }}</div>
            </div>
          </div>
        </AppCard>
      </div>
    </AppCard>

    <!-- Summary -->
    <AppCard v-if="items.length > 0" class="p-4 flex flex-col gap-2.5">
      <div class="flex justify-between text-sm"><span>商品种类</span><span class="font-[var(--font-mono)]">{{ items.length }}</span></div>
      <div class="flex justify-between text-sm"><span>总数量</span><span class="font-[var(--font-mono)]">{{ totalQty }}</span></div>
      <div class="flex justify-between text-sm"><span>合计金额</span><span class="font-semibold gradient-text font-[var(--font-mono)]">¥{{ totalAmount.toFixed(2) }}</span></div>
      <div class="flex justify-between items-center text-sm">
        <span>优惠</span>
        <AppInput v-model.number="form.discount" type="number" class="w-28 text-right" placeholder="0.00" />
      </div>
      <div class="flex justify-between items-center pt-2 border-t border-[var(--color-border)]">
        <span class="font-semibold">应付金额</span>
        <span class="text-2xl font-bold gradient-text font-[var(--font-mono)]">¥{{ payableAmount.toFixed(2) }}</span>
      </div>
    </AppCard>

    <!-- Notes -->
    <AppCard class="p-4">
      <AppFormGroup label="备注">
        <textarea v-model="form.remark" rows="2" class="flex w-full rounded-lg border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 resize-none" placeholder="输入采购备注..." />
      </AppFormGroup>
    </AppCard>

    <!-- Submit Bar -->
    <div class="fixed bottom-0 left-0 right-0 bg-[var(--color-card)]/90 backdrop-blur-xl border-t border-[var(--color-border)] p-4 flex items-center justify-between z-50 md:static md:rounded-xl md:border md:bg-[var(--color-card)]">
      <div class="flex flex-col">
        <span class="text-xs text-[var(--color-muted-foreground)]">应付</span>
        <span class="text-xl font-bold gradient-text font-[var(--font-mono)]">¥{{ payableAmount.toFixed(2) }}</span>
      </div>
      <AppButton size="lg" @click="submitOrder">确认采购</AppButton>
    </div>

    <!-- Product Picker Sheet -->
    <AppSheet :open="showProductPicker" @close="showProductPicker = false">
      <div class="p-4 border-b border-[var(--color-border)] flex justify-between items-center">
        <h3 class="font-semibold">选择商品</h3>
        <AppButton variant="ghost" size="icon-sm" @click="showProductPicker = false">
          <X class="h-4 w-4" />
        </AppButton>
      </div>
      <div class="p-4">
        <AppSearch v-model="pickerQuery" placeholder="搜索商品..." />
      </div>
      <div class="px-4 pb-4 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
        <AppCard
          v-for="product in filteredPickerProducts"
          :key="product.id"
          clickable
          class="p-3 flex items-center gap-3"
          @click="addItem(product)"
        >
          <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] flex-shrink-0">
            <Package class="h-5 w-5 text-[var(--color-brand)]" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm">{{ product.name }}</div>
            <div class="text-xs text-[var(--color-muted-foreground)]">进价 ¥{{ product.cost }} | 库存 {{ product.stock }}</div>
          </div>
          <Plus class="h-5 w-5 text-[var(--color-brand)]" />
        </AppCard>
      </div>
    </AppSheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productApi, orderApi, partnerApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import { ChevronLeft, Plus, X, Minus, Package } from 'lucide-vue-next'
import { AppButton, AppCard, AppInput, AppSelect, AppSearch, AppSheet, AppFormGroup, AppEmpty } from '@/components/ui'

const router = useRouter()
const toast = useToastStore()
const showProductPicker = ref(false)
const pickerQuery = ref('')

const form = reactive({ supplierId: null as number | null, warehouse: '总仓', discount: 0, remark: '' })
const items = ref<Array<{ id: number; name: string; spec: string; price: number; qty: number; stock: number }>>([])
const allProducts = ref<Array<any>>([])
const suppliers = ref<Array<any>>([])

async function loadData() {
  try {
    const [prodRes, partnerRes] = await Promise.all([productApi.list(), partnerApi.list({ type: 'supplier' })])
    allProducts.value = prodRes.data.map((p: any) => ({
      id: p.id, name: p.name, spec: p.specs || '', cost: p.purchasePrice,
      stock: p.stockQty, supplierId: p.supplierId, icon: 'Package'
    }))
    suppliers.value = partnerRes.data
  } catch (e: any) {
    toast.error(e.message || '加载失败')
  }
}

function onSupplierChange() {
  items.value = []
}

const filteredPickerProducts = computed(() => {
  let list = form.supplierId ? allProducts.value.filter((p: any) => p.supplierId === form.supplierId) : []
  if (pickerQuery.value) list = list.filter((p: any) => p.name.toLowerCase().includes(pickerQuery.value.toLowerCase()))
  return list
})

const totalQty = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
const totalAmount = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0))
const payableAmount = computed(() => Math.max(0, totalAmount.value - form.discount))

function addItem(product: any) {
  const existing = items.value.find(i => i.id === product.id)
  if (existing) existing.qty++
  else items.value.push({ id: product.id, name: product.name, spec: product.spec, price: product.cost, qty: 1, stock: product.stock })
  showProductPicker.value = false
}

function increaseQty(index: number) { items.value[index].qty++ }
function decreaseQty(index: number) {
  if (items.value[index].qty > 1) items.value[index].qty--
  else removeItem(index)
}
function removeItem(index: number) { items.value.splice(index, 1) }

async function submitOrder() {
  if (!form.supplierId) { toast.warning('请选择供应商'); return }
  if (items.value.length === 0) { toast.warning('请添加采购商品'); return }
  try {
    await orderApi.create({
      type: 'purchase', partnerId: form.supplierId, discountAmount: form.discount, remark: form.remark,
      items: items.value.map(i => ({ productId: i.id, qty: i.qty, unitPrice: i.price }))
    })
    toast.success('采购单提交成功！')
    router.push('/purchase')
  } catch (e: any) {
    toast.error(e.message || '提交失败')
  }
}

onMounted(loadData)
</script>
