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
      <!-- 左侧：订阅源列表 -->
      <FeedList
        :feed-index="feedIndex"
        :feeds="feeds"
        v-model:selected-feed="selectedFeed"
      />

      <!-- 中间：文章标题列表 -->
      <div class="article-list-panel">
        <div class="panel-header">
          <div class="header-top">
            <h2 class="panel-title">{{ selectedFeedName }}</h2>
            <div class="header-actions">
              <button
                v-if="isLoading"
                class="loading-indicator"
                @click="handleRefresh"
                title="点击重新加载"
              >
                🔄 加载中 ({{ loadedCount }}/{{ feedIndex.length }})
              </button>
              <button
                v-else
                class="refresh-btn"
                @click="handleRefresh"
                title="重新加载所有订阅源"
              >
                🔄 刷新
              </button>
            </div>
          </div>

          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文章标题或来源..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search" title="清空搜索">✕</button>
          </div>
        </div>

        <div v-if="filteredArticles.length === 0 && !isLoading" class="empty-hint">
          <p>暂无文章</p>
        </div>

        <ul v-else class="article-list">
          <li
            v-for="article in displayedArticles"
            :key="`${article.feedId}-${article.id}`"
            class="article-item"
            :class="{ active: selectedArticle?.id === article.id }"
            @click="selectedArticle = article"
          >
            <h3 class="article-item-title">{{ article.title }}</h3>
            <div class="article-item-meta">
              <span class="article-item-source">{{ article.source }}</span>
              <span class="article-item-date">{{ formatDate(article.date_published) }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- 右侧：文章详情 -->
      <div class="article-detail-panel">
        <div v-if="!selectedArticle" class="no-selection">
          <p>请选择一篇文章</p>
        </div>
        <div v-else class="article-detail">
          <div class="detail-header">
            <a
              :href="selectedArticle.url"
              target="_blank"
              rel="noopener noreferrer"
              class="detail-title"
            >
              {{ selectedArticle.title }}
            </a>
            <div class="detail-meta">
              <span class="meta-source">{{ selectedArticle.source }}</span>
              <span class="meta-divider">·</span>
              <span class="meta-date">{{ formatDetailDate(selectedArticle.date_published) }}</span>
            </div>
          </div>
          <div class="detail-content" v-html="selectedArticle.content_html"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFeeds } from '../composables/useFeeds'
import type { Article } from '../composables/useFeeds'
import FeedList from './FeedList.vue'

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
const selectedArticle = ref<Article | null>(null)
const searchQuery = ref('')

// 监听 selectedFeed 变化，调试用
watch(selectedFeed, (newVal, oldVal) => {
  console.log('selectedFeed changed:', { from: oldVal, to: newVal })
  console.log('feeds.value.has:', newVal === 'all' ? 'all' : feeds.value.has(newVal))
  console.log('feeds.value.size:', feeds.value.size)

  // 切换订阅源时重置选中文章
  selectedArticle.value = null
  // 切换订阅源时也可以选择是否重置搜索，这里暂不重置，方便在不同源下搜同一个词
  // searchQuery.value = ''
})

const selectedFeedName = computed(() => {
  if (selectedFeed.value === 'all') {
    return '今日更新'
  }
  if (selectedFeed.value === 'yesterday') {
    return '昨日回顾'
  }
  const feed = feedIndex.value.find(f => f.id === selectedFeed.value)
  return feed?.name || '未知订阅源'
})

