<template>
  <div class="article-list">
    <div v-if="articles.length === 0" class="empty-state">
      <p>暂无文章</p>
    </div>
    <ArticleCard
      v-for="article in displayedArticles"
      :key="`${article.feedId}-${article.id}`"
      :article="article"
      @open-detail="openDetail"
    />
    <div v-if="hasMore" class="load-more">
      <button @click="loadMore" class="load-more-btn">
        加载更多
      </button>
    </div>

    <!-- 文章详情弹窗 -->
    <ArticleDetail
      v-if="selectedArticle"
      :article="selectedArticle"
      @close="selectedArticle = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ArticleCard from './ArticleCard.vue'
import ArticleDetail from './ArticleDetail.vue'
import type { Article } from '../composables/useFeeds'

const props = defineProps<{
  articles: Article[]
}>()

const displayCount = ref(50)
const LOAD_MORE_COUNT = 30
const selectedArticle = ref<Article | null>(null)

// 当文章列表变化时，重置显示数量和选中文章
watch(() => props.articles, () => {
  displayCount.value = 50
  selectedArticle.value = null
  console.log('ArticleList: articles changed, count:', props.articles.length)
})

const displayedArticles = computed(() => {
  const result = props.articles.slice(0, displayCount.value)
  console.log('displayedArticles computed, showing:', result.length, 'first article source:', result[0]?.source)
  return result
})

const hasMore = computed(() => {
  return props.articles.length > displayCount.value
})

function loadMore() {
  displayCount.value += LOAD_MORE_COUNT
}

function openDetail(article: Article) {
  selectedArticle.value = article
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  font-size: 0.95rem;
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
</style>
