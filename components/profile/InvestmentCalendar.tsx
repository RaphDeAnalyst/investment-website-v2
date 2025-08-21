// components/profile/InvestmentCalendar.tsx
import { useState, useMemo } from 'react'

interface Investment {
  id: string
  maturity_date?: string
  amount_usd?: number
  expected_return?: number
  plan_name?: string
}

interface InvestmentCalendarProps {
  investments: Investment[]
}

interface CalendarDay {
  day: number
  isCurrentMonth: boolean
  isNextMonth: boolean
  date: Date
}

export function InvestmentCalendar({ investments }: InvestmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Get month and year
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()
    
    const days: CalendarDay[] = []
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isNextMonth: false,
        date: new Date(year, month - 1, daysInPrevMonth - i)
      })
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false,
        date: new Date(year, month, day)
      })
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
        date: new Date(year, month + 1, day)
      })
    }
    
    return days
  }, [year, month])
  
  // Get maturity dates from investments with additional info
  const maturityData = useMemo(() => {
    const dataMap = new Map()
    
    investments
      .filter(inv => inv.maturity_date)
      .forEach(inv => {
        const dateStr = new Date(inv.maturity_date!).toDateString()
        if (!dataMap.has(dateStr)) {
          dataMap.set(dateStr, [])
        }
        dataMap.get(dateStr).push({
          amount: inv.amount_usd,
          expectedReturn: inv.expected_return,
          planName: inv.plan_name
        })
      })
    
    return dataMap
  }, [investments])
  
  // Check if a date has investment maturity
  const getMaturityInfo = (date: Date) => {
    const dateStr = date.toDateString()
    return maturityData.get(dateStr) || null
  }
  
  // Navigation functions
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const today = new Date()
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Investment Calendar</h3>
          <div className="text-xs text-gray-500">
            {investments.length} active investment{investments.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h4 className="text-sm font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h4>
          
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayObj, index) => {
            const maturityInfo = getMaturityInfo(dayObj.date)
            const isCurrentDay = isToday(dayObj.date)
            const hasMaturity = maturityInfo !== null
            
            return (
              <div
                key={index}
                className={`
                  relative text-center py-1.5 text-xs rounded transition-colors cursor-default
                  ${!dayObj.isCurrentMonth 
                    ? 'text-gray-400' 
                    : 'text-gray-900'
                  }
                  ${isCurrentDay 
                    ? 'bg-blue-100 text-blue-900 font-semibold ring-2 ring-blue-300' 
                    : ''
                  }
                  ${hasMaturity && dayObj.isCurrentMonth
                    ? 'bg-green-100 text-green-900 font-semibold border-2 border-green-300' 
                    : ''
                  }
                  ${!hasMaturity && !isCurrentDay && dayObj.isCurrentMonth
                    ? 'hover:bg-gray-50'
                    : ''
                  }
                `}
                title={
                  hasMaturity && dayObj.isCurrentMonth
                    ? `${maturityInfo.length} investment${maturityInfo.length > 1 ? 's' : ''} maturing`
                    : undefined
                }
              >
                {dayObj.day}
                {hasMaturity && dayObj.isCurrentMonth && (
                  <>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"></div>
                    {maturityInfo.length > 1 && (
                      <div className="absolute top-0 right-0 w-3 h-3 bg-green-600 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                        {maturityInfo.length}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-gray-600">Maturity Date</span>
            </div>
          </div>
          
          {/* Summary Stats */}
          {investments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-center">
              <div className="text-xs text-gray-600">
                <span className="font-medium text-gray-800">
                  {investments.filter(inv => inv.maturity_date).length}
                </span>
                {' '}upcoming maturities this year
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}