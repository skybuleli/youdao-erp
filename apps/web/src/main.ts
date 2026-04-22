import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { authApi } from './api'

import './styles/theme.css'
import './styles/global.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 应用启动时验证 token 有效性
const token = localStorage.getItem('token')
if (token) {
  authApi.me().catch(() => {
    localStorage.removeItem('token')
    if (router.currentRoute.value.meta.public !== true) {
      router.replace('/login')
    }
  })
}

app.mount('#app')
