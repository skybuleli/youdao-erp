import { createRouter, createWebHistory } from 'vue-router'
import { useLoadingStore } from '@/stores/loading'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/DashboardView.vue') },
      { path: 'product', name: 'Product', component: () => import('@/views/product/ProductView.vue') },
      { path: 'partner', name: 'Partner', component: () => import('@/views/partner/PartnerView.vue') },
      { path: 'purchase', name: 'Purchase', component: () => import('@/views/purchase/PurchaseView.vue') },
      { path: 'purchase/new', name: 'PurchaseOrder', component: () => import('@/views/purchase/PurchaseOrderView.vue') },
      { path: 'sale', name: 'Sale', component: () => import('@/views/sale/SaleView.vue') },
      { path: 'sale/pos', name: 'SalePOS', component: () => import('@/views/sale/SalePOSView.vue') },
      { path: 'sale/return', name: 'SaleReturn', component: () => import('@/views/sale/SaleReturnView.vue') },
      { path: 'inventory', name: 'Inventory', component: () => import('@/views/inventory/InventoryView.vue') },
      { path: 'finance', name: 'Finance', component: () => import('@/views/finance/FinanceView.vue') },
      { path: 'report', name: 'Report', component: () => import('@/views/report/ReportView.vue') },
      { path: 'setting', name: 'Setting', component: () => import('@/views/setting/SettingView.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, _from, next) => {
  const loadingStore = useLoadingStore()
  loadingStore.start()
  const token = localStorage.getItem('token')
  if (!to.meta.public && !token) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach(() => {
  const loadingStore = useLoadingStore()
  setTimeout(() => loadingStore.stop(), 300)
})

export default router
