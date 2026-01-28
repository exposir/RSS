import DefaultTheme from 'vitepress/theme'
import './style.css'

export default {
  extends: DefaultTheme,
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
