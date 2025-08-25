// pages/investment.tsx - Enhanced with Dashboard Sidebar
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../lib/supabase'
import { ChatWidget } from '../components/ChatWidget'
import { useGlobalPopup } from '../components/ui/PopupProvider'
import toast from 'react-hot-toast'

interface InvestmentPlan {
  id: string
  name: string
  minAmount: number
  maxAmount: number | null
  duration: number
  interestRate: number
  risk: 'low' | 'medium' | 'high'
  description: string
  features: string[]
  popular?: boolean
}

interface CalculatorState {
  selectedPlan: InvestmentPlan | null
  amount: string
  isOpen: boolean
}

interface PaymentState {
  isOpen: boolean
  selectedMethod: string
  step: 'method' | 'payment' | 'confirm'
  btcRate: number
  loading: boolean
}

export default function Investment() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [calculator, setCalculator] = useState<CalculatorState>({
    selectedPlan: null,
    amount: '',
    isOpen: false
  })
  const [payment, setPayment] = useState<PaymentState>({
    isOpen: false,
    selectedMethod: '',
    step: 'method',
    btcRate: 0,
    loading: false
  })
  const [paymentForm, setPaymentForm] = useState({
    transactionHash: '',
    customAmount: ''
  })
  
  const router = useRouter()
  const supabase = createSupabaseClient()
  const { showSuccess, showError, showConfirm } = useGlobalPopup()

  const investmentPlans: InvestmentPlan[] = [
    {
      id: 'compact',
      name: 'Compact Plan',
      minAmount: 200,
      maxAmount: 20000,
      duration: 5,
      interestRate: 2.5,
      risk: 'low',
      description: 'Perfect for beginners looking to start their investment journey with minimal risk.',
      features: [
        '5-day investment period',
        '2.5% guaranteed returns',
        'Low risk investment',
        'Instant portfolio updates',
        'Email notifications'
      ]
    },
    {
      id: 'master',
      name: 'Master Plan',
      minAmount: 20000,
      maxAmount: 100000,
      duration: 10,
      interestRate: 3.5,
      risk: 'medium',
      description: 'Ideal for experienced investors seeking higher returns with moderate risk.',
      features: [
        '10-day investment period',
        '3.5% guaranteed returns',
        'Medium risk investment',
        'Priority customer support',
        'Daily portfolio reports',
        'Investment insights'
      ],
      popular: true
    },
    {
      id: 'ultimate',
      name: 'Ultimate Plan',
      minAmount: 100000,
      maxAmount: null,
      duration: 20,
      interestRate: 5.0,
      risk: 'high',
      description: 'Maximum returns for high-net-worth investors willing to take calculated risks.',
      features: [
        '20-day investment period',
        '5% guaranteed returns',
        'High yield investment',
        'Dedicated account manager',
        'Real-time market analysis',
        'VIP customer service',
        'Exclusive investment opportunities'
      ]
    }
  ]

  // Payment methods configuration
  const paymentMethods: Record<string, {
    name: string;
    address: string;
    icon: string;
    network: string;
  }> = {
    btc: {
      name: 'Bitcoin (BTC)',
      address: 'bc1qmeljv3lhtmvyew2cw8zgkcwjl2gsd08tp5d6cz',
      icon: '₿',
      network: 'Bitcoin Network'
    },
    usdt_bep20: {
      name: 'USDT (BEP20)',
      address: '0xb14D7Ee1D74D549e51b4B3A2b79FcC6Ba428072B',
      icon: '₮',
      network: 'Binance Smart Chain'
    },
    usdt_erc20: {
      name: 'USDT (ERC20)',
      address: '0xb14D7Ee1D74D549e51b4B3A2b79FcC6Ba428072B',
      icon: '₮',
      network: 'Ethereum Network'
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
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  // Fetch BTC rate from multiple sources
  const fetchBTCRate = async () => {
    try {
      // Primary: CoinGecko API (free, no API key required)
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      const data = await response.json()
      return data.bitcoin.usd
    } catch (error) {
      try {
        // Fallback: Binance API
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
        const data = await response.json()
        return parseFloat(data.price)
      } catch (fallbackError) {
        try {
          // Fallback 2: CoinCap API
          const response = await fetch('https://api.coincap.io/v2/assets/bitcoin')
          const data = await response.json()
          return parseFloat(data.data.priceUsd)
        } catch (finalError) {
          // Fallback to static rate if all APIs fail
          console.error('All BTC rate APIs failed:', finalError)
          return 45000 // Static fallback rate
        }
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatBTC = (amount: number) => {
    return amount.toFixed(8) + ' BTC'
  }

  const getPlanColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'medium': return 'bg-green-100 text-green-800 border-green-200'
      case 'high': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPlanAccentColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#2563eb'
      case 'medium': return '#059669'
      case 'high': return '#7c3aed'
      default: return '#6b7280'
    }
  }

  const openCalculator = (plan: InvestmentPlan) => {
    setCalculator({
      selectedPlan: plan,
      amount: plan.minAmount.toString(),
      isOpen: true
    })
  }

  const closeCalculator = () => {
    setCalculator({
      selectedPlan: null,
      amount: '',
      isOpen: false
    })
  }

  const calculateReturns = () => {
    if (!calculator.selectedPlan || !calculator.amount) return { profit: 0, total: 0 }
    
    const amount = parseFloat(calculator.amount)
    const dailyRate = calculator.selectedPlan.interestRate / 100
    const days = calculator.selectedPlan.duration
    
    // Calculate daily simple interest: A = P(1 + r*t)
    const total = amount * (1 + dailyRate * days)
    const profit = total - amount
    
    return { profit, total }
  }

  const isValidAmount = () => {
    if (!calculator.selectedPlan || !calculator.amount) return false
    
    const amount = parseFloat(calculator.amount)
    const plan = calculator.selectedPlan
    
    if (amount < plan.minAmount) return false
    if (plan.maxAmount && amount > plan.maxAmount) return false
    
    return true
  }

  const proceedToPayment = async () => {
    if (!isValidAmount()) return
    
    // Don't close calculator yet - we need selectedPlan for submission
    setCalculator(prev => ({ ...prev, isOpen: false })) // Only close the modal
    setPayment({ ...payment, isOpen: true, loading: true })
    
    // Fetch current BTC rate
    const rate = await fetchBTCRate()
    setPayment(prev => ({ ...prev, btcRate: rate, loading: false }))
  }

  const selectPaymentMethod = (method: string) => {
    setPayment(prev => ({ ...prev, selectedMethod: method, step: 'payment' }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showSuccess(
      'Address Copied',
      'Payment address has been copied to your clipboard.',
      2000
    )
  }

  // Helper function to safely parse and format numbers
  const safeParseFloat = (value: string | number): number => {
    if (typeof value === 'number') return value
    if (!value || value === '') return 0
    const parsed = parseFloat(value.toString())
    return isNaN(parsed) ? 0 : parsed
  }

  // Helper function to safely format currency
  const safeCurrencyFormat = (value: string | number): string => {
    const numericValue = safeParseFloat(value)
    return formatCurrency(numericValue)
  }

  // Add validation function for payment step
  const canProceedToConfirm = () => {
    return paymentForm.customAmount && parseFloat(paymentForm.customAmount) > 0
  }

  const submitPayment = async () => {
    console.log('🔄 Starting payment submission...')
    console.log('Payment form data:', paymentForm)
    console.log('Calculator data:', calculator)
    console.log('User:', user?.id)
    
    if (!calculator.selectedPlan) {
      console.log('❌ Missing required data')
      showError(
        'Payment Failed',
        'Missing investment plan data. Please select a plan and try again.'
      )
      return
    }

    // Use the amount from payment step (customAmount) as the final amount
    const finalAmount = safeParseFloat(paymentForm.customAmount)

    if (finalAmount < 1) {
      console.log('❌ Amount too small')
      showError(
        'Invalid Amount',
        'Please enter a valid payment amount greater than $1.'
      )
      return
    }

    try {
      console.log('💰 Processing payment submission...')
      setPayment(prev => ({ ...prev, loading: true }))
      
      // Calculate maturity date
      const maturityDate = new Date()
      maturityDate.setDate(maturityDate.getDate() + calculator.selectedPlan.duration)

      // Calculate expected return based on the final amount, not calculator amount
      const dailyRate = calculator.selectedPlan.interestRate / 100
      const days = calculator.selectedPlan.duration
      const total = finalAmount * (1 + dailyRate * days)
      const profit = total - finalAmount

      const submissionData = {
        user_id: user.id,
        plan_id: calculator.selectedPlan.id,
        plan_name: calculator.selectedPlan.name,
        amount_usd: finalAmount,
        expected_return: profit,
        duration_days: calculator.selectedPlan.duration,
        interest_rate: calculator.selectedPlan.interestRate,
        payment_method: payment.selectedMethod,
        transaction_hash: paymentForm.transactionHash || null,
        maturity_date: maturityDate.toISOString(),
        status: 'pending'
      }
      
      console.log('📋 Submission data:', submissionData)
      
      // Create pending investment record
      const { data, error } = await supabase
        .from('pending_investments')
        .insert([submissionData])
        .select()

      console.log('📤 Supabase response:', { data, error })

      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }
      
      console.log('✅ Payment submitted successfully!')
      
      // Send email notifications (don't block on email failures)
      try {
        // Ensure we have a valid email address
        const userEmail = profile?.email || user?.email || ''
        
        console.log('📧 Preparing investment notification email payload...', {
          userId: user.id,
          profileEmail: profile?.email,
          userEmail: user?.email,
          finalEmail: userEmail,
          hasProfile: !!profile,
          profileData: profile ? { id: profile.id, email: profile.email, name: profile.full_name } : 'No profile'
        })

        if (!userEmail) {
          console.error('❌ No email address found for investment notification')
          throw new Error('No email address available')
        }

        const emailPayload = {
          user: {
            id: user.id,
            email: userEmail,
            full_name: profile?.full_name || ''
          },
          request: {
            id: data[0].id,
            plan_name: submissionData.plan_name,
            amount_usd: submissionData.amount_usd,
            expected_return: submissionData.expected_return,
            duration_days: submissionData.duration_days,
            interest_rate: submissionData.interest_rate,
            payment_method: submissionData.payment_method,
            transaction_hash: submissionData.transaction_hash,
            maturity_date: submissionData.maturity_date,
            created_at: data[0].created_at
          }
        }

        console.log('📧 Sending investment notifications with payload:', {
          userEmail: emailPayload.user.email,
          requestId: emailPayload.request.id,
          planName: emailPayload.request.plan_name,
          amount: emailPayload.request.amount_usd
        })

        const emailResponse = await fetch('/api/notifications/investment-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailPayload)
        })

        const responseText = await emailResponse.text()
        console.log('📧 Investment notification API response:', {
          status: emailResponse.status,
          statusText: emailResponse.statusText,
          response: responseText
        })

        if (emailResponse.ok) {
          console.log('✅ Investment notifications sent successfully')
        } else {
          console.warn('⚠️ Investment notifications failed:', responseText)
        }
      } catch (emailError) {
        console.error('❌ Email notification error:', emailError)
        // Don't throw - email failure shouldn't break the investment flow
      }
      
      // Reset states and redirect
      setPayment({ isOpen: false, selectedMethod: '', step: 'method', btcRate: 0, loading: false })
      setPaymentForm({ transactionHash: '', customAmount: '' })
      setCalculator({ selectedPlan: null, amount: '', isOpen: false })
      
      showSuccess(
        'Payment Submitted!',
        'Your investment has been submitted successfully and is awaiting admin confirmation. You will be redirected to your dashboard.',
        4000
      )
      
      // Wait a moment before redirecting to let the user see the success message
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
      
    } catch (error: any) {
      console.error('❌ Payment submission error:', error)
      const errorMessage = error?.message || 'Failed to submit payment. Please try again.'
      showError(
        'Payment Failed',
        errorMessage
      )
      setPayment(prev => ({ ...prev, loading: false }))
    }
  }

  const closePayment = () => {
    setPayment({ isOpen: false, selectedMethod: '', step: 'method', btcRate: 0, loading: false })
    setPaymentForm({ transactionHash: '', customAmount: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading investment plans...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Investment Plans - Investment Platform</title>
        <meta name="description" content="Choose from our investment plans" />
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

                <Link href="/investment" className="bg-blue-600 text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg className="text-white mr-3 flex-shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  {/* Header */}
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Choose Your Investment Plan
                    </h1>
                    <p className="text-gray-600 leading-relaxed">
                      Select the perfect investment plan that matches your goals and risk tolerance. 
                      All plans offer guaranteed returns with flexible investment amounts.
                    </p>
                  </div>

                  {/* Investment Plans Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {investmentPlans.map((plan) => {
                      const colorClasses = getPlanColor(plan.risk)
                      const accentColor = getPlanAccentColor(plan.risk)
                      
                      return (
                        <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative transition-all hover:shadow-lg hover:-translate-y-1">
                          {/* Popular Badge */}
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase">
                              Most Popular
                            </div>
                          )}

                          {/* Plan Header */}
                          <div className="text-center mb-6">
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                              style={{ backgroundColor: plan.risk === 'low' ? '#dbeafe' : plan.risk === 'medium' ? '#dcfce7' : '#e9d5ff' }}
                            >
                              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke={accentColor}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {plan.name}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {plan.description}
                            </p>
                          </div>

                          {/* Plan Details */}
                          <div className="bg-gray-50 rounded-xl p-5 mb-6">
                            <div className="grid grid-cols-2 gap-4 mb-5">
                              <div className="text-center">
                                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                  Interest Rate
                                </p>
                                <p className="text-2xl font-bold m-0" style={{ color: accentColor }}>
                                  {plan.interestRate}%
                                </p>
                                <p className="text-xs font-medium text-gray-600 mt-1">
                                  daily
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                  Duration
                                </p>
                                <p className="text-2xl font-bold text-gray-900 m-0">
                                  {plan.duration} days
                                </p>
                              </div>
                            </div>

                            <div className="text-center">
                              <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                                Investment Range
                              </p>
                              <p className="text-base font-bold text-gray-900 m-0">
                                {formatCurrency(plan.minAmount)} - {plan.maxAmount ? formatCurrency(plan.maxAmount) : 'Unlimited'}
                              </p>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                              Plan Features
                            </h4>
                            <ul className="space-y-2">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#059669">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {feature.replace('guaranteed returns', 'daily simple returns')}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => openCalculator(plan)}
                            className="w-full text-white py-3 rounded-xl border-0 text-base font-semibold cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
                            style={{ backgroundColor: accentColor }}
                          >
                            Calculate Returns
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Calculator Modal */}
                  {calculator.isOpen && calculator.selectedPlan && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                          <h3 className="text-xl font-bold text-gray-900">
                            Investment Calculator
                          </h3>
                          <button
                            onClick={closeCalculator}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="p-6">
                          {/* Selected Plan Info */}
                          <div className="bg-gray-50 p-4 rounded-xl mb-6">
                            <h4 className="text-base font-semibold text-gray-900 mb-2">
                              {calculator.selectedPlan.name}
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-gray-600">Duration: </span>
                                <span className="font-semibold">{calculator.selectedPlan.duration} days</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Daily Interest: </span>
                                <span className="font-semibold">{calculator.selectedPlan.interestRate}%</span>
                              </div>
                            </div>
                          </div>

                          {/* Amount Input */}
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Investment Amount (USD)
                            </label>
                            <input
                              type="number"
                              min={calculator.selectedPlan.minAmount}
                              max={calculator.selectedPlan.maxAmount || undefined}
                              value={calculator.amount}
                              onChange={(e) => setCalculator(prev => ({ ...prev, amount: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={`Min: ${formatCurrency(calculator.selectedPlan.minAmount)}`}
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              Range: {formatCurrency(calculator.selectedPlan.minAmount)} - {calculator.selectedPlan.maxAmount ? formatCurrency(calculator.selectedPlan.maxAmount) : 'Unlimited'}
                            </p>
                          </div>

                          {/* Calculation Results */}
                          {calculator.amount && isValidAmount() && (
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
                              <h4 className="text-base font-semibold text-green-800 mb-4">
                                Investment Summary (Daily Simple Interest)
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-700">Investment Amount:</span>
                                  <span className="font-semibold text-base">
                                    {formatCurrency(parseFloat(calculator.amount))}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-700">Expected Profit:</span>
                                  <span className="font-semibold text-base text-green-700">
                                    +{formatCurrency(calculateReturns().profit)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-green-200">
                                  <span className="text-gray-700 font-semibold">Total Return:</span>
                                  <span className="font-bold text-lg text-green-700">
                                    {formatCurrency(calculateReturns().total)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Error Message */}
                          {calculator.amount && !isValidAmount() && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                              <p className="text-red-600 text-sm font-medium">
                                Please enter an amount between {formatCurrency(calculator.selectedPlan.minAmount)} and {calculator.selectedPlan.maxAmount ? formatCurrency(calculator.selectedPlan.maxAmount) : 'unlimited'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                          <button
                            onClick={closeCalculator}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={proceedToPayment}
                            disabled={!isValidAmount()}
                            className={`flex-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
                              isValidAmount() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                          >
                            Proceed to Payment
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Modal */}
                  {payment.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                          <h3 className="text-xl font-bold text-gray-900">
                            {payment.step === 'method' ? 'Select Payment Method' : 
                             payment.step === 'payment' ? 'Make Payment' : 'Confirm Payment'}
                          </h3>
                          <button
                            onClick={closePayment}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="p-6">
                          {payment.loading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="ml-3 text-gray-600">Loading BTC rates...</span>
                            </div>
                          ) : (
                            <>
                              {/* Investment Summary */}
                              {calculator.selectedPlan && (
                                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                                  <h4 className="text-base font-semibold text-gray-900 mb-3">
                                    Investment Details
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Plan: <strong>{calculator.selectedPlan.name}</strong></div>
                                    <div>Duration: <strong>{calculator.selectedPlan.duration} days</strong></div>
                                    <div>Amount: <strong>{safeCurrencyFormat(calculator.amount)}</strong></div>
                                    <div>Expected Return: <strong className="text-green-600">{formatCurrency(calculateReturns().total)}</strong></div>
                                  </div>
                                </div>
                              )}

                              {/* Step 1: Payment Method Selection */}
                              {payment.step === 'method' && (
                                <div>
                                  <p className="text-gray-600 mb-6">
                                    Choose your preferred payment method to proceed with the investment.
                                  </p>
                                  
                                  <div className="space-y-4">
                                    {Object.entries(paymentMethods).map(([key, method]) => (
                                      <button
                                        key={key}
                                        onClick={() => selectPaymentMethod(key)}
                                        className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl bg-white cursor-pointer text-left transition-all hover:border-blue-500 hover:bg-blue-50"
                                      >
                                        <div 
                                          className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold"
                                          style={{ color: key === 'btc' ? '#f7931a' : '#26a17b' }}
                                        >
                                          {method.icon}
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                            {method.name}
                                          </h4>
                                          <p className="text-sm text-gray-600">
                                            {method.network}
                                          </p>
                                        </div>
                                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Step 2: Payment Instructions */}
                              {payment.step === 'payment' && payment.selectedMethod && (
                                <div>
                                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                                    <h4 className="text-base font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      Important Payment Instructions
                                    </h4>
                                    <ul className="mt-2 pl-5 text-yellow-800 text-sm leading-relaxed list-disc">
                                      <li>Send the exact amount shown below</li>
                                      <li>Use only the provided wallet address</li>
                                      <li>Double-check the network before sending</li>
                                      <li>Save your transaction hash for verification</li>
                                    </ul>
                                  </div>

                                  {/* Payment Details */}
                                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden mb-6">
                                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                                      <h4 className="text-base font-semibold text-gray-900">
                                        {payment.selectedMethod in paymentMethods ? paymentMethods[payment.selectedMethod].name : 'Payment'} Details
                                      </h4>
                                    </div>
                                    
                                    <div className="p-4">
                                      {/* Amount to Send */}
                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          {payment.selectedMethod === 'btc' ? 'Amount to Send (USD)' : 'Amount to Send (USDT)'}
                                        </label>
                                        
                                        {/* For Bitcoin - Show input field and BTC equivalent */}
                                        {payment.selectedMethod === 'btc' && (
                                          <>
                                            <input
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              value={paymentForm.customAmount}
                                              onChange={(e) => setPaymentForm(prev => ({ ...prev, customAmount: e.target.value }))}
                                              placeholder="Enter USD amount"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                                            />
                                            
                                            {/* BTC Equivalent Display */}
                                            {payment.btcRate > 0 && paymentForm.customAmount && parseFloat(paymentForm.customAmount) > 0 ? (
                                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-1">
                                                  <span className="text-sm text-blue-800 font-medium">
                                                    BTC Equivalent:
                                                  </span>
                                                  <span className="text-base font-bold text-blue-800">
                                                    {formatBTC(parseFloat(paymentForm.customAmount) / payment.btcRate)}
                                                  </span>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                  Rate: ${payment.btcRate.toLocaleString()} per BTC
                                                </div>
                                              </div>
                                            ) : payment.btcRate > 0 ? (
                                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                <div className="text-xs text-gray-600">
                                                  Enter amount above to see BTC equivalent
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <div className="text-sm text-yellow-800">
                                                  Loading BTC rate...
                                                </div>
                                              </div>
                                            )}
                                          </>
                                        )}
                                        
                                        {/* For USDT - Show input field for user to enter amount */}
                                        {(payment.selectedMethod === 'usdt_bep20' || payment.selectedMethod === 'usdt_erc20') && (
                                          <>
                                            <input
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              value={paymentForm.customAmount}
                                              onChange={(e) => setPaymentForm(prev => ({ ...prev, customAmount: e.target.value }))}
                                              placeholder="Enter USDT amount"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                                            />
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                              <div className="text-xs text-gray-600">
                                                USDT is equivalent to USD (1:1 ratio)
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>

                                      {/* Wallet Address */}
                                      <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Wallet Address
                                        </label>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={payment.selectedMethod in paymentMethods ? paymentMethods[payment.selectedMethod].address : ''}
                                            readOnly
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                                          />
                                          <button
                                            onClick={() => {
                                              if (payment.selectedMethod in paymentMethods) {
                                                copyToClipboard(paymentMethods[payment.selectedMethod].address)
                                              }
                                            }}
                                            disabled={!(payment.selectedMethod in paymentMethods)}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                                          >
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy
                                          </button>
                                        </div>
                                      </div>

                                      {/* Network Info */}
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800 font-medium">
                                          <strong>Network:</strong> {payment.selectedMethod in paymentMethods ? paymentMethods[payment.selectedMethod].network : 'Unknown Network'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Button */}
                                  <button
                                    onClick={() => {
                                      if (canProceedToConfirm()) {
                                        setPayment(prev => ({ ...prev, step: 'confirm' }))
                                      } else {
                                        toast.error('Please enter a payment amount first')
                                      }
                                    }}
                                    disabled={!canProceedToConfirm()}
                                    className={`w-full py-3 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-colors ${
                                      canProceedToConfirm() 
                                        ? 'bg-green-600 text-white hover:bg-green-700' 
                                        : 'bg-gray-400 text-white cursor-not-allowed'
                                    }`}
                                  >
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    I Have Made the Payment
                                  </button>
                                </div>
                              )}

                              {/* Step 3: Payment Confirmation */}
                              {payment.step === 'confirm' && (
                                <div>
                                  <p className="text-gray-600 mb-6">
                                    Please confirm your payment details below. This information will be sent to our admin for verification.
                                  </p>

                                  <div className="space-y-5">
                                    {/* Show the amount as read-only confirmation */}
                                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Amount (USD)
                                      </label>
                                      <div className="text-lg font-bold text-gray-900">
                                        {safeCurrencyFormat(paymentForm.customAmount)}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        Amount you entered on the previous step
                                      </div>
                                    </div>

                                    {/* Transaction Hash - Only input field */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction Hash (Optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={paymentForm.transactionHash}
                                        onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionHash: e.target.value }))}
                                        placeholder="Enter transaction hash for faster verification"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                      />
                                    </div>

                                    {/* Confirmation Notice */}
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                      <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                        📋 What happens next?
                                      </h4>
                                      <ul className="pl-5 text-blue-800 text-sm leading-relaxed list-disc">
                                        <li>Your payment will be reviewed by our admin team</li>
                                        <li>You'll receive an email confirmation once verified</li>
                                        <li>Your investment will appear in your dashboard</li>
                                        <li>Returns will be automatically credited at maturity</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Modal Footer for Confirmation Step */}
                        {payment.step === 'confirm' && !payment.loading && (
                          <div className="flex gap-3 p-6 border-t border-gray-200">
                            <button
                              onClick={() => setPayment(prev => ({ ...prev, step: 'payment' }))}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              ← Back
                            </button>
                            <button
                              onClick={submitPayment}
                              disabled={payment.loading}
                              className={`flex-2 px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                                payment.loading 
                                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {payment.loading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                  Submit Payment
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
            <Link href="/investment" className="flex flex-col items-center py-2 px-3 text-blue-600">
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
            <Link href="/profile" className="flex flex-col items-center py-2 px-3 text-gray-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>

        <ChatWidget />
      </div>
    </>
  )
}