// components/profile/ProfileCompletionCard.tsx
import { useMemo } from 'react'

interface ProfileCompletionCardProps {
  profileForm: {
    full_name: string
    email: string
    phone_number: string
    country: string
    wallet_address_btc: string
    wallet_address_usdt_bep20: string
    wallet_address_usdt_erc20: string
  }
  avatarPreview: string
  profile: any
}

interface CompletionItem {
  label: string
  completed: boolean
  description: string
}

export function ProfileCompletionCard({ 
  profileForm, 
  avatarPreview, 
  profile 
}: ProfileCompletionCardProps) {
  
  const completionData = useMemo(() => {
    const items: CompletionItem[] = [
      { 
        label: 'Basic Info', 
        completed: !!(profileForm.full_name && profileForm.email),
        description: 'Name and email'
      },
      { 
        label: 'Contact Details', 
        completed: !!(profileForm.phone_number && profileForm.country),
        description: 'Phone and country'
      },
      { 
        label: 'Wallet Addresses', 
        completed: !!(
          profileForm.wallet_address_btc && 
          profileForm.wallet_address_usdt_bep20 && 
          profileForm.wallet_address_usdt_erc20
        ),
        description: 'All crypto wallets'
      },
      { 
        label: 'Profile Picture', 
        completed: !!avatarPreview,
        description: 'Avatar uploaded'
      }
    ]

    const completedCount = items.filter(item => item.completed).length
    const percentage = Math.round((completedCount / items.length) * 100)

    return { items, completedCount, percentage, total: items.length }
  }, [profileForm, avatarPreview])

  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletionBgColor = (percentage: number) => {
    if (percentage === 100) return 'from-green-500 to-green-600'
    if (percentage >= 75) return 'from-blue-500 to-blue-600'
    if (percentage >= 50) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Profile Completion
        </h3>
        <div className={`text-sm font-medium ${getCompletionColor(completionData.percentage)}`}>
          {completionData.completedCount}/{completionData.total} completed
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-20 h-20 mb-3">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(completionData.percentage / 100) * 251.2} 251.2`}
              strokeLinecap="round"
              className="transition-all duration-500 ease-in-out"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={`stop-color-blue-500`} />
                <stop offset="100%" className={`stop-color-blue-600`} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${getCompletionColor(completionData.percentage)}`}>
              {completionData.percentage}%
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 text-center leading-relaxed">
          {completionData.percentage === 100 
            ? '🎉 Profile is complete!' 
            : 'Complete your profile to unlock all features'
          }
        </p>
      </div>

      {/* Completion Items */}
      <div className="space-y-3">
        {completionData.items.map((item, index) => (
          <div 
            key={index} 
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              item.completed 
                ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                : 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
              item.completed ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
              {item.completed ? '✓' : '!'}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${
                item.completed ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {item.label}
              </div>
              <div className={`text-xs ${
                item.completed ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {item.description}
              </div>
            </div>
            {item.completed && (
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Motivational message */}
      {completionData.percentage < 100 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 text-center font-medium">
            {completionData.percentage >= 75 
              ? "🚀 Almost there! Just a few more steps to go."
              : completionData.percentage >= 50
              ? "👍 Great progress! You're halfway there."
              : "🔥 Get started by completing your basic information."
            }
          </p>
        </div>
      )}
    </div>
  )
}