// pages/dashboard.tsx - Redesigned Bank-style Layout
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../lib/supabase'
import { ChatWidget } from '../components/ChatWidget'
import { useGlobalPopup } from '../components/ui/PopupProvider'

// Investment Calendar Component
interface InvestmentCalendarProps {
  investments: any[]
}

const InvestmentCalendar: React.FC<InvestmentCalendarProps> = ({ investments }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Get month and year
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  
  // Create array of all days to display
  const days = []
  
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
  
  // Get maturity dates from investments
  const maturityDates = investments
    .filter(inv => inv.maturity_date)
    .map(inv => new Date(inv.maturity_date).toDateString())
  
  // Check if a date has investment maturity
  const hasMaturity = (date: Date) => {
    return maturityDates.includes(date.toDateString())
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
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
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
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
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
          {days.map((dayObj, index) => {
            const hasMaturityDate = hasMaturity(dayObj.date)
            const isCurrentDay = isToday(dayObj.date)
            
            return (
              <div
                key={index}
                className={`
                  relative text-center py-1.5 text-xs rounded transition-colors
                  ${!dayObj.isCurrentMonth 
                    ? 'text-gray-400' 
                    : 'text-gray-900'
                  }
                  ${isCurrentDay 
                    ? 'bg-blue-100 text-blue-900 font-semibold' 
                    : ''
                  }
                  ${hasMaturityDate && dayObj.isCurrentMonth
                    ? 'bg-green-100 text-green-900 font-semibold border border-green-300' 
                    : ''
                  }
                  ${!hasMaturityDate && !isCurrentDay && dayObj.isCurrentMonth
                    ? 'hover:bg-gray-50'
                    : ''
                  }
                `}
              >
                {dayObj.day}
                {hasMaturityDate && dayObj.isCurrentMonth && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"></div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-600">Maturity Date</span>
            </div>
          </div>
          
          {/* Upcoming Maturities */}
          {investments.filter(inv => {
            if (!inv.maturity_date) return false
            const maturityDate = new Date(inv.maturity_date)
            const now = new Date()
            const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
            return maturityDate >= now && maturityDate <= thirtyDaysFromNow
          }).length > 0 && (
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-1">Upcoming Maturities:</p>
              <div className="space-y-1">
                {investments
                  .filter(inv => {
                    if (!inv.maturity_date) return false
                    const maturityDate = new Date(inv.maturity_date)
                    const now = new Date()
                    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
                    return maturityDate >= now && maturityDate <= thirtyDaysFromNow
                  })
                  .slice(0, 3)
                  .map((inv) => (
                    <div key={inv.id} className="text-xs text-gray-600">
                      <span className="font-medium">{inv.investment_name}</span>
                      <span className="text-gray-500"> - {new Date(inv.maturity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const supabase = createSupabaseClient()
  const { showSuccess, showError, showConfirm } = useGlobalPopup()

  // Extract first name from full name
  const getFirstName = (fullName: string) => {
    if (!fullName) return 'User'
    const names = fullName.trim().split(' ')
    return names[0]
  }

  // Check if profile is complete
  const isProfileComplete = (profile: any) => {
    if (!profile) return false
    return !!(
      profile.full_name?.trim() &&
      profile.country?.trim() &&
      profile.wallet_address_btc?.trim() &&
      profile.wallet_address_usdt_erc20?.trim() &&
      profile.wallet_address_usdt_bep20?.trim()
    )
  }

  // Get profile completion percentage
  const getProfileCompletionPercentage = (profile: any, user: any) => {
    if (!profile) return 0
    
    const completedItems = [
      !!(profile.full_name && user?.email),
      !!(profile.phone_number && profile.country),
      !!(profile.wallet_address_btc && profile.wallet_address_usdt_bep20 && profile.wallet_address_usdt_erc20),
      !!profile.avatar_url
    ].filter(Boolean).length

    return Math.round((completedItems / 4) * 100)
  }

  useEffect(() => {
    // Suppress browser extension errors
    const originalError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('ethereum') || message.includes('evmAsk') || message.includes('chrome-extension')) {
        return
      }
      originalError.apply(console, args)
    }

    const fetchData = async () => {
      try {
        console.log('🔍 Starting dashboard data fetch...')

        // Get current user with timeout
        const userPromise = supabase.auth.getUser()
        const timeoutPromise = new Promise<any>((_, reject) =>
          setTimeout(() => reject(new Error('Connection taking longer than expected')), 30000)
        )

        const userResult = await Promise.race([userPromise, timeoutPromise])

        if (userResult.error) {
          throw new Error(`Auth error: ${userResult.error.message}`)
        }

        const user = userResult.data?.user
        if (!user) {
          throw new Error('No authenticated user found')
        }

        console.log('✅ User authenticated:', user.email)
        setData((prev: any) => ({ ...prev, user }))

        // Fetch profile
        try {
          const profileResult = await Promise.race([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            timeoutPromise
          ])

          if (!profileResult.error && profileResult.data) {
            console.log('✅ Profile loaded')
            setData((prev: any) => ({ ...prev, profile: profileResult.data }))
          } else {
            console.log('⚠️ Profile not found or error:', profileResult.error?.message || 'Unknown error')
          }
        } catch (profileError: any) {
          console.log('⚠️ Profile fetch failed:', profileError.message)
        }

        // Fetch balance
        try {
          const balanceResult = await Promise.race([
            supabase.from('user_balances').select('*').eq('user_id', user.id).single(),
            timeoutPromise
          ])

          if (!balanceResult.error && balanceResult.data) {
            console.log('✅ Balance loaded')
            setData((prev: any) => ({ ...prev, balance: balanceResult.data }))
          } else {
            console.log('⚠️ Balance not found:', balanceResult.error?.message || 'Unknown error')
          }
        } catch (balanceError: any) {
          console.log('⚠️ Balance fetch failed:', balanceError.message)
        }

        // Fetch investments
        try {
          const investmentsResult = await Promise.race([
            supabase.from('investments').select('*').eq('user_id', user.id).eq('status', 'active'),
            timeoutPromise
          ])

          if (!investmentsResult.error && investmentsResult.data) {
            console.log('✅ Investments loaded:', investmentsResult.data.length)
            setData((prev: any) => ({ ...prev, investments: investmentsResult.data }))
          } else {
            console.log('⚠️ Investments not found:', investmentsResult.error?.message || 'Unknown error')
            setData((prev: any) => ({ ...prev, investments: [] }))
          }
        } catch (investmentsError: any) {
          console.log('⚠️ Investments fetch failed:', investmentsError.message)
          setData((prev: any) => ({ ...prev, investments: [] }))
        }

        // Fetch recent activity (mock data for now)
        setRecentActivity([
          {
            id: 1,
            type: 'investment',
            description: 'New investment in Master Plan',
            amount: 25000,
            date: new Date().toISOString(),
            status: 'completed'
          },
          {
            id: 2,
            type: 'withdrawal',
            description: 'Withdrawal to BTC wallet',
            amount: -5000,
            date: new Date(Date.now() - 86400000).toISOString(),
            status: 'pending'
          },
          {
            id: 3,
            type: 'return',
            description: 'Investment return from Compact Plan',
            amount: 1250,
            date: new Date(Date.now() - 172800000).toISOString(),
            status: 'completed'
          }
        ])

        console.log('🎉 Dashboard data loaded successfully!')

      } catch (err: any) {
      console.error('❌ Dashboard error:', err)
      
      // Provide user-friendly error messages
      let friendlyMessage = err.message
      
      if (err.message.includes('Request timed out') || err.message.includes('Connection taking longer than expected')) {
        friendlyMessage = 'Connection taking longer than expected'
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        friendlyMessage = 'Unable to connect to our servers. Please check your internet connection.'
      } else if (err.message.includes('Auth error')) {
        friendlyMessage = 'Authentication issue. Please try signing in again.'
      } else {
        friendlyMessage = 'Unable to load dashboard data. Please try refreshing the page.'
      }
      
      setError(friendlyMessage)
    } finally {
      setLoading(false)
}
    }

    // Small delay to let page stabilize
    setTimeout(fetchData, 500)

    return () => {
      console.error = originalError
    }
  }, [])

  // Redirect to home if not authenticated (only after loading completes)
  useEffect(() => {
    if (!loading && !data.user) {
      window.location.href = '/'
    }
  }, [loading, data.user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 mb-2">Loading your dashboard...</p>
        <p className="text-gray-500 text-xs">This should only take a moment</p>
      </div>
    )
  }

  if (error) {
  const isTimeoutError = error.includes('Connection taking longer than expected') || error.includes('Request timed out')
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 text-center max-w-lg shadow-lg">
        {/* Friendly Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-orange-600">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h2 className="text-gray-800 mb-4 text-2xl font-bold">
          {isTimeoutError ? 'Connection Issue' : 'Dashboard Unavailable'}
        </h2>
        
        <p className="text-gray-600 mb-6 leading-6">
          {isTimeoutError 
            ? "We're having trouble connecting to our servers. This might be due to a slow internet connection or temporary server issues."
            : "We encountered an issue while loading your dashboard. Please try refreshing the page."
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg border-0 cursor-pointer font-medium hover:bg-blue-700 transition-colors"
          >
            {isTimeoutError ? 'Retry Connection' : 'Refresh Page'}
          </button>
          <Link href="/">
            <button className="bg-gray-600 text-white px-6 py-3 rounded-lg border-0 cursor-pointer font-medium hover:bg-gray-700 transition-colors">
              Go Back Home
            </button>
          </Link>
        </div>
        
        {isTimeoutError && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> If this keeps happening, try checking your internet connection or try again in a few minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

  const { user, profile, balance, investments = [] } = data

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalBalance = balance?.total_balance || 0
  const availableBalance = balance?.available_balance || 0
  const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.amount_invested, 0)
  const expectedReturns = investments.reduce((sum: number, inv: any) => sum + inv.expected_return_amount, 0)
  const totalWithdrawn = balance?.total_withdrawn || 0
  
  // Calculate real portfolio performance
  const totalCurrentValue = investments.reduce((sum: number, inv: any) => sum + (inv.current_value || inv.amount_invested), 0)
  const totalGains = totalCurrentValue - totalInvested
  const totalReturnPercentage = totalInvested > 0 ? ((totalGains / totalInvested) * 100) : 0

  return (
    <>
      <Head>
        <title>Dashboard - Investment Platform</title>
        <meta name="description" content="Investment platform dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{
          __html: `
          // Prevent browser extension conflicts
          window.addEventListener('error', function(e) {
            if (e.message && (
              e.message.includes('ethereum') || 
              e.message.includes('evmAsk') ||
              e.message.includes('chrome-extension') ||
              e.message.includes('Cannot redefine property')
            )) {
              e.preventDefault();
              return false;
            }
          });
        `
        }} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Left Sidebar */}
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0 px-4 mb-8">
                <img 
                  src="/logo.png" 
                  alt="Company Logo" 
                  className="h-13 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="hidden">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Link href="/?stay=true" className="bg-blue-600 text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-white mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Homepage
                </Link>

                <Link href="/investment" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Investment
                </Link>

                <Link href="/activity" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Transaction History
                </Link>

                <Link href="/withdraw" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Withdraw Funds
                </Link>

                <Link href="/profile" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </Link>
              </nav>

              {/* Logout Button */}
              <div className="flex-shrink-0 px-2 pb-4">
                <button
                  onClick={() => {
                    showConfirm(
                      'Confirm Logout',
                      'Are you sure you want to logout?',
                      async () => {
                        try {
                          await supabase.auth.signOut();
                          showSuccess(
                            'Logged Out',
                            'You have been successfully logged out. Redirecting...',
                            2000
                          )
                          setTimeout(() => {
                            window.location.href = '/';
                          }, 2000)
                        } catch (error) {
                          showError(
                            'Logout Failed',
                            'Failed to logout. Please try again.'
                          )
                        }
                      }
                    )
                  }}
                  className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:pl-64 flex flex-col flex-1">
            <main className="flex-1">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Left Column - Main Content (3/4 width on large screens) */}
                    <div className="lg:col-span-3 space-y-6">
                      
                      {/* Welcome Section */}
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Welcome <span className="text-blue-600">{getFirstName(profile?.full_name || '')}</span> | Investment Platform
                          </h1>
                          <p className="mt-1 text-sm text-gray-500">
                            Access and manage your account and transactions efficiently.
                          </p>
                        </div>
                      </div>

                      {/* Available Balance Section */}
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <p className="text-sm text-gray-500">Available Balance</p>
                              <p className="text-3xl font-bold text-gray-900">{formatCurrency(availableBalance)}</p>
                            </div>
                            <div className="w-24 h-24">
                              {/* Circular progress indicator showing Available Balance / Total Balance ratio */}
                              <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                  />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="#3b82f6"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${totalBalance > 0 ? (availableBalance / totalBalance) * 251.2 : 0} 251.2`}
                                    className="transition-all duration-300"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Financial Overview */}
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <h2 className="text-lg font-medium text-gray-900 mb-4">Key Financial Overview</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-blue-900">{formatCurrency(totalBalance)}</div>
                              <div className="text-sm text-gray-600">Total Balance</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-green-900">{formatCurrency(totalInvested)}</div>
                              <div className="text-sm text-gray-600">Invested Funds</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-purple-900">{formatCurrency(expectedReturns)}</div>
                              <div className="text-sm text-gray-600">Expected Returns</div>
                            </div>
                            <div className="bg-red-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-red-900">{formatCurrency(totalWithdrawn)}</div>
                              <div className="text-sm text-gray-600">Withdrawn Funds</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Active Investment Portfolio */}
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-medium text-gray-900">Active Investment Portfolio</h2>
                            <Link href="/investment" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                              View All Plans →
                            </Link>
                          </div>

                          {investments.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <h3 className="mt-2 text-sm font-medium text-gray-900">No active investments</h3>
                              <p className="mt-1 text-sm text-gray-500">Get started by creating your first investment.</p>
                              <div className="mt-6">
                                <Link href="/investment" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                  Choose Investment Plan
                                </Link>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {investments.map((investment: any) => (
                                <div key={investment.id} className="border border-gray-200 rounded-lg p-4">
                                  <h3 className="font-medium text-gray-900 mb-2">{investment.investment_name}</h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500">Invested:</span>
                                      <span className="font-medium">{formatCurrency(investment.amount_invested)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500">Expected Return:</span>
                                      <span className="font-medium text-green-600">{formatCurrency(investment.expected_return_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500">Maturity:</span>
                                      <span className="font-medium">{investment.maturity_date ? formatDate(investment.maturity_date) : 'TBD'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Performance Overview */}
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 mb-3">Portfolio Performance</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Total Return</span>
                                  <span className={`text-sm font-medium ${totalGains >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalGains >= 0 ? '+' : ''}{formatCurrency(totalGains)} ({totalReturnPercentage >= 0 ? '+' : ''}{totalReturnPercentage.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Active Investments</span>
                                  <span className="text-sm font-medium">{investments.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Average ROI</span>
                                  <span className="text-sm font-medium">
                                    {investments.length > 0
                                      ? `${(investments.reduce((sum: number, inv: any) => sum + inv.expected_return_rate, 0) / investments.length).toFixed(1)}%`
                                      : '0%'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-gray-900 mb-3">Account Status</h3>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Available Balance</span>
                                  <span className="text-sm font-medium">{formatCurrency(availableBalance)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Profile Status</span>
                                  <span className={`text-sm font-medium ${isProfileComplete(profile) ? 'text-green-600' : 'text-red-600'}`}>
                                    {isProfileComplete(profile) ? 'Complete' : 'Incomplete'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-500">Account Status</span>
                                  <span className="text-sm font-medium text-green-600">Active</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Profile & Calendar (1/4 width on large screens) */}
                    <div className="lg:col-span-1 space-y-6">
                      
                      {/* Profile Section */}
                      <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex flex-col items-center text-center">
                            <Link href="/profile" className="block">
                              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden">
                                {profile?.avatar_url ? (
                                  <img
                                    src={profile.avatar_url}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-blue-600 text-2xl font-bold">
                                    {(() => {
                                      if (profile?.full_name) {
                                        const names = profile.full_name.trim().split(' ');
                                        if (names.length >= 2) {
                                          return names[0].charAt(0) + names[names.length - 1].charAt(0);
                                        } else {
                                          return names[0].substring(0, 2);
                                        }
                                      } else if (user?.email) {
                                        return user.email.substring(0, 2);
                                      }
                                      return 'U';
                                    })()}
                                  </span>
                                )}
                              </div>
                            </Link>
                            <h3 className="text-lg font-medium text-gray-900">{profile?.full_name || 'User'}</h3>
                            <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${getProfileCompletionPercentage(profile, user)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {getProfileCompletionPercentage(profile, user)}% profile complete
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Investment Calendar */}
                      <InvestmentCalendar investments={investments} />
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <Link href="/?stay=true" className="flex flex-col items-center py-2 px-3 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/investment" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs mt-1">Invest</span>
            </Link>
            <Link href="/activity" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs mt-1">Activity</span>
            </Link>
            <Link href="/withdraw" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs mt-1">Withdraw</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>

        <ChatWidget />
      </div>
    </>
  )
}