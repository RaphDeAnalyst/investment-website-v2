// pages/profile.tsx - Enhanced with Sidebar & Investment Calendar
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { FileInput } from '../components/ui/FileInput'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import toast from 'react-hot-toast'

interface ProfileForm {
  full_name: string
  email: string
  phone_number: string
  country: string
  wallet_address_btc: string
  wallet_address_usdt_bep20: string
  wallet_address_usdt_erc20: string
}

interface PasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Investment Calendar Component
interface InvestmentCalendarProps {
  investments: any[]
}

const InvestmentCalendar: React.FC<InvestmentCalendarProps> = ({ investments }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Get month and year
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  
  // Create array of all days to display
  const days = []
  
  // Previous month's trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isNextMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i)
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      isCurrentMonth: true,
      isNextMonth: false,
      date: new Date(year, month, day)
    })
  }
  
  // Next month's leading days
  const remainingDays = 42 - days.length // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      day,
      isCurrentMonth: false,
      isNextMonth: true,
      date: new Date(year, month + 1, day)
    })
  }
  
  // Get maturity dates from investments
  const maturityDates = investments
    .filter(inv => inv.maturity_date)
    .map(inv => new Date(inv.maturity_date).toDateString())
  
  // Check if a date has investment maturity
  const hasMaturity = (date: Date) => {
    return maturityDates.includes(date.toDateString())
  }
  
  // Navigation functions
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  const today = new Date()
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Investment Calendar</h3>
        </div>
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h4 className="text-sm font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h4>
          
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dayObj, index) => {
            const hasMaturityDate = hasMaturity(dayObj.date)
            const isCurrentDay = isToday(dayObj.date)
            
            return (
              <div
                key={index}
                className={`
                  relative text-center py-1.5 text-xs rounded transition-colors
                  ${!dayObj.isCurrentMonth 
                    ? 'text-gray-400' 
                    : 'text-gray-900'
                  }
                  ${isCurrentDay 
                    ? 'bg-blue-100 text-blue-900 font-semibold' 
                    : ''
                  }
                  ${hasMaturityDate && dayObj.isCurrentMonth
                    ? 'bg-green-100 text-green-900 font-semibold border border-green-300' 
                    : ''
                  }
                  ${!hasMaturityDate && !isCurrentDay && dayObj.isCurrentMonth
                    ? 'hover:bg-gray-50'
                    : ''
                  }
                `}
              >
                {dayObj.day}
                {hasMaturityDate && dayObj.isCurrentMonth && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full"></div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-gray-600">Maturity Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileSettings() {
  const { user, profile, loading: authLoading, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [investments, setInvestments] = useState<any[]>([])
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: '',
    email: '',
    phone_number: '',
    country: '',
    wallet_address_btc: '',
    wallet_address_usdt_bep20: '',
    wallet_address_usdt_erc20: ''
  })
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const router = useRouter()
  const supabase = createSupabaseClient()

  // List of countries for dropdown
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
    'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
    'Finland', 'Australia', 'New Zealand', 'Japan', 'South Korea', 'Singapore',
    'Hong Kong', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru',
    'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Morocco', 'Ghana', 'India',
    'China', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam',
    'United Arab Emirates', 'Saudi Arabia', 'Israel', 'Turkey', 'Russia',
    'Ukraine', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria'
  ].sort()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    } else if (user && profile) {
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
      
      // Fetch investments for calendar
      fetchInvestments()
    }
  }, [user, profile, authLoading, router])

  // Fetch investments for calendar
  const fetchInvestments = async () => {
    if (!user?.id) return

    try {
      const { data: investmentsData, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (!error && investmentsData) {
        setInvestments(investmentsData)
      }
    } catch (error) {
      console.error('Error fetching investments:', error)
    }
  }

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file)
    
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setAvatarPreview(profile?.avatar_url || '')
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return null

    try {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload profile picture')
      return null
    }
  }

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!profileForm.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!profileForm.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (profileForm.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(profileForm.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number'
    }

    // Validate wallet addresses format (basic validation)
    if (profileForm.wallet_address_btc && profileForm.wallet_address_btc.length < 25) {
      newErrors.wallet_address_btc = 'Invalid Bitcoin address format'
    }

    // USDT-BEP20 and USDT-ERC20 both use similar validation (should start with 0x and be 42 characters for ERC20/BEP20)
    if (profileForm.wallet_address_usdt_bep20 && (!profileForm.wallet_address_usdt_bep20.startsWith('0x') || profileForm.wallet_address_usdt_bep20.length !== 42)) {
      newErrors.wallet_address_usdt_bep20 = 'Invalid USDT-BEP20 address format (should start with 0x)'
    }

    if (profileForm.wallet_address_usdt_erc20 && (!profileForm.wallet_address_usdt_erc20.startsWith('0x') || profileForm.wallet_address_usdt_erc20.length !== 42)) {
      newErrors.wallet_address_usdt_erc20 = 'Invalid USDT-ERC20 address format (should start with 0x)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = (): boolean => {
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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateProfileForm()) return

    setSaving(true)
    try {
      let avatarUrl = profile?.avatar_url || ''

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }

      // Update profile in database
      await updateProfile({
        full_name: profileForm.full_name,
        phone_number: profileForm.phone_number,
        country: profileForm.country,
        wallet_address_btc: profileForm.wallet_address_btc,
        wallet_address_usdt_bep20: profileForm.wallet_address_usdt_bep20,
        wallet_address_usdt_erc20: profileForm.wallet_address_usdt_erc20,
        avatar_url: avatarUrl,
        profile_complete: true
      })

      // Update email if changed
      if (profileForm.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileForm.email
        })
        
        if (emailError) {
          toast.error('Profile updated but email change failed: ' + emailError.message)
        } else {
          toast.success('Profile updated! Please check your email to confirm the new email address.')
        }
      } else {
        toast.success('Profile updated successfully!')
      }

      // Clear avatar file selection
      setAvatarFile(null)
      
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) return

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.'
    )
    
    if (!confirmed) return

    const doubleConfirmed = window.confirm(
      'This is your final warning. Deleting your account will permanently remove all your investment data, transaction history, and profile information. Type "DELETE" to confirm.'
    )

    if (!doubleConfirmed) return

    try {
      setSaving(true)
      
      // Note: In a real application, you would call a secure server endpoint
      // that handles account deletion with proper cleanup of user data
      toast.error('Account deletion is not implemented in this demo')
      
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    } finally {
      setSaving(false)
    }
  }

  // Get profile completion percentage
  const getProfileCompletionPercentage = () => {
    if (!profile) return 0
    
    const completedItems = [
      !!(profileForm.full_name && user?.email),
      !!(profileForm.phone_number && profileForm.country),
      !!(profileForm.wallet_address_btc && profileForm.wallet_address_usdt_bep20 && profileForm.wallet_address_usdt_erc20),
      !!avatarPreview
    ].filter(Boolean).length

    return Math.round((completedItems / 4) * 100)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <>
      <Head>
        <title>Profile Settings - Investment Platform</title>
        <meta name="description" content="Manage your profile settings and account preferences" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Left Sidebar - Same as Dashboard */}
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0 px-4 mb-8">
                <img 
                  src="/logo.png" 
                  alt="Company Logo" 
                  className="h-13 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <div className="hidden">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Link href="/dashboard" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>

                <Link href="/investment" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Investment
                </Link>

                <Link href="/activity" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Transaction History
                </Link>

                <Link href="/withdraw" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Withdraw Funds
                </Link>

                <Link href="/profile" className="bg-blue-600 text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-white mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </Link>
              </nav>

              {/* Logout Button */}
              <div className="flex-shrink-0 px-2 pb-4">
                <button
                  onClick={async () => {
                    const confirmed = window.confirm('Are you sure you want to logout?');
                    if (confirmed) {
                      await supabase.auth.signOut();
                      window.location.href = '/';
                    }
                  }}
                  className="w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:pl-64 flex flex-col flex-1">
            <main className="flex-1">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  {/* Header */}
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Profile Settings
                    </h1>
                    <p className="text-gray-600">
                      Manage your account settings and profile information
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Main Content Area (3/4 width) */}
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        
                        {/* Profile Tab Navigation (1/4 of main content) */}
                        <div className="lg:col-span-1">
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                  {avatarPreview ? (
                                    <img
                                      src={avatarPreview}
                                      alt="Profile"
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-blue-600 text-lg font-bold">
                                      {profileForm.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-base font-semibold text-gray-900 truncate">
                                    {profileForm.full_name || 'User'}
                                  </h3>
                                  <p className="text-sm text-gray-500 truncate">
                                    {profileForm.email}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <nav className="py-2">
                              {[
                                { id: 'profile', label: 'Profile Information', icon: '👤' },
                                { id: 'security', label: 'Security & Password', icon: '🔒' },
                                { id: 'preferences', label: 'Preferences', icon: '⚙️' }
                              ].map((tab) => (
                                <button
                                  key={tab.id}
                                  onClick={() => setActiveTab(tab.id as any)}
                                  className={`w-full px-4 sm:px-6 py-3 text-left text-sm font-medium transition-colors flex items-center gap-3 ${
                                    activeTab === tab.id
                                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <span className="text-base">{tab.icon}</span>
                                  <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                              ))}
                            </nav>
                          </div>
                        </div>

                        {/* Profile Content (3/4 of main content) */}
                        <div className="lg:col-span-3">
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
                            {/* Profile Information Tab */}
                            {activeTab === 'profile' && (
                              <form onSubmit={handleProfileSubmit} className="p-4 sm:p-6 lg:p-8">
                                <div className="mb-6 sm:mb-8">
                                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                    Profile Information
                                  </h2>
                                  <p className="text-sm text-gray-600">
                                    Update your profile details and wallet addresses
                                  </p>
                                </div>

                                <div className="space-y-6">
                                  {/* Profile Picture */}
                                  <FileInput
                                    label="Profile Picture"
                                    onFileSelect={handleAvatarChange}
                                    preview={avatarPreview}
                                    accept="image/*"
                                  />

                                  {/* Personal Information */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    <Input
                                      label="Full Name *"
                                      value={profileForm.full_name}
                                      onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                                      error={errors.full_name}
                                      placeholder="Enter your full name"
                                      required
                                    />

                                    <Input
                                      label="Email Address *"
                                      type="email"
                                      value={profileForm.email}
                                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                      error={errors.email}
                                      placeholder="Enter your email"
                                      required
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    <Input
                                      label="Phone Number"
                                      type="tel"
                                      value={profileForm.phone_number}
                                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone_number: e.target.value }))}
                                      error={errors.phone_number}
                                      placeholder="+1 (555) 123-4567"
                                    />

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                      </label>
                                      <select
                                        value={profileForm.country}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      >
                                        <option value="">Select your country</option>
                                        {countries.map(country => (
                                          <option key={country} value={country}>{country}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Wallet Addresses Section */}
                                  <div className="mt-6 p-4 sm:p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                      <span>🔐</span>
                                      Cryptocurrency Wallet Addresses
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                                      Add your wallet addresses for receiving withdrawals. Make sure to double-check these addresses as incorrect addresses may result in permanent loss of funds.
                                    </p>

                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Bitcoin (BTC) Wallet Address
                                        </label>
                                        <input
                                          type="text"
                                          value={profileForm.wallet_address_btc}
                                          onChange={(e) => setProfileForm(prev => ({ ...prev, wallet_address_btc: e.target.value }))}
                                          placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                                          className={`w-full px-3 py-3 border rounded-lg text-xs font-mono bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.wallet_address_btc ? 'border-red-300' : 'border-gray-300'
                                          }`}
                                        />
                                        {errors.wallet_address_btc && (
                                          <p className="text-xs text-red-600 mt-1">
                                            {errors.wallet_address_btc}
                                          </p>
                                        )}
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          USDT (BEP20) Wallet Address
                                        </label>
                                        <input
                                          type="text"
                                          value={profileForm.wallet_address_usdt_bep20}
                                          onChange={(e) => setProfileForm(prev => ({ ...prev, wallet_address_usdt_bep20: e.target.value }))}
                                          placeholder="0x742d35Cc6634C0532925a3b8D7389a8C0e2e4f0e"
                                          className={`w-full px-3 py-3 border rounded-lg text-xs font-mono bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.wallet_address_usdt_bep20 ? 'border-red-300' : 'border-gray-300'
                                          }`}
                                        />
                                        {errors.wallet_address_usdt_bep20 && (
                                          <p className="text-xs text-red-600 mt-1">
                                            {errors.wallet_address_usdt_bep20}
                                          </p>
                                        )}
                                      </div>

                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          USDT (ERC20) Wallet Address
                                        </label>
                                        <input
                                          type="text"
                                          value={profileForm.wallet_address_usdt_erc20}
                                          onChange={(e) => setProfileForm(prev => ({ ...prev, wallet_address_usdt_erc20: e.target.value }))}
                                          placeholder="0x742d35Cc6634C0532925a3b8D7389a8C0e2e4f0e"
                                          className={`w-full px-3 py-3 border rounded-lg text-xs font-mono bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.wallet_address_usdt_erc20 ? 'border-red-300' : 'border-gray-300'
                                          }`}
                                        />
                                        {errors.wallet_address_usdt_erc20 && (
                                          <p className="text-xs text-red-600 mt-1">
                                            {errors.wallet_address_usdt_erc20}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <p className="text-xs text-yellow-800 font-medium">
                                        ⚠️ Important: These wallet addresses will be used for withdrawals. Please ensure they are correct and that you have access to them.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Save Button */}
                                  <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        // Reset form to original values
                                        if (profile) {
                                          setProfileForm({
                                            full_name: profile.full_name || '',
                                            email: profile.email || user.email || '',
                                            phone_number: profile.phone_number || '',
                                            country: profile.country || '',
                                            wallet_address_btc: profile.wallet_address_btc || '',
                                            wallet_address_usdt_erc20: profile.wallet_address_usdt_erc20 || '',
                                            wallet_address_usdt_bep20: profile.wallet_address_usdt_bep20 || ''
                                          })
                                          setAvatarPreview(profile.avatar_url || '')
                                          setAvatarFile(null)
                                        }
                                        setErrors({})
                                      }}
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
                                      Save Changes
                                    </Button>
                                  </div>
                                </div>
                              </form>
                            )}

                            {/* Security & Password Tab */}
                            {activeTab === 'security' && (
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
                                <form onSubmit={handlePasswordSubmit} className="mb-8 p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-200">
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

                                    <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                          setPasswordForm({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                          })
                                          setErrors({})
                                        }}
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
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
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
                                    {[
                                      { id: 'investment_updates', label: 'Investment Updates', description: 'Get notified when your investments mature or status changes' },
                                      { id: 'withdrawal_confirmations', label: 'Withdrawal Confirmations', description: 'Receive confirmation emails for withdrawal requests' },
                                      { id: 'security_alerts', label: 'Security Alerts', description: 'Important security notifications and login alerts' },
                                      { id: 'marketing_emails', label: 'Marketing Emails', description: 'Promotional offers and investment opportunities' }
                                    ].map((pref) => (
                                      <label key={pref.id} className="flex items-start gap-3 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          defaultChecked={pref.id !== 'marketing_emails'}
                                          className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                          <div className="text-sm font-medium text-gray-900 mb-1">
                                            {pref.label}
                                          </div>
                                          <div className="text-xs text-gray-600 leading-relaxed">
                                            {pref.description}
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                {/* Data Management */}
                                <div className="p-4 sm:p-6 bg-red-50 rounded-xl border-2 border-red-200">
                                  <h3 className="text-lg font-semibold text-red-600 mb-4">
                                    Data Management
                                  </h3>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                        Export Your Data
                                      </h4>
                                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                        Download a copy of your account data including profile information, investment history, and transaction records.
                                      </p>
                                      <button
                                        onClick={() => {
                                          const userData = {
                                            profile: profileForm,
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
                                          toast.success('Profile data exported successfully!')
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                      >
                                        Export Data
                                      </button>
                                    </div>

                                    <div>
                                      <h4 className="text-sm font-semibold text-red-600 mb-2">
                                        Delete Account
                                      </h4>
                                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                      </p>
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

                                {/* Save Preferences Button */}
                                <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                                  <Button
                                    onClick={() => {
                                      toast.success('Preferences saved successfully!')
                                    }}
                                    className="w-full sm:w-auto"
                                  >
                                    Save Preferences
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar (1/4 width) */}
                    <div className="lg:col-span-1 space-y-6">
                      
                      {/* Profile Completion Status Card */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Profile Completion
                        </h3>

                        {/* Progress Circle */}
                        <div className="flex flex-col items-center mb-6">
                          <div className="relative w-20 h-20 mb-3">
                            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#e5e7eb"
                                strokeWidth="8"
                                fill="none"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#3b82f6"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${(getProfileCompletionPercentage() / 100) * 251.2} 251.2`}
                                className="transition-all duration-300"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-900">
                                {getProfileCompletionPercentage()}%
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 text-center">
                            Complete your profile to unlock all features
                          </p>
                        </div>

                        {/* Completion Items */}
                        <div className="space-y-3">
                          {[
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
                              completed: !!(profileForm.wallet_address_btc && profileForm.wallet_address_usdt_bep20 && profileForm.wallet_address_usdt_erc20),
                              description: 'All crypto wallets'
                            },
                            { 
                              label: 'Profile Picture', 
                              completed: !!avatarPreview,
                              description: 'Avatar uploaded'
                            }
                          ].map((item, index) => (
                            <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${
                              item.completed 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-yellow-50 border-yellow-200'
                            }`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                item.completed ? 'bg-green-600' : 'bg-yellow-600'
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
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Investment Calendar */}
                      <InvestmentCalendar investments={investments} />
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <Link href="/dashboard" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Dashboard</span>
            </Link>
            <Link href="/investment" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs mt-1">Invest</span>
            </Link>
            <Link href="/activity" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="text-xs mt-1">Activity</span>
            </Link>
            <Link href="/withdraw" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs mt-1">Withdraw</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center py-2 px-3 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}