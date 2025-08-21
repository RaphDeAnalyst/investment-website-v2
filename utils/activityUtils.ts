// utils/activityUtils.ts
import { ActivityItem } from '../types/activityTypes'

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  
  // Fix: Use more accurate time difference calculation
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  // Fix: More accurate "today" detection
  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = diffDays === 1
  
  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'
  if (diffDays <= 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Icon paths for different activity types
export const getActivityIconPath = (type: ActivityItem['type']): string => {
  switch (type) {
    case 'investment':
      return "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    case 'withdrawal':
      return "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    case 'return':
    case 'dividend':
      return "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    case 'deposit':
      return "M12 6v6m0 0v6m0-6h6m-6 0H6"
    default:
      return "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
  }
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'failed':
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'active':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getAmountColor = (type: ActivityItem['type']): string => {
  switch (type) {
    case 'return':
    case 'dividend':
    case 'deposit':
      return 'text-green-700'
    case 'investment':
    case 'withdrawal':
      return 'text-red-600'
    default:
      return 'text-gray-700'
  }
}

export const calculateInvestmentProgress = (startDate: string, maturityDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(maturityDate)
  const now = new Date()
  
  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  
  return Math.min(Math.max((elapsed / total) * 100, 0), 100)
}

export const isActivityInTimeRange = (activityDate: string, timeRange: string): boolean => {
  if (timeRange === 'all') return true
  
  const date = new Date(activityDate)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const ranges = { '7d': 7, '30d': 30, '90d': 90 }
  return diffDays <= ranges[timeRange as keyof typeof ranges]
}

export const isActivityOfType = (activity: ActivityItem, filter: string): boolean => {
  if (filter === 'all') return true
  if (filter === 'investments') return activity.type === 'investment'
  if (filter === 'withdrawals') return activity.type === 'withdrawal'
  if (filter === 'returns') return ['return', 'dividend'].includes(activity.type)
  return false
}

export const searchActivities = (activities: ActivityItem[], query: string): ActivityItem[] => {
  if (!query.trim()) return activities
  
  const searchTerm = query.toLowerCase()
  return activities.filter(activity => 
    activity.title.toLowerCase().includes(searchTerm) ||
    activity.description.toLowerCase().includes(searchTerm) ||
    activity.investment_name?.toLowerCase().includes(searchTerm) ||
    activity.payment_method?.toLowerCase().includes(searchTerm) ||
    activity.status.toLowerCase().includes(searchTerm)
  )
}