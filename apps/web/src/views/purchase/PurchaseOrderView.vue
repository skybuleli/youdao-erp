<template>
  <div class="purchase-order-view">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">←</button>
      <h2>新增采购单</h2>
      <button class="save-draft-btn">保存草稿</button>
    </div>

    <!-- Supplier & Warehouse -->
    <div class="info-card">
      <div class="form-row">
        <div class="form-group">
          <label>供应商</label>
          <select v-model="form.supplier" class="kimi-select">
            <option value="">选择供应商</option>
            <option>供应商A</option>
            <option>供应商B</option>
          </select>
        </div>
        <div class="form-group">
          <label>入库仓库</label>
          <select v-model="form.warehouse" class="kimi-select">
            <option>总仓</option>
            <option>分仓A</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Product Selection -->
    <div class="product-section">
      <div class="section-title">
        <span>采购商品</span>
        <button class="add-btn" @click="showProductPicker = true">➕ 添加商品</button>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        <span class="empty-icon">📦</span>
        <span>点击添加商品开始采购</span>
      </div>

      <div v-else class="item-list">
        <div v-for="(item, index) in items" :key="index" class="item-row">
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-spec">{{ item.spec }} | 库存 {{ item.stock }}</div>
          </div>
          <div class="item-inputs">
            <div class="input-group">
              <label>单价</label>
              <input v-model.number="item.price" type="number" class="kimi-input small" />
            </div>
            <div class="input-group">
              <label>数量</label>
              <div class="qty-control">
                <button class="qty-btn" @click="decreaseQty(index)">−</button>
                <input v-model.number="item.qty" type="number" class="kimi-input small qty-input" />
                <button class="qty-btn" @click="increaseQty(index)">+</button>
              </div>
            </div>
            <div class="input-group">
              <label>小计</label>
              <span class="subtotal amount">¥{{ (item.price * item.qty).toFixed(2) }}</span>
            </div>
          </div>
          <button class="remove-btn" @click="removeItem(index)">✕</button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="items.length > 0" class="summary-card">
      <div class="summary-row">
        <span>商品种类</span>
        <span class="amount">{{ items.length }}</span>
      </div>
      <div class="summary-row">
        <span>总数量</span>
        <span class="amount">{{ totalQty }}</span>
      </div>
      <div class="summary-row">
        <span>合计金额</span>
        <span class="amount gradient-text">¥{{ totalAmount.toFixed(2) }}</span>
      </div>
      <div class="summary-row">
        <span>优惠</span>
        <input v-model.number="form.discount" type="number" class="kimi-input small" placeholder="0.00" />
      </div>
      <div class="summary-row total">
        <span>应付金额</span>
        <span class="amount gradient-text" style="font-size: 24px;">¥{{ payableAmount.toFixed(2) }}</span>
      </div>
    </div>

    <!-- Notes -->
    <div class="info-card">
      <div class="form-group">
        <label>备注</label>
        <textarea v-model="form.remark" class="kimi-textarea" rows="2" placeholder="输入采购备注..."></textarea>
      </div>
    </div>

    <!-- Submit -->
    <div class="submit-bar">
      <div class="submit-info">
        <span class="submit-label">应付</span>
        <span class="submit-amount amount gradient-text">¥{{ payableAmount.toFixed(2) }}</span>
      </div>
      <button class="btn-submit" @click="submitOrder">
        <span>确认采购</span>
      </button>
    </div>

    <!-- Product Picker Modal -->
    <div v-if="showProductPicker" class="modal-overlay" @click.self="showProductPicker = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>选择商品</h3>
          <button class="close-btn" @click="showProductPicker = false">✕</button>
        </div>
        <div class="picker-search">
          <span>🔍</span>
          <input v-model="pickerQuery" class="kimi-input" placeholder="搜索商品..." />
        </div>
        <div class="picker-list">
          <div
            v-for="product in filteredPickerProducts"
            :key="product.id"
            class="picker-item"
            @click="addItem(product)"
          >
            <span class="picker-icon">{{ product.icon }}</span>
            <div class="picker-info">
              <div class="picker-name">{{ product.name }}</div>
              <div class="picker-price">进价 ¥{{ product.cost }} | 库存 {{ product.stock }}</div>
            </div>
            <span class="picker-add">➕</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productApi, orderApi, partnerApi } from '@/api'

const router = useRouter()
const showProductPicker = ref(false)
const pickerQuery = ref('')
const loading = ref(false)

const form = reactive({
  supplier: '',
  warehouse: '总仓',
  discount: 0,
  remark: ''
})

const items = ref<Array<{ id: number; name: string; spec: string; price: number; qty: number; stock: number }>>([])

const allProducts = ref<Array<any>>([])
const suppliers = ref<Array<any>>([])

