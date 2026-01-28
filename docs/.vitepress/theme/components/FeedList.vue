<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="feed-list-title">订阅源</h2>
      <span class="total-count" v-if="totalCount > 0">{{ totalCount }} 篇</span>
    </div>
    <ul class="feed-list">
      <li
        class="feed-item"
        :class="{ active: selectedFeed === 'all' }"
        @click="selectFeed('all')"
      >
        <span class="feed-icon">📅</span>
        <span class="feed-name">今日</span>
        <span class="feed-count" v-if="todayCount > 0">({{ todayCount }})</span>
      </li>
      <li
        class="feed-item"
        :class="{ active: selectedFeed === 'yesterday' }"
        @click="selectFeed('yesterday')"
      >
        <span class="feed-icon">⏮️</span>
        <span class="feed-name">昨日</span>
        <span class="feed-count" v-if="yesterdayCount > 0">({{ yesterdayCount }})</span>
      </li>
      <li
        v-for="feed in feedIndex"
        :key="feed.id"
        class="feed-item"
        :class="{ active: selectedFeed === feed.id }"
        @click="selectFeed(feed.id)"
      >
        <span class="feed-icon">📄</span>
        <span class="feed-name">{{ feed.name }}</span>
        <span class="feed-count" v-if="getFeedCount(feed.id) > 0">
          ({{ getFeedCount(feed.id) }})
        </span>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FeedIndex, Feed } from '../composables/useFeeds'

const props = defineProps<{
  feedIndex: FeedIndex[]
  feeds: Map<string, Feed>
  selectedFeed: string
}>()

const emit = defineEmits<{
  'update:selectedFeed': [feedId: string]
}>()

const totalCount = computed(() => {
  let count = 0
  props.feeds.forEach(feed => {
    count += feed.items?.length || 0
  })
  return count
})

const todayCount = computed(() => {
  let count = 0
  const today = new Date().toDateString()

  props.feeds.forEach(feed => {
    feed.items?.forEach(item => {
      if (new Date(item.date_published).toDateString() === today) {
        count++
      }
    })
  })
  return count
})

const yesterdayCount = computed(() => {
  let count = 0
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  props.feeds.forEach(feed => {
    feed.items?.forEach(item => {
      if (new Date(item.date_published).toDateString() === yesterdayStr) {
        count++
      }
    })
  })
  return count
})

function getFeedCount(feedId: string): number {
  const feed = props.feeds.get(feedId)
  return feed?.items?.length || 0
}

function selectFeed(feedId: string) {
  emit('update:selectedFeed', feedId)
}
</script>

<style scoped>
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  margin-bottom: 1rem;
}

.feed-list-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--vp-c-text-1);
}

.total-count {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  font-weight: 400;
}

.feed-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.feed-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feed-count {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
</style>
