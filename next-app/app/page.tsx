/**
 * [INPUT]: 依赖 useFeeds Hook 获取数据
 * [OUTPUT]: 渲染主页面 (三栏布局: FeedList - ArticleList - ArticleDetail)
 * [POS]: next-app/app/ 核心页面组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client'

import { useState, useMemo, useEffect } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { useFeeds, Article } from '@/hooks/useFeeds'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { isDateMatch } from '@/lib/date'
import { FeedList } from '@/components/FeedList'
import { ArticleList } from '@/components/ArticleList'
import { ArticleDetail } from '@/components/ArticleDetail'

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
  }, [])

  // Filter Logic
  const filteredArticles = useMemo(() => {
    let articles: Article[] = []
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    // 1. Gather articles
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

    // 2. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q)
      )
    }

    // 3. Sort
    return articles.sort((a, b) =>
      new Date(b.date_published).getTime() - new Date(a.date_published).getTime()
    )
  }, [feeds, feedIndex, selectedFeed, searchQuery])

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
        id="rss-reader-group-v3"
      >
        {/* Left: Feed List */}
        {isDesktop && (
          <>
            <ResizablePanel
              id="left-panel"
              defaultSize={25}
              minSize={20}
              maxSize={35}
              collapsible={false}
              className="border-r border-border overflow-hidden"
            >
              <FeedList
                feedIndex={feedIndex}
                feeds={feeds}
                selectedFeed={selectedFeed}
                onSelect={(id) => { setSelectedFeed(id); setSelectedArticle(null); }}
                loadingIndex={loadingIndex}
                error={error}
              />
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        {/* Middle: Article List */}
        <ResizablePanel
          id="middle-panel"
          defaultSize={30}
          minSize={20}
          className={cn("border-r border-border overflow-hidden", !isDesktop && "w-full border-none")}
        >
          <ArticleList
            articles={filteredArticles}
            selectedArticleId={selectedArticle?.id}
            onSelect={setSelectedArticle}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            title={selectedFeedName}
            loading={loading}
            loadedCount={loadedCount}
            totalCount={feedIndex.length}
            onRefresh={loadAllFeeds}
            error={error}
            isDesktop={isDesktop}
          />
        </ResizablePanel>

        {/* Right: Detail */}
        {isDesktop && (
          <>
            <ResizableHandle />
            <ResizablePanel id="right-panel" defaultSize={50} className="bg-background overflow-hidden">
              <ArticleDetail article={selectedArticle} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}