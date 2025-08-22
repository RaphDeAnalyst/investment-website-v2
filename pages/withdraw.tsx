// pages/withdraw.tsx - Enhanced with Dashboard Sidebar
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../lib/supabase'
import { useGlobalPopup } from '../components/ui/PopupProvider'
import toast from 'react-hot-toast'

interface WithdrawalForm {
  amount: string
  paymentMethod: string
  walletAddress: string
}

interface UserBalance {
  total_balance: number
  available_balance: number
}

export default function Withdraw() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<WithdrawalForm>({
    amount: '',
    paymentMethod: '',
    walletAddress: ''
  })
  
  const router = useRouter()
  const supabase = createSupabaseClient()
  const { showSuccess, showError, showConfirm } = useGlobalPopup()

  const paymentMethods: Record<string, {
    name: string;
    icon: string;
    network: string;
    addressField: string;
  }> = {
    btc: {
      name: 'Bitcoin (BTC)',
      icon: '₿',
      network: 'Bitcoin Network',
      addressField: 'wallet_address_btc'
    },
    usdt_bep20: {
      name: 'USDT (BEP20)',
      icon: '₮',
      network: 'Binance Smart Chain',
      addressField: 'wallet_address_usdt_bep20'
    },
    usdt_erc20: {
      name: 'USDT (ERC20)',
      icon: '₮',
      network: 'Ethereum Network',
      addressField: 'wallet_address_usdt_erc20'
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          router.push('/')
          return
        }
        setUser(user)
        await fetchUserData(user.id)
      } catch (error) {
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch user balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (balanceError) {
        // Create balance record if it doesn't exist
        const { data: newBalance, error: createError } = await supabase
          .from('user_balances')
          .insert([{
            user_id: userId,
            total_balance: 0,
            total_invested: 0,
            total_withdrawn: 0,
            expected_returns: 0,
            available_balance: 0
          }])
          .select()
          .single()

        if (createError) throw createError
        setUserBalance(newBalance)
      } else {
        setUserBalance(balanceData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      showError(
        'Failed to Load Data',
        'Unable to load your account information. Please refresh the page and try again.'
      )
    }
  }

  const handlePaymentMethodChange = (method: string) => {
    setForm(prev => ({ 
      ...prev, 
      paymentMethod: method,
      walletAddress: (method in paymentMethods && profile?.[paymentMethods[method].addressField]) || ''
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const isValidAmount = () => {
    if (!form.amount || !userBalance) return false
    
    const amount = parseFloat(form.amount)
    
    // Minimum withdrawal is $200
    if (amount < 200) return false
    
    // Cannot exceed available balance
    if (amount > userBalance.available_balance) return false
    
    return true
  }

  const canWithdraw = () => {
    return userBalance && userBalance.available_balance >= 200
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isValidAmount() || !form.paymentMethod || !form.walletAddress) {
      showError(
        'Incomplete Form',
        'Please fill in all required fields: amount, payment method, and wallet address.'
      )
      return
    }

    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert([{
          user_id: user.id,
          amount: parseFloat(form.amount),
          payment_method: form.paymentMethod,
          wallet_address: form.walletAddress,
          status: 'pending'
        }])
        .select()

      if (error) throw error

      // Send email notifications (don't block on email failures)
      try {
        const emailPayload = {
          user: {
            id: user.id,
            email: profile?.email || user.email || '',
            full_name: profile?.full_name || ''
          },
          request: {
            id: data[0].id,
            amount: parseFloat(form.amount),
            payment_method: form.paymentMethod,
            wallet_address: form.walletAddress,
            created_at: data[0].created_at
          }
        }

        console.log('📧 Sending withdrawal notifications...')
        const emailResponse = await fetch('/api/notifications/withdrawal-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload)
        })

        if (emailResponse.ok) {
          console.log('✅ Withdrawal notifications sent successfully')
        } else {
          console.warn('⚠️ Withdrawal notifications failed, but withdrawal was created')
        }
      } catch (emailError) {
        console.warn('⚠️ Email notification error:', emailError)
        // Don't throw - email failure shouldn't break the withdrawal flow
      }

      // Reset form
      setForm({
        amount: '',
        paymentMethod: '',
        walletAddress: ''
      })
      
      showSuccess(
        'Withdrawal Submitted!',
        'Your withdrawal request has been submitted successfully and is being processed. You will be redirected to your dashboard.',
        3000
      )
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
      
    } catch (error) {
      console.error('Error submitting withdrawal:', error)
      showError(
        'Withdrawal Failed',
        'Failed to submit withdrawal request. Please check your information and try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading withdrawal page...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Withdraw Funds - Investment Platform</title>
        <meta name="description" content="Withdraw your investment returns" />
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

                <Link href="/withdraw" className="bg-blue-600 text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-white mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Withdraw Funds
                </Link>

                <Link href="/profile" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile Settings
                </Link>
              </nav>

              {/* Logout Button */}
              <div className="flex-shrink-0 px-2 pb-4">
                <button
                  onClick={() => {
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  {/* Header */}
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Withdraw Funds
                    </h1>
                    <p className="text-gray-600">
                      Request a withdrawal from your available balance
                    </p>
                  </div>

                  {/* Balance Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Account Balance
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                        <p className="text-sm font-semibold text-green-700 mb-1">
                          Available Balance
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          {userBalance ? formatCurrency(userBalance.available_balance) : '$0.00'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Total Balance
                        </p>
                        <p className="text-2xl font-bold text-gray-800">
                          {userBalance ? formatCurrency(userBalance.total_balance) : '$0.00'}
                        </p>
                      </div>
                    </div>

                    {/* Withdrawal Eligibility */}
                    {!canWithdraw() && (
                      <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#dc2626">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <h3 className="text-sm font-semibold text-red-700">
                            Withdrawal Not Available
                          </h3>
                        </div>
                        <p className="text-sm text-red-700 mt-2">
                          You need a minimum balance of $200 to make a withdrawal. 
                          {userBalance && userBalance.available_balance < 200 && 
                            ` You currently have ${formatCurrency(userBalance.available_balance)} available.`
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Withdrawal Form */}
                  {canWithdraw() && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Withdrawal Request
                      </h2>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Withdrawal Amount */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Withdrawal Amount (USD) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="200"
                            max={userBalance?.available_balance || 0}
                            value={form.amount}
                            onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                            placeholder="Enter amount to withdraw"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            Minimum withdrawal: $200 | Available: {userBalance ? formatCurrency(userBalance.available_balance) : '$0.00'}
                          </p>
                          
                          {form.amount && !isValidAmount() && (
                            <p className="text-xs text-red-600 mt-1 font-medium">
                              {parseFloat(form.amount) < 200 
                                ? 'Minimum withdrawal amount is $200'
                                : 'Amount exceeds available balance'
                              }
                            </p>
                          )}
                        </div>

                        {/* Payment Method Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Payment Method *
                          </label>
                          
                          <div className="space-y-3">
                            {Object.entries(paymentMethods).map(([key, method]) => (
                              <label
                                key={key}
                                className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                  form.paymentMethod === key 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="paymentMethod"
                                  value={key}
                                  checked={form.paymentMethod === key}
                                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                                  className="w-4 h-4 text-blue-600"
                                  required
                                />
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                  key === 'btc' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                }`}>
                                  {method.icon}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-base font-semibold text-gray-900">
                                    {method.name}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {method.network}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Wallet Address */}
                        {form.paymentMethod && form.paymentMethod in paymentMethods && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {paymentMethods[form.paymentMethod].name} Wallet Address *
                            </label>
                            <input
                              type="text"
                              value={form.walletAddress}
                              onChange={(e) => setForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                              placeholder={`Enter your ${paymentMethods[form.paymentMethod].name} wallet address`}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              required
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              Double-check your wallet address. Funds sent to incorrect addresses cannot be recovered.
                            </p>
                          </div>
                        )}

                        {/* Important Notice */}
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                          <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Important Notice
                          </h4>
                          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                            <li>Processing typically takes 24-48 hours</li>
                            <li>Verify your wallet address before submitting</li>
                            <li>You'll receive email confirmation once processed</li>
                          </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-2">
                          <button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!isValidAmount() || !form.paymentMethod || !form.walletAddress || submitting}
                            className={`flex-2 px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                              (isValidAmount() && form.paymentMethod && form.walletAddress && !submitting)
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            }`}
                          >
                            {submitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                              </>
                            ) : (
                              <>
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Submit Withdrawal Request
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Help Section - Preserved */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Need Help?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      If you have questions about withdrawals or need assistance with your wallet address, 
                      please contact our support team.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <a
                        href="mailto:support@investmentpro.com"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Support
                      </a>
                      <Link
                        href="/help"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help Center
                      </Link>
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
            <Link href="/withdraw" className="flex flex-col items-center py-2 px-3 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs mt-1">Withdraw</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center py-2 px-3 text-gray-600">
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