# 🤖 RSS Archive & Web Reader

基于 GitHub Actions 的自动化 RSS 订阅源归档系统，配备现代化的 VitePress Web 阅读器。

## 🚀 功能特点

- **自动化抓取**：每 15 分钟自动抓取 83+ 个 RSS 订阅源
- **Web 阅读器**：VitePress 驱动的现代化阅读体验
- **纯静态站点**：无需后端，部署在 GitHub Pages
- **响应式设计**：支持桌面和移动端，自动暗色模式
- **JSON Feed 格式**：标准化的数据存储格式
- **实时更新**：运行时从同源 JSON 获取最新数据

## 🌐 在线访问

访问在线阅读器：**https://exposir.github.io/RSS/**

- 首页：https://exposir.github.io/RSS/
- 阅读器：https://exposir.github.io/RSS/reader

## 📋 本地使用

### 安装依赖

```bash
npm install
```

### 抓取 RSS 数据

```bash
npm run fetch
```

这会从 `feeds.yml` 读取配置，抓取所有订阅源并生成：
- `feeds/*.json` - 各订阅源的归档数据
- `feeds/index.json` - 订阅源索引文件

### 启动开发服务器

```bash
npm run docs:dev
```

访问 http://localhost:5173/RSS/

### 构建站点

```bash
npm run docs:build
```

产物在 `dist/` 目录。

### 预览构建结果

```bash
npm run docs:preview
```

## 📂 项目结构

```
RSS/
├── feeds/                    # RSS 数据存储
│   ├── index.json           # 订阅源索引
│   └── *.json               # 各订阅源归档
├── docs/                     # VitePress 站点
│   ├── .vitepress/
│   │   ├── config.ts        # VitePress 配置
│   │   └── theme/           # 自定义主题
│   │       ├── components/  # Vue 组件
│   │       ├── composables/ # 数据处理
│   │       └── style.css    # 样式
│   ├── index.md             # 首页
│   └── reader.md            # 阅读器页面
├── scripts/
│   └── fetch-rss.js         # RSS 抓取脚本
├── feeds.yml                # 订阅源配置
└── .github/workflows/
    └── rss.yml              # 自动化工作流
```

## ⚙️ 订阅源管理

编辑 `feeds.yml` 添加/删除订阅源：

```yaml
feeds:
  - name: 订阅源名称
    url: https://example.com/rss
    output: feeds/example.json
```

## 🎨 阅读器功能

- ✅ 左侧边栏显示所有订阅源
- ✅ 点击筛选特定订阅源的文章
- ✅ 按时间倒序显示最新文章
- ✅ 文章卡片显示标题、来源、时间和摘要
- ✅ 点击文章跳转到原文（新窗口）
- ✅ 分页加载更多
- ✅ 响应式布局，移动端友好
- ✅ 自动暗色模式

## 🛠️ 技术栈

- **数据抓取**: Node.js + fast-xml-parser + js-yaml
- **前端框架**: VitePress 1.6 + Vue 3.5
- **样式**: CSS Variables (自动暗色模式)
- **部署**: GitHub Actions + GitHub Pages
- **数据格式**: JSON Feed 1.1

## 🔄 自动化流程

GitHub Actions 每 15 分钟执行：

1. 抓取所有 RSS 订阅源
2. 更新 `feeds/` 目录
3. 生成 `feeds/index.json` 索引
4. 构建 VitePress 站点
5. 部署到 GitHub Pages

## 📊 当前订阅源

项目配置了 83 个订阅源，涵盖：
- 科技媒体：36氪、虎嗅、爱范儿、极客公园等
- 新闻媒体：BBC、纽约时报、华尔街日报等
- 技术博客：阮一峰、Randy's Blog 等
- 社区热点：V2EX、知乎、微博热搜等

完整列表见 `feeds.yml`。

---

_Created by Antigravity AI_
