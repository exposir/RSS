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
    // Clear old layout data logic if needed...
  }, [])

  // Layout persistence logic
  const [layout, setLayout] = useState<number[]>([20, 30, 50])

  useEffect(() => {
    if (typeof window !== 'undefined' && isDesktop) {
      try {
        const savedLayout = localStorage.getItem('rss-reader-layout-v3')
        if (savedLayout) {
          const sizes = JSON.parse(savedLayout)
          if (Array.isArray(sizes) && sizes.length === 3) {
             // Validate left panel size
             if (sizes[0] >= 15) {
               setLayout(sizes)
             }
          }
        }
      } catch (e) { console.error(e) }
    }
  }, [isDesktop])

  const onLayout = (sizes: number[]) => {
    if (isDesktop) {
       // Guard against too small left panel
       if (sizes[0] < 15) return
       setLayout(sizes)
       if (typeof window !== 'undefined') {
         localStorage.setItem('rss-reader-layout-v3', JSON.stringify(sizes))
       }
    }
  }

  // ... (inside return)

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col">
      <ResizablePanelGroup
        key={isDesktop ? "desktop-layout" : "mobile-layout"}
        direction="horizontal"
        className="flex-1 h-full items-stretch"
        id="rss-reader-group-v3"
        onLayout={onLayout}
      >
        {/* Left: Feed List */}
        {isDesktop && (
          <>
            <ResizablePanel
              id="left-panel"
              defaultSize={layout[0]}
              minSize={18}
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
          defaultSize={isDesktop ? layout[1] : 100}
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
            <ResizablePanel id="right-panel" defaultSize={layout[2]} className="bg-background overflow-hidden">
              <ArticleDetail article={selectedArticle} />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}