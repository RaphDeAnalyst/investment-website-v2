// pages/forgot-password.tsx
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../lib/supabase'
import { useGlobalPopup } from '../components/ui/PopupProvider'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const router = useRouter()
  const supabase = createSupabaseClient()
  const { showSuccess, showError } = useGlobalPopup()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      // Check rate limiting
      const rateLimitResponse = await fetch('/api/check-reset-rate-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const rateLimitResult = await rateLimitResponse.json()
      
      if (!rateLimitResult.allowed) {
        throw new Error(`Too many password reset requests. Please try again in ${rateLimitResult.remainingTime}.`)
      }

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?type=recovery`,
      })

      if (error) throw error

      // Send confirmation email about the reset request
      await sendResetConfirmationEmail(email)

      showSuccess(
        'Reset Email Sent!',
        'We have sent a password reset link to your email address. Please check your email and follow the instructions to reset your password.',
        5000
      )

      // Clear form
      setEmail('')
      
      // Redirect back to sign in after showing message
      setTimeout(() => {
        router.push('/signin')
      }, 5000)

    } catch (error: any) {
      console.error('Password reset error:', error)
      showError(
        'Reset Failed',
        error.message || 'Failed to send password reset email. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Function to send confirmation email about reset request
  const sendResetConfirmationEmail = async (userEmail: string) => {
    try {
      console.log(`Sending confirmation email to ${userEmail} about password reset request`)
      
      const response = await fetch('/api/send-reset-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })

      if (!response.ok) {
        throw new Error('Failed to send confirmation email')
      }

      const result = await response.json()
      console.log('Confirmation email sent successfully:', result)
      
    } catch (error) {
      console.error('Error sending confirmation email:', error)
      // Don't fail the entire process if confirmation email fails
      // The user will still get the password reset email from Supabase
    }
  }

  const handleChange = (value: string) => {
    setEmail(value)
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password - Investment Platform</title>
        <meta name="description" content="Reset your password for Investment Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="/logo.png" 
              alt="Company Logo" 
              className="h-16 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <div className="hidden">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
            Forgot your password?
          </h2>
          <p className="text-center text-sm text-gray-600 mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className={`
                    w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.email ? 'border-red-300' : 'border-gray-300'}
                  `}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                  shadow-sm text-sm font-medium text-white
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }
                  transition-colors duration-200
                `}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {/* Back to Sign In Link */}
            <div className="mt-6 text-center">
              <Link 
                href="/signin" 
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Need help?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    If you don't receive the email within a few minutes, please check your spam folder 
                    or contact our support team for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}