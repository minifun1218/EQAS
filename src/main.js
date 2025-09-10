import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './utils/request' // 导入全局拦截器
import errorHandler from './utils/errorHandler' // 导入错误处理器
import permissionManager from './utils/permission' // 导入权限管理器
import globalMixin from './mixins/global' // 导入全局混入
import { initChromeExtensionFix } from './utils/chromeExtensionFix' // 导入Chrome扩展错误修复
import { APP_CONFIG } from './config/index'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
    
  // 注册全局混入
  app.mixin(globalMixin)
  // 全局配置
  app.config.globalProperties.$config = APP_CONFIG
  // 初始化Chrome扩展错误修复（优先级最高）
  initChromeExtensionFix()
  // 初始化全局错误处理
  errorHandler.init()
  // 初始化权限管理
  permissionManager.init()
  return {
    app,
    pinia
  }
}