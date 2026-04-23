<template>
  <div class="main-layout">
    <!-- Global Loading Bar -->
    <div class="loading-bar" :class="{ active: loadingStore.globalLoading }"></div>

    <!-- Mobile Header -->
    <header class="mobile-header glass no-print">
      <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">
        <Menu class="w-5 h-5" />
      </button>
      <span class="page-title">{{ pageTitle }}</span>
      <button class="scan-btn" @click="goToScan">
        <ScanLine class="w-5 h-5" />
      </button>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }" @click.self="sidebarOpen = false">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <Layers class="w-5 h-5 text-white" />
          </div>
          <span class="logo-text">有道ERP</span>
        </div>
        <button class="close-btn no-desktop" @click="sidebarOpen = false">
          <X class="w-5 h-5" />
        </button>
      </div>

      <nav class="nav-menu">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: $route.path === item.path }"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle" @click="themeStore.toggleTheme()">
          <component :is="themeStore.currentTheme === 'dark' ? Moon : Sun" class="w-4 h-4" />
          <span class="toggle-label">{{ themeStore.currentTheme === 'dark' ? '深色' : '浅色' }}</span>
        </button>
        <button class="logout-btn" @click="logout">
          <LogOut class="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Overlay -->
    <div class="sidebar-overlay" :class="{ show: sidebarOpen }" @click="sidebarOpen = false"></div>

    <!-- Main Content -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Nav (Mobile) -->
    <nav class="bottom-nav no-print no-desktop">
      <router-link
        v-for="item in bottomMenuItems"
        :key="item.path"
        :to="item.path"
        class="bottom-nav-item"
        :class="{ active: $route.path === item.path }"
      >
        <component :is="item.icon" class="bottom-icon" />
        <span class="bottom-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useLoadingStore } from '@/stores/loading'
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Store,
  Warehouse,
  CreditCard,
  BarChart3,
  Settings,
  ScanLine,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  Layers
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const loadingStore = useLoadingStore()

const sidebarOpen = ref(false)

onMounted(() => {
  if (authStore.token && !authStore.user) {
    authStore.fetchMe()
  }
})

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/product': '商品管理',
    '/partner': '往来单位',
    '/purchase': '采购管理',
    '/sale': '销售管理',
    '/inventory': '库存管理',
    '/finance': '财务管理',
    '/report': '报表分析',
    '/setting': '系统设置'
  }
  return titles[route.path] || '有道ERP'
})

const menuItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/product', label: '商品管理', icon: Package },
  { path: '/partner', label: '往来单位', icon: Users },
  { path: '/purchase', label: '采购管理', icon: ShoppingCart },
  { path: '/sale', label: '销售管理', icon: Store },
  { path: '/inventory', label: '库存管理', icon: Warehouse },
  { path: '/finance', label: '财务管理', icon: CreditCard },
  { path: '/report', label: '报表分析', icon: BarChart3 },
  { path: '/setting', label: '系统设置', icon: Settings }
]

const bottomMenuItems = [
  { path: '/dashboard', label: '首页', icon: LayoutDashboard },
  { path: '/sale/pos', label: '开单', icon: Store },
  { path: '/inventory', label: '库存', icon: Warehouse },
  { path: '/setting', label: '我的', icon: Settings }
]

function goToScan() {
  router.push('/sale/pos')
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

/* Global Loading Bar */
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-brand), transparent);
  background-size: 200% 100%;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.loading-bar.active {
  opacity: 1;
  animation: loading-slide 1s linear infinite;
}

@keyframes loading-slide {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Mobile Header */
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
}

.menu-btn,
.scan-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-foreground);
  cursor: pointer;
  transition: background 0.15s ease;
}

.menu-btn:hover,
.scan-btn:hover {
  background: var(--color-accent);
}

.page-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-foreground);
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: var(--color-background);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #7c5cfc 0%, #5b8def 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #7c5cfc 0%, #5b8def 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-muted-foreground);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: var(--radius-md);
  transition: background 0.15s ease;
}

.close-btn:hover {
  background: var(--color-accent);
}

.nav-menu {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  color: var(--color-muted-foreground);
  text-decoration: none;
  transition: all 0.15s ease;
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: var(--color-accent);
  color: var(--color-accent-foreground);
}

.nav-item.active {
  background: var(--color-brand-muted);
  color: var(--color-brand);
}

.nav-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.theme-toggle,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  background: var(--color-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-muted-foreground);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.theme-toggle:hover,
.logout-btn:hover {
  background: var(--color-accent);
  color: var(--color-accent-foreground);
}

/* Overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 150;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.sidebar-overlay.show {
  opacity: 1;
  visibility: visible;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 72px 16px 80px;
  min-height: 100vh;
  overflow-x: hidden;
  width: 100%;
}

/* Bottom Nav */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--color-card);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--color-muted-foreground);
  text-decoration: none;
  padding: 8px 16px;
  transition: color 0.15s ease;
}

.bottom-nav-item.active {
  color: var(--color-brand);
}

.bottom-icon {
  width: 20px;
  height: 20px;
}

.bottom-label {
  font-size: 11px;
  font-weight: 500;
}

/* Desktop */
@media (min-width: 1024px) {
  .mobile-header,
  .bottom-nav,
  .sidebar-overlay {
    display: none !important;
  }

  .sidebar {
    position: sticky;
    transform: none;
  }

  .close-btn {
    display: none;
  }

  .main-content {
    padding: 24px;
    padding-bottom: 24px;
  }
}
</style>
