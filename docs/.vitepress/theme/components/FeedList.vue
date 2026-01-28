<template>
  <aside class="sidebar">
    <h2 class="feed-list-title">订阅源</h2>
    <ul class="feed-list">
      <li
        class="feed-item"
        :class="{ active: selectedFeed === 'all' }"
        @click="selectFeed('all')"
      >
        <span class="feed-icon">📰</span>
        <span class="feed-name">全部</span>
        <span class="feed-count" v-if="totalCount > 0">({{ totalCount }})</span>
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

function getFeedCount(feedId: string): number {
  const feed = props.feeds.get(feedId)
  return feed?.items?.length || 0
}

function selectFeed(feedId: string) {
  emit('update:selectedFeed', feedId)
}
</script>

<style scoped>
.feed-list-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding: 0 0.75rem;
  color: var(--vp-c-text-1);
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
