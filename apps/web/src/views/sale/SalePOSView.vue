<template>
  <div class="flex flex-col gap-3 pb-4">
    <!-- Scan Area -->
    <AppCard clickable class="p-6 border-dashed border-2 border-[var(--color-border)] flex flex-col items-center gap-2 cursor-pointer hover:border-[var(--color-brand)] transition-colors" @click="handleScan">
      <ScanLine class="h-9 w-9 text-[var(--color-brand)]" />
      <span class="text-[15px] text-[var(--color-muted-foreground)]">{{ isScanning ? '正在扫描...' : '点击扫码或输入条码' }}</span>
    </AppCard>

    <!-- Cart -->
    <AppCard class="p-4">
      <div class="flex justify-between items-center mb-3">
        <span class="font-semibold">购物车 ({{ cart.length }})</span>
        <AppButton variant="ghost" size="sm" class="text-[var(--color-danger)]" @click="clearCart">清空</AppButton>
      </div>
      <AppEmpty v-if="cart.length === 0" message="扫码添加商品" />
      <div v-else class="flex flex-col gap-2">
        <div v-for="(item, index) in cart" :key="index" class="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-secondary)] animate-slide-in">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--color-brand-muted)] flex-shrink-0">
            <Package class="h-5 w-5 text-[var(--color-brand)]" />
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

    <!-- Summary Panel -->
    <AppCard class="p-4 flex flex-col gap-3">
      <div class="flex justify-between gap-4">
        <div v-for="s in summaryItems" :key="s.label" class="flex flex-col items-center gap-1 flex-1">
          <span class="text-xs text-[var(--color-muted-foreground)]">{{ s.label }}</span>
          <span class="text-xl font-bold font-[var(--font-mono)]" :class="s.class">{{ s.value }}</span>
        </div>
      </div>
      <div class="flex flex-col gap-2 p-3 rounded-lg bg-[var(--color-secondary)]">
        <div class="flex justify-between items-center text-sm">
          <span>优惠</span>
          <AppInput v-model.number="discount" type="number" class="w-24 text-right" placeholder="0.00" />
        </div>
        <div class="flex justify-between items-center text-sm">
          <span>应收</span>
          <span class="text-lg font-bold font-[var(--font-mono)]">¥{{ payableAmount.toFixed(2) }}</span>
        </div>
      </div>
      <div class="flex gap-2">
        <AppSelect v-model="selectedCustomer" class="flex-1">
          <option :value="null">选择客户</option>
          <option v-for="p in customers" :key="p.id" :value="p.id">{{ p.name }}</option>
        </AppSelect>
        <AppSelect class="flex-1"><option>总仓</option></AppSelect>
      </div>
      <div class="flex gap-2">
        <AppButton
          v-for="method in paymentMethods"
          :key="method.value"
          :variant="selectedPayment === method.value ? 'default' : 'secondary'"
          class="flex-1 flex-col h-12 gap-0.5 text-xs"
          @click="selectedPayment = method.value"
        >
          <component :is="method.icon" class="h-4 w-4" />
          <span>{{ method.label }}</span>
        </AppButton>
      </div>
      <div class="flex justify-between items-center px-1">
        <span>实收</span>
        <AppInput v-model.number="received" type="number" class="w-32 text-right text-base font-semibold" :placeholder="payableAmount.toFixed(2)" />
      </div>
      <div v-if="received > payableAmount" class="flex justify-between items-center px-1 text-sm">
        <span>找零</span>
        <span class="text-[var(--color-success)] font-[var(--font-mono)]">¥{{ (received - payableAmount).toFixed(2) }}</span>
      </div>
      <div class="flex gap-3">
        <AppButton variant="secondary" class="flex-1 h-13">保存草稿</AppButton>
        <AppButton class="flex-[2] h-13 text-base" @click="submitOrder">确认收款 ¥{{ payableAmount.toFixed(2) }}</AppButton>
      </div>
    </AppCard>

    <!-- Quick Products -->
    <AppCard class="p-4">
      <h4 class="text-sm text-[var(--color-muted-foreground)] mb-3">快捷商品</h4>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <AppButton
          v-for="product in quickProducts"
          :key="product.id"
          variant="secondary"
          class="flex-col h-auto py-3 px-1 gap-1 text-xs"
          @click="addToCart(product)"
        >
          <Package class="h-5 w-5" />
          <span class="truncate max-w-full">{{ product.name }}</span>
          <span class="text-[var(--color-brand)] font-semibold">¥{{ product.price }}</span>
        </AppButton>
      </div>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { productApi, orderApi, partnerApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import { ScanLine, Package, Minus, Plus, Trash2, Banknote, CircleDot } from 'lucide-vue-next'
import { AppButton, AppCard, AppInput, AppSelect, AppEmpty } from '@/components/ui'

const toast = useToastStore()
const isScanning = ref(false)
const cart = ref<Array<{ id: number; name: string; price: number; qty: number; unit: string; icon: string }>>([])
const discount = ref(0)
const selectedPayment = ref('cash')
const received = ref(0)
const quickProducts = ref<Array<any>>([])
const customers = ref<Array<{ id: number; name: string }>>([])
const selectedCustomer = ref<number | null>(null)

const paymentMethods = [
  { value: 'cash', label: '现金', icon: Banknote },
  { value: 'wechat', label: '微信', icon: CircleDot },
  { value: 'alipay', label: '支付宝', icon: CircleDot }
]

async function loadData() {
  try {
    const [prodRes, partnerRes] = await Promise.all([
      productApi.list().catch(() => ({ data: [] })),
      partnerApi.list().catch(() => ({ data: [] }))
    ])
    quickProducts.value = (prodRes.data || []).slice(0, 12).map((p: any) => ({
      id: p.id, name: p.name, price: p.salePrice, supplierName: p.supplierName, icon: 'Package'
    }))
    customers.value = (partnerRes.data || []).map((p: any) => ({ id: p.id, name: p.name }))
  } catch (e: any) {
    toast.error(e.message || '加载失败')
  }
}

const totalQty = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const totalAmount = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.qty, 0))
const payableAmount = computed(() => Math.max(0, totalAmount.value - discount.value))

