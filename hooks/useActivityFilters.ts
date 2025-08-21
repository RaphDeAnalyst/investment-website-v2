// hooks/useActivityFilters.ts
import { useState, useMemo, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import { 
  ActivityItem, 
  ActivityFilter, 
  TimeRangeFilter, 
  ActivityFilters 
} from '../types/activityTypes'
import { 
  isActivityInTimeRange, 
  isActivityOfType, 
  searchActivities 
} from '../utils/activityUtils'

interface UseActivityFiltersReturn {
  filters: ActivityFilters
  filteredActivities: ActivityItem[]
  setTypeFilter: (type: ActivityFilter) => void
  setTimeRangeFilter: (range: TimeRangeFilter) => void
  setSearchQuery: (query: string) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export function useActivityFilters(activities: ActivityItem[]): UseActivityFiltersReturn {
  const [typeFilter, setTypeFilter] = useState<ActivityFilter>('all')
  const [timeRangeFilter, setTimeRangeFilter] = useState<TimeRangeFilter>('30d')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Combine all filters into a single object
  const filters: ActivityFilters = useMemo(() => ({
    type: typeFilter,
    timeRange: timeRangeFilter,
    searchQuery: debouncedSearchQuery
  }), [typeFilter, timeRangeFilter, debouncedSearchQuery])

  // Memoized filtering logic for performance
  const filteredActivities = useMemo(() => {
    let result = activities

    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter(activity => isActivityOfType(activity, filters.type))
    }

    // Apply time range filter
    if (filters.timeRange !== 'all') {
      result = result.filter(activity => isActivityInTimeRange(activity.date, filters.timeRange))
    }

    // Apply search filter
    if (filters.searchQuery && filters.searchQuery.trim()) {
      result = searchActivities(result, filters.searchQuery)
    }

    console.log(`🔍 Filtered activities: ${result.length}/${activities.length}`, {
      typeFilter: filters.type,
      timeRange: filters.timeRange,
      searchQuery: filters.searchQuery
    })

    return result
  }, [activities, filters])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.type !== 'all' || 
           filters.timeRange !== 'all' || 
           Boolean(filters.searchQuery && filters.searchQuery.trim().length > 0)
  }, [filters])

  // Filter setters with logging
  const setTypeFilterWithLog = useCallback((type: ActivityFilter) => {
    console.log('🏷️ Setting type filter:', type)
    setTypeFilter(type)
  }, [])

  const setTimeRangeFilterWithLog = useCallback((range: TimeRangeFilter) => {
    console.log('📅 Setting time range filter:', range)
    setTimeRangeFilter(range)
  }, [])

  const setSearchQueryWithLog = useCallback((query: string) => {
    console.log('🔍 Setting search query:', query)
    setSearchQuery(query)
  }, [])

  const clearFilters = useCallback(() => {
    console.log('🧹 Clearing all filters')
    setTypeFilter('all')
    setTimeRangeFilter('all')
    setSearchQuery('')
  }, [])

  return {
    filters,
    filteredActivities,
    setTypeFilter: setTypeFilterWithLog,
    setTimeRangeFilter: setTimeRangeFilterWithLog,
    setSearchQuery: setSearchQueryWithLog,
    clearFilters,
    hasActiveFilters
  }
}