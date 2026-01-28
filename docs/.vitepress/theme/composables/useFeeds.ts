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
  const error = ref<string | null>(null)

  // Load feed index
  async function loadFeedIndex() {
    try {
      const response = await fetch('/RSS/feeds/index.json')
      if (!response.ok) {
        throw new Error(`Failed to load feed index: ${response.statusText}`)
      }
      feedIndex.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load feed index'
      console.error('Error loading feed index:', err)
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

  // Load all feeds
  async function loadAllFeeds() {
    loading.value = true
    error.value = null

    try {
      await loadFeedIndex()

      // Load feeds in batches to avoid overwhelming the browser
      const BATCH_SIZE = 10
      for (let i = 0; i < feedIndex.value.length; i += BATCH_SIZE) {
        const batch = feedIndex.value.slice(i, i + BATCH_SIZE)
        const results = await Promise.allSettled(
          batch.map(async (feedInfo) => {
            const feed = await loadFeed(feedInfo)
            if (feed) {
              feeds.value.set(feedInfo.id, feed)
            }
            return feed
          })
        )
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load feeds'
      console.error('Error loading feeds:', err)
    } finally {
      loading.value = false
    }
  }

  // Get all articles sorted by date
  function getAllArticles(): Article[] {
    const articles: Article[] = []

    feedIndex.value.forEach((feedInfo) => {
      const feed = feeds.value.get(feedInfo.id)
      if (feed && feed.items) {
        feed.items.forEach((item) => {
          articles.push({
            ...item,
            source: feed.title || feedInfo.name,
            feedId: feedInfo.id
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
    error,
    loadAllFeeds,
    getAllArticles,
    getArticlesByFeed
  }
}
