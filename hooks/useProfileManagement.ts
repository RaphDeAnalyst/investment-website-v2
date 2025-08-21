// hooks/useProfileManagement.ts
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useGlobalPopup } from '../components/ui/PopupProvider'

interface ProfileForm {
  full_name: string
  email: string
  phone_number: string
  country: string
  wallet_address_btc: string
  wallet_address_usdt_bep20: string
  wallet_address_usdt_erc20: string
}

export function useProfileManagement() {
  const { user, profile, updateProfile } = useAuth()
  const { showConfirm } = useGlobalPopup()
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: '',
    email: '',
    phone_number: '',
    country: '',
    wallet_address_btc: '',
    wallet_address_usdt_bep20: '',
    wallet_address_usdt_erc20: ''
  })

  // Initialize form data when profile loads
  useEffect(() => {
    if (user && profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        phone_number: profile.phone_number || '',
        country: profile.country || '',
        wallet_address_btc: profile.wallet_address_btc || '',
        wallet_address_usdt_bep20: profile.wallet_address_usdt_bep20 || '',
        wallet_address_usdt_erc20: profile.wallet_address_usdt_erc20 || ''
      })
      setAvatarPreview(profile.avatar_url || '')
    }
  }, [user, profile])

  // Handle account deletion with confirmation
  const handleDeleteAccount = useCallback(() => {
    showConfirm(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.',
      () => {
        showConfirm(
          'Final Confirmation',
          'This is your final warning. Deleting your account will permanently remove all your investment data, transaction history, and profile information. This action cannot be undone.',
          async () => {
            await proceedWithAccountDeletion()
          }
        )
      }
    )
  }, [showConfirm])

  const proceedWithAccountDeletion = async () => {
    try {
      setSaving(true)
      
      // Note: In a real application, you would call a secure server endpoint
      // that handles account deletion with proper cleanup of user data
      console.log('Account deletion requested for user:', user?.id)
      
      // For demo purposes, we'll just show an error
      throw new Error('Account deletion is not implemented in this demo version.')
      
    } catch (error: any) {
      console.error('Error deleting account:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  // Utility functions for form validation
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email'
    return null
  }

  const validatePhone = (phone: string): string | null => {
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return 'Please enter a valid phone number'
    }
    return null
  }

  const validateWalletAddress = (address: string, type: 'btc' | 'bep20' | 'erc20'): string | null => {
    if (!address) return null
    
    switch (type) {
      case 'btc':
        if (address.length < 25) {
          return 'Invalid Bitcoin address format'
        }
        break
      case 'bep20':
      case 'erc20':
        if (!address.startsWith('0x') || address.length !== 42) {
          return `Invalid ${type.toUpperCase()} address format (should start with 0x)`
        }
        break
    }
    return null
  }

  // Form validation
  const validateProfileForm = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!profileForm.full_name.trim()) {
      errors.full_name = 'Full name is required'
    }

    const emailError = validateEmail(profileForm.email)
    if (emailError) errors.email = emailError

    const phoneError = validatePhone(profileForm.phone_number)
    if (phoneError) errors.phone_number = phoneError

    const btcError = validateWalletAddress(profileForm.wallet_address_btc, 'btc')
    if (btcError) errors.wallet_address_btc = btcError

    const bep20Error = validateWalletAddress(profileForm.wallet_address_usdt_bep20, 'bep20')
    if (bep20Error) errors.wallet_address_usdt_bep20 = bep20Error

    const erc20Error = validateWalletAddress(profileForm.wallet_address_usdt_erc20, 'erc20')
    if (erc20Error) errors.wallet_address_usdt_erc20 = erc20Error

    return errors
  }, [profileForm])

  // Real-time field validation
  const validateField = useCallback((field: string, value: string): string | null => {
    switch (field) {
      case 'full_name':
        return value.trim() ? null : 'Full name is required'
      case 'email':
        return validateEmail(value)
      case 'phone_number':
        return validatePhone(value)
      case 'wallet_address_btc':
        return validateWalletAddress(value, 'btc')
      case 'wallet_address_usdt_bep20':
        return validateWalletAddress(value, 'bep20')
      case 'wallet_address_usdt_erc20':
        return validateWalletAddress(value, 'erc20')
      default:
        return null
    }
  }, [])

  return {
    // State
    profileForm,
    setProfileForm,
    avatarPreview,
    setAvatarPreview,
    saving,
    setSaving,
    user,
    profile,
    
    // Functions
    updateProfile,
    handleDeleteAccount,
    validateProfileForm,
    validateField,
    
    // Utilities
    validateEmail,
    validatePhone,
    validateWalletAddress
  }
}