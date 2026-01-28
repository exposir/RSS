<template>
  <div class="reader-wrapper">
    <div v-if="loading" class="loading-spinner">
      <p>加载中...</p>
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
            共 {{ filteredArticles.length }} 篇文章
          </p>
        </div>

        <ArticleList :articles="filteredArticles" />
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
  if (selectedFeed.value === 'all') {
    return getAllArticles()
  }
  return getArticlesByFeed(selectedFeed.value)
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
}
</style>