const filteredArticles = computed(() => {
  console.log('filteredArticles computed, selectedFeed:', selectedFeed.value)

  // 直接在 computed 内部实现过滤逻辑,确保响应式追踪
  const articles: Article[] = []

  if (selectedFeed.value === 'all') {
    const todayStr = new Date().toDateString()

    // 获取所有今日更新的文章
    Array.from(feeds.value.entries()).forEach(([feedId, feed]) => {
      const feedInfo = feedIndex.value.find(f => f.id === feedId)
      if (feed && feed.items && feedInfo) {
        feed.items.forEach((item) => {
          // 只保留今天的文章
          if (new Date(item.date_published).toDateString() === todayStr) {
            articles.push({
              ...item,
              source: feed.title || feedInfo.name,
              feedId: feedId
            })
          }
        })
      }
    })
  } else if (selectedFeed.value === 'yesterday') {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    // 获取所有昨日更新的文章
    Array.from(feeds.value.entries()).forEach(([feedId, feed]) => {
      const feedInfo = feedIndex.value.find(f => f.id === feedId)
      if (feed && feed.items && feedInfo) {
        feed.items.forEach((item) => {
          // 只保留昨天的文章
          if (new Date(item.date_published).toDateString() === yesterdayStr) {
            articles.push({
              ...item,
              source: feed.title || feedInfo.name,
              feedId: feedId
            })
          }
        })
      }
    })
  } else {
    // 获取特定订阅源的文章
    const feedInfo = feedIndex.value.find(f => f.id === selectedFeed.value)
    const feed = feeds.value.get(selectedFeed.value)

    console.log('filtering for feedId:', selectedFeed.value, 'feed exists:', !!feed, 'items:', feed?.items?.length || 0)

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

  console.log('filteredArticles result count:', articles.length)

  // 打印前5篇文章的来源和标题，用于调试
  if (articles.length > 0) {
    console.log('前5篇文章:', articles.slice(0, 5).map(a => ({
      source: a.source,
      feedId: a.feedId,
      title: a.title.substring(0, 30)
    })))
  }

  // 搜索过滤
  let result = articles
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(article =>
      article.title.toLowerCase().includes(query) ||
      article.source.toLowerCase().includes(query)
    )
  }

  // 按日期倒序排列
  return result.sort((a, b) =>
    new Date(b.date_published).getTime() - new Date(a.date_published).getTime()
  )
})

const displayedArticles = computed(() => {
  return filteredArticles.value
})

const isLoading = computed(() => {
  return loadedCount.value < feedIndex.value.length
})

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInHours < 1) {
    return '刚刚'
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
  }
}

function formatDetailDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function handleRefresh() {
  console.log('手动刷新：重新加载所有订阅源')

  // 重置状态
  selectedArticle.value = null

  // 重新加载所有数据
  await loadAllFeeds()
}
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

.reader-container {
  display: grid;
  grid-template-columns: 240px 320px 1fr;
  height: calc(100vh - var(--vp-nav-height));
  gap: 0;
}

/* 中间：文章列表面板 */
.article-list-panel {
  border-right: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.panel-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--vp-c-text-1);
}

.panel-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

/* 搜索框样式 */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.4rem 2rem 0.4rem 2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  transition: all 0.2s;
  -webkit-appearance: none; /* 移除 iOS 默认样式 */
}

.search-input:focus {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 0.6rem;
  font-size: 0.9rem;
  opacity: 0.5;
  pointer-events: none;
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: var(--vp-c-text-3);
  cursor: pointer;
  font-size: 0.8rem;
  width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.clear-search:hover {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
}

.loading-indicator {
  font-size: 0.85rem;
  color: var(--vp-c-brand);
  font-weight: 400;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.loading-indicator:hover {
  background: var(--vp-c-bg-soft);
}

.refresh-btn {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-weight: 400;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.refresh-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand);
}

.refresh-btn:active,
.loading-indicator:active {
  transform: scale(0.95);
}

.empty-hint {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--vp-c-text-3);
}

.article-list {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
}

.article-item {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: background 0.2s;
}

.article-item:hover {
  background: var(--vp-c-bg-soft);
}

.article-item.active {
  background: var(--vp-c-bg-mute);
  border-left: 3px solid var(--vp-c-brand);
  padding-left: calc(1.25rem - 3px);
}

.article-item-title {
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 0.2rem 0; /* 减小标题下边距 */
  color: var(--vp-c-text-1);
  /* 移除行数限制以适配沉浸式翻译 */
  display: block;
  word-wrap: break-word;
}

