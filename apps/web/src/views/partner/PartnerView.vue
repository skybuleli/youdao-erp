<template>
  <div class="flex flex-col gap-4">
    <AppTabs v-model="activeTab" :tabs="tabs" />

    <AppSearch v-model="searchQuery" placeholder="搜索名称、联系人、电话..." />

    <AppLoading v-if="loading" />

    <div v-else class="flex flex-col gap-3">
      <AppCard v-for="partner in filteredPartners" :key="partner.id" hoverable class="p-4">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-11 h-11 rounded-full flex items-center justify-center text-lg font-semibold text-white flex-shrink-0" style="background: var(--color-brand-gradient)">
            {{ partner.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-base">{{ partner.name }}</div>
            <AppBadge :variant="partner.type === 'customer' ? 'default' : 'success'" class="mt-0.5">
              {{ partner.typeName }}
            </AppBadge>
          </div>
          <div class="text-right">
            <div class="text-xs text-[var(--color-muted-foreground)]">{{ partner.type === 'customer' ? '应收' : '应付' }}</div>
            <div class="text-base font-bold font-[var(--font-mono)]" :class="partner.balance > 0 ? 'text-[var(--color-danger)]' : ''">
              ¥{{ partner.balance.toFixed(2) }}
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2 py-3 border-t border-b border-[var(--color-border)] mb-3 text-sm">
          <div class="flex justify-between">
            <span class="text-[var(--color-muted-foreground)] flex items-center gap-1"><User class="h-4 w-4" /> 联系人</span>
            <span>{{ partner.contact }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--color-muted-foreground)]">📞 电话</span>
            <span>{{ partner.phone }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[var(--color-muted-foreground)]">📍 地址</span>
            <span class="truncate max-w-[200px]">{{ partner.address }}</span>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <AppButton variant="secondary" size="sm" @click="callPartner(partner.phone)">📞</AppButton>
          <AppButton variant="secondary" size="sm" @click="openDetail(partner)">商品</AppButton>
          <AppButton variant="outline" size="sm" @click="editPartner(partner)">编辑</AppButton>
          <AppButton variant="ghost" size="sm" class="text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]" @click="deletePartner(partner)">删除</AppButton>
        </div>
      </AppCard>
    </div>

    <!-- FAB -->
    <AppButton class="fixed right-5 bottom-20 md:bottom-5 w-14 h-14 rounded-full shadow-lg z-50" @click="openAddModal">
      <Plus class="h-6 w-6" />
    </AppButton>

    <!-- Add/Edit Dialog -->
    <AppDialog :open="showAddModal" @close="showAddModal = false">
      <div class="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
        <h3 class="text-lg font-semibold">{{ editingPartner ? '编辑往来单位' : '新增往来单位' }}</h3>
        <AppButton variant="ghost" size="icon-sm" @click="showAddModal = false">
          <X class="h-4 w-4" />
        </AppButton>
      </div>
      <div class="p-5 flex flex-col gap-4">
        <AppFormGroup label="类型">
          <div class="flex gap-2">
            <AppButton
              v-for="t in [{v:'customer',l:'客户'},{v:'supplier',l:'供应商'}]"
              :key="t.v"
              :variant="form.type === t.v ? 'default' : 'secondary'"
              class="flex-1"
              @click="form.type = t.v as PartnerType"
            >{{ t.l }}</AppButton>
          </div>
        </AppFormGroup>
        <AppFormGroup label="名称"><AppInput v-model="form.name" placeholder="单位名称" /></AppFormGroup>
        <AppFormGroup label="联系人"><AppInput v-model="form.contact" placeholder="联系人姓名" /></AppFormGroup>
        <AppFormGroup label="电话"><AppInput v-model="form.phone" placeholder="联系电话" /></AppFormGroup>
        <AppFormGroup label="地址"><AppInput v-model="form.address" placeholder="详细地址" /></AppFormGroup>
      </div>
      <div class="p-4 border-t border-[var(--color-border)] flex gap-3">
        <AppButton variant="secondary" class="flex-1" @click="showAddModal = false">取消</AppButton>
        <AppButton class="flex-1" @click="savePartner">保存</AppButton>
      </div>
    </AppDialog>

    <!-- Detail Dialog -->
    <AppDialog :open="showDetailModal" @close="showDetailModal = false">
      <div class="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
        <h3 class="text-lg font-semibold">{{ detailPartner?.name }} — 供应商品</h3>
        <AppButton variant="ghost" size="icon-sm" @click="showDetailModal = false">
          <X class="h-4 w-4" />
        </AppButton>
      </div>
      <div class="p-5">
        <AppEmpty v-if="detailProducts.length === 0" message="该供应商暂无商品" />
        <div v-else class="flex flex-col gap-2.5">
          <AppCard v-for="p in detailProducts" :key="p.id" class="p-3">
            <div class="font-semibold text-sm mb-1.5">{{ p.name }}</div>
            <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-muted-foreground)]">
              <span>条码: {{ p.barcode || '-' }}</span>
              <span>库存: {{ p.stockQty }}</span>
              <span>进价: ¥{{ p.purchasePrice }}</span>
              <span>售价: ¥{{ p.salePrice }}</span>
            </div>
          </AppCard>
        </div>
      </div>
      <div class="p-4 border-t border-[var(--color-border)]">
        <AppButton variant="secondary" class="w-full" @click="showDetailModal = false">关闭</AppButton>
      </div>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { partnerApi, productApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import { Plus, X, User } from 'lucide-vue-next'
import { AppButton, AppCard, AppInput, AppSearch, AppDialog, AppFormGroup, AppBadge, AppTabs, AppLoading, AppEmpty } from '@/components/ui'

const toast = useToastStore()
const activeTab = ref('all')
const searchQuery = ref('')
const showAddModal = ref(false)
const showDetailModal = ref(false)
const editingPartner = ref<any>(null)
const detailPartner = ref<any>(null)
const detailProducts = ref<Array<any>>([])
const loading = ref(false)
const partners = ref<Array<any>>([])

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'customer', label: '客户' },
  { value: 'supplier', label: '供应商' }
]

