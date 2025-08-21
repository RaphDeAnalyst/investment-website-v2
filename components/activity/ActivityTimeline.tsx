// components/activity/ActivityTimeline.tsx
import React from 'react'
import { ActivityItem as ActivityItemType, ActivityFilter } from '../../types/activityTypes'
import { ActivityItem } from './ActivityItem'
import { ActivityEmptyState } from './ActivityEmptyState'

interface ActivityTimelineProps {
  activities: ActivityItemType[]
}

export const ActivityTimeline = React.memo(({ 
  activities
}: ActivityTimelineProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Activity Timeline
        </h2>
      </div>

      {activities.length > 0 && (
        <div className="pb-6">
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              index={index}
              totalItems={activities.length}
            />
          ))}
        </div>
      )}
    </div>
  )
})

ActivityTimeline.displayName = 'ActivityTimeline'