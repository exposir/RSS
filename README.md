# 🤖 Auto RSS Fulltext Fetcher

这是一个基于 GitHub Actions 的自动化 RSS 全文提取工具。它能够定时抓取指定的 RSS 源，并利用全文提取算法获取文章的完整内容，自动保存到仓库中。

## 🚀 功能特点

- **自动化运行**：每 5 分钟自动检查一次更新（基于 GitHub Actions Schedule）。
- **全文提取**：不再只看摘要，自动抓取文章正文。
- **多源支持**：支持配置多个 RSS/Atom/JSON Feed 链接。
- **数据存档**：所有抓取的内容都以 JSON 格式保存在 `feeds/` 目录下。

## 📋 当前配置的订阅源

目前已配置以下订阅源：

1. [V2EX 热门话题](https://rsshub.app/v2ex/topics/hot)
2. [知乎日报](https://rsshub.app/zhihu/daily)
3. [人民网-政治](https://plink.anyfeeder.com/people/politics)

## 🛠️ 技术实现

- **工作流引擎**：GitHub Actions
- **核心组件**：[`nahuelhds/rss-entries-fetch-action`](https://github.com/nahuelhds/rss-entries-fetch-action)
- **自动提交**：[`stefanzweifel/git-auto-commit-action`](https://github.com/stefanzweifel/git-auto-commit-action)

## 📂 目录结构

- `.github/workflows/rss.yml`: 自动化任务配置。
- `feeds/`: 抓取到的全文内容存档目录。

---

_Created by Antigravity AI_
