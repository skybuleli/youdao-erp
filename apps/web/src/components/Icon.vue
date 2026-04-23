<script setup lang="ts">
import {
  Package,
  ShoppingCart,
  ScanLine,
  Trash2,
  X,
  TrendingUp,
  ArrowDownLeft,
  AlertTriangle,
  BarChart3,
  Flame,
  FileText,
  ChevronRight,
  Zap,
  Store,
  Search,
  ClipboardList,
  CreditCard,
  Users,
  Warehouse,
  Settings,
  LayoutDashboard,
  Moon,
  Sun,
  LogOut,
  Layers,
  User,
  Lock,
  AlertCircle,
  Loader2,
  Info,
  Check,
  Coffee,
  Cookie,
  Wheat,
  Droplets,
  Minus,
  Plus,
  CircleDot
} from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  name: string
  class?: string
}>()

const iconMap: Record<string, any> = {
  Package,
  ShoppingCart,
  ScanLine,
  Trash2,
  X,
  TrendingUp,
  ArrowDownLeft,
  AlertTriangle,
  BarChart3,
  Flame,
  FileText,
  ChevronRight,
  Zap,
  Store,
  Search,
  ClipboardList,
  CreditCard,
  Users,
  Warehouse,
  Settings,
  LayoutDashboard,
  Moon,
  Sun,
  LogOut,
  Layers,
  User,
  Lock,
  AlertCircle,
  Loader2,
  Info,
  Check,
  Coffee,
  Cookie,
  Wheat,
  Droplets,
  Minus,
  Plus,
  CircleDot
}

const iconComponent = computed(() => {
  return iconMap[props.name] || Package
})
</script>

<template>
  <component :is="iconComponent" :class="props.class" />
</template>
