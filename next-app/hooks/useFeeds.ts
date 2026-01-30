import { useState, useEffect, useCallback } from 'react'

export interface FeedIndex {
  id: string
  name: string
  output: string
}

export interface FeedItem {
  id: string
  url: string
  title: string
  content_html: string
  content_text: string
  date_published: string
}

export interface Feed {
  version: string
  title: string
  home_page_url: string
  feed_url: string
  description: string
  items: FeedItem[]
}

export interface Article extends FeedItem {
  source: string
  feedId: string
}

export function useFeeds() {
  const [feedIndex, setFeedIndex] = useState<FeedIndex[]>([])
  const [feeds, setFeeds] = useState<Map<string, Feed>>(new Map())
  const [loading, setLoading] = useState(true)
  const [loadingIndex, setLoadingIndex] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadedCount, setLoadedCount] = useState(0)

  // Use configured base path
  const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/RSS/next'

  // Load feed index
  const loadFeedIndex = useCallback(async () => {
    try {
      // Fetch from the base path (served from public/feeds in dev, or root feeds/ in prod?)
      // Wait, in prod (GitHub Pages), feeds are at /RSS/feeds/..., NOT /RSS/next/feeds/...
      // In dev (Next.js), feeds are at /RSS/next/feeds/... (from public/feeds)
      
      // We need a way to distinguish data source origin.
      // Prod: /RSS/feeds/index.json
      // Dev: /RSS/next/feeds/index.json (because of basePath)
      
      const isDev = process.env.NODE_ENV === 'development'
      const dataUrl = isDev ? `${BASE_PATH}/feeds/index.json` : '/RSS/feeds/index.json'

      const response = await fetch(dataUrl)
      if (!response.ok) {
        throw new Error(`Failed to load feed index: ${response.statusText}`)
      }
      const data = await response.json()
      setFeedIndex(data)
      setLoadingIndex(false)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed index')
      console.error('Error loading feed index:', err)
      setLoadingIndex(false)
      return []
    }
  }, [BASE_PATH])

  // Load a single feed
  const loadFeed = useCallback(async (feedInfo: FeedIndex): Promise<Feed | null> => {
    try {
      const isDev = process.env.NODE_ENV === 'development'
      // Handle feed.output which usually starts with 'feeds/'
      // Prod: /RSS/feeds/xxx.json
      // Dev: /RSS/next/feeds/xxx.json
      
      const relativePath = feedInfo.output.startsWith('/') ? feedInfo.output.slice(1) : feedInfo.output
      const baseUrl = isDev ? BASE_PATH : '/RSS'
      const url = `${baseUrl}/${relativePath}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to load ${feedInfo.name}`)
      }
      const data: Feed = await response.json()
      return data
    } catch (err) {
      console.error(`Error loading feed ${feedInfo.name}:`, err)
      return null
    }
  }, [BASE_PATH])

  // Load all feeds progressively
  const loadAllFeeds = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLoadedCount(0)
    // Don't clear feeds to avoid flashing

    try {
      // Load index first
      const index = await loadFeedIndex()

      // Stop loading spinner immediately to show progressive loading
      setLoading(false)

      const CONCURRENT = 5
      for (let i = 0; i < index.length; i += CONCURRENT) {
        const batch = index.slice(i, i + CONCURRENT)

        await Promise.allSettled(
          batch.map(async (feedInfo: FeedIndex) => {
            const feed = await loadFeed(feedInfo)
            if (feed) {
              setFeeds(prev => {
                const newMap = new Map(prev)
                newMap.set(feedInfo.id, feed)
                return newMap
              })
              setLoadedCount(prev => prev + 1)
            }
          })
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feeds')
      console.error('Error loading feeds:', err)
      setLoading(false)
    }
  }, [loadFeedIndex, loadFeed])

  useEffect(() => {
    loadAllFeeds()
  }, [loadAllFeeds])

  return {
    feedIndex,
    feeds,
    loading,
    loadingIndex,
    loadedCount,
    error,
    loadAllFeeds
  }
}
