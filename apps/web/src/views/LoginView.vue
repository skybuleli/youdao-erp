<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <div class="logo-icon">YD</div>
        <h1 class="gradient-text">有道ERP</h1>
        <p class="subtitle">智能进销存管理系统</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="kimi-input"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            v-model="form.password"
            type="password"
            class="kimi-input"
            placeholder="请输入密码"
            required
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="btn-login" :disabled="authStore.loading">
          <span v-if="authStore.loading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>

      <p class="hint">默认账号: admin / 密码: admin123</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
  background: var(--bg-base);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-card);
}

.logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.logo h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.error-message {
  color: var(--color-danger);
  font-size: 14px;
  text-align: center;
}

.btn-login {
  height: 48px;
  background: var(--accent-primary);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-login:hover {
  transform: translateY(-1px);
  
}

.btn-login:active {
  transform: scale(0.97);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  text-align: center;
  color: var(--text-tertiary);
  font-size: 12px;
  margin-top: 20px;
}
</style>
