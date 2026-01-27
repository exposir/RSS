import fs from 'fs';
import yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';

// 清理 HTML 内容，保留格式和图片
function cleanHtml(html) {
  if (!html) return '';
  
  // 解码 HTML 实体（多次解码处理嵌套）
  let content = html;
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
  
  // 先提取图片并替换为占位符
  const images = [];
  content = content.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, (match, src) => {
    if (src.includes('go_top') || src.includes('template') || src.includes('webdig')) {
      return '';
    }
    // 修复相对路径
    if (src.startsWith('../')) {
      src = 'http://paper.people.com.cn/rmrb/pc/' + src.replace(/\.\.\//g, '');
    }
    // 保留图片 URL
    src = src.replace(/\.jpg\.\d+$/, '.jpg');
    src = src.replace(/\.png\.\d+$/, '.png');
    images.push(src);
    return `__IMG_${images.length - 1}__`;
  });
  
  // 移除 script 标签及内容
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // 移除 style 标签及内容
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // 移除注释
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // 移除 input 标签
  content = content.replace(/<input[^>]*>/gi, '');
  
  // 移除脚本代码
  content = content.replace(/document\.write\([^)]*\);?/g, '');
  content = content.replace(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\}/g, '');
  content = content.replace(/var\s+\w+\s*=[\s\S]*?;/g, '');
  content = content.replace(/\/\/.*$/gm, '');
  
  
  
  // 清理无用标签但保留结构
  content = content.replace(/<(div|span)[^>]*>\s*<\/\1>/gi, '');
  
  // 将 div 转为 p
  content = content.replace(/<div[^>]*id="ozoom"[^>]*>/gi, '');
  content = content.replace(/<div[^>]*>/gi, '<p>');
  content = content.replace(/<\/div>/gi, '</p>');
  
  // 移除空段落
  content = content.replace(/<p>\s*<\/p>/g, '');
  content = content.replace(/(<p>\s*){2,}/g, '<p>');
  content = content.replace(/<\/p>\s*<\/p>/g, '</p>');
  
  // 移除无意义的 span
  content = content.replace(/<span[^>]*>/gi, '');
  content = content.replace(/<\/span>/gi, '');
  
  // 清理空白
  content = content.replace(/\t+/g, ' ');
  content = content.replace(/  +/g, ' ');
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // 恢复图片
  images.forEach((src, i) => {
    content = content.replace(`__IMG_${i}__`, `</p><p><img src="${src}" style="max-width:100%;" /></p><p>`);
  });
  
  // 最后清理连续的 p 标签
  content = content.replace(/<p>\s*<\/p>/g, '');
  content = content.replace(/<p>\s*<p>/g, '<p>');
  
  // 清理换行符
  content = content.replace(/\\n/g, '');
  
  // 清理残留的引号和标签
  content = content.replace(/">/g, '');
  content = content.replace(/<p[^>]*style[^>]*><\/p>/g, '');
  content = content.replace(/<p>\s*<\/p>/g, '');
  
  return content.trim();
}

// 提取纯文本
function extractText(html) {
  if (!html) return '';
  
  let text = html
    .replace(/<img[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/  +/g, ' ')
    .trim();
  
  return text;
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
      description: item.description,
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
