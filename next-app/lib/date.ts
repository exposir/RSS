/**
 * [INPUT]: Date objects or strings
 * [OUTPUT]: Formatted date strings and comparison logic
 * [POS]: next-app/lib/ Utility for date handling
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export const isDateMatch = (dateStr: string, targetDate: Date) => {
  const d = new Date(dateStr)
  return d.getDate() === targetDate.getDate() &&
         d.getMonth() === targetDate.getMonth() &&
         d.getFullYear() === targetDate.getFullYear()
}

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

export const formatDetailDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

export const isToday = (dateStr: string) => {
  const today = new Date()
  return isDateMatch(dateStr, today)
}

export const isYesterday = (dateStr: string) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return isDateMatch(dateStr, yesterday)
}
