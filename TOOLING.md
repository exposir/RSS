# 🛠 开发工具配置指南

本项目支持多种 AI 辅助开发工具和 IDE。为了确保开发体验的一致性，请参考以下配置说明。

## 🤖 AI 辅助工具

### Gemini CLI
- **配置文件**: `GEMINI.md`
- **作用**: Gemini CLI 的专属上下文记忆文件，包含项目概述、技术栈、常用命令和交互偏好。
- **规范同步**: 内容应与 `AGENTS.md` 保持一致。

### Antigravity (Agents)
- **配置文件**: `AGENTS.md`
- **作用**: Antigravity IDE / Agent 的核心规范文件。定义了 Agent 的行为模式、项目结构和防护栏规则。
- **高级配置**: `.agent/` 目录（如有）用于存放具体的 Rules 和 Workflows。

## 💻 IDE 配置

### VS Code / Windsurf / Cursor
- **配置文件**: `.cursorrules` 或 `.windsurfrules` (如有)
- **代码风格**:
  - `.editorconfig`: 跨编辑器的通用缩进和换行配置。
  - `package.json` 中的 `eslint` 配置: 代码质量检查。

## 🔄 规范同步指南
当更新项目规范（如新增技术栈、修改提交规范）时，请务必同时更新以下文件以保持一致性：
1. `README.md` (面向人类)
2. `.gemini/GEMINI.md` (面向 Gemini CLI)
3. `AGENTS.md` (面向 Antigravity)

---
*此文件旨在索引所有开发工具的配置入口，避免混乱。*
