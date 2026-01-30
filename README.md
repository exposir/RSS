<!--
- [INPUT]: 依赖 项目根目录 的全局架构定义 (CLAUDE.md)
- [OUTPUT]: 面向人类的项目门户说明书
- [POS]: 项目根目录 的入口文档
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# 🤖 RSS Archive & Web Reader

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/exposir/RSS/rss.yml?label=RSS%20Fetch%20%26%20Build)
![License](https://img.shields.io/github/license/exposir/RSS)

基于 GitHub Actions 的自动化 RSS 订阅源归档系统。每 15 分钟执行一次“感知-清洗-归档”回环。

## 🌐 在线访问

- **稳定版 (VitePress)**: [https://exposir.github.io/RSS/](https://exposir.github.io/RSS/)
  > 生产环境，轻量、可靠、响应式。
- **预览版 (Next.js)**: [https://exposir.github.io/RSS/next/](https://exposir.github.io/RSS/next/)
  > 实验环境，基于 Next.js 16 + React 19 的现代化 UI 探索。

## 🚀 核心逻辑

- **自动化抓取**：定时更新 **82+** 个精选订阅源。
- **内容清洗**：自动剔除 HTML 垃圾、广告脚本，并通过图片代理绕过防盗链。
- **分形归档**：数据以 JSON Feed 格式存储于 `feeds/`，实现数据与表现层的解耦。

## 🛠️ 技术栈

- **Core**: Node.js + GitHub Actions
- **Stable UI**: VitePress 1.6 + Vue 3.5
- **Next UI**: Next.js 16 + React 19 + Tailwind CSS v4
- **Parser**: fast-xml-parser

## 📋 本地开发

### 环境准备
```bash
npm install
```

### 抓取数据
```bash
npm run fetch
```

### 启动阅读器
- **VitePress**: `npm run docs:dev`
- **Next.js**: `cd next-app/next-app && npm run dev`

## 📂 项目结构

关于项目详细的架构设计与 AI 协同规范，请参阅：
- [CLAUDE.md](./CLAUDE.md) - **项目宪法与分形地图**
- [TOOLING.md](./TOOLING.md) - 多 Agent 工具链配置指引

---
[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md