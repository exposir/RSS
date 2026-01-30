# 🤖 RSS Archive & Web Reader

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/exposir/RSS/rss.yml?label=RSS%20Fetch%20%26%20Build)
![License](https://img.shields.io/github/license/exposir/RSS)

基于 GitHub Actions 的自动化 RSS 订阅源归档系统，配备现代化的 VitePress Web 阅读器，并正在探索 Next.js 版本的全新体验。

## 🚀 功能特点

- **自动化抓取**：每 15 分钟自动抓取 **82+** 个精选 RSS 订阅源
- **Web 阅读器**：
  - **稳定版**: 基于 VitePress 的静态站点，轻量高效
  - **预览版**: 基于 Next.js 16 的现代化应用 (开发中)
- **纯静态归档**：无需后端数据库，数据以 JSON Feed 标准格式存储
- **响应式设计**：支持桌面和移动端，自动深色模式
- **内容清洗**：自动去除广告、追踪参数，并提供图片防盗链代理

## 🌐 在线访问

**稳定版 (VitePress)**: [https://exposir.github.io/RSS/](https://exposir.github.io/RSS/)

## 📋 开发指南

### 1. 环境准备

```bash
npm install
```

### 2. 抓取 RSS 数据 (核心)

```bash
npm run fetch
```
此命令会读取 `feeds.yml`，抓取最新文章并更新 `feeds/*.json` 归档文件。

### 3. 运行阅读器

#### 🅰️ VitePress 版 (当前主推)

```bash
npm run docs:dev
```
访问: http://localhost:5173/RSS/

#### 🅱️ Next.js 版 (预览体验)

采用了最新的 React 19 和 Next.js 16 架构。

```bash
cd next-app
npm install
npm run dev
```
访问: http://localhost:3000

## 📂 项目结构

```
RSS/
├── feeds/                    # 📦 RSS 数据归档 (JSON)
├── feeds.yml                 # ⚙️ 订阅源配置文件
├── scripts/
│   └── fetch-rss.js          # 🕷️ 核心抓取脚本
├── docs/                     # 📖 VitePress 阅读器源码
│   ├── .vitepress/           #    主题与配置
│   └── reader.md             #    阅读器入口
├── next-app/                 # 🧪 Next.js 阅读器 (WIP)
│   └── next-app/             #    Next.js 16 源码
└── .github/workflows/        # 🤖 自动化工作流
```

## ⚙️ 订阅源管理

编辑根目录下的 `feeds.yml` 添加或修改订阅源：

```yaml
feeds:
  - name: 订阅源名称
    url: https://example.com/rss
    output: feeds/filename.json
```

## 🔄 自动化机制

GitHub Actions (`.github/workflows/rss.yml`) 负责：
1. **定时触发**: 每 15 分钟运行一次
2. **增量抓取**: 执行 `fetch-rss.js` 更新数据
3. **构建部署**: 生成 VitePress 静态站并推送到 GitHub Pages

## 🛠️ 技术栈



- **Core**: Node.js, fast-xml-parser, GitHub Actions

- **Reader (Stable)**: VitePress 1.6, Vue 3.5

- **Reader (Next)**: Next.js 16, React 19, Tailwind CSS v4, Radix UI
