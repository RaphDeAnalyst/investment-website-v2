// components/profile/SecurityTab.tsx
import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useGlobalPopup } from '../ui/PopupProvider'
import { createSupabaseClient } from '../../lib/supabase'

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface SecurityTabProps {
  profileForm: {
    wallet_address_btc: string
    wallet_address_usdt_bep20: string
    wallet_address_usdt_erc20: string
  }
  saving: boolean
  setSaving: React.Dispatch<React.SetStateAction<boolean>>
}

export function SecurityTab({ profileForm, saving, setSaving }: SecurityTabProps) {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showSuccess, showError } = useGlobalPopup()
  const supabase = createSupabaseClient()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) {
        // Handle specific error cases
        let errorTitle = 'Password Update Failed'
        let errorMessage = 'Failed to update password. Please try again.'
        
        if (error.message) {
          if (error.message.includes('New password should be different from the old password')) {
            errorTitle = 'Password Not Changed'
            errorMessage = 'Your new password must be different from your current password. Please choose a different password.'
          } else if (error.message.includes('Password should be at least')) {
            errorTitle = 'Password Too Weak'
            errorMessage = 'Your password must meet the minimum security requirements. Please choose a stronger password.'
          } else if (error.message.includes('Invalid session')) {
            errorTitle = 'Session Expired'
            errorMessage = 'Your session has expired. Please sign in again.'
          } else {
            errorMessage = error.message
          }
        }
        
        showError(errorTitle, errorMessage)
        return
      }

      showSuccess(
        'Password Updated!',
        'Your password has been updated successfully.',
        3000
      )
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
      
    } catch (error: any) {
      console.error('Error updating password:', error)
      showError(
        'Password Update Failed',
        error.message || 'Failed to update password. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setErrors({})
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Security & Password
        </h2>
        <p className="text-sm text-gray-600">
          Manage your account security settings
        </p>
      </div>

      {/* Change Password Section */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Change Password
        </h3>

        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
            error={errors.currentPassword}
            placeholder="Enter your current password"
            required
          />

          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
            error={errors.newPassword}
            placeholder="Enter your new password"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
            placeholder="Confirm your new password"
            required
          />

          {/* Password Strength Indicator */}
          {passwordForm.newPassword && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
              <div className="space-y-1">
                <div className={`flex items-center text-sm ${
                  passwordForm.newPassword.length >= 6 ? 'text-green-700' : 'text-gray-600'
                }`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${
                    passwordForm.newPassword.length >= 6 ? 'bg-green-500 text-white' : 'bg-gray-300'
                  }`}>
                    {passwordForm.newPassword.length >= 6 ? '✓' : '○'}
                  </span>
                  At least 6 characters long
                </div>
                <div className={`flex items-center text-sm ${
                  passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length > 0 
                    ? 'text-green-700' : 'text-gray-600'
                }`}>
                  <span className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center text-xs ${
                    passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length > 0
                      ? 'bg-green-500 text-white' : 'bg-gray-300'
                  }`}>
                    {passwordForm.newPassword === passwordForm.confirmPassword && passwordForm.newPassword.length > 0 ? '✓' : '○'}
                  </span>
                  Passwords match
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Update Password
            </Button>
          </div>
        </div>
      </form>

      {/* Account Security Information */}
      <div className="p-4 sm:p-6 bg-green-50 rounded-xl border-2 border-green-200 mb-6">
        <h3 className="text-base font-semibold text-green-800 mb-3">
          Account Security Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-sm text-green-800">Email verified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-sm text-green-800">Strong password protection</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={profileForm.wallet_address_btc && profileForm.wallet_address_usdt_bep20 && profileForm.wallet_address_usdt_erc20 ? 'text-green-600' : 'text-yellow-600'}>
              {profileForm.wallet_address_btc && profileForm.wallet_address_usdt_bep20 && profileForm.wallet_address_usdt_erc20 ? '✅' : '⚠️'}
            </span>
            <span className={`text-sm ${
              profileForm.wallet_address_btc && profileForm.wallet_address_usdt_bep20 && profileForm.wallet_address_usdt_erc20 
                ? 'text-green-800' 
                : 'text-yellow-800'
            }`}>
              {profileForm.wallet_address_btc && profileForm.wallet_address_usdt_bep20 && profileForm.wallet_address_usdt_erc20 
                ? 'Wallet addresses configured' 
                : 'Wallet addresses needed for withdrawals'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}