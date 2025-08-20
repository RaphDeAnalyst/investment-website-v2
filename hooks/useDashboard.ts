// hooks/useDashboard.ts (Fixed version that resolves loading)
import { useState, useEffect, useCallback } from 'react'
import { createSupabaseClient } from '../lib/supabase'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

// Updated types
interface UserBalance {
  id: string
  user_id: string
  total_balance: number
  total_invested: number
  total_withdrawn: number
  expected_returns: number
  available_balance: number
  created_at: string
  updated_at: string
}

interface Investment {
  id: string
  user_id: string
  investment_name: string
  investment_type: string
  amount_invested: number
  current_value: number
  expected_return_rate: number
  expected_return_amount: number
  investment_date: string
  maturity_date?: string
  status: 'active' | 'completed' | 'cancelled'
  risk_level: 'low' | 'medium' | 'high'
  description?: string
  icon_url?: string
  created_at: string
  updated_at: string
}

interface Transaction {
  id: string
  user_id: string
  transaction_type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'dividend'
  amount: number
  description: string
  investment_id?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  transaction_date: string
  created_at: string
}

export function useDashboard() {
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const { user } = useAuth()
  const supabase = createSupabaseClient()

  const fetchUserBalance = useCallback(async (userId: string) => {
    try {
      console.log('💰 Fetching balance for user:', userId)
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ No balance record found, creating one...')
          // No balance record exists, create one
          const { data: newBalance, error: createError } = await supabase
            .from('user_balances')
            .insert([{
              user_id: userId,
              total_balance: 0,
              total_invested: 0,
              total_withdrawn: 0,
              expected_returns: 0,
              available_balance: 0
            }])
            .select()
            .single()

          if (createError) {
            console.error('❌ Error creating balance:', createError)
            throw createError
          }
          console.log('✅ Balance created:', newBalance)
          setUserBalance(newBalance)
        } else {
          console.error('❌ Balance fetch error:', error)
          throw error
        }
      } else {
        console.log('✅ Balance fetched:', data)
        setUserBalance(data)
      }
    } catch (error: any) {
      console.error('❌ Error in fetchUserBalance:', error)
      setError('Failed to fetch balance data')
    }
  }, [supabase])

  const fetchInvestments = useCallback(async (userId: string) => {
    try {
      console.log('📈 Fetching investments for user:', userId)
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Investments fetch error:', error)
        throw error
      }
      
      console.log('✅ Investments fetched:', data?.length || 0, 'items')
      setInvestments(data || [])
    } catch (error: any) {
      console.error('❌ Error in fetchInvestments:', error)
      setError('Failed to fetch investments')
    }
  }, [supabase])

  const fetchTransactions = useCallback(async (userId: string, limit = 10) => {
    try {
      console.log('📋 Fetching transactions for user:', userId)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ Transactions fetch error:', error)
        throw error
      }
      
      console.log('✅ Transactions fetched:', data?.length || 0, 'items')
      setTransactions(data || [])
    } catch (error: any) {
      console.error('❌ Error in fetchTransactions:', error)
      setError('Failed to fetch transaction history')
    }
  }, [supabase])

  const fetchDashboardData = useCallback(async (userId: string) => {
    if (!userId) {
      console.log('⚠️ No user ID provided to fetchDashboardData')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Starting dashboard data fetch for user:', userId)
      
      await Promise.all([
        fetchUserBalance(userId),
        fetchInvestments(userId),
        fetchTransactions(userId)
      ])
      
      console.log('✅ Dashboard data fetch completed')
    } catch (error: any) {
      console.error('❌ Error in fetchDashboardData:', error)
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [fetchUserBalance, fetchInvestments, fetchTransactions])

  const updateBalance = useCallback(async (updates: Partial<UserBalance>) => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('user_balances')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      setUserBalance(data)
      return data
    } catch (error: any) {
      console.error('Error updating balance:', error)
      toast.error('Failed to update balance')
      throw error
    }
  }, [user?.id, supabase])

  const createInvestment = useCallback(async (investmentData: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'investment_date'>) => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{
          ...investmentData,
          user_id: user.id,
          investment_date: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      
      // Update investments list
      setInvestments(prev => [data, ...prev])
      
      toast.success('Investment created successfully!')
      return data
    } catch (error: any) {
      console.error('Error creating investment:', error)
      toast.error('Failed to create investment')
      throw error
    }
  }, [user?.id, supabase])

  const createTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'transaction_date'>) => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          user_id: user.id,
          transaction_date: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      
      // Update transactions list
      setTransactions(prev => [data, ...prev])
      
      return data
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      toast.error('Failed to record transaction')
      throw error
    }
  }, [user?.id, supabase])

  // Auto-fetch data when user changes
  useEffect(() => {
    if (user?.id && !initialized) {
      console.log('🚀 User detected, starting data fetch:', user.id)
      fetchDashboardData(user.id)
    } else if (!user?.id) {
      // Clear data when user logs out
      console.log('🧹 Clearing dashboard data (no user)')
      setUserBalance(null)
      setInvestments([])
      setTransactions([])
      setInitialized(false)
      setLoading(false)
      setError(null)
    }
  }, [user?.id, initialized, fetchDashboardData])

  return {
    userBalance,
    investments,
    transactions,
    loading,
    error,
    initialized,
    fetchDashboardData: () => user?.id ? fetchDashboardData(user.id) : Promise.resolve(),
    fetchUserBalance: () => user?.id ? fetchUserBalance(user.id) : Promise.resolve(),
    fetchInvestments: () => user?.id ? fetchInvestments(user.id) : Promise.resolve(),
    fetchTransactions: (limit?: number) => user?.id ? fetchTransactions(user.id, limit) : Promise.resolve(),
    updateBalance,
    createInvestment,
    createTransaction
  }
}