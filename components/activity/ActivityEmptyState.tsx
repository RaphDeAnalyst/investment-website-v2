// components/activity/ActivityEmptyState.tsx
import React from 'react'
import Link from 'next/link'
import { ActivityFilter, TimeRangeFilter } from '../../types/activityTypes'

interface ActivityEmptyStateProps {
  filters: {
    type: ActivityFilter
    timeRange: TimeRangeFilter
    searchQuery?: string
  }
  onClearFilters: () => void
}

export const ActivityEmptyState = React.memo(({ 
  filters, 
  onClearFilters 
}: ActivityEmptyStateProps) => {
  return (
    <div className="p-8 sm:p-15 text-center text-gray-500">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
        No Activity Found
      </h3>
      
      <p className="mb-4 sm:mb-6 text-sm sm:text-base">
        {filters.type === 'all' 
          ? "You haven't made any transactions yet."
          : `No ${filters.type} found for the selected time period.`
        }
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link 
          href="/investment" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Make Your First Investment
        </Link>
        <button
          onClick={onClearFilters}
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
})

ActivityEmptyState.displayName = 'ActivityEmptyState'