<template>
  <div class="pos-view">
    <!-- Scan Area -->
    <div class="scan-area" @click="handleScan">
      <div class="scan-content" :class="{ scanning: isScanning }">
        <span class="scan-icon">📷</span>
        <span class="scan-text">{{ isScanning ? '正在扫描...' : '点击扫码或输入条码' }}</span>
      </div>
    </div>

    <!-- Cart -->
    <div class="cart-section">
      <div class="cart-header">
        <span>购物车 ({{ cart.length }})</span>
        <button class="clear-btn" @click="clearCart">清空</button>
      </div>

      <div v-if="cart.length === 0" class="empty-cart">
        <span class="empty-icon">🛒</span>
        <span class="empty-text">扫码添加商品</span>
      </div>

      <div v-else class="cart-items">
        <div v-for="(item, index) in cart" :key="index" class="cart-item animate-slide-in">
          <div class="item-icon">{{ item.icon || '📦' }}</div>
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

    <!-- Summary Panel (Fixed Bottom) -->
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
          <span class="summary-label">合计</span>
          <span class="summary-value amount gradient-text">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="summary-details">
        <div class="detail-row">
          <span>优惠</span>
          <input v-model.number="discount" type="number" class="discount-input" placeholder="0.00" />
        </div>
        <div class="detail-row">
          <span>应收</span>
          <span class="amount" style="font-size: 18px; font-weight: 700;">¥{{ payableAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="customer-row">
        <select class="kimi-select">
          <option>选择客户</option>
          <option>张老板</option>
          <option>李老板</option>
          <option>客户C</option>
        </select>
        <select class="kimi-select">
          <option>总仓</option>
        </select>
      </div>

      <div class="payment-row">
        <button
          v-for="method in paymentMethods"
          :key="method.value"
          class="payment-btn"
          :class="{ active: selectedPayment === method.value }"
          @click="selectedPayment = method.value"
        >
          <span>{{ method.icon }}</span>
          <span>{{ method.label }}</span>
        </button>
      </div>

      <div class="received-row">
        <span>实收</span>
        <input v-model.number="received" type="number" class="received-input" :placeholder="payableAmount.toFixed(2)" />
      </div>

      <div class="change-row" v-if="received > payableAmount">
        <span>找零</span>
        <span class="amount" style="color: var(--color-success);">¥{{ (received - payableAmount).toFixed(2) }}</span>
      </div>

      <div class="action-row">
        <button class="btn-draft">保存草稿</button>
        <button class="btn-submit" @click="submitOrder">
          <span>💜 确认收款 ¥{{ payableAmount.toFixed(2) }}</span>
        </button>
      </div>
    </div>

    <!-- Quick Products -->
    <div class="quick-products">
      <h4>快捷商品</h4>
      <div class="product-grid">
        <button
          v-for="product in quickProducts"
          :key="product.id"
          class="quick-product-btn"
          @click="addToCart(product)"
        >
          <span class="qp-icon">{{ product.icon }}</span>
          <span class="qp-name">{{ product.name }}</span>
          <span class="qp-price">¥{{ product.price }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { productApi, orderApi } from '@/api'

const isScanning = ref(false)
const cart = ref<Array<{ id: number; name: string; price: number; qty: number; unit: string; icon: string }>>([])
const discount = ref(0)
const selectedPayment = ref('cash')
const received = ref(0)
const loading = ref(false)
const quickProducts = ref<Array<any>>([])

const paymentMethods = [
  { value: 'cash', label: '现金', icon: '💵' },
  { value: 'wechat', label: '微信', icon: '💚' },
  { value: 'alipay', label: '支付宝', icon: '🔵' }
]

async function loadData() {
  loading.value = true
  try {
    const res = await productApi.list()
    quickProducts.value = res.data.slice(0, 12).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.salePrice,
      icon: '📦'
    }))
  } catch (e: any) {
    alert(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const totalQty = computed(() => cart.value.reduce((sum, item) => sum + item.qty, 0))
const totalAmount = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.qty, 0))
const payableAmount = computed(() => Math.max(0, totalAmount.value - discount.value))

function handleScan() {
  isScanning.value = true
  setTimeout(() => {
    addToCart({ id: Date.now(), name: '扫码商品' + Math.floor(Math.random() * 100), price: Math.floor(Math.random() * 50) + 10, qty: 1, unit: '件', icon: '📦' })
    isScanning.value = false
  }, 1500)
}

function addToCart(product: { id: number; name: string; price: number; qty?: number; unit?: string; icon?: string }) {
  const existing = cart.value.find(item => item.id === product.id)
  if (existing) {
    existing.qty++
  } else {
    cart.value.push({
      ...product,
      qty: product.qty || 1,
      unit: product.unit || '件',
      icon: product.icon || '📦'
    })
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

async function submitOrder() {
  if (cart.value.length === 0) {
    alert('请先添加商品')
    return
  }
  try {
    await orderApi.create({
      type: 'sale',
      partnerId: 1,
      paymentMethod: selectedPayment.value,
      discountAmount: discount.value,
      paidAmount: received.value || payableAmount.value,
      items: cart.value.map(item => ({
        productId: item.id,
        qty: item.qty,
        unitPrice: item.price
      }))
    })
    alert('订单提交成功！')
    clearCart()
  } catch (e: any) {
    alert(e.message || '提交失败')
  }
}

onMounted(loadData)
</script>

<style scoped>
.pos-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
}

/* Scan Area */
.scan-area {
  background: var(--bg-elevated);
  border: 2px dashed var(--border-medium);
  border-radius: var(--radius-lg);
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.scan-area:hover {
  border-color: #8B5CF6;
  box-shadow: var(--shadow-glow-purple);
}

.scan-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.scan-content.scanning {
  animation: pulse-purple 1.5s infinite;
}

@keyframes pulse-purple {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.scan-icon {
  font-size: 36px;
}

.scan-text {
  font-size: 15px;
  color: var(--text-secondary);
}

/* Cart Section */
.cart-section {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
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
  background: var(--gradient-subtle);
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
  width: 32px;
  height: 32px;
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

/* Summary Panel */
.summary-panel {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
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

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.discount-input {
  width: 100px;
  height: 36px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  text-align: right;
  padding: 0 12px;
}

.customer-row {
  display: flex;
  gap: 8px;
}

.kimi-select {
  flex: 1;
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: 0 12px;
  font-size: 14px;
}

.payment-row {
  display: flex;
  gap: 8px;
}

.payment-btn {
  flex: 1;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-btn.active {
  background: var(--gradient-subtle);
  border-color: #8B5CF6;
  color: var(--text-primary);
}

.received-row,
.change-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.received-input {
  width: 120px;
  height: 40px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  text-align: right;
  padding: 0 12px;
  font-size: 16px;
  font-weight: 600;
}

.action-row {
  display: flex;
  gap: 12px;
}

.btn-draft {
  flex: 1;
  height: 52px;
  background: var(--bg-surface);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
}

.btn-submit {
  flex: 2;
  height: 52px;
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-glow-purple);
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow-pink);
}

.btn-submit:active {
  transform: scale(0.97);
}

/* Quick Products */
.quick-products {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.quick-products h4 {
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--text-secondary);
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
  border-color: #8B5CF6;
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
  color: #8B5CF6;
}
</style>
