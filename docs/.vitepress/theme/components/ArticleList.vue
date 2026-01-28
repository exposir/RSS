<template>
  <div class="article-list">
    <div v-if="articles.length === 0" class="empty-state">
      <p>暂无文章</p>
    </div>
    <ArticleCard
      v-for="article in displayedArticles"
      :key="article.id"
      :article="article"
    />
    <div v-if="hasMore" class="load-more">
      <button @click="loadMore" class="load-more-btn">
        加载更多
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ArticleCard from './ArticleCard.vue'
import type { Article } from '../composables/useFeeds'

const props = defineProps<{
  articles: Article[]
}>()

const displayCount = ref(50)
const LOAD_MORE_COUNT = 30

const displayedArticles = computed(() => {
  return props.articles.slice(0, displayCount.value)
})

const hasMore = computed(() => {
  return props.articles.length > displayCount.value
})

function loadMore() {
  displayCount.value += LOAD_MORE_COUNT
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
