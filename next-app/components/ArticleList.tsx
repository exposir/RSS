/**
 * [INPUT]: articles (Array), search query, selection state
 * [OUTPUT]: Virtualized article list with search bar & toolbar
 * [POS]: next-app/components/ Middle panel component
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Virtuoso } from 'react-virtuoso'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/theme-toggle'
import { Search, RotateCw } from 'lucide-react'
import { Article } from '@/hooks/useFeeds'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'

interface ArticleListProps {
  articles: Article[]
  selectedArticleId: string | undefined
  onSelect: (article: Article) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  title: string
  loading: boolean
  loadedCount: number
  totalCount: number
  onRefresh: () => void
  error: string | null
  isDesktop: boolean
}

export function ArticleList({
  articles,
  selectedArticleId,
  onSelect,
  searchQuery,
  setSearchQuery,
  title,
  loading,
  loadedCount,
  totalCount,
  onRefresh,
  error,
  isDesktop
}: ArticleListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg truncate pr-2">{title}</h2>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              onClick={() => {
                try { localStorage.clear() } catch (e) {}
                window.location.reload()
              }}
              title="重置布局"
            >
              重置
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8"
            >
              <RotateCw className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} />
              {loading ? `${loadedCount}/${totalCount}` : "刷新"}
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索文章标题或来源..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {!isDesktop && error && (
          <div className="p-2 text-xs text-destructive bg-destructive/10 rounded">
            加载错误: {error}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {articles.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>暂无文章</p>
          </div>
        ) : (
          <Virtuoso
            style={{ height: '100%' }}
            data={articles}
            itemContent={(index, article) => (
              <div
                key={`${article.feedId}-${article.id}`}
                className={cn(
                  "p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedArticleId === article.id && "bg-muted border-l-4 border-l-primary pl-[15px]"
                )}
                onClick={() => onSelect(article)}
              >
                <h3 className="font-medium text-sm leading-snug mb-1 line-clamp-2 md:line-clamp-none md:block md:whitespace-normal break-words immersive-translate-target">
                  {article.title}
                </h3>
                <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1.5 flex-wrap">
                  <span className="font-medium text-foreground/80 immersive-translate-source block w-full md:w-auto">{article.source}</span>
                  <span className="hidden md:inline">·</span>
                  <span>{formatDate(article.date_published)}</span>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}
