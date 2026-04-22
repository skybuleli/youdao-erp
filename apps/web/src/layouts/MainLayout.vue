<template>
  <div class="main-layout">
    <!-- Global Loading Bar -->
    <div class="loading-bar" :class="{ active: loadingStore.globalLoading }"></div>

    <!-- Mobile Header -->
    <header class="mobile-header glass no-print">
      <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">
        <span class="menu-icon">☰</span>
      </button>
      <span class="page-title">{{ pageTitle }}</span>
      <button class="scan-btn" @click="goToScan">
        <span>📷</span>
      </button>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }" @click.self="sidebarOpen = false">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">YD</div>
          <span class="logo-text">有道ERP</span>
        </div>
        <button class="close-btn no-desktop" @click="sidebarOpen = false">✕</button>
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
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle" @click="themeStore.toggleTheme()">
          <span>{{ themeStore.currentTheme === 'dark' ? '🌙' : '☀️' }}</span>
          <span class="toggle-label">{{ themeStore.currentTheme === 'dark' ? '深色' : '浅色' }}</span>
        </button>
        <button class="logout-btn" @click="logout">
          <span>👋</span>
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
        <span class="bottom-icon">{{ item.icon }}</span>
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
  { path: '/dashboard', label: '仪表盘', icon: '📊' },
  { path: '/product', label: '商品管理', icon: '📦' },
  { path: '/partner', label: '往来单位', icon: '🤝' },
  { path: '/purchase', label: '采购管理', icon: '📥' },
  { path: '/sale', label: '销售管理', icon: '🛒' },
  { path: '/inventory', label: '库存管理', icon: '🏭' },
  { path: '/finance', label: '财务管理', icon: '💰' },
  { path: '/report', label: '报表分析', icon: '📈' },
  { path: '/setting', label: '系统设置', icon: '⚙️' }
]

const bottomMenuItems = [
  { path: '/dashboard', label: '首页', icon: '📊' },
  { path: '/sale/pos', label: '开单', icon: '🛒' },
  { path: '/inventory', label: '库存', icon: '🏭' },
  { path: '/setting', label: '我的', icon: '👤' }
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
  background: var(--bg-base);
}

/* Global Loading Bar */
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #7C5CFC, transparent);
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
  border-bottom: 1px solid var(--border-subtle);
}

.menu-btn,
.scan-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 18px;
  cursor: pointer;
}

.page-title {
  font-weight: 600;
  font-size: 16px;
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: var(--bg-elevated);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  color: white;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
}

.nav-menu {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--gradient-subtle);
  color: var(--text-primary);
  border-left: 3px solid #7C5CFC;
}

.nav-icon {
  font-size: 20px;
}

.nav-label {
  font-size: 15px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-toggle,
.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
}

.theme-toggle:hover,
.logout-btn:hover {
  background: var(--bg-hover);
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
  transition: all 0.3s;
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
}

/* Bottom Nav */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--text-tertiary);
  text-decoration: none;
  padding: 8px 16px;
}

.bottom-nav-item.active {
  color: #7C5CFC;
}

.bottom-icon {
  font-size: 22px;
}

.bottom-label {
  font-size: 11px;
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
