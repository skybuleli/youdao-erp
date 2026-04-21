<template>
  <div class="setting-view">
    <!-- User Profile -->
    <div class="profile-card">
      <div class="avatar">管</div>
      <div class="profile-info">
        <div class="profile-name">管理员</div>
        <div class="profile-role">超级管理员</div>
      </div>
      <button class="edit-btn" @click="editProfile">✏️</button>
    </div>

    <!-- Settings Groups -->
    <div class="setting-group">
      <h4 class="group-title">🔧 基础设置</h4>
      <div class="setting-list">
        <div class="setting-item" @click="showShopModal = true">
          <div class="setting-icon">🏪</div>
          <div class="setting-info">
            <span class="setting-name">店铺信息</span>
            <span class="setting-desc">设置店铺名称、地址、联系方式</span>
          </div>
          <span class="arrow">›</span>
        </div>
        <div class="setting-item" @click="showPrinterModal = true">
          <div class="setting-icon">🖨️</div>
          <div class="setting-info">
            <span class="setting-name">打印设置</span>
            <span class="setting-desc">小票打印格式、打印机配置</span>
          </div>
          <span class="arrow">›</span>
        </div>
        <div class="setting-item">
          <div class="setting-icon">🔔</div>
          <div class="setting-info">
            <span class="setting-name">库存预警</span>
            <span class="setting-desc">开启后库存不足时推送提醒</span>
          </div>
          <label class="toggle">
            <input v-model="settings.stockAlert" type="checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="setting-group">
      <h4 class="group-title">🎨 外观</h4>
      <div class="setting-list">
        <div class="setting-item">
          <div class="setting-icon">🌙</div>
          <div class="setting-info">
            <span class="setting-name">深色模式</span>
            <span class="setting-desc">切换深色/浅色主题</span>
          </div>
          <label class="toggle">
            <input v-model="settings.darkMode" type="checkbox" @change="toggleTheme" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="setting-item">
          <div class="setting-icon">🔤</div>
          <div class="setting-info">
            <span class="setting-name">字体大小</span>
            <span class="setting-desc">调整界面字体显示大小</span>
          </div>
          <span class="setting-value">标准</span>
        </div>
      </div>
    </div>

    <div class="setting-group">
      <h4 class="group-title">🔒 安全</h4>
      <div class="setting-list">
        <div class="setting-item" @click="showPasswordModal = true">
          <div class="setting-icon">🔑</div>
          <div class="setting-info">
            <span class="setting-name">修改密码</span>
            <span class="setting-desc">定期更换密码保障安全</span>
          </div>
          <span class="arrow">›</span>
        </div>
        <div class="setting-item">
          <div class="setting-icon">📱</div>
          <div class="setting-info">
            <span class="setting-name">数据备份</span>
            <span class="setting-desc">自动备份到云端</span>
          </div>
          <label class="toggle">
            <input v-model="settings.autoBackup" type="checkbox" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>

    <div class="setting-group">
      <h4 class="group-title">📋 关于</h4>
      <div class="setting-list">
        <div class="setting-item">
          <div class="setting-icon">📦</div>
          <div class="setting-info">
            <span class="setting-name">版本信息</span>
            <span class="setting-desc">有道ERP v0.1.0</span>
          </div>
          <span class="setting-value">最新</span>
        </div>
        <div class="setting-item">
          <div class="setting-icon">📖</div>
          <div class="setting-info">
            <span class="setting-name">使用帮助</span>
            <span class="setting-desc">查看操作指南和常见问题</span>
          </div>
          <span class="arrow">›</span>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <button class="logout-btn" @click="logout">
      <span>👋 退出登录</span>
    </button>

    <!-- Shop Info Modal -->
    <div v-if="showShopModal" class="modal-overlay" @click.self="showShopModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>店铺信息</h3>
          <button class="close-btn" @click="showShopModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>店铺名称</label>
            <input v-model="shopForm.name" class="kimi-input" />
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input v-model="shopForm.phone" class="kimi-input" />
          </div>
          <div class="form-group">
            <label>店铺地址</label>
            <input v-model="shopForm.address" class="kimi-input" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showShopModal = false">取消</button>
          <button class="btn-primary" @click="saveShop">保存</button>
        </div>
      </div>
    </div>

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click.self="showPasswordModal = false">
      <div class="modal-panel">
        <div class="modal-header">
          <h3>修改密码</h3>
          <button class="close-btn" @click="showPasswordModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>原密码</label>
            <input v-model="pwdForm.old" type="password" class="kimi-input" placeholder="输入原密码" />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input v-model="pwdForm.new" type="password" class="kimi-input" placeholder="输入新密码" />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input v-model="pwdForm.confirm" type="password" class="kimi-input" placeholder="再次输入新密码" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showPasswordModal = false">取消</button>
          <button class="btn-primary" @click="savePassword">确认修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const settings = reactive({
  stockAlert: true,
  darkMode: true,
  autoBackup: true
})

const showShopModal = ref(false)
const showPasswordModal = ref(false)
const showPrinterModal = ref(false)

const shopForm = reactive({
  name: '有道食品商行',
  phone: '010-12345678',
  address: '北京市朝阳区建国路88号'
})

const pwdForm = reactive({
  old: '',
  new: '',
  confirm: ''
})

function toggleTheme() {
  document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light')
}

function editProfile() {
  alert('编辑个人信息（待实现）')
}

function saveShop() {
  showShopModal.value = false
  alert('店铺信息保存成功！')
}

function savePassword() {
  if (pwdForm.new !== pwdForm.confirm) {
    alert('两次输入的新密码不一致')
    return
  }
  showPasswordModal.value = false
  alert('密码修改成功！')
  Object.assign(pwdForm, { old: '', new: '', confirm: '' })
}

function logout() {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.setting-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.profile-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 60px;
  height: 60px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.profile-role {
  font-size: 14px;
  color: var(--text-secondary);
}

.edit-btn {
  width: 40px;
  height: 40px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 16px;
  cursor: pointer;
}

.setting-group {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.group-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  padding: 12px 16px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}

.setting-list {
  display: flex;
  flex-direction: column;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid var(--border-subtle);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background: var(--bg-hover);
}

.setting-icon {
  width: 36px;
  height: 36px;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.setting-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-name {
  font-size: 15px;
  font-weight: 500;
}

.setting-desc {
  font-size: 12px;
  color: var(--text-tertiary);
}

.arrow {
  font-size: 20px;
  color: var(--text-tertiary);
}

.setting-value {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-medium);
  border-radius: 26px;
  transition: all 0.3s;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background: var(--text-secondary);
  border-radius: 50%;
  transition: all 0.3s;
}

.toggle input:checked + .toggle-slider {
  background: var(--gradient-primary);
  border-color: transparent;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(22px);
  background: white;
}

/* Logout */
.logout-btn {
  height: 52px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-lg);
  color: var(--color-danger);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-panel {
  background: var(--bg-elevated);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slide-up 0.3s ease-out;
}

@media (min-width: 768px) {
  .modal-panel {
    border-radius: var(--radius-xl);
  }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

.kimi-input {
  height: 44px;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0 12px;
  color: var(--text-primary);
  font-size: 15px;
  width: 100%;
}

.kimi-input:focus {
  border-color: #8B5CF6;
  outline: none;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
}

.btn-secondary {
  flex: 1;
  height: 48px;
  background: var(--bg-surface);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
}

.btn-primary {
  flex: 1;
  height: 48px;
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-glow-purple);
}
</style>
