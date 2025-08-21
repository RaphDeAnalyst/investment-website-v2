// components/profile/PreferencesTab.tsx
import { useState } from 'react'
import { Button } from '../ui/Button'
import { useGlobalPopup } from '../ui/PopupProvider'

interface PreferencesTabProps {
  user: any
  profileForm: {
    full_name: string
    email: string
    phone_number: string
    country: string
  }
  saving: boolean
  handleDeleteAccount: () => void
}

interface NotificationPreferences {
  investment_updates: boolean
  withdrawal_confirmations: boolean
  security_alerts: boolean
  marketing_emails: boolean
}

export function PreferencesTab({ 
  user, 
  profileForm, 
  saving, 
  handleDeleteAccount 
}: PreferencesTabProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    investment_updates: true,
    withdrawal_confirmations: true,
    security_alerts: true,
    marketing_emails: false
  })
  
  const { showSuccess } = useGlobalPopup()

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleSavePreferences = () => {
    // In a real app, you would save these preferences to the database
    showSuccess(
      'Preferences Saved',
      'Your preferences have been saved successfully.',
      3000
    )
  }

  const handleExportData = () => {
    const userData = {
      profile: profileForm,
      preferences,
      exportDate: new Date().toISOString(),
      accountCreated: user?.created_at
    }
    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    showSuccess(
      'Data Exported',
      'Your profile data has been exported successfully.',
      3000
    )
  }

  const notificationOptions = [
    { 
      id: 'investment_updates' as keyof NotificationPreferences,
      label: 'Investment Updates', 
      description: 'Get notified when your investments mature or status changes' 
    },
    { 
      id: 'withdrawal_confirmations' as keyof NotificationPreferences,
      label: 'Withdrawal Confirmations', 
      description: 'Receive confirmation emails for withdrawal requests' 
    },
    { 
      id: 'security_alerts' as keyof NotificationPreferences,
      label: 'Security Alerts', 
      description: 'Important security notifications and login alerts' 
    },
    { 
      id: 'marketing_emails' as keyof NotificationPreferences,
      label: 'Marketing Emails', 
      description: 'Promotional offers and investment opportunities' 
    }
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Preferences
        </h2>
        <p className="text-sm text-gray-600">
          Customize your account preferences and notifications
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="mb-8 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Email Notifications
        </h3>

        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <label key={option.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences[option.id]}
                onChange={(e) => handlePreferenceChange(option.id, e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {option.label}
                </div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={handleSavePreferences}
            className="w-full sm:w-auto"
          >
            Save Notification Preferences
          </Button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="mb-8 p-4 sm:p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">
          Privacy & Data Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mt-0.5">
              i
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Data Processing
              </div>
              <div className="text-xs text-blue-700 leading-relaxed">
                Your personal data is processed according to our privacy policy to provide investment services and comply with regulatory requirements.
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mt-0.5">
              🔒
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-900 mb-1">
                Data Security
              </div>
              <div className="text-xs text-blue-700 leading-relaxed">
                All sensitive data is encrypted and stored securely. We never share your personal information with third parties without consent.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="p-4 sm:p-6 bg-red-50 rounded-xl border-2 border-red-200">
        <h3 className="text-lg font-semibold text-red-600 mb-4">
          Data Management
        </h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Export Your Data
            </h4>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Download a copy of your account data including profile information, preferences, and account settings.
            </p>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export Data
            </button>
          </div>

          <div className="border-t border-red-200 pt-6">
            <h4 className="text-sm font-semibold text-red-600 mb-2">
              Delete Account
            </h4>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-xs text-red-800 font-medium">
                ⚠️ Warning: This will permanently delete all your investment data, transaction history, and profile information.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={saving}
              className={`px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg transition-colors ${
                saving ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-700'
              }`}
            >
              {saving ? 'Processing...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}