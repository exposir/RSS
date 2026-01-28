<template>
  <div class="reader-wrapper">
    <div v-if="loadingIndex" class="loading-spinner">
      <p>加载订阅源列表...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>加载失败: {{ error }}</p>
      <button @click="loadAllFeeds" class="retry-btn">重试</button>
    </div>

    <div v-else class="reader-container">
      <FeedList
        :feed-index="feedIndex"
        :feeds="feeds"
        v-model:selected-feed="selectedFeed"
      />

      <main class="content-main">
        <div class="content-header">
          <h1 class="content-title">
            {{ selectedFeedName }}
          </h1>
          <p class="content-count">
            <span v-if="filteredArticles.length > 0">
              共 {{ filteredArticles.length }} 篇文章
            </span>
            <span v-if="isLoading" class="loading-indicator">
              · 正在加载 ({{ loadedCount }}/{{ feedIndex.length }})
            </span>
          </p>
        </div>

        <div v-if="filteredArticles.length === 0 && !isLoading" class="empty-hint">
          <p>暂无文章</p>
        </div>

        <ArticleList v-else :articles="filteredArticles" />

        <div v-if="isLoading" class="loading-more">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>加载更多订阅源中...</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFeeds } from '../composables/useFeeds'
import FeedList from './FeedList.vue'
import ArticleList from './ArticleList.vue'

const {
  feedIndex,
  feeds,
  loading,
  loadingIndex,
  loadedCount,
  error,
  loadAllFeeds,
  getAllArticles,
  getArticlesByFeed
} = useFeeds()

const selectedFeed = ref('all')

const selectedFeedName = computed(() => {
  if (selectedFeed.value === 'all') {
    return '全部文章'
  }
  const feed = feedIndex.value.find(f => f.id === selectedFeed.value)
  return feed?.name || '未知订阅源'
})

const filteredArticles = computed(() => {
  // 直接在 computed 内部实现过滤逻辑,确保响应式追踪
  const articles: Article[] = []

  if (selectedFeed.value === 'all') {
    // 获取所有文章
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
  } else {
    // 获取特定订阅源的文章
    const feedInfo = feedIndex.value.find(f => f.id === selectedFeed.value)
    const feed = feeds.value.get(selectedFeed.value)

    if (feed && feed.items && feedInfo) {
      feed.items.forEach(item => {
        articles.push({
          ...item,
          source: feed.title || feedInfo.name,
          feedId: selectedFeed.value
        })
      })
    }
  }

  // 按日期倒序排列
  return articles.sort((a, b) =>
    new Date(b.date_published).getTime() - new Date(a.date_published).getTime()
  )
})

const isLoading = computed(() => {
  return loadedCount.value < feedIndex.value.length
})
</script>

<style scoped>
.reader-wrapper {
  width: 100%;
  min-height: 60vh;
}

.loading-spinner,
.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--vp-c-text-2);
}

.error-state p {
  margin-bottom: 1rem;
  color: var(--vp-c-danger);
}

.retry-btn {
  padding: 0.5rem 1.5rem;
  font-size: 0.95rem;
  color: var(--vp-c-brand);
  background: transparent;
  border: 1px solid var(--vp-c-brand);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.retry-btn:hover {
  background: var(--vp-c-brand);
  color: #fff;
}

.content-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--vp-c-divider);
}

.content-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-text-1);
}

.content-count {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-indicator {
  color: var(--vp-c-brand);
  font-size: 0.9rem;
}

.empty-hint {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-3);
}

.loading-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 1rem;
}

.loading-more p {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin: 0;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--vp-c-brand);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
