import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.youdao.erp',
  appName: '有道ERP',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BarcodeScanner: {
      camera: 'back'
    }
  }
}

export default config
