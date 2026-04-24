<template>
  <div class="flex min-h-screen bg-[var(--color-background)]">
    <!-- Global Loading Bar -->
    <div
      class="fixed top-0 left-0 right-0 h-0.5 z-[1000] pointer-events-none transition-opacity duration-200"
      :class="loadingStore.globalLoading ? 'opacity-100' : 'opacity-0'"
    >
      <div class="h-full bg-[var(--color-brand)] animate-[loading-slide_1s_linear_infinite]" />
    </div>

    <!-- Mobile Header -->
    <header class="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-[100] glass no-print md:hidden">
      <AppButton variant="ghost" size="icon-sm" @click="sidebarOpen = !sidebarOpen">
        <Menu class="h-5 w-5" />
      </AppButton>
      <span class="font-semibold text-base text-[var(--color-foreground)]">{{ pageTitle }}</span>
      <AppButton variant="ghost" size="icon-sm" @click="goToScan">
        <ScanLine class="h-5 w-5" />
      </AppButton>
    </header>

    <!-- Sidebar -->
    <aside
      class="fixed left-0 top-0 bottom-0 w-[260px] bg-[var(--color-background)] border-r border-[var(--color-border)] flex flex-col z-[200] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:sticky md:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
      @click.self="sidebarOpen = false"
    >
      <div class="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: var(--color-brand-gradient)">
            <Layers class="h-5 w-5 text-white" />
          </div>
          <span class="text-lg font-bold gradient-text">有道ERP</span>
        </div>
        <AppButton variant="ghost" size="icon-sm" class="md:hidden" @click="sidebarOpen = false">
          <X class="h-5 w-5" />
        </AppButton>
      </div>

      <nav class="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          :class="$route.path === item.path
            ? 'bg-[var(--color-brand-muted)] text-[var(--color-brand)]'
            : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]'"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="h-[18px] w-[18px] flex-shrink-0" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="p-3 border-t border-[var(--color-border)] flex flex-col gap-1.5">
        <AppButton variant="ghost" class="justify-start gap-2.5 h-9 px-3 text-[13px]" @click="themeStore.toggleTheme()">
          <component :is="themeStore.currentTheme === 'dark' ? Moon : Sun" class="h-4 w-4" />
          <span>{{ themeStore.currentTheme === 'dark' ? '深色' : '浅色' }}</span>
        </AppButton>
        <AppButton variant="ghost" class="justify-start gap-2.5 h-9 px-3 text-[13px] text-[var(--color-danger)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]" @click="logout">
          <LogOut class="h-4 w-4" />
          <span>退出登录</span>
        </AppButton>
      </div>
    </aside>

    <!-- Overlay -->
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] transition-all duration-300 md:hidden"
      :class="sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'"
      @click="sidebarOpen = false"
    />

    <!-- Main Content -->
    <main class="flex-1 pt-[72px] pb-20 px-4 min-h-screen overflow-x-hidden w-full md:pt-6 md:pb-6 md:px-6">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Bottom Nav (Mobile) -->
    <nav class="fixed bottom-0 left-0 right-0 h-16 bg-[var(--color-card)]/80 backdrop-blur-xl border-t border-[var(--color-border)] flex justify-around items-center z-[100] no-print no-desktop md:hidden">
      <router-link
        v-for="item in bottomMenuItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-1 py-2 px-4 text-xs font-medium transition-colors"
        :class="$route.path === item.path ? 'text-[var(--color-brand)]' : 'text-[var(--color-muted-foreground)]'"
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span>{{ item.label }}</span>
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
  LayoutDashboard, Package, Users, ShoppingCart, Store,
  Warehouse, CreditCard, BarChart3, Settings, ScanLine,
  Menu, X, Moon, Sun, LogOut, Layers
} from 'lucide-vue-next'
import { AppButton } from '@/components/ui'

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
@keyframes loading-slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@media (min-width: 768px) {
  .no-desktop {
    display: none !important;
  }
}
</style>
