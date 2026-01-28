<template>
  <Teleport to="body">
    <div class="article-detail-overlay" @click.self="$emit('close')">
      <div class="article-detail-modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ article.title }}</h2>
          <button class="close-btn" @click="$emit('close')" aria-label="关闭">
            <span class="close-icon">×</span>
          </button>
        </div>

        <div class="modal-meta">
          <span class="meta-source">{{ article.source }}</span>
          <span class="meta-divider">·</span>
          <span class="meta-date">{{ formattedDate }}</span>
        </div>

        <div class="modal-content" v-html="article.content_html"></div>

        <div class="modal-footer">
          <a
            :href="article.url"
            target="_blank"
            rel="noopener noreferrer"
            class="read-original-btn"
          >
            阅读原文 →
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { Article } from '../composables/useFeeds'

const props = defineProps<{
  article: Article
}>()

defineEmits<{
  close: []
}>()

const formattedDate = computed(() => {
  const date = new Date(props.article.date_published)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// 禁止背景滚动
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.article-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.article-detail-modal {
  background: var(--vp-c-bg);
  border-radius: 12px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: auto;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.4;
  margin: 0;
  color: var(--vp-c-text-1);
  flex: 1;
}

.close-btn {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--vp-c-bg-mute);
  transform: scale(1.05);
}

.close-icon {
  font-size: 2rem;
  line-height: 1;
  color: var(--vp-c-text-2);
}

.modal-meta {
  padding: 1rem 2rem;
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}

.meta-divider {
  margin: 0 0.5rem;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  line-height: 1.8;
  color: var(--vp-c-text-1);
}

.modal-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.modal-content :deep(p) {
  margin: 1rem 0;
}

.modal-content :deep(h1),
.modal-content :deep(h2),
.modal-content :deep(h3) {
  margin: 2rem 0 1rem;
  color: var(--vp-c-text-1);
}

.modal-content :deep(a) {
  color: var(--vp-c-brand);
  text-decoration: none;
}

.modal-content :deep(a:hover) {
  text-decoration: underline;
}

.modal-content :deep(pre) {
  background: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

.modal-content :deep(blockquote) {
  border-left: 4px solid var(--vp-c-brand);
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: var(--vp-c-text-2);
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: flex-end;
}

.read-original-btn {
  padding: 0.75rem 1.5rem;
  background: var(--vp-c-brand);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.read-original-btn:hover {
  background: var(--vp-c-brand-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 暗色模式优化 */
.dark .article-detail-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.dark .article-detail-modal {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .article-detail-modal {
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  }

  .modal-header,
  .modal-meta,
  .modal-content,
  .modal-footer {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--vp-c-divider);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-text-3);
}
</style>