async function loadData() {
  loading.value = true
  try {
    const [prodRes, partnerRes] = await Promise.all([
      productApi.list(),
      partnerApi.list({ type: 'supplier' })
    ])
    allProducts.value = prodRes.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      spec: p.specs || '',
      cost: p.purchasePrice,
      stock: p.stockQty,
      icon: '📦'
    }))
    suppliers.value = partnerRes.data
  } catch (e: any) {
    alert(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const filteredPickerProducts = computed(() => {
  if (!pickerQuery.value) return allProducts.value
  const q = pickerQuery.value.toLowerCase()
  return allProducts.value.filter((p: any) => p.name.toLowerCase().includes(q))
})

const totalQty = computed(() => items.value.reduce((sum, i) => sum + i.qty, 0))
const totalAmount = computed(() => items.value.reduce((sum, i) => sum + i.price * i.qty, 0))
const payableAmount = computed(() => Math.max(0, totalAmount.value - form.discount))

function addItem(product: any) {
  const existing = items.value.find(i => i.id === product.id)
  if (existing) {
    existing.qty++
  } else {
    items.value.push({
      id: product.id,
      name: product.name,
      spec: product.spec,
      price: product.cost,
      qty: 1,
      stock: product.stock
    })
  }
  showProductPicker.value = false
}

function increaseQty(index: number) {
  items.value[index].qty++
}

function decreaseQty(index: number) {
  if (items.value[index].qty > 1) {
    items.value[index].qty--
  } else {
    removeItem(index)
  }
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

function getPartnerId() {
  if (!form.supplier) return 1
  const idx = form.supplier === '供应商A' ? 0 : form.supplier === '供应商B' ? 1 : -1
  if (idx >= 0 && suppliers.value[idx]) return suppliers.value[idx].id
  const found = suppliers.value.find((s: any) => s.name === form.supplier)
  return found ? found.id : 1
}

async function submitOrder() {
  if (!form.supplier) {
    alert('请选择供应商')
    return
  }
  if (items.value.length === 0) {
    alert('请添加采购商品')
    return
  }
  try {
    await orderApi.create({
      type: 'purchase',
      partnerId: getPartnerId(),
      discountAmount: form.discount,
      remark: form.remark,
      items: items.value.map(i => ({
        productId: i.id,
        qty: i.qty,
        unitPrice: i.price
      }))
    })
    alert('采购单提交成功！')
    router.push('/purchase')
  } catch (e: any) {
    alert(e.message || '提交失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.purchase-order-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 100px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.back-btn {
  width: 40px;
  height: 40px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 18px;
  cursor: pointer;
}

.page-header h2 {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
}

.save-draft-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
}

.info-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  color: var(--text-secondary);
}

.kimi-select,
.kimi-input,
.kimi-textarea {
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 12px;
  color: var(--text-primary);
  font-size: 15px;
  width: 100%;
}

.kimi-textarea {
  height: auto;
  padding: 12px;
  resize: vertical;
}

.kimi-input.small {
  height: 36px;
  font-size: 14px;
  width: 80px;
  text-align: center;
}

.kimi-input:focus,
.kimi-select:focus,
.kimi-textarea:focus {
  border-color: #7C5CFC;
  outline: none;
}

.product-section {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
}

.add-btn {
  background: var(--gradient-subtle);
  border: 1px solid #7C5CFC;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  padding: 6px 12px;
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  position: relative;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
}

.item-spec {
  font-size: 12px;
  color: var(--text-tertiary);
}

.item-inputs {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.input-group label {
  font-size: 11px;
  color: var(--text-tertiary);
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--border-medium);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-input {
  width: 50px !important;
}

.subtotal {
  font-weight: 600;
  min-width: 70px;
  text-align: right;
}

.remove-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: 14px;
  cursor: pointer;
  opacity: 0.6;
}

.remove-btn:hover {
  opacity: 1;
}

.summary-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.summary-row.total {
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
  font-weight: 600;
}

.submit-bar {
  position: fixed;
  bottom: 64px;
  left: 0;
  right: 0;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border-subtle);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
}

@media (min-width: 1024px) {
  .submit-bar {
    position: static;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
    margin-top: 8px;
  }
}

.submit-info {
  display: flex;
  flex-direction: column;
}

.submit-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

.submit-amount {
  font-size: 22px;
  font-weight: 700;
}

.btn-submit {
  height: 48px;
  padding: 0 32px;
  background: var(--accent-primary);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
}

.btn-submit:hover {
  transform: translateY(-1px);
  
}

.btn-submit:active {
  transform: scale(0.97);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-panel {
  background: var(--bg-elevated);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slide-up 0.3s ease-out;
}

@media (min-width: 768px) {
  .modal-panel {
    border-radius: var(--radius-xl);
  }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
}

.picker-search {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--border-subtle);
}

.picker-search .kimi-input {
  flex: 1;
}

.picker-list {
  padding: 8px;
}

.picker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.picker-item:hover {
  background: var(--bg-surface);
}

.picker-icon {
  width: 40px;
  height: 40px;
  background: var(--gradient-subtle);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.picker-info {
  flex: 1;
}

.picker-name {
  font-size: 14px;
  font-weight: 500;
}

.picker-price {
  font-size: 12px;
  color: var(--text-tertiary);
}

.picker-add {
  font-size: 18px;
  color: #7C5CFC;
}
</style>
