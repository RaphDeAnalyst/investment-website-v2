// pages/admin.tsx (Fixed Version)
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
  user_id: string
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
        console.error('Auth check error:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching admin data...')
      
      // Try to fetch pending investments with a simpler approach
      const { data: investments, error: investError } = await supabase
        .from('pending_investments')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (investError) {
        console.error('Investment fetch error:', investError)
        throw investError
      }

      // Fetch user profiles separately to avoid join issues
      const transformedInvestments = await Promise.all(
        (investments || []).map(async (inv) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', inv.user_id)
            .single()

          return {
            id: inv.id,
            user_id: inv.user_id,
            user_email: profile?.email || 'Unknown',
            user_name: profile?.full_name || 'Unknown',
            plan_name: inv.plan_name,
            amount_usd: inv.amount_usd,
            expected_return: inv.expected_return,
            payment_method: inv.payment_method,
            transaction_hash: inv.transaction_hash,
            created_at: inv.created_at,
            status: inv.status
          }
        })
      )

      setPendingInvestments(transformedInvestments)
      console.log('✅ Investments loaded:', transformedInvestments.length)

      // Fetch withdrawal requests with simpler approach
      const { data: withdrawals, error: withdrawError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (withdrawError) {
        console.error('Withdrawal fetch error:', withdrawError)
        throw withdrawError
      }

      // Get user profiles and balances separately
      const withdrawalsWithBalance = await Promise.all(
        (withdrawals || []).map(async (withdrawal) => {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', withdrawal.user_id)
            .single()

          // Get user's available balance - use a fallback if RPC fails
          let availableBalance = 0
          try {
            const { data: balanceData, error: balanceError } = await supabase
              .rpc('get_user_balance', { user_id: withdrawal.user_id })
            availableBalance = balanceError ? 0 : (balanceData || 0)
          } catch (error) {
            console.warn('Balance calculation failed, using 0:', error)
            availableBalance = 0
          }

          return {
            id: withdrawal.id,
            user_id: withdrawal.user_id,
            user_email: profile?.email || 'Unknown',
            user_name: profile?.full_name || 'Unknown',
            amount: withdrawal.amount,
            payment_method: withdrawal.payment_method,
            wallet_address: withdrawal.wallet_address,
            user_available_balance: availableBalance,
            created_at: withdrawal.created_at,
            status: withdrawal.status
          }
        })
      )

      setWithdrawalRequests(withdrawalsWithBalance)
      console.log('✅ Withdrawals loaded:', withdrawalsWithBalance.length)

    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data: ' + (error as Error).message)
    }
  }

  const approveInvestment = async (investmentId: string) => {
    setProcessing(investmentId)
    try {
      console.log('🔄 Approving investment:', investmentId)

      // Get the investment details first
      const investment = pendingInvestments.find(inv => inv.id === investmentId)
      if (!investment) {
        throw new Error('Investment not found')
      }

      // Update the pending investment status
      const { error: updateError } = await supabase
        .from('pending_investments')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', investmentId)

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      // Calculate maturity date based on plan
      const maturityDate = new Date()
      const planDays = {
        'Compact Plan': 5,
        'Master Plan': 10,
        'Ultimate Plan': 20
      }
      const days = planDays[investment.plan_name as keyof typeof planDays] || 5
      maturityDate.setDate(maturityDate.getDate() + days)

      // Create the actual investment record
      const { error: investError } = await supabase
        .from('investments')
        .insert([{
          user_id: investment.user_id,
          investment_name: investment.plan_name,
          investment_type: 'plan',
          amount_invested: investment.amount_usd,
          current_value: investment.amount_usd,
          expected_return_rate: ((investment.expected_return / investment.amount_usd) * 100),
          expected_return_amount: investment.expected_return,
          maturity_date: maturityDate.toISOString(),
          status: 'active',
          risk_level: investment.plan_name === 'Compact Plan' ? 'low' : 
                     investment.plan_name === 'Master Plan' ? 'medium' : 'high'
        }])

      if (investError) {
        console.error('Investment creation error:', investError)
        throw investError
      }

      console.log('✅ Investment approved successfully')
      toast.success('Investment approved successfully!')
      await fetchData()

    } catch (error) {
      console.error('Error approving investment:', error)
      toast.error('Failed to approve investment: ' + (error as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  const rejectInvestment = async (investmentId: string) => {
    setProcessing(investmentId)
    try {
      console.log('🔄 Rejecting investment:', investmentId)

      const { error } = await supabase
        .from('pending_investments')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', investmentId)

      if (error) {
        console.error('Rejection error:', error)
        throw error
      }

      console.log('✅ Investment rejected successfully')
      toast.success('Investment rejected')
      await fetchData()

    } catch (error) {
      console.error('Error rejecting investment:', error)
      toast.error('Failed to reject investment: ' + (error as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  const approveWithdrawal = async (withdrawalId: string) => {
    setProcessing(withdrawalId)
    try {
      console.log('🔄 Approving withdrawal:', withdrawalId)

      const withdrawal = withdrawalRequests.find(w => w.id === withdrawalId)
      if (!withdrawal) {
        throw new Error('Withdrawal request not found')
      }

      // Check if user has sufficient balance
      if (withdrawal.amount > withdrawal.user_available_balance) {
        throw new Error('Insufficient balance for withdrawal')
      }

      // Try using the RPC function first
      try {
        const { error: rpcError } = await supabase.rpc('approve_withdrawal', {
          withdrawal_id: withdrawalId,
          admin_user_id: user.id,
          notes: 'Approved by admin'
        })

        if (rpcError) throw rpcError
      } catch (rpcError) {
        console.warn('RPC function failed, using direct update:', rpcError)
        
        // Fallback to direct update if RPC fails
        const { error: updateError } = await supabase
          .from('withdrawal_requests')
          .update({
            status: 'approved',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            notes: 'Approved by admin'
          })
          .eq('id', withdrawalId)

        if (updateError) {
          console.error('Direct update also failed:', updateError)
          throw updateError
        }

        // Try to create transaction record (optional)
        try {
          await supabase
            .from('transactions')
            .insert([{
              user_id: withdrawal.user_id,
              type: 'withdrawal',
              amount: -withdrawal.amount,
              description: `Withdrawal approved - ${withdrawal.payment_method}`,
              status: 'completed',
              created_at: new Date().toISOString()
            }])
        } catch (transError) {
          console.warn('Transaction record creation failed:', transError)
          // Don't throw error here as withdrawal is already approved
        }
      }

      console.log('✅ Withdrawal approved successfully')
      toast.success('Withdrawal approved successfully!')
      await fetchData()

    } catch (error) {
      console.error('Error approving withdrawal:', error)
      toast.error('Failed to approve withdrawal: ' + (error as Error).message)
    } finally {
      setProcessing(null)
    }
  }

  const rejectWithdrawal = async (withdrawalId: string) => {
    setProcessing(withdrawalId)
    try {
      console.log('🔄 Rejecting withdrawal:', withdrawalId)

      // Try using the RPC function first
      try {
        const { error: rpcError } = await supabase.rpc('reject_withdrawal', {
          withdrawal_id: withdrawalId,
          admin_user_id: user.id,
          notes: 'Rejected by admin'
        })

        if (rpcError) throw rpcError
      } catch (rpcError) {
        console.warn('RPC function failed, using direct update:', rpcError)
        
        // Fallback to direct update
        const { error: updateError } = await supabase
          .from('withdrawal_requests')
          .update({
            status: 'rejected',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            notes: 'Rejected by admin'
          })
          .eq('id', withdrawalId)

        if (updateError) {
          console.error('Direct update failed:', updateError)
          throw updateError
        }
      }

      console.log('✅ Withdrawal rejected successfully')
      toast.success('Withdrawal rejected')
      await fetchData()

    } catch (error) {
      console.error('Error rejecting withdrawal:', error)
      toast.error('Failed to reject withdrawal: ' + (error as Error).message)
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
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #2563eb',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
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

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Navigation */}
        <nav style={{
          backgroundColor: '#1f2937',
          color: 'white'
        }}>
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            height: '64px',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                Admin Panel
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', color: '#d1d5db' }}>
                {user?.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <main style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 16px'
        }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0 0 8px 0'
            }}>
              Admin Dashboard
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0
            }}>
              Manage pending investments and withdrawal requests
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 8px 0',
                textTransform: 'uppercase'
              }}>
                Pending Investments
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#dc2626',
                margin: 0
              }}>
                {pendingInvestments.length}
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 8px 0',
                textTransform: 'uppercase'
              }}>
                Pending Withdrawals
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#dc2626',
                margin: 0
              }}>
                {withdrawalRequests.length}
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
                margin: '0 0 8px 0',
                textTransform: 'uppercase'
              }}>
                Total Pending Value
              </h3>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#2563eb',
                margin: 0
              }}>
                {formatCurrency(
                  pendingInvestments.reduce((sum, inv) => sum + inv.amount_usd, 0) +
                  withdrawalRequests.reduce((sum, wr) => sum + wr.amount, 0)
                )}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            {/* Tab Headers */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setActiveTab('investments')}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: 'none',
                  backgroundColor: activeTab === 'investments' ? '#f9fafb' : 'white',
                  color: activeTab === 'investments' ? '#2563eb' : '#6b7280',
                  fontWeight: activeTab === 'investments' ? '600' : '500',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'investments' ? '2px solid #2563eb' : 'none'
                }}
              >
                Pending Investments ({pendingInvestments.length})
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: 'none',
                  backgroundColor: activeTab === 'withdrawals' ? '#f9fafb' : 'white',
                  color: activeTab === 'withdrawals' ? '#2563eb' : '#6b7280',
                  fontWeight: activeTab === 'withdrawals' ? '600' : '500',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'withdrawals' ? '2px solid #2563eb' : 'none'
                }}
              >
                Withdrawal Requests ({withdrawalRequests.length})
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ padding: '24px' }}>
              {activeTab === 'investments' && (
                <div>
                  {pendingInvestments.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#6b7280'
                    }}>
                      <svg style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 16px',
                        color: '#d1d5db'
                      }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                        No Pending Investments
                      </h3>
                      <p style={{ margin: 0 }}>
                        All investment requests have been processed.
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gap: '16px'
                    }}>
                      {pendingInvestments.map((investment) => (
                        <div key={investment.id} style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '20px',
                          backgroundColor: '#fafafa'
                        }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginBottom: '16px'
                          }}>
                            <div>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                margin: '0 0 4px 0'
                              }}>
                                User Details
                              </h4>
                              <p style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 2px 0'
                              }}>
                                {investment.user_name || 'N/A'}
                              </p>
                              <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: 0
                              }}>
                                {investment.user_email}
                              </p>
                            </div>

                            <div>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                margin: '0 0 4px 0'
                              }}>
                                Investment Plan
                              </h4>
                              <p style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 2px 0'
                              }}>
                                {investment.plan_name}
                              </p>
                              <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: 0
                              }}>
                                {formatCurrency(investment.amount_usd)} → {formatCurrency(investment.amount_usd + investment.expected_return)}
                              </p>
                            </div>

                            <div>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                margin: '0 0 4px 0'
                              }}>
                                Payment Method
                              </h4>
                              <p style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 2px 0'
                              }}>
                                {investment.payment_method.toUpperCase()}
                              </p>
                              <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: 0
                              }}>
                                {formatDate(investment.created_at)}
                              </p>
                            </div>

                            {investment.transaction_hash && (
                              <div>
                                <h4 style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#374151',
                                  margin: '0 0 4px 0'
                                }}>
                                  Transaction Hash
                                </h4>
                                <p style={{
                                  fontSize: '12px',
                                  fontFamily: 'monospace',
                                  color: '#6b7280',
                                  margin: 0,
                                  wordBreak: 'break-all'
                                }}>
                                  {investment.transaction_hash}
                                </p>
                              </div>
                            )}
                          </div>

                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                          }}>
                            <button
                              onClick={() => rejectInvestment(investment.id)}
                              disabled={processing === investment.id}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: processing === investment.id ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                opacity: processing === investment.id ? 0.6 : 1
                              }}
                            >
                              {processing === investment.id ? 'Processing...' : 'Reject'}
                            </button>
                            <button
                              onClick={() => approveInvestment(investment.id)}
                              disabled={processing === investment.id}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: processing === investment.id ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                opacity: processing === investment.id ? 0.6 : 1
                              }}
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
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#6b7280'
                    }}>
                      <svg style={{
                        width: '48px',
                        height: '48px',
                        margin: '0 auto 16px',
                        color: '#d1d5db'
                      }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                        No Pending Withdrawals
                      </h3>
                      <p style={{ margin: 0 }}>
                        All withdrawal requests have been processed.
                      </p>
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gap: '16px'
                    }}>
                      {withdrawalRequests.map((withdrawal) => (
                        <div key={withdrawal.id} style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '20px',
                          backgroundColor: '#fafafa'
                        }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '16px',
                            marginBottom: '16px'
                          }}>
                            <div>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                margin: '0 0 4px 0'
                              }}>
                                User Details
                              </h4>
                              <p style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 2px 0'
                              }}>
                                {withdrawal.user_name || 'N/A'}
                              </p>
                              <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: 0
                              }}>
                                {withdrawal.user_email}
                              </p>
                            </div>

                            <div>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                margin: '0 0 4px 0'
                              }}>
                                Withdrawal Amount
                              </h4>
                              <p style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#dc2626',
                                margin: '0 0 2px 0'
                              }}>
                                {formatCurrency(withdrawal.amount)}
                              </p>
                              <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: 0
                              }}>
                                Available: {formatCurrency(withdrawal.user_available_balance)}
                              </p>
                            </div>

                            <div>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                margin: '0 0 4px 0'
                              }}>
                                Payment Method
                              </h4>
                              <p style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 2px 0'
                              }}>
                                {withdrawal.payment_method.toUpperCase()}
                              </p>
                              <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: 0
                              }}>
                                {formatDate(withdrawal.created_at)}
                              </p>
                            </div>

                            <div>
                              <h4 style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151',
                                margin: '0 0 4px 0'
                              }}>
                                Wallet Address
                              </h4>
                              <p style={{
                                fontSize: '12px',
                                fontFamily: 'monospace',
                                color: '#6b7280',
                                margin: 0,
                                wordBreak: 'break-all'
                              }}>
                                {withdrawal.wallet_address}
                              </p>
                            </div>
                          </div>

                          {/* Balance Validation */}
                          {withdrawal.amount > withdrawal.user_available_balance && (
                            <div style={{
                              backgroundColor: '#fef2f2',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '12px',
                              marginBottom: '16px'
                            }}>
                              <p style={{
                                fontSize: '14px',
                                color: '#dc2626',
                                margin: 0,
                                fontWeight: '500'
                              }}>
                                ⚠️ Warning: Withdrawal amount exceeds available balance
                              </p>
                            </div>
                          )}

                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                          }}>
                            <button
                              onClick={() => rejectWithdrawal(withdrawal.id)}
                              disabled={processing === withdrawal.id}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: processing === withdrawal.id ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                opacity: processing === withdrawal.id ? 0.6 : 1
                              }}
                            >
                              {processing === withdrawal.id ? 'Processing...' : 'Reject'}
                            </button>
                            <button
                              onClick={() => approveWithdrawal(withdrawal.id)}
                              disabled={processing === withdrawal.id || withdrawal.amount > withdrawal.user_available_balance}
                              style={{
                                padding: '8px 16px',
                                backgroundColor: (withdrawal.amount <= withdrawal.user_available_balance) ? '#059669' : '#9ca3af',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: (processing === withdrawal.id || withdrawal.amount > withdrawal.user_available_balance) ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                opacity: processing === withdrawal.id ? 0.6 : 1
                              }}
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
          <div style={{
            marginTop: '32px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 16px 0'
            }}>
              Quick Actions
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <button
                onClick={fetchData}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
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
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Summary
              </button>

              <a
                href="mailto:support@investmentpro.com"
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#7c3aed',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none'
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}