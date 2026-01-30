<!--
- [INPUT]: 依赖 项目根目录 CLAUDE.md
- [OUTPUT]: 本模块架构地图
- [POS]: scripts/ 模块宪法
- [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
-->

# RSS Crawler Core

Node.js + fast-xml-parser + js-yaml

<directory>
. - 脚本根目录
</directory>

<config>
fetch-rss.js - 核心抓取脚本
  - 依赖: feeds.yml (读取配置)
  - 产出: feeds/*.json (增量归档)
  - 逻辑: 感知(Fetch) -> 清洗(Clean HTML) -> 归档(Merge & Sort)
</config>

法则: 健壮性·幂等性·去噪·防腐层

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
