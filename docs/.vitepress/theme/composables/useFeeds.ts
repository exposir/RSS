import { ref, onMounted } from 'vue'

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
  const feedIndex = ref<FeedIndex[]>([])
  const feeds = ref<Map<string, Feed>>(new Map())
  const loading = ref(true)
  const loadingIndex = ref(true)
  const error = ref<string | null>(null)
  const loadedCount = ref(0)

  // Load feed index
  async function loadFeedIndex() {
    try {
      const response = await fetch('/RSS/feeds/index.json')
      if (!response.ok) {
        throw new Error(`Failed to load feed index: ${response.statusText}`)
      }
      feedIndex.value = await response.json()
      loadingIndex.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load feed index'
      console.error('Error loading feed index:', err)
      loadingIndex.value = false
    }
  }

  // Load a single feed
  async function loadFeed(feedInfo: FeedIndex): Promise<Feed | null> {
    try {
      const response = await fetch(`/RSS/${feedInfo.output}`)
      if (!response.ok) {
        throw new Error(`Failed to load ${feedInfo.name}`)
      }
      const data: Feed = await response.json()
      return data
    } catch (err) {
      console.error(`Error loading feed ${feedInfo.name}:`, err)
      return null
    }
  }

  // Load all feeds progressively
  async function loadAllFeeds() {
    loading.value = true
    error.value = null

    // 注意：不要清空 feeds.value.clear()，否则刷新时会导致 UI 空白
    // 只重置计数器
    loadedCount.value = 0

    try {
      // 先加载索引
      await loadFeedIndex()

      // 立即显示页面（loading = false）
      loading.value = false

      // 逐个加载 feeds，每加载完一个就立即显示
      const CONCURRENT = 5 // 同时加载 5 个
      for (let i = 0; i < feedIndex.value.length; i += CONCURRENT) {
        const batch = feedIndex.value.slice(i, i + CONCURRENT)

        // 并发加载这一批
        await Promise.allSettled(
          batch.map(async (feedInfo) => {
            const feed = await loadFeed(feedInfo)
            if (feed) {
              // 立即更新 feeds Map，触发响应式更新
              feeds.value.set(feedInfo.id, feed)
              loadedCount.value++

              // 强制触发响应式更新
              feeds.value = new Map(feeds.value)
            }
          })
        )
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load feeds'
      console.error('Error loading feeds:', err)
      loading.value = false
    }
  }

  // Get all articles sorted by date
  function getAllArticles(): Article[] {
    const articles: Article[] = []

    // 遍历 Map 以确保响应式追踪
    Array.from(feeds.value.entries()).forEach(([feedId, feed]) => {
      const feedInfo = feedIndex.value.find(f => f.id === feedId)
      if (feed && feed.items && feedInfo) {
        feed.items.forEach((item) => {
          articles.push({
            ...item,
            source: feed.title || feedInfo.name,
            feedId: feedId
          })
        })
      }
    })

    return articles.sort((a, b) =>
      new Date(b.date_published).getTime() - new Date(a.date_published).getTime()
    )
  }

  // Get articles from a specific feed
  function getArticlesByFeed(feedId: string): Article[] {
    const feedInfo = feedIndex.value.find(f => f.id === feedId)
    if (!feedInfo) return []

    // 直接访问 Map 以确保响应式追踪
    const feed = feeds.value.get(feedId)
    if (!feed || !feed.items) return []

    return feed.items.map(item => ({
      ...item,
      source: feed.title || feedInfo.name,
      feedId: feedId
    })).sort((a, b) =>
      new Date(b.date_published).getTime() - new Date(a.date_published).getTime()
    )
  }

  onMounted(() => {
    loadAllFeeds()
  })

  return {
    feedIndex,
    feeds,
    loading,
    loadingIndex,
    loadedCount,
    error,
    loadAllFeeds,
    getAllArticles,
    getArticlesByFeed
  }
}
