<template>
  <div class="flex flex-col gap-4 pb-5">
    <div>
      <h2 class="text-xl font-semibold mb-1">销售退货</h2>
      <p class="text-sm text-[var(--color-muted-foreground)]">选择客户并添加退货商品</p>
    </div>

    <AppCard class="p-4">
      <AppFormGroup label="退货客户">
        <AppSelect v-model="selectedCustomer">
          <option :value="null">请选择客户</option>
          <option v-for="p in customers" :key="p.id" :value="p.id">{{ p.name }}</option>
        </AppSelect>
      </AppFormGroup>
    </AppCard>

    <AppCard class="p-4">
      <AppFormGroup label="选择商品">
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
          <AppButton
            v-for="product in quickProducts"
            :key="product.id"
            variant="secondary"
            class="flex-col h-auto py-3 px-1 gap-1 text-xs"
            @click="addToCart(product)"
          >
            <Package class="h-5 w-5" />
            <span class="truncate max-w-full">{{ product.name }}</span>
            <span class="text-[var(--color-warning)] font-semibold">¥{{ product.price }}</span>
          </AppButton>
        </div>
        <AppEmpty v-if="quickProducts.length === 0" message="暂无商品" />
      </AppFormGroup>
    </AppCard>

    <AppCard class="p-4">
      <div class="flex justify-between items-center mb-3">
        <span class="font-semibold">退货清单 ({{ cart.length }})</span>
        <AppButton variant="ghost" size="sm" class="text-[var(--color-danger)]" @click="clearCart">清空</AppButton>
      </div>
      <AppEmpty v-if="cart.length === 0" message="点击上方商品添加" />
      <div v-else class="flex flex-col gap-2">
        <div v-for="(item, index) in cart" :key="index" class="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-secondary)]">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--color-warning-muted)] flex-shrink-0">
            <Package class="h-5 w-5 text-[var(--color-warning)]" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ item.name }}</div>
            <div class="text-xs text-[var(--color-muted-foreground)]">¥{{ item.price }}/{{ item.unit }}</div>
          </div>
          <div class="flex items-center gap-2">
            <AppButton variant="secondary" size="icon-sm" @click="decreaseQty(index)"><Minus class="h-3 w-3" /></AppButton>
            <span class="min-w-[32px] text-center font-semibold">{{ item.qty }}</span>
            <AppButton variant="secondary" size="icon-sm" @click="increaseQty(index)"><Plus class="h-3 w-3" /></AppButton>
            <span class="font-semibold min-w-[70px] text-right font-[var(--font-mono)]">¥{{ (item.price * item.qty).toFixed(2) }}</span>
            <AppButton variant="ghost" size="icon-sm" class="text-[var(--color-danger)]" @click="removeItem(index)">
              <Trash2 class="h-4 w-4" />
            </AppButton>
          </div>
        </div>
      </div>
    </AppCard>

    <AppCard class="p-4 flex flex-col gap-3">
      <div class="flex justify-between gap-4">
        <div class="flex flex-col items-center gap-1 flex-1">
          <span class="text-xs text-[var(--color-muted-foreground)]">商品种类</span>
          <span class="text-xl font-bold font-[var(--font-mono)]">{{ cart.length }}</span>
        </div>
        <div class="flex flex-col items-center gap-1 flex-1">
          <span class="text-xs text-[var(--color-muted-foreground)]">总数量</span>
          <span class="text-xl font-bold font-[var(--font-mono)]">{{ totalQty }}</span>
        </div>
        <div class="flex flex-col items-center gap-1 flex-1">
          <span class="text-xs text-[var(--color-muted-foreground)]">应退金额</span>
          <span class="text-xl font-bold text-[var(--color-warning)] font-[var(--font-mono)]">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>
      <div class="flex justify-between items-center text-sm py-2 border-t border-[var(--color-border)]">
        <span>实退金额</span>
        <AppInput v-model.number="refundAmount" type="number" class="w-36 text-right" :placeholder="totalAmount.toFixed(2)" />
      </div>
      <div class="flex justify-between items-center text-sm">
        <span>退货原因</span>
        <AppInput v-model="remark" class="w-48" placeholder="可选..." />
      </div>
      <AppButton variant="secondary" class="h-13 text-base bg-[var(--color-warning)] text-white hover:opacity-90 border-none" @click="submitReturn">
        确认退货 ¥{{ refundAmount || totalAmount }}
      </AppButton>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { productApi, orderApi, partnerApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import { Package, Minus, Plus, Trash2 } from 'lucide-vue-next'
import { AppButton, AppCard, AppInput, AppSelect, AppFormGroup, AppEmpty } from '@/components/ui'

const toast = useToastStore()
const cart = ref<Array<{ id: number; name: string; price: number; qty: number; unit: string }>>([])
const quickProducts = ref<Array<{ id: number; name: string; price: number }>>([])
const customers = ref<Array<{ id: number; name: string }>>([])
const selectedCustomer = ref<number | null>(null)
const refundAmount = ref(0)
const remark = ref('')

async function loadData() {
  try {
    const [prodRes, partnerRes] = await Promise.all([
      productApi.list({ pageSize: 100 }).catch(() => ({ data: [] })),
      partnerApi.list().catch(() => ({ data: [] }))
    ])
    quickProducts.value = (prodRes.data || []).slice(0, 12).map((p: any) => ({ id: p.id, name: p.name, price: p.salePrice }))
    customers.value = (partnerRes.data || []).map((p: any) => ({ id: p.id, name: p.name }))
  } catch (e: any) {
    toast.error(e.message || '加载失败')
  }
}

const totalQty = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const totalAmount = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.qty, 0))

function addToCart(product: any) {
  const existing = cart.value.find(item => item.id === product.id)
  if (existing) existing.qty++
  else cart.value.push({ ...product, qty: 1, unit: '件' })
}
function increaseQty(index: number) { cart.value[index].qty++ }
function decreaseQty(index: number) {
  if (cart.value[index].qty > 1) cart.value[index].qty--
  else removeItem(index)
}
function removeItem(index: number) { cart.value.splice(index, 1) }
function clearCart() { cart.value = [] }

async function submitReturn() {
  if (!selectedCustomer.value) { toast.warning('请选择退货客户'); return }
  if (cart.value.length === 0) { toast.warning('请先添加退货商品'); return }
  try {
    await orderApi.create({
      type: 'sale', subType: 'return', partnerId: selectedCustomer.value, discountAmount: 0,
      paidAmount: refundAmount.value || totalAmount.value, remark: remark.value || undefined,
      items: cart.value.map(item => ({ productId: item.id, qty: item.qty, unitPrice: item.price }))
    })
    toast.success('退货单提交成功！')
    clearCart()
    refundAmount.value = 0
    remark.value = ''
  } catch (e: any) {
    toast.error(e.message || '提交失败')
  }
}

onMounted(loadData)
</script>
