import fs from 'fs';

const FEED_URL = process.env.FEED_URL || process.argv[2];
const OUTPUT_FILE = process.env.OUTPUT_FILE || process.argv[3] || 'feeds/archive.json';

async function main() {
  if (!FEED_URL) {
    console.error('错误: 请提供 FEED_URL');
    process.exit(1);
  }

  console.log(`正在抓取: ${FEED_URL}`);

  const { extract } = await import('@extractus/feed-extractor');
  const feed = await extract(FEED_URL);
  const newEntries = feed.entries || [];

  console.log(`抓取到 ${newEntries.length} 条新闻`);

  // 读取现有存档（JSON Feed 格式）
  let archive = {
    version: "https://jsonfeed.org/version/1.1",
    title: feed.title || "RSS Archive",
    home_page_url: feed.link || "",
    feed_url: `https://raw.githubusercontent.com/exposir/RSS/main/${OUTPUT_FILE}`,
    description: feed.description || "",
    items: []
  };

  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      if (existing.items) {
        archive.items = existing.items;
      }
    } catch (e) {
      console.log('现有存档文件损坏，将创建新的');
    }
  }

  // 去重
  const existingIds = new Set(archive.items.map(e => e.id));

  let addedCount = 0;
  for (const entry of newEntries) {
    const id = entry.id || entry.link;
    if (!existingIds.has(id)) {
      const item = {
        id: id,
        url: entry.link,
        title: entry.title,
        content_text: entry.description || "",
        date_published: entry.published || new Date().toISOString()
      };
      archive.items.unshift(item);
      existingIds.add(id);
      addedCount++;
    }
  }

  // 确保目录存在
  const dir = OUTPUT_FILE.substring(0, OUTPUT_FILE.lastIndexOf('/'));
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(archive, null, 2));
  console.log(`✅ 新增 ${addedCount} 条，总共 ${archive.items.length} 条`);
}

main().catch(err => {
  console.error('抓取失败:', err.message);
  process.exit(1);
});
