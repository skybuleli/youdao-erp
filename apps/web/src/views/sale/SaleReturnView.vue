<template>
  <div class="return-view">
    <!-- Header -->
    <div class="return-header">
      <h2>🔄 销售退货</h2>
      <p class="hint">选择客户并添加退货商品</p>
    </div>

    <!-- Customer Select -->
    <div class="customer-section">
      <label class="section-label">退货客户</label>
      <select v-model="selectedCustomer" class="kimi-select">
        <option :value="null">请选择客户</option>
        <option v-for="p in customers" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <!-- Product Select -->
    <div class="product-section">
      <label class="section-label">选择商品</label>
      <div class="product-grid">
        <button
          v-for="product in quickProducts"
          :key="product.id"
          class="quick-product-btn"
          @click="addToCart(product)"
        >
          <span class="qp-icon">📦</span>
          <span class="qp-name">{{ product.name }}</span>
          <span class="qp-price">¥{{ product.price }}</span>
        </button>
      </div>
      <div v-if="quickProducts.length === 0" class="empty-hint">暂无商品</div>
    </div>

    <!-- Cart -->
    <div class="cart-section">
      <div class="cart-header">
        <span>退货清单 ({{ cart.length }})</span>
        <button class="clear-btn" @click="clearCart">清空</button>
      </div>

      <div v-if="cart.length === 0" class="empty-cart">
        <span class="empty-icon">🛒</span>
        <span class="empty-text">点击上方商品添加</span>
      </div>

      <div v-else class="cart-items">
        <div v-for="(item, index) in cart" :key="index" class="cart-item">
          <div class="item-icon">📦</div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-price">¥{{ item.price }}/{{ item.unit }}</div>
          </div>
          <div class="item-actions">
            <button class="qty-btn" @click="decreaseQty(index)">−</button>
            <span class="qty-value amount">{{ item.qty }}</span>
            <button class="qty-btn" @click="increaseQty(index)">+</button>
            <span class="item-subtotal amount">¥{{ (item.price * item.qty).toFixed(2) }}</span>
            <button class="delete-btn" @click="removeItem(index)">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="summary-panel">
      <div class="summary-row">
        <div class="summary-item">
          <span class="summary-label">商品种类</span>
          <span class="summary-value amount">{{ cart.length }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">总数量</span>
          <span class="summary-value amount">{{ totalQty }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">应退金额</span>
          <span class="summary-value amount" style="color: var(--color-warning);">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="detail-row">
        <span>实退金额</span>
        <input v-model.number="refundAmount" type="number" class="refund-input" :placeholder="totalAmount.toFixed(2)" />
      </div>

      <div class="detail-row">
        <span>退货原因</span>
        <input v-model="remark" class="remark-input" placeholder="可选..." />
      </div>

      <button class="btn-submit return" @click="submitReturn">
        <span>🔄 确认退货 ¥{{ refundAmount || totalAmount }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { productApi, orderApi, partnerApi } from '@/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const cart = ref<Array<{ id: number; name: string; price: number; qty: number; unit: string }>>([])
const quickProducts = ref<Array<{ id: number; name: string; price: number }>>([])
const customers = ref<Array<{ id: number; name: string }>>([])
const selectedCustomer = ref<number | null>(null)
const refundAmount = ref(0)
const remark = ref('')
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const [prodRes, partnerRes] = await Promise.all([
      productApi.list({ pageSize: 100 }).catch(() => ({ data: [], total: 0, page: 1, pageSize: 10 })),
      partnerApi.list().catch(() => ({ data: [] }))
    ])
    quickProducts.value = (prodRes.data || []).slice(0, 12).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.salePrice
    }))
    customers.value = (partnerRes.data || []).map((p: any) => ({ id: p.id, name: p.name }))
  } catch (e: any) {
    toast.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const totalQty = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const totalAmount = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.qty, 0))

function addToCart(product: { id: number; name: string; price: number }) {
  const existing = cart.value.find(item => item.id === product.id)
  if (existing) {
    existing.qty++
  } else {
    cart.value.push({ ...product, qty: 1, unit: '件' })
  }
}

function increaseQty(index: number) {
  cart.value[index].qty++
}

function decreaseQty(index: number) {
  if (cart.value[index].qty > 1) {
    cart.value[index].qty--
  } else {
    removeItem(index)
  }
}

function removeItem(index: number) {
  cart.value.splice(index, 1)
}

function clearCart() {
  cart.value = []
}

async function submitReturn() {
  if (!selectedCustomer.value) {
    toast.warning('请选择退货客户')
    return
  }
  if (cart.value.length === 0) {
    toast.warning('请先添加退货商品')
    return
  }
  try {
    await orderApi.create({
      type: 'sale',
      subType: 'return',
      partnerId: selectedCustomer.value,
      discountAmount: 0,
      paidAmount: refundAmount.value || totalAmount.value,
      remark: remark.value || undefined,
      items: cart.value.map(item => ({
        productId: item.id,
        qty: item.qty,
        unitPrice: item.price
      }))
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

<style scoped>
.return-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.return-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.hint {
  font-size: 13px;
  color: var(--text-tertiary);
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.customer-section,
.product-section,
.cart-section,
.summary-panel {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.kimi-select {
  width: 100%;
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: 0 12px;
  font-size: 14px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.quick-product-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-product-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-warning);
}

.qp-icon {
  font-size: 24px;
}

.qp-name {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.qp-price {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-warning);
}

.empty-hint {
  text-align: center;
  padding: 20px;
  color: var(--text-tertiary);
  font-size: 14px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: 13px;
  cursor: pointer;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}

.item-icon {
  width: 40px;
  height: 40px;
  background: rgba(245, 158, 11, 0.15);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  font-size: 12px;
  color: var(--text-tertiary);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-medium);
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 640px) {
  .qty-btn {
    width: 44px;
    height: 44px;
  }
}

.qty-value {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
}

.item-subtotal {
  font-weight: 600;
  min-width: 70px;
  text-align: right;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.6;
}

.delete-btn:hover {
  opacity: 1;
}

.summary-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.summary-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-display);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 8px 0;
  border-top: 1px solid var(--border-subtle);
}

.refund-input,
.remark-input {
  width: 140px;
  height: 36px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  text-align: right;
  padding: 0 12px;
  font-size: 15px;
}

.remark-input {
  text-align: left;
  width: 200px;
}

.btn-submit {
  height: 52px;
  background: var(--color-warning);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}

.btn-submit:active {
  transform: scale(0.97);
}
</style>
