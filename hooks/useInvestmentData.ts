// hooks/useInvestmentData.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import { createSupabaseClient } from '../lib/supabase'
import { useAuth } from './useAuth'

interface Investment {
  id: string
  user_id: string
  plan_name: string
  amount_usd: number
  expected_return: number
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  created_at: string
  maturity_date?: string
  completed_at?: string
}

interface UseInvestmentDataReturn {
  investments: Investment[]
  loading: boolean
  error: string | null
  activeInvestments: Investment[]
  upcomingMaturities: Investment[]
  totalInvested: number
  totalExpectedReturns: number
  refreshInvestments: () => Promise<void>
  getInvestmentsByStatus: (status: Investment['status']) => Investment[]
  getInvestmentsMaturityInMonth: (date: Date) => Investment[]
}

export function useInvestmentData(): UseInvestmentDataReturn {
  const { user } = useAuth()
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseClient()

  // Fetch investments from database
  const fetchInvestments = useCallback(async () => {
    if (!user?.id) {
      setInvestments([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data: investmentsData, error: fetchError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('Error fetching investments:', fetchError)
        throw fetchError
      }

      setInvestments(investmentsData || [])
    } catch (err: any) {
      console.error('Error fetching investments:', err)
      setError(err.message || 'Failed to load investments')
    } finally {
      setLoading(false)
    }
  }, [user?.id, supabase])

  // Initial load and user change effect
  useEffect(() => {
    fetchInvestments()
  }, [fetchInvestments])

  // Computed values using useMemo for performance
  const activeInvestments = useMemo(() => {
    return investments.filter(investment => investment.status === 'active')
  }, [investments])

  const upcomingMaturities = useMemo(() => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    return investments
      .filter(investment => 
        investment.status === 'active' && 
        investment.maturity_date &&
        new Date(investment.maturity_date) >= now &&
        new Date(investment.maturity_date) <= thirtyDaysFromNow
      )
      .sort((a, b) => 
        new Date(a.maturity_date!).getTime() - new Date(b.maturity_date!).getTime()
      )
  }, [investments])

  const totalInvested = useMemo(() => {
    return investments
      .filter(inv => inv.status === 'active' || inv.status === 'completed')
      .reduce((total, investment) => total + (investment.amount_usd || 0), 0)
  }, [investments])

  const totalExpectedReturns = useMemo(() => {
    return activeInvestments
      .reduce((total, investment) => total + (investment.expected_return || 0), 0)
  }, [activeInvestments])

  // Utility function to get investments by status
  const getInvestmentsByStatus = useCallback((status: Investment['status']) => {
    return investments.filter(investment => investment.status === status)
  }, [investments])

  // Get investments maturing in a specific month
  const getInvestmentsMaturityInMonth = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    return investments.filter(investment => {
      if (!investment.maturity_date || investment.status !== 'active') return false
      
      const maturityDate = new Date(investment.maturity_date)
      return maturityDate.getFullYear() === year && maturityDate.getMonth() === month
    })
  }, [investments])

  // Refresh function for manual updates
  const refreshInvestments = useCallback(async () => {
    await fetchInvestments()
  }, [fetchInvestments])

  return {
    investments,
    loading,
    error,
    activeInvestments,
    upcomingMaturities,
    totalInvested,
    totalExpectedReturns,
    refreshInvestments,
    getInvestmentsByStatus,
    getInvestmentsMaturityInMonth
  }
}