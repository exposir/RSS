'use client'

import { useState, useMemo, useEffect } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useFeeds, Article } from '@/hooks/useFeeds'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { Search, RotateCw, Calendar, ChevronLeft, ExternalLink } from 'lucide-react'

export default function RSSReader() {
  const { feedIndex, feeds, loading, loadingIndex, loadedCount, error, loadAllFeeds } = useFeeds()
  const [selectedFeed, setSelectedFeed] = useState<string>('today') // Default to 'today'
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fix hydration mismatch by waiting for mount
  const [isMounted, setIsMounted] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  useEffect(() => {
    setIsMounted(true)

    // Clear old layout data and migrate to new version
    if (typeof window !== 'undefined' && isDesktop) {
      try {
        // Clear old keys that may have corrupt data
        localStorage.removeItem('rss-reader-layout')
        // Also clear any other layout-related keys from old versions
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('react-resizable-panels') || key === 'rss-reader-layout')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (e) {
        console.error('Error clearing layout data:', e)
      }
    }
  }, [isDesktop])

  // Monitor and protect layout to ensure left panel is not too small
  const handleLayoutChanged = (layout: { [id: string]: number }) => {
    if (isDesktop && layout['left-panel']) {
      // Ensure left panel is at least 18%
      if (layout['left-panel'] < 18) {
        console.warn('Left panel too small, skipping save')
        return
      }
    }
    // Save to localStorage with new key
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rss-reader-layout-v2', JSON.stringify(layout))
      } catch (e) {
        console.error('Error saving layout:', e)
      }
    }
  }

  // Load default layout from localStorage
  const [defaultLayout, setDefaultLayout] = useState<{ [id: string]: number } | undefined>(undefined)

  useEffect(() => {
    if (typeof window !== 'undefined' && isDesktop) {
      try {
        const savedLayout = localStorage.getItem('rss-reader-layout-v2')
        if (savedLayout) {
          const layoutData = JSON.parse(savedLayout)
          if (layoutData && typeof layoutData === 'object') {
            // Validate the loaded layout
            if (layoutData['left-panel'] && layoutData['left-panel'] >= 18) {
              setDefaultLayout(layoutData)
            }
          }
        }
      } catch (e) {
        console.error('Error loading layout:', e)
      }
    }
  }, [isDesktop])

  // Helper: check if date matches today/yesterday
  const isDateMatch = (dateStr: string, targetDate: Date) => {
    const d = new Date(dateStr)
    return d.getDate() === targetDate.getDate() &&
           d.getMonth() === targetDate.getMonth() &&
           d.getFullYear() === targetDate.getFullYear()
  }

  // Calculate counts
  const todayCount = useMemo(() => {
    let count = 0
    const today = new Date()
    feeds.forEach(feed => {
      feed.items?.forEach(item => {
        if (isDateMatch(item.date_published, today)) count++
      })
    })
    return count
  }, [feeds])

  const yesterdayCount = useMemo(() => {
    let count = 0
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    feeds.forEach(feed => {
      feed.items?.forEach(item => {
        if (isDateMatch(item.date_published, yesterday)) count++
      })
    })
    return count
  }, [feeds])

  const getFeedCount = (feedId: string) => {
    return feeds.get(feedId)?.items?.length || 0
  }

  // Filter articles
  const filteredArticles = useMemo(() => {
    let articles: Article[] = []
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // 1. Gather articles based on selection
    if (selectedFeed === 'today') {
      feeds.forEach((feed, feedId) => {
        const feedInfo = feedIndex.find(f => f.id === feedId)
        feed.items?.forEach(item => {
          if (isDateMatch(item.date_published, today)) {
            articles.push({ ...item, source: feed.title || feedInfo?.name || '', feedId })
          }
        })
      })
    } else if (selectedFeed === 'yesterday') {
      feeds.forEach((feed, feedId) => {
        const feedInfo = feedIndex.find(f => f.id === feedId)
        feed.items?.forEach(item => {
          if (isDateMatch(item.date_published, yesterday)) {
            articles.push({ ...item, source: feed.title || feedInfo?.name || '', feedId })
          }
        })
      })
    } else {
      // Specific feed
      const feed = feeds.get(selectedFeed)
      const feedInfo = feedIndex.find(f => f.id === selectedFeed)
      if (feed && feed.items) {
        articles = feed.items.map(item => ({
          ...item,
          source: feed.title || feedInfo?.name || '',
          feedId: selectedFeed
        }))
      }
    }

    // 2. Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
      )
    }

    // 3. Sort by date desc
    return articles.sort((a, b) =>
      new Date(b.date_published).getTime() - new Date(a.date_published).getTime()
    )
  }, [feeds, feedIndex, selectedFeed, searchQuery])

  // Formatting helpers
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return '刚刚'
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  }

  const formatDetailDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    })
  }

  const selectedFeedName = useMemo(() => {
    if (selectedFeed === 'today') return '今日更新'
    if (selectedFeed === 'yesterday') return '昨日回顾'
    return feedIndex.find(f => f.id === selectedFeed)?.name || '未知订阅源'
  }, [selectedFeed, feedIndex])

  if (!isMounted) return null

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col">
      <ResizablePanelGroup
        key={isDesktop ? "desktop-layout" : "mobile-layout"}
        direction="horizontal"
        className="flex-1 h-full items-stretch"
        id="rss-reader-group-v2"
        defaultLayout={defaultLayout}
        onLayoutChanged={handleLayoutChanged}
      >

        {/* LEFT COLUMN: Feeds List */}
        {isDesktop && (
          <>
            <ResizablePanel
              id="left-panel"
              defaultSize={20}
              minSize={18}
              maxSize={35}
              collapsible={false}
              className="border-r border-border overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold">订阅源</h2>
                  <span className="text-xs text-muted-foreground">{feedIndex.length} 个</span>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {/* Error State */}
                    {error && (
                      <div className="p-2 mb-2 text-xs text-destructive bg-destructive/10 rounded">
                        加载错误: {error}
                      </div>
                    )}
                    <Button
                      variant={selectedFeed === 'today' ? "secondary" : "ghost"}
                      className="w-full justify-start font-normal"
                      onClick={() => { setSelectedFeed('today'); setSelectedArticle(null); }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      <span className="flex-1 text-left">今日</span>
                      {todayCount > 0 && <Badge variant="secondary" className="ml-auto text-xs">{todayCount}</Badge>}
                    </Button>
                    <Button
                      variant={selectedFeed === 'yesterday' ? "secondary" : "ghost"}
                      className="w-full justify-start font-normal"
                      onClick={() => { setSelectedFeed('yesterday'); setSelectedArticle(null); }}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      <span className="flex-1 text-left">昨日</span>
                      {yesterdayCount > 0 && <Badge variant="secondary" className="ml-auto text-xs">{yesterdayCount}</Badge>}
                    </Button>

                    <Separator className="my-2" />

                    {loadingIndex ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">加载中...</div>
                    ) : (
                      feedIndex.map(feed => (
                        <Button
                          key={feed.id}
                          variant={selectedFeed === feed.id ? "secondary" : "ghost"}
                          className="w-full justify-start font-normal truncate"
                          onClick={() => { setSelectedFeed(feed.id); setSelectedArticle(null); }}
                        >
                          <span className="truncate flex-1 text-left">{feed.name}</span>
                          {getFeedCount(feed.id) > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">{getFeedCount(feed.id)}</span>
                          )}
                        </Button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        {/* MIDDLE COLUMN: Article List */}
        <ResizablePanel
          id="middle-panel"
          defaultSize={isDesktop ? 30 : 100}
          minSize={25}
          className={cn("border-r border-border", !isDesktop && "w-full border-none")}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg truncate pr-2">{selectedFeedName}</h2>
                <div className="flex items-center gap-2">
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
                    onClick={loadAllFeeds}
                    disabled={loading}
                    className="h-8"
                  >
                    <RotateCw className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin")} />
                    {loading ? `${loadedCount}/${feedIndex.length}` : "刷新"}
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
              {filteredArticles.length === 0 && !loading ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <p>暂无文章</p>
                </div>
              ) : (
                <Virtuoso
                  style={{ height: '100%' }}
                  data={filteredArticles}
                  itemContent={(index, article) => (
                    <div
                      key={`${article.feedId}-${article.id}`}
                      className={cn(
                        "p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedArticle?.id === article.id && "bg-muted border-l-4 border-l-primary pl-[15px]"
                      )}
                      onClick={() => setSelectedArticle(article)}
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
        </ResizablePanel>

        {/* RIGHT COLUMN: Detail */}
        {isDesktop && (
          <>
            <ResizableHandle />
            <ResizablePanel id="right-panel" defaultSize={50} className="bg-background">
              {selectedArticle ? (
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <a
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl font-bold hover:text-primary hover:underline block mb-2 leading-tight"
                    >
                      {selectedArticle.title}
                      <ExternalLink className="inline-block ml-2 h-5 w-5 opacity-50" />
                    </a>
                    <div className="flex items-center text-sm text-muted-foreground gap-2 mt-3">
                      <span className="font-medium text-foreground">{selectedArticle.source}</span>
                      <span>·</span>
                      <span>{formatDetailDate(selectedArticle.date_published)}</span>
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <div
                      className={cn(
                        "p-8 prose prose-slate dark:prose-invert max-w-none",
                        "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
                        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                        "prose-img:rounded-lg prose-img:border prose-img:border-border"
                      )}
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content_html }}
                    />
                  </ScrollArea>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p>请选择一篇文章开始阅读</p>
                  </div>
                </div>
              )}
            </ResizablePanel>
          </>
        )}

      </ResizablePanelGroup>

      {/* Immersive Translation Styles */}
      <style jsx global>{`
        .immersive-translate-target font,
        .immersive-translate-target span[lang] {
          display: block !important;
          margin-top: 0 !important;
          font-size: 1em !important;
          opacity: 1 !important;
          line-height: 1.5 !important;
        }
        .immersive-translate-target br {
          display: none !important;
        }
        .immersive-translate-source font,
        .immersive-translate-source span[lang] {
          display: block !important;
          margin-top: 2px !important;
          width: 100% !important;
        }
        .immersive-translate-source br {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
