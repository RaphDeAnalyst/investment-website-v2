// pages/profile.tsx - Refactored with extracted components and hooks
import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../lib/supabase'
import { useGlobalPopup } from '../components/ui/PopupProvider'
import { useProfileManagement } from '../hooks/useProfileManagement'
import { useInvestmentData } from '../hooks/useInvestmentData'
import { ProfileInformationTab } from '../components/profile/ProfileInformationTab'
import { SecurityTab } from '../components/profile/SecurityTab'
import { PreferencesTab } from '../components/profile/PreferencesTab'
import { InvestmentCalendar } from '../components/profile/InvestmentCalendar'
import { ProfileCompletionCard } from '../components/profile/ProfileCompletionCard'

export default function ProfileSettings() {
  const router = useRouter()
  const supabase = createSupabaseClient()
  const { showSuccess, showError, showConfirm } = useGlobalPopup()
  
  // Custom hooks
  const {
    profileForm,
    setProfileForm,
    avatarPreview,
    setAvatarPreview,
    saving,
    setSaving,
    user,
    profile,
    updateProfile,
    handleDeleteAccount
  } = useProfileManagement()
  
  const { 
    investments, 
    loading: investmentsLoading,
    activeInvestments 
  } = useInvestmentData()

  // Local state
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')

  // Memoized loading state
  const loading = useMemo(() => {
    return !user || !profile
  }, [user, profile])

  // Redirect to home if not authenticated
  useMemo(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [loading, user, router])

  // Logout handler with styled popup
  const handleLogout = () => {
    showConfirm(
      'Confirm Logout',
      'Are you sure you want to logout?',
      async () => {
        try {
          await supabase.auth.signOut();
          showSuccess(
            'Logged Out',
            'You have been successfully logged out. Redirecting...',
            2000
          )
          setTimeout(() => {
            window.location.href = '/';
          }, 2000)
        } catch (error) {
          showError(
            'Logout Failed',
            'Failed to logout. Please try again.'
          )
        }
      }
    )
  }

  // Loading state
  if (loading) {
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
                  onClick={handleLogout}
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
                              <ProfileInformationTab
                                user={user}
                                profile={profile}
                                profileForm={profileForm}
                                setProfileForm={setProfileForm}
                                avatarPreview={avatarPreview}
                                setAvatarPreview={setAvatarPreview}
                                saving={saving}
                                updateProfile={updateProfile}
                              />
                            )}

                            {/* Security & Password Tab */}
                            {activeTab === 'security' && (
                              <SecurityTab
                                profileForm={profileForm}
                                saving={saving}
                                setSaving={setSaving}
                              />
                            )}

                            {/* Preferences Tab */}
                            {activeTab === 'preferences' && (
                              <PreferencesTab
                                user={user}
                                profileForm={profileForm}
                                saving={saving}
                                handleDeleteAccount={handleDeleteAccount}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar (1/4 width) */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Profile Completion Status Card */}
                      <ProfileCompletionCard
                        profileForm={profileForm}
                        avatarPreview={avatarPreview}
                        profile={profile}
                      />

                      {/* Investment Calendar */}
                      <InvestmentCalendar investments={activeInvestments} />
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
