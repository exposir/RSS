import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'RSS Reader',
  description: 'My RSS Feed Reader',
  base: '/RSS/',
  outDir: '../dist',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/exposir/RSS' }
    ]
  },

  // 优化构建配置
  vite: {
    build: {
      chunkSizeWarningLimit: 1000
    }
  }
})
