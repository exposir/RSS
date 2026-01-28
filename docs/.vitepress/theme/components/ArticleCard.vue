<template>
  <article class="article-card" @click="openArticle">
    <h3 class="article-title">{{ article.title }}</h3>
    <div class="article-meta">
      <span class="article-source">{{ article.source }}</span>
      <span class="article-divider">·</span>
      <span class="article-date">{{ formattedDate }}</span>
    </div>
    <div v-if="article.content_text" class="article-summary">
      {{ truncatedSummary }}
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Article } from '../composables/useFeeds'

const props = defineProps<{
  article: Article
}>()

const formattedDate = computed(() => {
  const date = new Date(props.article.date_published)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInHours < 1) {
    return '刚刚'
  } else if (diffInHours < 24) {
    return `${diffInHours} 小时前`
  } else if (diffInDays < 7) {
    return `${diffInDays} 天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
})

const truncatedSummary = computed(() => {
  const text = props.article.content_text || ''
  const maxLength = 200
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
})

function openArticle() {
  window.open(props.article.url, '_blank', 'noopener,noreferrer')
}
</script>