const summaryItems = computed(() => [
  { label: '商品种类', value: cart.value.length, class: '' },
  { label: '总数量', value: totalQty.value, class: '' },
  { label: '合计', value: `¥${totalAmount.value.toFixed(2)}`, class: 'gradient-text' },
])

function handleScan() { toast.info('扫码功能待接入条码扫描设备') }

function addToCart(product: any) {
  const existing = cart.value.find(item => item.id === product.id)
  if (existing) existing.qty++
  else cart.value.push({ ...product, qty: 1, unit: '件', icon: 'Package' })
}

function increaseQty(index: number) { cart.value[index].qty++ }
function decreaseQty(index: number) {
  if (cart.value[index].qty > 1) cart.value[index].qty--
  else removeItem(index)
}
function removeItem(index: number) { cart.value.splice(index, 1) }
function clearCart() { cart.value = [] }

async function submitOrder() {
  if (!selectedCustomer.value) { toast.warning('请选择客户'); return }
  if (cart.value.length === 0) { toast.warning('请先添加商品'); return }
  try {
    await orderApi.create({
      type: 'sale', partnerId: selectedCustomer.value, paymentMethod: selectedPayment.value,
      discountAmount: discount.value, paidAmount: received.value || payableAmount.value,
      items: cart.value.map(item => ({ productId: item.id, qty: item.qty, unitPrice: item.price }))
    })
    toast.success('订单提交成功！')
    clearCart()
    selectedCustomer.value = null
  } catch (e: any) {
    toast.error(e.message || '提交失败')
  }
}

onMounted(loadData)
</script>
