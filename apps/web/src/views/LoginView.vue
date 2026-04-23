<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <div class="logo-icon">
          <Layers class="w-6 h-6 text-white" />
        </div>
        <h1 class="gradient-text">有道ERP</h1>
        <p class="subtitle">智能进销存管理系统</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <User class="input-icon" />
            <input
              v-model="form.username"
              type="text"
              class="input"
              placeholder="请输入用户名"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label>密码</label>
          <div class="input-wrapper">
            <Lock class="input-icon" />
            <input
              v-model="form.password"
              type="password"
              class="input"
              placeholder="请输入密码"
              required
            />
          </div>
        </div>

        <div v-if="error" class="error-message">
          <AlertCircle class="w-4 h-4" />
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="authStore.loading">
          <Loader2 v-if="authStore.loading" class="w-4 h-4 animate-spin" />
          <span v-if="authStore.loading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>

      <p class="hint">
        <Info class="w-3 h-3" />
        默认账号: admin / 密码: admin123
      </p>
    </div>

    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Layers,
  User,
  Lock,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-vue-next'

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

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: var(--color-brand);
  top: -100px;
  right: -100px;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: #5b8def;
  bottom: -50px;
  left: -50px;
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-xl);
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #7c5cfc 0%, #5b8def 100%);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo h1 {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-foreground);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  width: 18px;
  height: 18px;
  color: var(--color-muted-foreground);
  pointer-events: none;
}

.input-wrapper .input {
  padding-left: 2.5rem;
}

.input {
  display: flex;
  width: 100%;
  height: 2.75rem;
  padding: 0 0.75rem;
  padding-left: 2.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background: var(--color-background);
  color: var(--color-foreground);
  border: 1px solid var(--color-input);
  border-radius: var(--radius-lg);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  outline: none;
}

.input:focus {
  border-color: var(--color-ring);
  box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.1);
}

.input::placeholder {
  color: var(--color-muted-foreground);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-danger-muted);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 500;
}

.btn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 2.75rem;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #7c5cfc 0%, #5b8def 100%);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.btn-login:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 1.25rem;
  font-size: 0.75rem;
  color: var(--color-muted-foreground);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
