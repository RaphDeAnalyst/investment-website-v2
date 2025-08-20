// pages/activity.tsx - With Dashboard Sidebar
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

interface ActivityItem {
  id: string
  type: 'investment' | 'withdrawal' | 'return' | 'dividend' | 'deposit'
  title: string
  description: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected' | 'active'
  date: string
  investment_name?: string
  payment_method?: string
  transaction_hash?: string
  expected_return?: number
  maturity_date?: string
}

interface InvestmentActivity {
  id: string
  investment_name: string
  amount_invested: number
  expected_return_amount: number
  maturity_date: string
  status: string
  created_at: string
}

interface TransactionActivity {
  id: string
  transaction_type: string
  amount: number
  description: string
  status: string
  transaction_date: string
  investment_id?: string
}

interface PendingInvestmentActivity {
  id: string
  plan_name: string
  amount_usd: number
  expected_return: number
  payment_method: string
  status: string
  created_at: string
  maturity_date: string
}

interface WithdrawalActivity {
  id: string
  amount: number
  payment_method: string
  status: string
  created_at: string
}

export default function RecentActivity() {
  const { user, loading: authLoading } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'investments' | 'withdrawals' | 'returns'>('all')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    } else if (user) {
      fetchActivities()
    }
  }, [user, authLoading, router])

  const fetchActivities = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const allActivities: ActivityItem[] = []

      // Fetch active investments
      const { data: investments, error: investError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!investError && investments) {
        investments.forEach((investment: InvestmentActivity) => {
          allActivities.push({
            id: `investment-${investment.id}`,
            type: 'investment',
            title: `Investment Created`,
            description: `Started investment in ${investment.investment_name}`,
            amount: investment.amount_invested,
            status: investment.status as any,
            date: investment.created_at,
            investment_name: investment.investment_name,
            expected_return: investment.expected_return_amount,
            maturity_date: investment.maturity_date
          })

          // Add return entry if investment is completed
          if (investment.status === 'completed') {
            allActivities.push({
              id: `return-${investment.id}`,
              type: 'return',
              title: `Investment Matured`,
              description: `Received returns from ${investment.investment_name}`,
              amount: investment.expected_return_amount,
              status: 'completed',
              date: investment.maturity_date,
              investment_name: investment.investment_name
            })
          }
        })
      }

      // Fetch pending investments
      const { data: pendingInvestments, error: pendingError } = await supabase
        .from('pending_investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!pendingError && pendingInvestments) {
        pendingInvestments.forEach((pending: PendingInvestmentActivity) => {
          allActivities.push({
            id: `pending-${pending.id}`,
            type: 'investment',
            title: `Investment Submitted`,
            description: `Submitted ${pending.plan_name} investment for approval`,
            amount: pending.amount_usd,
            status: pending.status as any,
            date: pending.created_at,
            investment_name: pending.plan_name,
            payment_method: pending.payment_method,
            expected_return: pending.expected_return,
            maturity_date: pending.maturity_date
          })
        })
      }

      // Fetch transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })

      if (!transError && transactions) {
        transactions.forEach((transaction: TransactionActivity) => {
          let type: ActivityItem['type'] = 'deposit'
          let title = ''
          
          switch (transaction.transaction_type) {
            case 'investment':
              type = 'investment'
              title = 'Investment Transaction'
              break
            case 'withdrawal':
              type = 'withdrawal'
              title = 'Withdrawal Processed'
              break
            case 'return':
              type = 'return'
              title = 'Investment Return'
              break
            case 'dividend':
              type = 'dividend'
              title = 'Dividend Payment'
              break
            case 'deposit':
              type = 'deposit'
              title = 'Deposit Received'
              break
          }

          allActivities.push({
            id: `transaction-${transaction.id}`,
            type,
            title,
            description: transaction.description,
            amount: transaction.amount,
            status: transaction.status as any,
            date: transaction.transaction_date
          })
        })
      }

      // Fetch withdrawal requests
      const { data: withdrawals, error: withdrawError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!withdrawError && withdrawals) {
        withdrawals.forEach((withdrawal: WithdrawalActivity) => {
          allActivities.push({
            id: `withdrawal-${withdrawal.id}`,
            type: 'withdrawal',
            title: 'Withdrawal Request',
            description: `Withdrawal request via ${withdrawal.payment_method.toUpperCase()}`,
            amount: withdrawal.amount,
            status: withdrawal.status as any,
            date: withdrawal.created_at,
            payment_method: withdrawal.payment_method
          })
        })
      }

      // Sort all activities by date (newest first)
      allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setActivities(allActivities)
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Failed to load activity data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: ActivityItem['type']) => {
    const iconProps = { width: "20", height: "20", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }
    
    switch (type) {
      case 'investment':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'withdrawal':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      case 'return':
      case 'dividend':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      case 'deposit':
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )
      default:
        return (
          <svg {...iconProps}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
    }
  }

  const getStatusColor = (status: string) => {
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

  const getAmountColor = (type: ActivityItem['type']) => {
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

  const filteredActivities = activities.filter(activity => {
    // Filter by type
    if (filter !== 'all') {
      if (filter === 'investments' && !['investment'].includes(activity.type)) return false
      if (filter === 'withdrawals' && activity.type !== 'withdrawal') return false
      if (filter === 'returns' && !['return', 'dividend'].includes(activity.type)) return false
    }

    // Filter by time range
    if (timeRange !== 'all') {
      const activityDate = new Date(activity.date)
      const now = new Date()
      const diffDays = Math.ceil((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
      
      const ranges = { '7d': 7, '30d': 30, '90d': 90 }
      if (diffDays > ranges[timeRange]) return false
    }

    return true
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading your activity...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>Recent Activity - Investment Platform</title>
        <meta name="description" content="View your recent investment activity and transaction history" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                <Link href="/dashboard" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>

                <Link href="/investment" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Investment
                </Link>

                <Link href="/activity" className="bg-blue-600 text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-white mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  onClick={async () => {
                    const confirmed = window.confirm('Are you sure you want to logout?');
                    if (confirmed) {
                      await supabase.auth.signOut();
                      window.location.href = '/';
                    }
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
                  
                  {/* Header */}
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Recent Activity
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                      Track all your investment transactions and activities
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      {/* Activity Type Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Activity Type
                        </label>
                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Activities</option>
                          <option value="investments">Investments</option>
                          <option value="withdrawals">Withdrawals</option>
                          <option value="returns">Returns & Dividends</option>
                        </select>
                      </div>

                      {/* Time Range Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Time Range
                        </label>
                        <select
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value as any)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="7d">Last 7 days</option>
                          <option value="30d">Last 30 days</option>
                          <option value="90d">Last 90 days</option>
                          <option value="all">All time</option>
                        </select>
                      </div>

                      {/* Refresh Button */}
                      <div className="sm:col-span-2 lg:col-span-1">
                        <button
                          onClick={fetchActivities}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="hidden sm:inline">Refresh</span>
                        </button>
                      </div>

                      {/* Clear Filters Button - Mobile */}
                      <div className="sm:hidden">
                        <button
                          onClick={() => {
                            setFilter('all')
                            setTimeRange('all')
                          }}
                          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-md text-sm font-medium"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Activity Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Total Activities
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        {filteredActivities.length}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Active Investments
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-green-700">
                        {filteredActivities.filter(a => a.type === 'investment' && a.status === 'active').length}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        Pending Requests
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-red-600">
                        {filteredActivities.filter(a => a.status === 'pending').length}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:block hidden">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                        This Month
                      </h3>
                      <p className="text-xl sm:text-2xl font-bold text-blue-700">
                        {activities.filter(a => {
                          const activityDate = new Date(a.date)
                          const now = new Date()
                          return activityDate.getMonth() === now.getMonth() && activityDate.getFullYear() === now.getFullYear()
                        }).length}
                      </p>
                    </div>
                  </div>

                  {/* Activity List */}
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Activity Timeline
                      </h2>
                    </div>

                    {filteredActivities.length === 0 ? (
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
                          {filter === 'all' 
                            ? "You haven't made any transactions yet."
                            : `No ${filter} found for the selected time period.`
                          }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Link href="/investment" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            Make Your First Investment
                          </Link>
                          <button
                            onClick={() => {
                              setFilter('all')
                              setTimeRange('all')
                            }}
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pb-6">
                        {filteredActivities.map((activity, index) => {
                          const statusClasses = getStatusColor(activity.status)
                          const amountClasses = getAmountColor(activity.type)
                          
                          return (
                            <div
                              key={activity.id}
                              className={`p-4 sm:p-6 ${index < filteredActivities.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
                            >
                              <div className="flex items-start gap-3 sm:gap-4">
                                {/* Activity Icon */}
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                  {getActivityIcon(activity.type)}
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
                                          {(() => {
                                            const start = new Date(activity.date)
                                            const end = new Date(activity.maturity_date)
                                            const now = new Date()
                                            const total = end.getTime() - start.getTime()
                                            const elapsed = now.getTime() - start.getTime()
                                            const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100)
                                            return `${Math.round(progress)}%`
                                          })()}
                                        </span>
                                      </div>
                                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                          style={{
                                            width: `${(() => {
                                              const start = new Date(activity.date)
                                              const end = new Date(activity.maturity_date)
                                              const now = new Date()
                                              const total = end.getTime() - start.getTime()
                                              const elapsed = now.getTime() - start.getTime()
                                              return Math.min(Math.max((elapsed / total) * 100, 0), 100)
                                            })()}%`
                                          }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Export Options */}
                  {filteredActivities.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mt-6 sm:mt-8">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                        Export Activity
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 sm:mb-5">
                        Download your activity data for record keeping or tax purposes.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            const csvContent = [
                              ['Date', 'Type', 'Description', 'Amount', 'Status', 'Investment Name', 'Payment Method'].join(','),
                              ...filteredActivities.map(activity => [
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
                            toast.success('Activity exported as CSV')
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export as CSV
                        </button>

                        <button
                          onClick={() => {
                            const activitySummary = {
                              exportDate: new Date().toISOString(),
                              totalActivities: filteredActivities.length,
                              filters: { type: filter, timeRange },
                              activities: filteredActivities.map(activity => ({
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
                            toast.success('Activity exported as JSON')
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Export as JSON
                        </button>

                        <button
                          onClick={() => {
                            const summary = `Investment Activity Summary\n\nTotal Activities: ${filteredActivities.length}\nActive Investments: ${filteredActivities.filter(a => a.type === 'investment' && a.status === 'active').length}\nPending Requests: ${filteredActivities.filter(a => a.status === 'pending').length}\n\nExported on: ${new Date().toLocaleDateString()}`
                            
                            navigator.clipboard.writeText(summary)
                            toast.success('Summary copied to clipboard')
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Summary
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <Link href="/dashboard" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link href="/investment" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs mt-1">Invest</span>
            </Link>
            <Link href="/activity" className="flex flex-col items-center py-2 px-3 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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
      </div>
    </>
  )
}