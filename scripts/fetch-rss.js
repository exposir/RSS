const fs = require("fs");

// 从环境变量或命令行参数获取配置
const FEED_URL = process.env.FEED_URL || process.argv[2];
const OUTPUT_FILE =
  process.env.OUTPUT_FILE || process.argv[3] || "feeds/archive.json";

async function main() {
  if (!FEED_URL) {
    console.error("错误: 请提供 FEED_URL");
    process.exit(1);
  }

  console.log(`正在抓取: ${FEED_URL}`);

  // 动态导入 feed-extractor（ESM 模块）
  const { extract } = await import("@extractus/feed-extractor");

  // 抓取 RSS
  const feed = await extract(FEED_URL);
  const newEntries = feed.entries || [];

  console.log(`抓取到 ${newEntries.length} 条新闻`);

  // 读取现有存档
  let archive = { entries: [], meta: {} };
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      archive = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
    } catch (e) {
      console.log("现有存档文件损坏，将创建新的");
    }
  }

  // 创建已有 ID 的 Set，用于去重
  const existingIds = new Set(archive.entries.map((e) => e.id || e.link));

  // 找出新条目
  let addedCount = 0;
  for (const entry of newEntries) {
    const id = entry.id || entry.link;
    if (!existingIds.has(id)) {
      archive.entries.unshift(entry); // 新的放前面
      existingIds.add(id);
      addedCount++;
    }
  }

  // 更新元信息
  archive.meta = {
    title: feed.title,
    link: feed.link,
    description: feed.description,
    lastUpdated: new Date().toISOString(),
    totalEntries: archive.entries.length,
  };

  // 确保目录存在
  const dir = OUTPUT_FILE.substring(0, OUTPUT_FILE.lastIndexOf("/"));
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 保存
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(archive, null, 2));
  console.log(`✅ 新增 ${addedCount} 条，总共 ${archive.entries.length} 条`);
}

main().catch((err) => {
  console.error("抓取失败:", err.message);
  process.exit(1);
});
