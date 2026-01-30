<!--
- [INPUT]: 依赖 项目根目录 CLAUDE.md
- [OUTPUT]: 本模块架构地图
- [POS]: next-app/ 模块宪法
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# Next.js Preview Reader

Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Radix UI

<directory>
app/ - 路由与页面组件 (App Router 架构)
components/ - 通用 UI 组件 (基于 shadcn/ui 理念)
hooks/ - 自定义 React Hooks (如 useFeeds, useMediaQuery)
lib/ - 工具函数库 (utils.ts)
public/ - 静态资源
</directory>

<config>
next.config.ts - Next.js 核心配置 (Export Output, BasePath)
package.json - 依赖与脚本
tailwind.config.ts - (如存在) Tailwind 配置，v4 可能内置
tsconfig.json - TypeScript 配置
</config>

法则: 现代化·高性能·实验性·组件化

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
