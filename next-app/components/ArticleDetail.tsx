/**
 * [INPUT]: selected article
 * [OUTPUT]: Rendered article content with formatting
 * [POS]: next-app/components/ Right content panel
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { ExternalLink } from 'lucide-react'
import { Article } from '@/hooks/useFeeds'
import { formatDetailDate } from '@/lib/date'
import { cn } from '@/lib/utils'

interface ArticleDetailProps {
  article: Article | null
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  if (!article) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p>请选择一篇文章开始阅读</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-border flex-shrink-0">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl font-bold hover:text-primary hover:underline block mb-2 leading-tight"
        >
          {article.title}
          <ExternalLink className="inline-block ml-2 h-5 w-5 opacity-50" />
        </a>
        <div className="flex items-center text-sm text-muted-foreground gap-2 mt-3">
          <span className="font-medium text-foreground">{article.source}</span>
          <span>·</span>
          <span>{formatDetailDate(article.date_published)}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            "p-8 prose prose-slate dark:prose-invert max-w-none",
            "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
            "prose-img:rounded-lg prose-img:border prose-img:border-border"
          )}
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />
      </div>
    </div>
  )
}
