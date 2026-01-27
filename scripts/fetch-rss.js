import fs from 'fs';
import yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';

// 解码 HTML 实体
function decodeHtmlEntities(html) {
  if (!html) return '';
  
  let content = html;
  // 多次解码处理嵌套实体
  for (let i = 0; i < 3; i++) {
    content = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&copy;/g, '©');
  }
  return content;
}

// 清理 HTML 内容
function cleanHtml(html) {
  if (!html) return '';
  
  let content = decodeHtmlEntities(html);
  
  // 移除 script 标签及内容
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // 移除 style 标签及内容
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // 移除 HTML 注释
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // 移除 input 标签
  content = content.replace(/<input[^>]*>/gi, '');
  
  // 使用图片代理绕过防盗链
  content = content.replace(/<img([^>]*)src=["']([^"']+)["']([^>]*)>/gi, (match, before, src, after) => {
    // 过滤模板/装饰图片
    if (src.includes('go_top') || src.includes('template') || src.includes('webdig')) {
      return '';
    }
    // 修复 .jpg.2 等后缀
    src = src.replace(/\.(jpg|png|gif)\.\d+$/i, '.$1');
    // HTTP 图片使用代理
    if (src.startsWith('http://')) {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(src)}`;
      return `<img${before}src="${proxyUrl}"${after}>`;
    }
    return match;
  });
  
  return content.trim();
}

// 提取纯文本（只移除 HTML 标签）
function extractText(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').trim();
}

async function fetchRss(url) {
  const response = await fetch(url);
  const xml = await response.text();
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  
  const result = parser.parse(xml);
  const channel = result.rss?.channel;
  
  if (!channel) {
    throw new Error('Invalid RSS format');
  }
  
  const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);
  
  return {
    title: channel.title,
    link: channel.link,
    description: channel.description,
    entries: items.map(item => ({
      id: item.guid || item.link,
      title: item.title,
      link: item.link,
      // 优先使用 content:encoded，其次用 description
      description: item['content:encoded'] || item.description || '',
      published: item.pubDate ? new Date(item.pubDate).toISOString() : null
    }))
  };
}

async function main() {
  const config = yaml.load(fs.readFileSync('feeds.yml', 'utf8'));
  const feeds = config.feeds || [];

  console.log(`读取到 ${feeds.length} 个订阅源`);

  for (const feed of feeds) {
    console.log(`\n正在抓取: ${feed.name}`);

    try {
      const result = await fetchRss(feed.url);
      const newEntries = result.entries || [];

      console.log(`  抓取到 ${newEntries.length} 条新闻`);

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

      const existingIds = new Set(archive.items.map(e => e.id));

      let addedCount = 0;
      for (const entry of newEntries) {
        const id = entry.id || entry.link;
        if (!existingIds.has(id)) {
          const cleanedHtml = cleanHtml(entry.description || "");
          const plainText = extractText(cleanedHtml);
          
          const item = {
            id: id,
            url: entry.link,
            title: entry.title,
            content_html: cleanedHtml,
            content_text: plainText,
            date_published: entry.published || new Date().toISOString()
          };
          archive.items.unshift(item);
          existingIds.add(id);
          addedCount++;
        }
      }

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
