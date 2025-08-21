// components/activity/ActivitySummaryCards.tsx
import React from 'react'
import { ActivityItem, ActivityStats } from '../../types/activityTypes'

interface ActivitySummaryCardsProps {
  stats: ActivityStats
  filteredCount: number
}

export const ActivitySummaryCards = React.memo(({ 
  stats,
  filteredCount
}: ActivitySummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
      {/* Total Activities Card */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          Total Activities
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">
          {filteredCount}
        </p>
      </div>

      {/* Active Investments Card */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          Active Investments
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-green-700">
          {stats.activeInvestments}
        </p>
      </div>

      {/* Pending Requests Card */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          Pending Requests
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-red-600">
          {stats.pendingRequests}
        </p>
      </div>

      {/* This Month Card */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:block hidden">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
          This Month
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-blue-700">
          {stats.thisMonth}
        </p>
      </div>
    </div>
  )
})

ActivitySummaryCards.displayName = 'ActivitySummaryCards'