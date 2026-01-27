import fs from 'fs';
import yaml from 'js-yaml';

// 清理 HTML 内容
function cleanHtml(html) {
  if (!html) return '';
  
  // 解码 HTML 实体
  let content = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&copy;/g, '©');
  
  // 移除 script 标签及内容（包括被转义的）
  content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // 移除 style 标签及内容
  content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
  
  // 移除注释
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // 移除特定的垃圾内容
  content = content.replace(/\/enpproperty-->/g, '');
  content = content.replace(/document\.write\([^)]*\);?/g, '');
  content = content.replace(/function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\}/g, '');
  content = content.replace(/var\s+\w+\s*=[\s\S]*?;/g, '');
  content = content.replace(/updateMetaRmrb[\s\S]*$/g, '');
  content = content.replace(/showMetaRmrb[\s\S]*$/g, '');
  content = content.replace(/\/\/.*$/gm, '');
  
  // 移除版权等无关内容
  content = content.replace(/人\s*民\s*网\s*版\s*权[\s\S]*?all rights reserved/gi, '');
  content = content.replace(/Copyright[\s\S]*?reserved/gi, '');
  content = content.replace(/获取更多RSS[\s\S]*$/gi, '');
  content = content.replace(/https?:\/\/feedx\.(net|site)/gi, '');
  
  // 移除 URL 和元数据垃圾
  content = content.replace(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}:\d+/g, '');
  content = content.replace(/http:\/\/paper\.people\.com\.cn[\w\/.]+/g, '');
  content = content.replace(/\d{10,}/g, ''); // 长数字串
  content = content.replace(/\s+http:?\s*$/g, ''); // 末尾残留的 http:
  
  // 清理 HTML 标签，只保留内容相关的
  // 提取 img 标签
  const images = [];
  content.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
    if (src && !src.includes('go_top') && !src.includes('template')) {
      images.push(`<img src="${src}" />`);
    }
    return '';
  });
  
  // 移除所有 HTML 标签
  content = content.replace(/<[^>]+>/g, ' ');
  
  // 清理空白
  content = content.replace(/\s+/g, ' ').trim();
  
  // 移除开头的日期
  content = content.replace(/^\d{4}年\d{2}月\d{2}日\s*/, '');
  
  // 添加图片
  if (images.length > 0) {
    content = images.join('\n') + '\n\n' + content;
  }
  
  return content;
}

// 提取纯文本
function extractText(html) {
  if (!html) return '';
  
  // 移除图片标签
  let text = html.replace(/<img[^>]*>/gi, '');
  
  // 清理空白
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

async function main() {
  const config = yaml.load(fs.readFileSync('feeds.yml', 'utf8'));
  const feeds = config.feeds || [];

  console.log(`读取到 ${feeds.length} 个订阅源`);

  const { extract } = await import('@extractus/feed-extractor');

  for (const feed of feeds) {
    console.log(`\n正在抓取: ${feed.name}`);

    try {
      const result = await extract(feed.url, {
        descriptionMaxLen: 100000
      });
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
          const cleanedContent = cleanHtml(entry.description || "");
          const plainText = extractText(cleanedContent);
          
          const item = {
            id: id,
            url: entry.link,
            title: entry.title,
            content_html: cleanedContent,
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
