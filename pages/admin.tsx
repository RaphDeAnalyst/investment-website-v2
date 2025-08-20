// pages/admin.tsx - Mobile Responsive Version
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { createSupabaseClient } from '../lib/supabase'
import toast from 'react-hot-toast'

interface PendingInvestment {
  id: string
  user_email: string
  user_name: string
  user_id: string
  plan_name: string
  amount_usd: number
  expected_return: number
  payment_method: string
  transaction_hash: string | null
  created_at: string
  status: string
}

interface WithdrawalRequest {
  id: string
  user_email: string
  user_name: string
  amount: number
  payment_method: string
  wallet_address: string
  user_available_balance: number
  created_at: string
  status: string
}

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'investments' | 'withdrawals'>('investments')
  const [pendingInvestments, setPendingInvestments] = useState<PendingInvestment[]>([])
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([])
  const [processing, setProcessing] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createSupabaseClient()

  const isAdmin = (email: string) => {
    const adminEmails = [
      'raphandy007@gmail.com',
      'admin@investmentpro.com',
      'support@investmentpro.com'
    ]
    return adminEmails.includes(email)
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user || !isAdmin(user.email || '')) {
          router.push('/')
          return
        }
        setUser(user)
        await fetchData()
      } catch (error) {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch pending investments
      const { data: investments, error: investError } = await supabase
        .from('admin_pending_investments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (investError) throw investError
      setPendingInvestments(investments || [])

      // Fetch withdrawal requests
      const { data: withdrawals, error: withdrawError } = await supabase
        .from('admin_withdrawal_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (withdrawError) throw withdrawError
      setWithdrawalRequests(withdrawals || [])

    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    }
  }

  const approveInvestment = async (investmentId: string) => {
    setProcessing(investmentId)
    try {
      // Update pending investment to approved
      const { error: updateError } = await supabase
        .from('pending_investments')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', investmentId)

      if (updateError) throw updateError

      // Get the investment details
      const investment = pendingInvestments.find(inv => inv.id === investmentId)
      if (!investment) throw new Error('Investment not found')

      // Create the actual investment record
      const maturityDate = new Date()
      maturityDate.setDate(maturityDate.getDate() + (investment.plan_name === 'Compact Plan' ? 5 : investment.plan_name === 'Master Plan' ? 10 : 20))

      const { error: investError } = await supabase
        .from('investments')
        .insert([{
          user_id: investment.user_id,
          investment_name: investment.plan_name,
          investment_type: 'plan',
          amount_invested: investment.amount_usd,
          current_value: investment.amount_usd,
          expected_return_rate: (investment.expected_return / investment.amount_usd) * 100,
          expected_return_amount: investment.expected_return,
          maturity_date: maturityDate.toISOString(),
          status: 'active',
          risk_level: investment.plan_name === 'Compact Plan' ? 'low' : investment.plan_name === 'Master Plan' ? 'medium' : 'high'
        }])

      if (investError) throw investError

      toast.success('Investment approved successfully!')
      await fetchData()

    } catch (error) {
      console.error('Error approving investment:', error)
      toast.error('Failed to approve investment')
    } finally {
      setProcessing(null)
    }
  }

  const rejectInvestment = async (investmentId: string) => {
    setProcessing(investmentId)
    try {
      const { error } = await supabase
        .from('pending_investments')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', investmentId)

      if (error) throw error

      toast.success('Investment rejected')
      await fetchData()

    } catch (error) {
      console.error('Error rejecting investment:', error)
      toast.error('Failed to reject investment')
    } finally {
      setProcessing(null)
    }
  }

  const approveWithdrawal = async (withdrawalId: string) => {
    setProcessing(withdrawalId)
    try {
      // Use the database function to approve withdrawal
      const { error } = await supabase.rpc('approve_withdrawal', {
        withdrawal_id: withdrawalId,
        admin_user_id: user.id,
        notes: 'Approved by admin'
      })

      if (error) throw error

      toast.success('Withdrawal approved successfully!')
      await fetchData()

    } catch (error) {
      console.error('Error approving withdrawal:', error)
      toast.error('Failed to approve withdrawal')
    } finally {
      setProcessing(null)
    }
  }

  const rejectWithdrawal = async (withdrawalId: string) => {
    setProcessing(withdrawalId)
    try {
      const { error } = await supabase.rpc('reject_withdrawal', {
        withdrawal_id: withdrawalId,
        admin_user_id: user.id,
        notes: 'Rejected by admin'
      })

      if (error) throw error

      toast.success('Withdrawal rejected')
      await fetchData()

    } catch (error) {
      console.error('Error rejecting withdrawal:', error)
      toast.error('Failed to reject withdrawal')
    } finally {
      setProcessing(null)
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Investment Platform</title>
        <meta name="description" content="Admin panel for managing investments and withdrawals" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Navigation */}
        <nav className="bg-gray-800 text-white">
          <div className="container-responsive flex h-16 justify-between items-center">
            <div>
              <h1 className="text-lg sm:text-xl font-bold m-0">
                Admin Panel
              </h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-300 hidden sm:block">
                {user?.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-3 sm:px-4 py-2 bg-gray-700 text-white border-0 rounded-md cursor-pointer text-sm hover:bg-gray-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <main className="container-responsive py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 m-0">
              Manage pending investments and withdrawal requests
            </p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid mb-6 sm:mb-8">
            <div className="summary-card">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Pending Investments
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-red-600 m-0">
                {pendingInvestments.length}
              </p>
            </div>

            <div className="summary-card">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Pending Withdrawals
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-red-600 m-0">
                {withdrawalRequests.length}
              </p>
            </div>

            <div className="summary-card">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Total Pending Value
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 m-0">
                {formatCurrency(
                  pendingInvestments.reduce((sum, inv) => sum + inv.amount_usd, 0) +
                  withdrawalRequests.reduce((sum, wr) => sum + wr.amount, 0)
                )}
              </p>
            </div>

            <div className="summary-card lg:block hidden">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Total Requests
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 m-0">
                {pendingInvestments.length + withdrawalRequests.length}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="card-base overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('investments')}
                className={`flex-1 px-3 sm:px-4 py-3 sm:py-4 border-0 text-sm sm:text-base font-medium cursor-pointer transition-colors ${
                  activeTab === 'investments'
                    ? 'bg-gray-50 text-blue-600 border-b-2 border-blue-600'
                    : 'bg-white text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="hidden sm:inline">Pending Investments</span>
                <span className="sm:hidden">Investments</span>
                <span className="ml-1 sm:ml-2">({pendingInvestments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`flex-1 px-3 sm:px-4 py-3 sm:py-4 border-0 text-sm sm:text-base font-medium cursor-pointer transition-colors ${
                  activeTab === 'withdrawals'
                    ? 'bg-gray-50 text-blue-600 border-b-2 border-blue-600'
                    : 'bg-white text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="hidden sm:inline">Withdrawal Requests</span>
                <span className="sm:hidden">Withdrawals</span>
                <span className="ml-1 sm:ml-2">({withdrawalRequests.length})</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6">
              {activeTab === 'investments' && (
                <div>
                  {pendingInvestments.length === 0 ? (
                    <div className="text-center py-8 sm:py-10 text-gray-500">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-base sm:text-lg font-semibold mb-2">
                        No Pending Investments
                      </h3>
                      <p className="text-sm sm:text-base m-0">
                        All investment requests have been processed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingInvestments.map((investment) => (
                        <div key={investment.id} className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-gray-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                User Details
                              </h4>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                                {investment.user_name || 'N/A'}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 break-all">
                                {investment.user_email}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                Investment Plan
                              </h4>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                                {investment.plan_name}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatCurrency(investment.amount_usd)} → {formatCurrency(investment.amount_usd + investment.expected_return)}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                Payment Method
                              </h4>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                                {investment.payment_method.toUpperCase()}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatDate(investment.created_at)}
                              </p>
                            </div>

                            {investment.transaction_hash && (
                              <div className="sm:col-span-2 lg:col-span-1">
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                  Transaction Hash
                                </h4>
                                <p className="text-xs font-mono text-gray-600 break-all">
                                  {investment.transaction_hash}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                              onClick={() => rejectInvestment(investment.id)}
                              disabled={processing === investment.id}
                              className="px-4 py-2 bg-red-600 text-white border-0 rounded-md cursor-pointer text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                            >
                              {processing === investment.id ? 'Processing...' : 'Reject'}
                            </button>
                            <button
                              onClick={() => approveInvestment(investment.id)}
                              disabled={processing === investment.id}
                              className="px-4 py-2 bg-green-600 text-white border-0 rounded-md cursor-pointer text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                            >
                              {processing === investment.id ? 'Processing...' : 'Approve'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'withdrawals' && (
                <div>
                  {withdrawalRequests.length === 0 ? (
                    <div className="text-center py-8 sm:py-10 text-gray-500">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h3 className="text-base sm:text-lg font-semibold mb-2">
                        No Pending Withdrawals
                      </h3>
                      <p className="text-sm sm:text-base m-0">
                        All withdrawal requests have been processed.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {withdrawalRequests.map((withdrawal) => (
                        <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-4 sm:p-5 bg-gray-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                User Details
                              </h4>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                                {withdrawal.user_name || 'N/A'}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 break-all">
                                {withdrawal.user_email}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                Withdrawal Amount
                              </h4>
                              <p className="text-base sm:text-lg font-semibold text-red-600 mb-1">
                                {formatCurrency(withdrawal.amount)}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                Available: {formatCurrency(withdrawal.user_available_balance)}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                Payment Method
                              </h4>
                              <p className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                                {withdrawal.payment_method.toUpperCase()}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {formatDate(withdrawal.created_at)}
                              </p>
                            </div>

                            <div className="sm:col-span-2 lg:col-span-1">
                              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                                Wallet Address
                              </h4>
                              <p className="text-xs font-mono text-gray-600 break-all">
                                {withdrawal.wallet_address}
                              </p>
                            </div>
                          </div>

                          {/* Balance Validation */}
                          {withdrawal.amount > withdrawal.user_available_balance && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                              <p className="text-sm text-red-600 m-0 font-medium">
                                ⚠️ Warning: Withdrawal amount exceeds available balance
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                              onClick={() => rejectWithdrawal(withdrawal.id)}
                              disabled={processing === withdrawal.id}
                              className="px-4 py-2 bg-red-600 text-white border-0 rounded-md cursor-pointer text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                            >
                              {processing === withdrawal.id ? 'Processing...' : 'Reject'}
                            </button>
                            <button
                              onClick={() => approveWithdrawal(withdrawal.id)}
                              disabled={processing === withdrawal.id || withdrawal.amount > withdrawal.user_available_balance}
                              className={`px-4 py-2 text-white border-0 rounded-md cursor-pointer text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors ${
                                withdrawal.amount <= withdrawal.user_available_balance
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-gray-400'
                              }`}
                            >
                              {processing === withdrawal.id ? 'Processing...' : 'Approve & Send'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-base p-4 sm:p-6 mt-6 sm:mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={fetchData}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white border-0 rounded-lg cursor-pointer text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
              
              <button
                onClick={() => {
                  const data = {
                    pendingInvestments: pendingInvestments.length,
                    withdrawalRequests: withdrawalRequests.length,
                    totalPendingValue: pendingInvestments.reduce((sum, inv) => sum + inv.amount_usd, 0) + withdrawalRequests.reduce((sum, wr) => sum + wr.amount, 0)
                  }
                  navigator.clipboard.writeText(JSON.stringify(data, null, 2))
                  toast.success('Summary copied to clipboard')
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white border-0 rounded-lg cursor-pointer text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Summary
              </button>

              <a
                href="mailto:support@investmentpro.com"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white border-0 rounded-lg cursor-pointer text-sm font-medium no-underline hover:bg-purple-700 transition-colors"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>

          {/* Footer Spacer for mobile */}
          <div className="h-20 sm:h-8"></div>
        </main>
      </div>
    </>
  )
}