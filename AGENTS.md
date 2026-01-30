# Antigravity Agents Context

## 📌 项目概述
这是一个基于 GitHub Actions 的自动化 RSS 订阅源归档系统。
- **核心功能**: 定时抓取 80+ 个 RSS 源，清洗并存储为 JSON 格式。
- **展示端**: 包含一个基于 VitePress 的稳定版阅读器和一个基于 Next.js 的预览版阅读器。

## 🛠 技术栈
- **Runtime**: Node.js
- **Core Scripts**: Vanilla JS (`scripts/fetch-rss.js`), `fast-xml-parser`
- **Web Reader (Stable)**: VitePress 1.6, Vue 3.5
- **Web Reader (Next)**: Next.js 16, React 19, Tailwind CSS v4, Radix UI
- **CI/CD**: GitHub Actions

## 🚦 开发工作流

### 1. 依赖安装
```bash
npm install
# Next.js 应用依赖
cd next-app && npm install
```

### 2. 数据抓取 (核心)
```bash
npm run fetch
```
*   读取 `feeds.yml` 配置。
*   抓取数据并更新 `feeds/` 目录下的 JSON 文件。

### 3. 启动开发服务器
- **VitePress**: `npm run docs:dev` (端口 5173)
- **Next.js**: `cd next-app && npm run dev` (端口 3000)

## 📝 提交规范 (Conventional Commits)
请遵循 Angular 提交规范：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 代码格式调整
- `refactor`: 代码重构
- `chore`: 构建过程或辅助工具的变动

**示例**:
- `docs: update README and remove unused directory`
- `feat: add new tech feeds`

## 🧠 记忆与偏好
- **语言**: 始终使用 **中文** 进行交流和注释。
- **文件操作**: 修改 `feeds.yml` 时注意保持 YAML 格式缩进。
- **部署**: Next.js 应用部署在 `/next/` 子路径下，注意 `basePath` 配置。
