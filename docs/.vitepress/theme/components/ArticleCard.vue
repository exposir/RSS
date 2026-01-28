<template>
  <article class="article-card" @click="$emit('open-detail', article)">
    <div v-if="coverImage" class="article-cover">
      <img :src="coverImage" :alt="article.title" loading="lazy" />
    </div>
    <div class="article-content">
      <h3 class="article-title">{{ article.title }}</h3>
      <div class="article-meta">
        <span class="article-source">{{ article.source }}</span>
        <span class="article-divider">·</span>
        <span class="article-date">{{ formattedDate }}</span>
      </div>
      <div v-if="article.content_text" class="article-summary">
        {{ truncatedSummary }}
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Article } from '../composables/useFeeds'

const props = defineProps<{
  article: Article
}>()

defineEmits<{
  'open-detail': [article: Article]
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

// 提取封面图片
const coverImage = computed(() => {
  if (!props.article.content_html) return null

  // 从 HTML 中提取第一张图片
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i
  const match = props.article.content_html.match(imgRegex)

  return match ? match[1] : null
})
</script>

<style scoped>
.article-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.article-cover {
  flex-shrink: 0;
  width: 180px;
  height: 120px;
  overflow: hidden;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.article-content {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .article-card {
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    height: 200px;
  }
}
</style>
