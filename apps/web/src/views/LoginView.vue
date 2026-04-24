<template>
  <div class="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-6 relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-15 bg-[var(--color-brand)] -top-[100px] -right-[100px]" />
      <div class="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-15 bg-[var(--color-brand-secondary)] -bottom-[50px] -left-[50px]" />
    </div>

    <AppCard class="relative z-[1] w-full max-w-[400px] p-8 md:p-10">
      <div class="flex flex-col items-center gap-3 mb-8">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: var(--color-brand-gradient)">
          <Layers class="h-6 w-6 text-white" />
        </div>
        <h1 class="text-[1.75rem] font-extrabold tracking-tight gradient-text">有道ERP</h1>
        <p class="text-sm text-[var(--color-muted-foreground)] font-medium">智能进销存管理系统</p>
      </div>

      <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
        <AppFormGroup label="用户名">
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[var(--color-muted-foreground)] pointer-events-none" />
            <AppInput v-model="form.username" class="pl-10" placeholder="请输入用户名" required />
          </div>
        </AppFormGroup>

        <AppFormGroup label="密码">
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[var(--color-muted-foreground)] pointer-events-none" />
            <AppInput v-model="form.password" type="password" class="pl-10" placeholder="请输入密码" required />
          </div>
        </AppFormGroup>

        <div v-if="error" class="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-danger-muted)] text-[var(--color-danger)] text-[13px] font-medium">
          <AlertCircle class="h-4 w-4 flex-shrink-0" />
          {{ error }}
        </div>

        <AppButton type="submit" class="w-full h-11" :loading="authStore.loading">
          <span v-if="authStore.loading">登录中...</span>
          <span v-else>登录</span>
        </AppButton>
      </form>

      <p class="flex items-center justify-center gap-1 mt-5 text-xs text-[var(--color-muted-foreground)]">
        <Info class="h-3 w-3" />
        默认账号: admin / 密码: admin123
      </p>
    </AppCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Layers, User, Lock, AlertCircle, Info } from 'lucide-vue-next'
import { AppCard, AppButton, AppInput, AppFormGroup } from '@/components/ui'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const error = ref('')

async function handleLogin() {
  error.value = ''
  try {
    await authStore.login(form.username, form.password)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || '登录失败，请稍后重试'
  }
}
</script>
