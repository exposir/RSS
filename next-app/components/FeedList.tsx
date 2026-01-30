/**
 * [INPUT]: feeds, feedIndex, selectedFeed
 * [OUTPUT]: Rendered feed navigation list
 * [POS]: next-app/components/ Left sidebar component
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, ChevronLeft } from 'lucide-react'
import { Feed, FeedItem } from '@/hooks/useFeeds'
import { isToday, isYesterday } from '@/lib/date'

interface FeedListProps {
  feedIndex: FeedItem[]
  feeds: Map<string, Feed>
  selectedFeed: string
  onSelect: (feedId: string) => void
  loadingIndex: boolean
  error: string | null
}

export function FeedList({ feedIndex, feeds, selectedFeed, onSelect, loadingIndex, error }: FeedListProps) {
  // Calculate counts
  const todayCount = useMemo(() => {
    let count = 0
    feeds.forEach(feed => {
      feed.items?.forEach(item => {
        if (isToday(item.date_published)) count++
      })
    })
    return count
  }, [feeds])

  const yesterdayCount = useMemo(() => {
    let count = 0
    feeds.forEach(feed => {
      feed.items?.forEach(item => {
        if (isYesterday(item.date_published)) count++
      })
    })
    return count
  }, [feeds])

  const getFeedCount = (feedId: string) => {
    return feeds.get(feedId)?.items?.length || 0
  }

  const hasTodayUpdate = (feedId: string) => {
    const feedData = feeds.get(feedId)
    if (!feedData?.items) return false
    return feedData.items.some(item => isToday(item.date_published))
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold">订阅源</h2>
        <span className="text-xs text-muted-foreground">{feedIndex.length} 个</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {error && (
            <div className="p-2 mb-2 text-xs text-destructive bg-destructive/10 rounded">
              加载错误: {error}
            </div>
          )}
          <Button
            variant={selectedFeed === 'today' ? "secondary" : "ghost"}
            className="w-full justify-start font-normal"
            onClick={() => onSelect('today')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span className="flex-1 text-left">今日</span>
            {todayCount > 0 && <Badge variant="secondary" className="ml-auto text-xs">{todayCount}</Badge>}
          </Button>
          <Button
            variant={selectedFeed === 'yesterday' ? "secondary" : "ghost"}
            className="w-full justify-start font-normal"
            onClick={() => onSelect('yesterday')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            <span className="flex-1 text-left">昨日</span>
            {yesterdayCount > 0 && <Badge variant="secondary" className="ml-auto text-xs">{yesterdayCount}</Badge>}
          </Button>

          <Separator className="my-2" />

          {loadingIndex ? (
            <div className="p-4 text-center text-sm text-muted-foreground">加载中...</div>
          ) : (
            feedIndex.map(feed => {
              const hasUpdate = hasTodayUpdate(feed.id)
              return (
                <Button
                  key={feed.id}
                  variant={selectedFeed === feed.id ? "secondary" : "ghost"}
                  className="w-full justify-start font-normal truncate"
                  onClick={() => onSelect(feed.id)}
                >
                  {hasUpdate && (
                    <span className="mr-2 flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="今日有更新" />
                  )}
                  <span className="truncate flex-1 text-left">{feed.name}</span>
                  {getFeedCount(feed.id) > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">{getFeedCount(feed.id)}</span>
                  )}
                </Button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
