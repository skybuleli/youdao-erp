<template>
  <div class="flex flex-col gap-4">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <AppStatCard label="应收账款" :value="`¥${formatNumber(receivable)}`" icon-bg="var(--color-brand-muted)" icon-color="var(--color-brand)">
        <template #icon><CreditCard class="h-5 w-5" /></template>
      </AppStatCard>
      <AppStatCard label="应付账款" :value="`¥${formatNumber(payable)}`" icon-bg="var(--color-success-muted)" icon-color="var(--color-success)">
        <template #icon><Banknote class="h-4 w-4" /></template>
      </AppStatCard>
      <AppStatCard label="本月收支" :value="`¥${formatNumber(monthNet)}`" icon-bg="var(--color-info-muted)" icon-color="var(--color-info)">
        <template #icon><BarChart3 class="h-5 w-5" /></template>
      </AppStatCard>
    </div>

    <AppTabs v-model="activeTab" :tabs="tabs" />

    <AppLoading v-if="loading" />

    <!-- Receivable -->
    <div v-if="!loading && activeTab === 'receivable'" class="flex flex-col gap-3">
      <AppEmpty v-if="receivableBills.length === 0" message="暂无应收账款" />
      <AppCard v-for="bill in receivableBills" :key="bill.id" hoverable class="p-4">
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold text-white flex-shrink-0" style="background: var(--color-brand-gradient)">
              {{ bill.partner.charAt(0) }}
            </div>
            <div>
              <div class="font-semibold text-[15px]">{{ bill.partner }}</div>
              <div class="text-xs text-[var(--color-muted-foreground)] font-[var(--font-mono)]">{{ bill.orderNo }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-[var(--color-muted-foreground)]">应收</div>
            <div class="text-lg font-bold text-[var(--color-danger)] font-[var(--font-mono)]">¥{{ bill.amount.toFixed(2) }}</div>
          </div>
        </div>
        <div class="flex gap-4 text-sm text-[var(--color-muted-foreground)] py-2.5 border-t border-b border-[var(--color-border)] mb-3">
          <span class="flex items-center gap-1"><Calendar class="h-4 w-4" /> 到期: {{ bill.dueDate }}</span>
          <span v-if="bill.overdue > 0" class="text-[var(--color-danger)] flex items-center gap-1"><Clock class="h-4 w-4" /> 逾期 {{ bill.overdue }} 天</span>
        </div>
        <div class="flex gap-2">
          <AppButton variant="secondary" size="sm" class="flex-1" @click="viewDetail(bill)">查看详情</AppButton>
          <AppButton size="sm" class="flex-1" @click="receivePayment(bill)">收款</AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Payable -->
    <div v-if="!loading && activeTab === 'payable'" class="flex flex-col gap-3">
      <AppEmpty v-if="payableBills.length === 0" message="暂无应付账款" />
      <AppCard v-for="bill in payableBills" :key="bill.id" hoverable class="p-4">
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold text-white flex-shrink-0 bg-[var(--color-success)]">
              {{ bill.partner.charAt(0) }}
            </div>
            <div>
              <div class="font-semibold text-[15px]">{{ bill.partner }}</div>
              <div class="text-xs text-[var(--color-muted-foreground)] font-[var(--font-mono)]">{{ bill.orderNo }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-[var(--color-muted-foreground)]">应付</div>
            <div class="text-lg font-bold font-[var(--font-mono)]">¥{{ bill.amount.toFixed(2) }}</div>
          </div>
        </div>
        <div class="flex gap-4 text-sm text-[var(--color-muted-foreground)] py-2.5 border-t border-b border-[var(--color-border)] mb-3">
          <span class="flex items-center gap-1"><Calendar class="h-4 w-4" /> 到期: {{ bill.dueDate }}</span>
        </div>
        <div class="flex gap-2">
          <AppButton variant="secondary" size="sm" class="flex-1" @click="viewDetail(bill)">查看详情</AppButton>
          <AppButton size="sm" class="flex-1" @click="makePayment(bill)">付款</AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Cash Flow -->
    <div v-if="!loading && activeTab === 'cashflow'" class="flex flex-col gap-3">
      <AppEmpty v-if="incomeItems.length === 0 && expenseItems.length === 0" message="暂无本月收支记录" />
      <AppCard v-if="incomeItems.length > 0" class="p-5">
        <div class="flex items-center gap-2 mb-2">
          <TrendingUp class="h-5 w-5 text-[var(--color-brand)]" />
          <span class="text-sm text-[var(--color-muted-foreground)]">本月收入</span>
        </div>
        <div class="text-3xl font-bold gradient-text mb-4 font-[var(--font-mono)]">¥{{ formatNumber(monthIncome) }}</div>
        <div class="flex flex-col gap-2.5 pt-3 border-t border-[var(--color-border)]">
          <div v-for="(item, i) in incomeItems" :key="i" class="flex justify-between text-sm">
            <span>{{ item.name }}</span>
            <span class="font-[var(--font-mono)]">¥{{ item.amount }}</span>
          </div>
        </div>
      </AppCard>
      <AppCard v-if="expenseItems.length > 0" class="p-5">
        <div class="flex items-center gap-2 mb-2">
          <TrendingDown class="h-5 w-5 text-[var(--color-danger)]" />
          <span class="text-sm text-[var(--color-muted-foreground)]">本月支出</span>
        </div>
        <div class="text-3xl font-bold text-[var(--color-danger)] mb-4 font-[var(--font-mono)]">¥{{ formatNumber(monthExpense) }}</div>
        <div class="flex flex-col gap-2.5 pt-3 border-t border-[var(--color-border)]">
          <div v-for="(item, i) in expenseItems" :key="i" class="flex justify-between text-sm">
            <span>{{ item.name }}</span>
            <span class="font-[var(--font-mono)]">¥{{ item.amount }}</span>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Receive Payment Dialog -->
    <AppDialog :open="showReceiveModal" @close="showReceiveModal = false">
      <div class="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
        <h3 class="text-lg font-semibold">收款 - {{ currentBill?.partner }}</h3>
        <AppButton variant="ghost" size="icon-sm" @click="showReceiveModal = false"><X class="h-4 w-4" /></AppButton>
      </div>
      <div class="p-5 flex flex-col gap-4">
        <AppFormGroup label="应收金额"><AppInput :value="currentBill?.amount" disabled /></AppFormGroup>
        <AppFormGroup label="实收金额"><AppInput v-model.number="receiveAmount" type="number" placeholder="0.00" /></AppFormGroup>
        <AppFormGroup label="支付方式">
          <div class="grid grid-cols-2 gap-2">
            <AppButton
              v-for="method in paymentMethods"
              :key="method.value"
              :variant="selectedPayment === method.value ? 'default' : 'secondary'"
              @click="selectedPayment = method.value"
            >{{ method.label }}</AppButton>
          </div>
        </AppFormGroup>
        <AppFormGroup label="备注"><AppInput v-model="receiveRemark" placeholder="收款备注..." /></AppFormGroup>
      </div>
      <div class="p-4 border-t border-[var(--color-border)] flex gap-3">
        <AppButton variant="secondary" class="flex-1" @click="showReceiveModal = false">取消</AppButton>
        <AppButton class="flex-1" @click="confirmReceive">确认收款</AppButton>
      </div>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { financeApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import { CreditCard, Banknote, BarChart3, Calendar, Clock, TrendingUp, TrendingDown, X } from 'lucide-vue-next'
import { AppButton, AppCard, AppInput, AppDialog, AppFormGroup, AppTabs, AppStatCard, AppLoading, AppEmpty } from '@/components/ui'

const toast = useToastStore()
const activeTab = ref('receivable')
const showReceiveModal = ref(false)
const currentBill = ref<any>(null)
const receiveAmount = ref(0)
const selectedPayment = ref('cash')
const receiveRemark = ref('')
const loading = ref(false)

const tabs = [
  { value: 'receivable', label: '应收' },
  { value: 'payable', label: '应付' },
  { value: 'cashflow', label: '收支' }
]

const receivable = ref(0)
const payable = ref(0)
const monthIncome = ref(0)
const monthExpense = ref(0)
const monthNet = computed(() => monthIncome.value - monthExpense.value)
const receivableBills = ref<any[]>([])
const payableBills = ref<any[]>([])
const incomeItems = ref<{ name: string; amount: number }[]>([])
const expenseItems = ref<{ name: string; amount: number }[]>([])

const paymentMethods = [
  { value: 'cash', label: '现金' },
  { value: 'wechat', label: '微信' },
  { value: 'alipay', label: '支付宝' },
  { value: 'bank', label: '银行' }
]

async function loadData() {
  loading.value = true
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

    const [recRes, payRes, transRes] = await Promise.all([
      financeApi.receivables().catch(() => ({ data: [] })),
      financeApi.payables().catch(() => ({ data: [] })),
      financeApi.transactions({ startDate: startOfMonth, endDate: endOfMonth }).catch(() => ({ data: [] }))
    ])

    receivableBills.value = (recRes.data || []).map((r: any) => ({
      orderId: r.orderId, id: r.orderId, partnerId: r.partnerId, partner: r.partnerName,
      orderNo: r.orderNo, amount: r.amount, dueDate: r.dueDate, overdue: r.overdue || 0
    }))
    receivable.value = receivableBills.value.reduce((sum, b) => sum + b.amount, 0)

    payableBills.value = (payRes.data || []).map((r: any) => ({
      orderId: r.orderId, id: r.orderId, partnerId: r.partnerId, partner: r.partnerName,
      orderNo: r.orderNo, amount: r.amount, dueDate: r.dueDate, overdue: r.overdue || 0
    }))
    payable.value = payableBills.value.reduce((sum, b) => sum + b.amount, 0)

    const transactions = transRes.data || []
    const incomeTrans = transactions.filter((t: any) => t.type === 'income')
    const expenseTrans = transactions.filter((t: any) => t.type === 'expense')

    monthIncome.value = incomeTrans.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
    monthExpense.value = expenseTrans.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

    const incomeMap = new Map<string, number>()
    const expenseMap = new Map<string, number>()
    for (const t of incomeTrans) incomeMap.set(t.category, (incomeMap.get(t.category) || 0) + (t.amount || 0))
    for (const t of expenseTrans) expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + (t.amount || 0))
    incomeItems.value = Array.from(incomeMap.entries()).map(([name, amount]) => ({ name, amount }))
    expenseItems.value = Array.from(expenseMap.entries()).map(([name, amount]) => ({ name, amount }))
  } catch (err: any) { console.error('Finance load failed:', err.message) }
  finally { loading.value = false }
}

function formatNumber(n: number) { return n.toLocaleString('zh-CN') }

function receivePayment(bill: any) {
  currentBill.value = bill
  receiveAmount.value = bill.amount
  selectedPayment.value = 'cash'
  receiveRemark.value = ''
  showReceiveModal.value = true
}

async function confirmReceive() {
  if (!currentBill.value || receiveAmount.value <= 0) return
  try {
    await financeApi.createTransaction({
      type: 'income', category: '销售收入', amount: receiveAmount.value,
      partnerId: currentBill.value.partnerId, orderId: currentBill.value.orderId,
      account: selectedPayment.value, remark: receiveRemark.value || '收款'
    })
    await loadData()
    showReceiveModal.value = false
    toast.success('收款成功！')
  } catch (err: any) { toast.error('收款失败: ' + (err.message || '未知错误')) }
}

async function makePayment(bill: any) {
  const amount = prompt(`付款给 ${bill.partner}，应付金额: ¥${bill.amount}，请输入实付金额:`, String(bill.amount))
  if (!amount || Number(amount) <= 0) return
  try {
    await financeApi.createTransaction({
      type: 'expense', category: '采购支出', amount: Number(amount),
      partnerId: bill.partnerId, orderId: bill.orderId, account: 'bank', remark: '付款'
    })
    await loadData()
    toast.success('付款成功！')
  } catch (err: any) { toast.error('付款失败: ' + (err.message || '未知错误')) }
}

function viewDetail(bill: any) { toast.info(`查看 ${bill.orderNo} 详情（待实现）`) }

onMounted(loadData)
</script>
