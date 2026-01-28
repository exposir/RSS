<template>
  <div class="top-search">
    <div class="search-container">
      <span class="search-icon">🔍</span>
      <input
        type="text"
        placeholder="搜索文章..."
        v-model="query"
        @keydown.enter="handleSearch"
        class="search-input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const query = ref('')

function handleSearch() {
  if (!query.value.trim()) return

  // 跳转到阅读器页面(首页)并带上参数
  // 获取当前 base 路径
  const base = import.meta.env.BASE_URL
  // 移除 base 结尾的斜杠以便拼接
  const baseUrl = base.endsWith('/') ? base : base + '/'

  // 导航
  window.location.href = `${baseUrl}?search=${encodeURIComponent(query.value)}`
}
</script>

<style scoped>
.top-search {
  display: flex;
  align-items: center;
  padding-left: 16px;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 10px 6px 30px;
  font-size: 13px;
  width: 140px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}

.search-input:focus {
  width: 200px;
  border-color: var(--vp-c-brand);
  background: var(--vp-c-bg);
  outline: none;
}

.search-icon {
  position: absolute;
  left: 8px;
  font-size: 12px;
  opacity: 0.5;
  pointer-events: none;
}

/* 移动端隐藏，节省空间 */
@media (max-width: 768px) {
  .top-search {
    display: none;
  }
}
</style>