<!--
- [INPUT]: 依赖 项目根目录 CLAUDE.md
- [OUTPUT]: 本模块架构地图
- [POS]: docs/ 模块宪法
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# VitePress Stable Reader

VitePress 1.6 + Vue 3 + CSS Variables

<directory>
.vitepress/ - 核心配置与主题
  config.ts - VitePress 站点配置
  theme/ - 自定义主题入口
    index.ts - 主题挂载逻辑
    style.css - 全局样式 (自动深色模式)
    components/ - Vue 业务组件 (Reader.vue, FeedList.vue...)
    composables/ - 组合式函数 (useFeeds.ts)
index.md - 首页内容
reader.md - 阅读器页面入口 (挂载 Reader.vue)
</directory>

<config>
package.json - (根目录共享依赖，此处主要关注 devDependencies)
</config>

法则: 静态优先·轻量·Vue驱动

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
