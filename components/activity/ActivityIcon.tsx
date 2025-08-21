// components/activity/ActivityIcon.tsx
import React from 'react'
import { ActivityItem } from '../../types/activityTypes'
import { getActivityIconPath } from '../../utils/activityUtils'

interface ActivityIconProps {
  type: ActivityItem['type']
  className?: string
  size?: number
}

export const ActivityIcon: React.FC<ActivityIconProps> = ({ 
  type, 
  className = "w-5 h-5", 
  size = 20 
}) => {
  const iconPath = getActivityIconPath(type)
  
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d={iconPath} 
      />
    </svg>
  )
}

export default ActivityIcon