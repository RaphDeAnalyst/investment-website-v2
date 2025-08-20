// components/dashboard/SummaryCard.tsx
import React from 'react'

interface SummaryCardProps {
  title: string
  amount: number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    period: string
  }
  bgColor: string
  textColor: string
  iconBgColor: string
}

export function SummaryCard({ title, amount, icon, trend, bgColor, textColor, iconBgColor }: SummaryCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% {trend.period}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className={`text-2xl font-bold ${textColor}`}>
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  )
}