async function loadData() {
  loading.value = true
  try {
    const type = activeTab.value === 'all' ? undefined : activeTab.value
    const res = await partnerApi.list({ type, search: searchQuery.value || undefined })
    partners.value = res.data.map((p: any) => ({ ...p, typeName: p.type === 'customer' ? '客户' : '供应商' }))
  } catch (e: any) {
    toast.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const filteredPartners = computed(() => {
  let result = partners.value
  if (activeTab.value !== 'all') result = result.filter((p: any) => p.type === activeTab.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p: any) =>
      p.name.toLowerCase().includes(q) || (p.contact && p.contact.toLowerCase().includes(q)) || (p.phone && p.phone.includes(q))
    )
  }
  return result
})

type PartnerType = 'customer' | 'supplier'
const form = reactive({ type: 'customer' as PartnerType, name: '', contact: '', phone: '', address: '' })

function openAddModal() {
  editingPartner.value = null
  Object.assign(form, { type: 'customer', name: '', contact: '', phone: '', address: '' })
  showAddModal.value = true
}

function editPartner(partner: any) {
  editingPartner.value = partner
  Object.assign(form, { type: partner.type, name: partner.name, contact: partner.contact || '', phone: partner.phone || '', address: partner.address || '' })
  showAddModal.value = true
}

async function deletePartner(partner: any) {
  if (!confirm(`确定要删除「${partner.name}」吗？`)) return
  try {
    await partnerApi.delete(partner.id)
    await loadData()
    toast.success('删除成功')
  } catch (e: any) {
    toast.error(e.message || '删除失败')
  }
}

async function openDetail(partner: any) {
  detailPartner.value = partner
  showDetailModal.value = true
  detailProducts.value = []
  if (partner.type === 'supplier') {
    try {
      const res = await productApi.list({ supplier: String(partner.id) })
      detailProducts.value = res.data
    } catch (e: any) {
      toast.error(e.message || '加载商品失败')
    }
  }
}

function callPartner(phone: string) {
  window.location.href = `tel:${phone}`
}

async function savePartner() {
  if (!form.name) { toast.warning('请输入单位名称'); return }
  try {
    const payload = { type: form.type, name: form.name, contact: form.contact, phone: form.phone, address: form.address }
    if (editingPartner.value) await partnerApi.update(editingPartner.value.id, payload)
    else await partnerApi.create(payload)
    showAddModal.value = false
    editingPartner.value = null
    Object.assign(form, { type: 'customer', name: '', contact: '', phone: '', address: '' })
    await loadData()
    toast.success('保存成功')
  } catch (e: any) {
    toast.error(e.message || '保存失败')
  }
}

watch([activeTab, searchQuery], loadData)
onMounted(loadData)
</script>
