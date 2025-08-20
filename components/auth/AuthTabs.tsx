// components/auth/AuthTabs.tsx
import { useState } from 'react'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'

type TabType = 'signin' | 'signup'

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('signin')

  const tabs = [
    { id: 'signin' as const, label: 'Sign In' },
    { id: 'signup' as const, label: 'Sign Up' },
  ]

  const getTabClassName = (isActive: boolean) => {
    return `flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
      isActive
        ? 'bg-white text-gray-900 shadow-sm'
        : 'text-gray-500 hover:text-gray-700'
    }`
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tab Navigation */}
      <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={getTabClassName(activeTab === tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'signin' && <SignInForm />}
        {activeTab === 'signup' && <SignUpForm />}
      </div>
    </div>
  )
}