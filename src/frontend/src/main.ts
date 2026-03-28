import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './styles/index.scss'

// 设置Element Plus深色主题CSS变量 - 空军蓝白配色
const style = document.createElement('style')
style.textContent = `
  :root {
    --el-color-primary: #4da6ff;
    --el-color-primary-light-3: #80bfff;
    --el-color-primary-light-5: #a3c9ff;
    --el-color-primary-light-7: #c6e0ff;
    --el-color-primary-light-8: #d9ecff;
    --el-color-primary-light-9: #ecf5ff;
    --el-color-primary-dark-2: #0066cc;
    --el-bg-color: #0f2744;
    --el-bg-color-page: #050d17;
    --el-text-color-primary: #ffffff;
    --el-text-color-regular: #e8f4ff;
    --el-text-color-secondary: #8cb8e8;
    --el-text-color-placeholder: #5a7a9a;
    --el-border-color: #1e4a7c;
    --el-border-color-light: #2a5a8c;
    --el-border-color-lighter: #3a6a9c;
    --el-border-color-extra-light: #4a7aac;
    --el-fill-color: #0a1628;
    --el-fill-color-light: #0d2137;
    --el-fill-color-lighter: #112a45;
    --el-fill-color-extra-light: #163354;
    --el-fill-color-blank: #050d17;
  }

  body {
    background-color: #050d17 !important;
  }
`
document.head.appendChild(style)

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
