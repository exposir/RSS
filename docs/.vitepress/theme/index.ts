import DefaultTheme from 'vitepress/theme'
import './style.css'
import { h } from 'vue'
import TopSearch from './components/TopSearch.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-content-after': () => h(TopSearch)
    })
  },
  enhanceApp({ app }) {
    // 在客户端运行时清除用户的手动偏好设置，强制跟随系统
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('vitepress-theme-appearance')
      } catch (e) {
        console.error('Failed to clear theme preference:', e)
      }
    }
  }
}
