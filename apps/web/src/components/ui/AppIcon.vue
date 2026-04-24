<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

// Import ALL lucide icons used in the project
import {
  Package, ShoppingCart, ScanLine, Trash2, X, TrendingUp, ArrowDownLeft,
  AlertTriangle, BarChart3, Flame, FileText, ChevronRight, Zap, Store,
  Search, ClipboardList, CreditCard, Users, Warehouse, Settings,
  LayoutDashboard, Moon, Sun, LogOut, Layers, User, Lock, AlertCircle,
  Loader2, Info, Check, Coffee, Cookie, Wheat, Droplets, Minus, Plus,
  CircleDot, Printer, Banknote, Landmark, Calendar, Clock, Pencil,
  PieChart, ChevronDown, ArrowDown, ArrowUp
} from 'lucide-vue-next'

const props = defineProps<{
  name: string
  class?: string
}>()

const iconMap: Record<string, Component> = {
  Package, ShoppingCart, ScanLine, Trash2, X, TrendingUp, ArrowDownLeft,
  AlertTriangle, BarChart3, Flame, FileText, ChevronRight, Zap, Store,
  Search, ClipboardList, CreditCard, Users, Warehouse, Settings,
  LayoutDashboard, Moon, Sun, LogOut, Layers, User, Lock, AlertCircle,
  Loader2, Info, Check, Coffee, Cookie, Wheat, Droplets, Minus, Plus,
  CircleDot, Printer, Banknote, Landmark, Calendar, Clock, Pencil,
  PieChart, ChevronDown, ArrowDown, ArrowUp
}

const iconComponent = computed(() => {
  return iconMap[props.name] || Package
})
</script>

<template>
  <component :is="iconComponent" :class="props.class" />
</template>