/* 尝试强制换行翻译内容（适配常见的翻译插件） */
.article-item-title :deep(font),
.article-item-title :deep(span[lang]) {
  display: block;
  margin-top: 0; /* 移除额外的顶部间距 */
  font-size: 1em; /* 保持与原文一致的字号 */
  opacity: 1; /* 保持不透明，提高清晰度 */
  line-height: 1.4;
}

/* 隐藏翻译插件可能注入的 br 标签，防止产生过大间距 */
.article-item-title :deep(br) {
  display: none;
}

.article-item-meta {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  display: flex;
  align-items: flex-start; /* 顶对齐，避免高度差异导致对齐问题 */
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem; /* 减小间距 */
}

.article-item-source {
  color: var(--vp-c-text-2);
  font-weight: 500;
  /* 允许来源内部换行 */
  display: block;
  /* width: 100%; 移除独占一行，让布局更紧凑 */
}

/* 强制来源和日期的翻译内容换行 */
.article-item-meta :deep(font),
.article-item-meta :deep(span[lang]) {
  display: block;
  margin-top: 0;
  width: 100%;
  line-height: 1.2;
}

/* 隐藏元数据里的 br */
.article-item-meta :deep(br) {
  display: none;
}

.load-more {
  padding: 1rem;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--vp-c-divider);
}

.load-more-btn {
  padding: 0.5rem 1.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-brand);
  background: transparent;
  border: 1px solid var(--vp-c-brand);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.load-more-btn:hover {
  background: var(--vp-c-brand);
  color: #fff;
}

/* 右侧：文章详情面板 */
.article-detail-panel {
  overflow-y: auto;
  height: 100%;
  background: var(--vp-c-bg);
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--vp-c-text-3);
}

.article-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  padding: 1.5rem 2rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.detail-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
  color: var(--vp-c-text-1);
  text-decoration: none;
  display: block;
  transition: color 0.2s;
}

.detail-title:hover {
  color: var(--vp-c-brand);
}

.detail-meta {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.meta-divider {
  margin: 0 0.5rem;
}

.meta-source {
  font-weight: 500;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  line-height: 1.7;
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
}

.detail-content :deep(img) {
  max-width: 100%;
  max-height: 500px;
  height: auto;
  border-radius: 8px;
  margin: 1.25rem 0;
  object-fit: contain;
}

.detail-content :deep(p) {
  margin: 0.85rem 0;
}

.detail-content :deep(h1),
.detail-content :deep(h2),
.detail-content :deep(h3) {
  margin: 1.5rem 0 0.85rem;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
  line-height: 1.4;
}

.detail-content :deep(a) {
  color: var(--vp-c-brand);
  text-decoration: none;
}

.detail-content :deep(a:hover) {
  text-decoration: underline;
}

.detail-content :deep(pre) {
  background: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

.detail-content :deep(blockquote) {
  border-left: 4px solid var(--vp-c-brand);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--vp-c-text-2);
}

/* 滚动条样式 */
.article-list::-webkit-scrollbar,
.article-detail-panel::-webkit-scrollbar,
.detail-content::-webkit-scrollbar {
  width: 8px;
}

.article-list::-webkit-scrollbar-track,
.article-detail-panel::-webkit-scrollbar-track,
.detail-content::-webkit-scrollbar-track {
  background: transparent;
}

.article-list::-webkit-scrollbar-thumb,
.article-detail-panel::-webkit-scrollbar-thumb,
.detail-content::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 4px;
}

.article-list::-webkit-scrollbar-thumb:hover,
.article-detail-panel::-webkit-scrollbar-thumb:hover,
.detail-content::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-text-3);
}

/* 移动端适配 */
@media (max-width: 1024px) {
  .reader-container {
    grid-template-columns: 200px 280px 1fr;
  }
}

@media (max-width: 768px) {
  .reader-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .article-detail-panel {
    display: none;
  }
}
</style>
