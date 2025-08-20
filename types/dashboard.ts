// types/dashboard.ts (Create this file)
export interface UserBalance {
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

export interface Investment {
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

export interface Transaction {
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