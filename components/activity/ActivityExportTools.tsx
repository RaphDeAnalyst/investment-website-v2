// components/activity/ActivityExportTools.tsx
import React, { useCallback } from 'react'
import { ActivityItem, ActivityFilter, TimeRangeFilter } from '../../types/activityTypes'

interface ActivityExportToolsProps {
  activities: ActivityItem[]
  filters: {
    type: ActivityFilter
    timeRange: TimeRangeFilter
    searchQuery?: string
  }
  onExportComplete: (message: string) => void
}

export const ActivityExportTools = React.memo(({ 
  activities, 
  filters, 
  onExportComplete 
}: ActivityExportToolsProps) => {
  const handleCSVExport = useCallback(() => {
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Status', 'Investment Name', 'Payment Method'].join(','),
      ...activities.map(activity => [
        new Date(activity.date).toLocaleDateString(),
        activity.type,
        `"${activity.description}"`,
        activity.amount,
        activity.status,
        activity.investment_name || '',
        activity.payment_method || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `investment-activity-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    onExportComplete('Your activity data has been exported as CSV.')
  }, [activities, onExportComplete])

  const handleJSONExport = useCallback(() => {
    const activitySummary = {
      exportDate: new Date().toISOString(),
      totalActivities: activities.length,
      filters: { type: filters.type, timeRange: filters.timeRange },
      activities: activities.map(activity => ({
        id: activity.id,
        date: activity.date,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        amount: activity.amount,
        status: activity.status,
        investmentName: activity.investment_name,
        paymentMethod: activity.payment_method,
        expectedReturn: activity.expected_return,
        maturityDate: activity.maturity_date
      }))
    }

    const jsonContent = JSON.stringify(activitySummary, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `investment-activity-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
    
    onExportComplete('Your activity data has been exported as JSON.')
  }, [activities, filters, onExportComplete])

  const handleSummaryCopy = useCallback(async () => {
    const summary = `Investment Activity Summary

Total Activities: ${activities.length}
Active Investments: ${activities.filter(a => a.type === 'investment' && a.status === 'active').length}
Pending Requests: ${activities.filter(a => a.status === 'pending').length}

Exported on: ${new Date().toLocaleDateString()}`
    
    try {
      await navigator.clipboard.writeText(summary)
      onExportComplete('Activity summary has been copied to your clipboard.')
    } catch (error) {
      console.error('Failed to copy summary:', error)
    }
  }, [activities, onExportComplete])

  if (activities.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-6 sm:mt-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Export Activity
      </h3>
      <p className="text-sm text-gray-600 mb-4 sm:mb-5">
        Download your activity data for record keeping or tax purposes.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCSVExport}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as CSV
        </button>

        <button
          onClick={handleJSONExport}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export as JSON
        </button>

        <button
          onClick={handleSummaryCopy}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Summary
        </button>
      </div>
    </div>
  )
})

ActivityExportTools.displayName = 'ActivityExportTools'