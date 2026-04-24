<template>
  <div class="flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="flex gap-3 items-center">
      <AppSearch v-model="searchQuery" placeholder="搜索商品名称、条码..." class="flex-1" @search="loadProducts" />
      <AppButton @click="openAddModal">
        <Plus class="h-4 w-4" /> 新增商品
      </AppButton>
    </div>

    <!-- Category Filter -->
    <div class="flex gap-2 overflow-x-auto pb-1">
      <AppButton
        v-for="cat in categories"
        :key="cat.value"
        :variant="selectedCategory === cat.value ? 'default' : 'secondary'"
        size="sm"
        @click="selectedCategory = cat.value"
      >
        {{ cat.label }}
      </AppButton>
    </div>

    <!-- Supplier Filter -->
    <div class="flex items-center gap-2">
      <span class="text-sm text-[var(--color-muted-foreground)] whitespace-nowrap">供应商:</span>
      <AppSelect v-model.number="selectedSupplier" class="flex-1 max-w-[240px]">
        <option :value="null">全部供应商</option>
        <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
      </AppSelect>
    </div>

    <!-- Loading -->
    <AppLoading v-if="loading" />

    <!-- Product Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <AppCard v-for="product in filteredProducts" :key="product.id" hoverable class="p-4 relative">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 bg-[var(--color-secondary)]">
            <AppIcon :name="product.icon" class="h-6 w-6 text-[var(--color-brand)]" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-[15px] mb-1 truncate">{{ product.name }}</div>
            <div class="flex gap-2 text-xs text-[var(--color-muted-foreground)] mb-2">
              <span>{{ product.code }}</span>
              <span>{{ product.spec }}</span>
            </div>
            <div class="flex items-center gap-1 text-xs mb-2">
              <span class="text-[var(--color-muted-foreground)]">供应商:</span>
              <span class="text-[var(--color-foreground)]">{{ product.supplierName || '未关联' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold text-[var(--color-brand)] font-[var(--font-mono)]">¥{{ product.price }}</span>
              <AppBadge :variant="stockBadge(product.stock, product.minStock).variant">
                库存 {{ product.stock }}
              </AppBadge>
            </div>
          </div>
        </div>
        <div class="absolute right-2 top-2 flex gap-1">
          <AppButton variant="ghost" size="icon-sm" @click="editProduct(product)">
            <Pencil class="h-4 w-4" />
          </AppButton>
          <AppButton variant="ghost" size="icon-sm" class="hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]" @click="deleteProduct(product)">
            <Trash2 class="h-4 w-4" />
          </AppButton>
        </div>
      </AppCard>
    </div>

    <!-- Add/Edit Modal -->
    <AppDialog :open="showAddModal" @close="showAddModal = false">
      <div class="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
        <h3 class="text-lg font-semibold">{{ editingProduct ? '编辑商品' : '新增商品' }}</h3>
        <AppButton variant="ghost" size="icon-sm" @click="showAddModal = false">
          <X class="h-4 w-4" />
        </AppButton>
      </div>
      <div class="p-5 flex flex-col gap-4">
        <AppFormGroup label="商品名称">
          <AppInput v-model="form.name" placeholder="请输入商品名称" />
        </AppFormGroup>
        <AppFormGroup label="条码">
          <AppInput v-model="form.code" placeholder="扫描或输入条码" />
        </AppFormGroup>
        <div class="grid grid-cols-2 gap-3">
          <AppFormGroup label="销售价">
            <AppInput v-model.number="form.price" type="number" placeholder="0.00" />
          </AppFormGroup>
          <AppFormGroup label="进货价">
            <AppInput v-model.number="form.cost" type="number" placeholder="0.00" />
          </AppFormGroup>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <AppFormGroup label="规格">
            <AppInput v-model="form.spec" placeholder="如 250ml*24" />
          </AppFormGroup>
          <AppFormGroup label="单位">
            <AppInput v-model="form.unit" placeholder="件 / 箱 / 瓶" />
          </AppFormGroup>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <AppFormGroup label="分类">
            <AppSelect v-model.number="form.categoryId">
              <option v-for="cat in categories.slice(1)" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </AppSelect>
          </AppFormGroup>
          <AppFormGroup label="供应商" required>
            <AppSelect v-model.number="form.supplierId">
              <option :value="null">请选择供应商</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </AppSelect>
          </AppFormGroup>
        </div>
        <AppFormGroup label="库存预警值">
          <AppInput v-model.number="form.minStock" type="number" placeholder="10" />
        </AppFormGroup>
      </div>
      <div class="p-4 border-t border-[var(--color-border)] flex gap-3">
        <AppButton variant="secondary" class="flex-1" @click="showAddModal = false">取消</AppButton>
        <AppButton class="flex-1" @click="saveProduct">保存</AppButton>
      </div>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { productApi, partnerApi } from '@/api'
import { useToastStore } from '@/stores/toast'
import type { Product } from '@/api/product'
import { Plus, Pencil, Trash2, X } from 'lucide-vue-next'
import { AppButton, AppCard, AppInput, AppSelect, AppSearch, AppDialog, AppFormGroup, AppBadge, AppLoading } from '@/components/ui'
import AppIcon from '@/components/ui/AppIcon.vue'

const toast = useToastStore()
const searchQuery = ref('')
const selectedCategory = ref(0)
const selectedSupplier = ref<number | null>(null)
const showAddModal = ref(false)
const editingProduct = ref<Product | null>(null)
const products = ref<Product[]>([])
const suppliers = ref<Array<{ id: number; name: string }>>([])
const loading = ref(false)

const categories = [
  { value: 0, label: '全部' },
  { value: 1, label: '饮料' },
  { value: 2, label: '零食' },
  { value: 3, label: '粮油' },
  { value: 4, label: '日用' },
  { value: 5, label: '其他' }
]

const iconMap: Record<number, string> = {
  1: 'Coffee', 2: 'Cookie', 3: 'Wheat', 4: 'Droplets', 5: 'Package'
}

const filteredProducts = computed(() => {
  return products.value.map(p => ({
    id: p.id, name: p.name, code: p.barcode || '',
    price: p.salePrice, cost: p.purchasePrice, spec: p.specs || '',
    unit: p.unit, categoryId: p.categoryId ?? 5, supplierId: p.supplierId,
    supplierName: p.supplierName, stock: p.stockQty, minStock: p.minStock,
    icon: iconMap[p.categoryId ?? 5] || 'Package'
  }))
})

function stockBadge(stock: number, min: number) {
  if (stock <= 0) return { variant: 'danger' as const }
  if (stock <= min) return { variant: 'warning' as const }
  return { variant: 'success' as const }
}

async function loadSuppliers() {
  try {
    const res = await partnerApi.list({ type: 'supplier' })
    suppliers.value = res.data.map((s: any) => ({ id: s.id, name: s.name }))
  } catch (e: any) {
    console.error('加载供应商失败', e.message)
  }
}

async function loadProducts() {
  loading.value = true
  try {
    const res = await productApi.list({
      search: searchQuery.value || undefined,
      category: selectedCategory.value === 0 ? undefined : String(selectedCategory.value),
      supplier: selectedSupplier.value ? String(selectedSupplier.value) : undefined
    })
    products.value = res.data
  } catch (err: any) {
    toast.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

watch([searchQuery, selectedCategory, selectedSupplier], () => {
  loadProducts()
}, { debounce: 300 } as any)

onMounted(() => {
  loadSuppliers()
  loadProducts()
})

const form = reactive({
  name: '', code: '', price: 0, cost: 0, spec: '', unit: '', categoryId: 5, supplierId: null as number | null, minStock: 10
})

function openAddModal() {
  editingProduct.value = null
  Object.assign(form, { name: '', code: '', price: 0, cost: 0, spec: '', unit: '', categoryId: 5, supplierId: null, minStock: 10 })
  showAddModal.value = true
}

function editProduct(product: any) {
  editingProduct.value = products.value.find(p => p.id === product.id) || null
  Object.assign(form, {
    name: product.name, code: product.code || '', price: product.price, cost: product.cost,
    spec: product.spec || '', unit: product.unit, categoryId: product.categoryId,
    supplierId: product.supplierId, minStock: product.minStock
  })
  showAddModal.value = true
}

async function saveProduct() {
  if (!form.name || !form.code) { toast.warning('请填写商品名称和条码'); return }
  if (!form.supplierId) { toast.warning('请选择供应商'); return }
  try {
    const payload = {
      name: form.name, barcode: form.code, salePrice: form.price, purchasePrice: form.cost,
      specs: form.spec, unit: form.unit, categoryId: form.categoryId, supplierId: form.supplierId, minStock: form.minStock
    }
    if (editingProduct.value) await productApi.update(editingProduct.value.id, payload)
    else await productApi.create(payload)
    showAddModal.value = false
    editingProduct.value = null
    Object.assign(form, { name: '', code: '', price: 0, cost: 0, spec: '', unit: '', categoryId: 5, supplierId: null, minStock: 10 })
    await loadProducts()
  } catch (err: any) {
    toast.error(err.message || '保存失败')
  }
}

async function deleteProduct(product: any) {
  if (!confirm(`确定要删除商品「${product.name}」吗？删除后不可恢复。`)) return
  try {
    await productApi.delete(product.id)
    await loadProducts()
  } catch (err: any) {
    toast.error(err.message || '删除失败')
  }
}
</script>
