// types/activityTypes.ts
export interface ActivityItem {
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

export interface InvestmentActivity {
  id: string
  investment_name: string
  amount_invested: number
  expected_return_amount: number
  maturity_date: string
  status: string
  created_at: string
}

export interface TransactionActivity {
  id: string
  transaction_type: string
  amount: number
  description: string
  status: string
  transaction_date: string
  investment_id?: string
}

export interface PendingInvestmentActivity {
  id: string
  plan_name: string
  amount_usd: number
  expected_return: number
  payment_method: string
  status: string
  created_at: string
  maturity_date: string
}

export interface WithdrawalActivity {
  id: string
  amount: number
  payment_method: string
  status: string
  created_at: string
}

export type ActivityFilter = 'all' | 'investments' | 'withdrawals' | 'returns'
export type TimeRangeFilter = '7d' | '30d' | '90d' | 'all'

export interface ActivityFilters {
  type: ActivityFilter
  timeRange: TimeRangeFilter
  searchQuery?: string
}

export interface ActivityStats {
  totalActivities: number
  activeInvestments: number
  pendingRequests: number
  thisMonth: number
}

export interface UseActivityDataReturn {
  activities: ActivityItem[]
  loading: boolean
  error: string | null
  refreshActivities: () => Promise<void>
  stats: ActivityStats
}