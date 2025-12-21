import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/styles/common.css'

Vue.config.productionTip = false

Vue.use(ElementUI)

// rem适配 - 移动端适配
function setRem() {
  const designWidth = 375 // 设计稿宽度（iPhone 6/7/8）
  const maxWidth = 768 // 最大适配宽度
  const minWidth = 320 // 最小适配宽度
  const baseSize = 16 // 基准字体大小（1rem = 16px）
  
  const width = document.documentElement.clientWidth || window.innerWidth
  let rem = baseSize
  
  if (width <= maxWidth) {
    // 移动端：按比例缩放
    const scale = width / designWidth
    rem = baseSize * scale
    // 限制最小和最大
    if (rem < baseSize * (minWidth / designWidth)) {
      rem = baseSize * (minWidth / designWidth)
    }
    if (rem > baseSize) {
      rem = baseSize
    }
  }
  
  document.documentElement.style.fontSize = rem + 'px'
}

// 立即执行一次
if (typeof document !== 'undefined') {
  setRem()
  window.addEventListener('resize', setRem)
  window.addEventListener('orientationchange', setRem)
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')


