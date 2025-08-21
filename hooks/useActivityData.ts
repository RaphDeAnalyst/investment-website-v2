// hooks/useActivityData.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createSupabaseClient } from '../lib/supabase'
import { useAuth } from './useAuth'
import { 
  ActivityItem, 
  InvestmentActivity, 
  TransactionActivity, 
  PendingInvestmentActivity, 
  WithdrawalActivity,
  ActivityStats,
  UseActivityDataReturn
} from '../types/activityTypes'

export function useActivityData(): UseActivityDataReturn {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  // Transform functions for different data types
  const transformInvestments = useCallback((investments: InvestmentActivity[]): ActivityItem[] => {
    const transformed: ActivityItem[] = []
    
    investments.forEach((investment) => {
      // Add investment creation activity
      transformed.push({
        id: `investment-${investment.id}`,
        type: 'investment',
        title: 'Investment Created',
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
        transformed.push({
          id: `return-${investment.id}`,
          type: 'return',
          title: 'Investment Matured',
          description: `Received returns from ${investment.investment_name}`,
          amount: investment.expected_return_amount,
          status: 'completed',
          date: investment.maturity_date,
          investment_name: investment.investment_name
        })
      }
    })
    
    return transformed
  }, [])

  const transformPendingInvestments = useCallback((pending: PendingInvestmentActivity[]): ActivityItem[] => {
    return pending.map((item) => ({
      id: `pending-${item.id}`,
      type: 'investment',
      title: 'Investment Submitted',
      description: `Submitted ${item.plan_name} investment for approval`,
      amount: item.amount_usd,
      status: item.status as any,
      date: item.created_at,
      investment_name: item.plan_name,
      payment_method: item.payment_method,
      expected_return: item.expected_return,
      maturity_date: item.maturity_date
    }))
  }, [])

  const transformTransactions = useCallback((transactions: TransactionActivity[]): ActivityItem[] => {
    return transactions.map((transaction) => {
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

      return {
        id: `transaction-${transaction.id}`,
        type,
        title,
        description: transaction.description,
        amount: transaction.amount,
        status: transaction.status as any,
        date: transaction.transaction_date
      }
    })
  }, [])

  const transformWithdrawals = useCallback((withdrawals: WithdrawalActivity[]): ActivityItem[] => {
    return withdrawals.map((withdrawal) => ({
      id: `withdrawal-${withdrawal.id}`,
      type: 'withdrawal',
      title: 'Withdrawal Request',
      description: `Withdrawal request via ${withdrawal.payment_method.toUpperCase()}`,
      amount: withdrawal.amount,
      status: withdrawal.status as any,
      date: withdrawal.created_at,
      payment_method: withdrawal.payment_method
    }))
  }, [])

  // Parallel data fetching with error handling
  const fetchActivities = useCallback(async () => {
    if (!user?.id) return

    console.log('🔄 Starting parallel data fetch for user:', user.id)
    setLoading(true)
    setError(null)

    try {
      // Fetch all data sources in parallel for better performance
      const [
        investmentsResult,
        pendingResult,
        transactionsResult,
        withdrawalsResult
      ] = await Promise.allSettled([
        supabase
          .from('investments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('pending_investments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false }),
        
        supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      const allActivities: ActivityItem[] = []

      // Process investments
      if (investmentsResult.status === 'fulfilled' && !investmentsResult.value.error) {
        const transformed = transformInvestments((investmentsResult.value.data || []) as unknown as InvestmentActivity[])
        allActivities.push(...transformed)
        console.log('✅ Investments loaded:', transformed.length)
      } else {
        console.error('❌ Failed to load investments:', investmentsResult)
      }

      // Process pending investments
      if (pendingResult.status === 'fulfilled' && !pendingResult.value.error) {
        const transformed = transformPendingInvestments((pendingResult.value.data || []) as unknown as PendingInvestmentActivity[])
        allActivities.push(...transformed)
        console.log('✅ Pending investments loaded:', transformed.length)
      } else {
        console.error('❌ Failed to load pending investments:', pendingResult)
      }

      // Process transactions
      if (transactionsResult.status === 'fulfilled' && !transactionsResult.value.error) {
        const transformed = transformTransactions((transactionsResult.value.data || []) as unknown as TransactionActivity[])
        allActivities.push(...transformed)
        console.log('✅ Transactions loaded:', transformed.length)
      } else {
        console.error('❌ Failed to load transactions:', transactionsResult)
      }

      // Process withdrawals
      if (withdrawalsResult.status === 'fulfilled' && !withdrawalsResult.value.error) {
        const transformed = transformWithdrawals((withdrawalsResult.value.data || []) as unknown as WithdrawalActivity[])
        allActivities.push(...transformed)
        console.log('✅ Withdrawals loaded:', transformed.length)
      } else {
        console.error('❌ Failed to load withdrawals:', withdrawalsResult)
      }

      // Sort all activities by date (newest first)
      allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      console.log('🎉 All activities processed successfully:', allActivities.length)
      setActivities(allActivities)

    } catch (error: any) {
      console.error('❌ Critical error fetching activities:', error)
      setError('Unable to load your activity history. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase, transformInvestments, transformPendingInvestments, transformTransactions, transformWithdrawals])

  // Initial load
  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Manual refresh function
  const refreshActivities = useCallback(async () => {
    console.log('🔄 Manual refresh triggered')
    await fetchActivities()
  }, [fetchActivities])

  // Memoized statistics calculation for performance
  const stats = useMemo((): ActivityStats => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return {
      totalActivities: activities.length,
      activeInvestments: activities.filter(a => a.type === 'investment' && a.status === 'active').length,
      pendingRequests: activities.filter(a => a.status === 'pending').length,
      thisMonth: activities.filter(a => {
        const activityDate = new Date(a.date)
        return activityDate.getMonth() === currentMonth && activityDate.getFullYear() === currentYear
      }).length
    }
  }, [activities])

  return {
    activities,
    loading,
    error,
    refreshActivities,
    stats
  }
}