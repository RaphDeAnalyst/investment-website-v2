// components/dashboard/PortfolioCard.tsx
import React from 'react'
import { Investment } from '../../types/dashboard'

interface PortfolioCardProps {
  investment: Investment
  onClick?: () => void
}

export function PortfolioCard({ investment, onClick }: PortfolioCardProps) {
  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getReturnColor = () => {
    const returnAmount = investment.current_value - investment.amount_invested
    return returnAmount >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stocks':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'crypto':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      case 'bonds':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
    }
  }

  return (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            {getTypeIcon(investment.investment_type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{investment.investment_name}</h3>
            <p className="text-sm text-gray-500 capitalize">{investment.investment_type}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(investment.risk_level)}`}>
          {investment.risk_level.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Invested</p>
          <p className="font-semibold text-gray-900">{formatCurrency(investment.amount_invested)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Current Value</p>
          <p className="font-semibold text-gray-900">{formatCurrency(investment.current_value)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Expected Return</p>
          <p className="font-semibold text-gray-900">{formatCurrency(investment.expected_return_amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Return Rate</p>
          <p className={`font-semibold ${getReturnColor()}`}>
            {investment.expected_return_rate}%
          </p>
        </div>
      </div>

      {investment.description && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">{investment.description}</p>
        </div>
      )}
    </div>
  )
}
