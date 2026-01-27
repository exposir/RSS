import fs from 'fs';
import yaml from 'js-yaml';

async function main() {
  // 读取配置
  const config = yaml.load(fs.readFileSync('feeds.yml', 'utf8'));
  const feeds = config.feeds || [];

  console.log(`读取到 ${feeds.length} 个订阅源`);

  const { extract } = await import('@extractus/feed-extractor');

  for (const feed of feeds) {
    console.log(`\n正在抓取: ${feed.name}`);

    try {
      const result = await extract(feed.url);
      const newEntries = result.entries || [];

      console.log(`  抓取到 ${newEntries.length} 条新闻`);

      // 读取现有存档
      let archive = {
        version: "https://jsonfeed.org/version/1.1",
        title: result.title || feed.name,
        home_page_url: result.link || "",
        feed_url: `https://exposir.github.io/RSS/${feed.output}`,
        description: result.description || "",
        items: []
      };

      if (fs.existsSync(feed.output)) {
        try {
          const existing = JSON.parse(fs.readFileSync(feed.output, 'utf8'));
          if (existing.items) {
            archive.items = existing.items;
          }
        } catch (e) {
          console.log('  现有存档文件损坏，将创建新的');
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
      const dir = feed.output.substring(0, feed.output.lastIndexOf('/'));
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(feed.output, JSON.stringify(archive, null, 2));
      console.log(`  ✅ 新增 ${addedCount} 条，总共 ${archive.items.length} 条`);

    } catch (err) {
      console.error(`  ❌ 抓取失败: ${err.message}`);
    }
  }

  console.log('\n全部完成！');
}

main().catch(err => {
  console.error('脚本执行失败:', err.message);
  process.exit(1);
});
