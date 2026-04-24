<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Profile -->
    <AppCard class="p-5 flex items-center gap-4">
      <div class="w-[60px] h-[60px] rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0" style="background: var(--color-brand-gradient)">
        管
      </div>
      <div class="flex-1">
        <div class="text-lg font-semibold">管理员</div>
        <div class="text-sm text-[var(--color-muted-foreground)]">超级管理员</div>
      </div>
      <AppButton variant="ghost" size="icon-sm" @click="editProfile">
        <Pencil class="h-4 w-4" />
      </AppButton>
    </AppCard>

    <!-- Settings Groups -->
    <AppCard>
      <div class="px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)] bg-[var(--color-secondary)] border-b border-[var(--color-border)]">
        基础设置
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[var(--color-accent)] transition-colors border-b border-[var(--color-border)]" @click="showShopModal = true">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] text-lg flex-shrink-0">🏪</div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[15px] font-medium">店铺信息</span>
            <span class="text-xs text-[var(--color-muted-foreground)]">设置店铺名称、地址、联系方式</span>
          </div>
          <span class="text-xl text-[var(--color-muted-foreground)]">›</span>
        </div>
        <div class="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[var(--color-accent)] transition-colors border-b border-[var(--color-border)]" @click="showPrinterModal = true">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] flex-shrink-0"><Printer class="h-4 w-4" /></div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[15px] font-medium">打印设置</span>
            <span class="text-xs text-[var(--color-muted-foreground)]">小票打印格式、打印机配置</span>
          </div>
          <span class="text-xl text-[var(--color-muted-foreground)]">›</span>
        </div>
        <div class="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)]">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] text-lg flex-shrink-0">🔔</div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[15px] font-medium">库存预警</span>
            <span class="text-xs text-[var(--color-muted-foreground)]">开启后库存不足时推送提醒</span>
          </div>
          <AppSwitch v-model="settings.stockAlert" />
        </div>
      </div>
    </AppCard>

    <AppCard>
      <div class="px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)] bg-[var(--color-secondary)] border-b border-[var(--color-border)]">
        外观
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)]">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] flex-shrink-0"><Moon class="h-4 w-4" /></div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[15px] font-medium">深色模式</span>
            <span class="text-xs text-[var(--color-muted-foreground)]">切换深色/浅色主题</span>
          </div>
          <AppSwitch v-model="settings.darkMode" @change="toggleTheme" />
        </div>
        <div class="flex items-center gap-3 px-4 py-3.5">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] text-lg flex-shrink-0">🔤</div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[15px] font-medium">字体大小</span>
            <span class="text-xs text-[var(--color-muted-foreground)]">调整界面字体显示大小</span>
          </div>
          <span class="text-sm text-[var(--color-muted-foreground)]">标准</span>
        </div>
      </div>
    </AppCard>

    <AppCard>
      <div class="px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)] bg-[var(--color-secondary)] border-b border-[var(--color-border)]">
        安全
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[var(--color-accent)] transition-colors border-b border-[var(--color-border)]" @click="showPasswordModal = true">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] text-lg flex-shrink-0">🔑</div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[15px] font-medium">修改密码</span>
            <span class="text-xs text-[var(--color-muted-foreground)]">定期更换密码保障安全</span>
          </div>
          <span class="text-xl text-[var(--color-muted-foreground)]">›</span>
        </div>
        <div class="flex items-center gap-3 px-4 py-3.5">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] text-lg flex-shrink-0">📱</div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[15px] font-medium">数据备份</span>
            <span class="text-xs text-[var(--color-muted-foreground)]">自动备份到云端</span>
          </div>
          <AppSwitch v-model="settings.autoBackup" />
        </div>
      </div>
    </AppCard>

    <AppCard>
      <div class="px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)] bg-[var(--color-secondary)] border-b border-[var(--color-border)]">
        关于
      </div>
      <div class="flex flex-col">
        <div class="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)]">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] flex-shrink-0"><Package class="h-5 w-5" /></div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[15px] font-medium">版本信息</span>
            <span class="text-xs text-[var(--color-muted-foreground)]">有道ERP v0.1.0</span>
          </div>
          <span class="text-sm text-[var(--color-muted-foreground)]">最新</span>
        </div>
        <div class="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[var(--color-accent)] transition-colors">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--color-secondary)] text-lg flex-shrink-0">📖</div>
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-[15px] font-medium">使用帮助</span>
            <span class="text-xs text-[var(--color-muted-foreground)]">查看操作指南和常见问题</span>
          </div>
          <span class="text-xl text-[var(--color-muted-foreground)]">›</span>
        </div>
      </div>
    </AppCard>

    <AppButton variant="secondary" class="h-13 bg-[var(--color-danger-muted)] text-[var(--color-danger)] border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)]/20" @click="logout">
      <LogOut class="h-4 w-4" /> 退出登录
    </AppButton>

    <!-- Shop Info Dialog -->
    <AppDialog :open="showShopModal" @close="showShopModal = false">
      <div class="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
        <h3 class="text-lg font-semibold">店铺信息</h3>
        <AppButton variant="ghost" size="icon-sm" @click="showShopModal = false"><X class="h-4 w-4" /></AppButton>
      </div>
      <div class="p-5 flex flex-col gap-4">
        <AppFormGroup label="店铺名称"><AppInput v-model="shopForm.name" /></AppFormGroup>
        <AppFormGroup label="联系电话"><AppInput v-model="shopForm.phone" /></AppFormGroup>
        <AppFormGroup label="店铺地址"><AppInput v-model="shopForm.address" /></AppFormGroup>
      </div>
      <div class="p-4 border-t border-[var(--color-border)] flex gap-3">
        <AppButton variant="secondary" class="flex-1" @click="showShopModal = false">取消</AppButton>
        <AppButton class="flex-1" @click="saveShop">保存</AppButton>
      </div>
    </AppDialog>

    <!-- Password Dialog -->
    <AppDialog :open="showPasswordModal" @close="showPasswordModal = false">
      <div class="p-5 border-b border-[var(--color-border)] flex justify-between items-center">
        <h3 class="text-lg font-semibold">修改密码</h3>
        <AppButton variant="ghost" size="icon-sm" @click="showPasswordModal = false"><X class="h-4 w-4" /></AppButton>
      </div>
      <div class="p-5 flex flex-col gap-4">
        <AppFormGroup label="原密码"><AppInput v-model="pwdForm.old" type="password" placeholder="输入原密码" /></AppFormGroup>
        <AppFormGroup label="新密码"><AppInput v-model="pwdForm.new" type="password" placeholder="输入新密码" /></AppFormGroup>
        <AppFormGroup label="确认新密码"><AppInput v-model="pwdForm.confirm" type="password" placeholder="再次输入新密码" /></AppFormGroup>
      </div>
      <div class="p-4 border-t border-[var(--color-border)] flex gap-3">
        <AppButton variant="secondary" class="flex-1" @click="showPasswordModal = false">取消</AppButton>
        <AppButton class="flex-1" @click="savePassword">确认修改</AppButton>
      </div>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { Pencil, Printer, Moon, Package, LogOut, X } from 'lucide-vue-next'
import { AppButton, AppCard, AppInput, AppDialog, AppFormGroup, AppSwitch } from '@/components/ui'

const router = useRouter()
const toast = useToastStore()
const authStore = useAuthStore()

const settings = reactive({ stockAlert: true, darkMode: true, autoBackup: true })
const showShopModal = ref(false)
const showPasswordModal = ref(false)
const showPrinterModal = ref(false)

const shopForm = reactive({ name: '有道食品商行', phone: '010-12345678', address: '北京市朝阳区建国路88号' })
const pwdForm = reactive({ old: '', new: '', confirm: '' })

function toggleTheme() {
  document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light')
}

function editProfile() { toast.info('编辑个人信息（待实现）') }
function saveShop() { showShopModal.value = false; toast.success('店铺信息保存成功！') }

function savePassword() {
  if (pwdForm.new !== pwdForm.confirm) { toast.warning('两次输入的新密码不一致'); return }
  showPasswordModal.value = false
  toast.success('密码修改成功！')
  Object.assign(pwdForm, { old: '', new: '', confirm: '' })
}

function logout() {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>
