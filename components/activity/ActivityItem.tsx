// components/activity/ActivityItem.tsx
import React from 'react'
import { ActivityItem as ActivityItemType } from '../../types/activityTypes'
import { 
  formatCurrency, 
  formatDate, 
  getStatusColor, 
  getAmountColor,
  calculateInvestmentProgress 
} from '../../utils/activityUtils'
import { ActivityIcon } from './ActivityIcon'

interface ActivityItemProps {
  activity: ActivityItemType
  index: number
  totalItems: number
}

export const ActivityItem = React.memo(({ 
  activity, 
  index, 
  totalItems 
}: ActivityItemProps) => {
  const statusClasses = getStatusColor(activity.status)
  const amountClasses = getAmountColor(activity.type)
  const isLastItem = index >= totalItems - 1

  return (
    <div
      className={`p-4 sm:p-6 ${!isLastItem ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Activity Icon */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          <ActivityIcon type={activity.type} className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-2 sm:mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 truncate">
                {activity.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {activity.description}
              </p>
            </div>

            <div className="text-left sm:text-right flex-shrink-0">
              <p className={`text-sm sm:text-base font-bold mb-1 ${amountClasses}`}>
                {activity.type === 'withdrawal' || activity.type === 'investment' ? '-' : '+'}
                {formatCurrency(activity.amount)}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(activity.date)}
              </p>
            </div>
          </div>

          {/* Activity Details */}
          <div className="flex flex-wrap gap-2 items-center mb-3">
            {/* Status Badge */}
            <span className={`px-2 py-1 border rounded-full text-xs font-semibold uppercase ${statusClasses}`}>
              {activity.status}
            </span>

            {/* Investment Name */}
            {activity.investment_name && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                {activity.investment_name}
              </span>
            )}

            {/* Payment Method */}
            {activity.payment_method && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                {activity.payment_method.toUpperCase()}
              </span>
            )}

            {/* Expected Return (for investments) */}
            {activity.expected_return && activity.type === 'investment' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-medium">
                Expected: {formatCurrency(activity.expected_return)}
              </span>
            )}

            {/* Maturity Date */}
            {activity.maturity_date && activity.type === 'investment' && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-medium">
                Matures: {new Date(activity.maturity_date).toLocaleDateString()}
              </span>
            )}

            {/* Transaction Hash */}
            {activity.transaction_hash && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono max-w-[120px] truncate">
                {activity.transaction_hash}
              </span>
            )}
          </div>

          {/* Progress Bar for Active Investments */}
          {activity.type === 'investment' && activity.status === 'active' && activity.maturity_date && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 font-medium">
                  Investment Progress
                </span>
                <span className="text-xs text-gray-700 font-semibold">
                  {Math.round(calculateInvestmentProgress(activity.date, activity.maturity_date))}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${calculateInvestmentProgress(activity.date, activity.maturity_date)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

ActivityItem.displayName = 'ActivityItem'