// pages/verify-email.tsx - Email Verification Page
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Get email from query params or localStorage
    const emailFromQuery = router.query.email as string
    const emailFromStorage = typeof window !== 'undefined' ? localStorage.getItem('pendingVerificationEmail') : null
    
    if (emailFromQuery) {
      setEmail(emailFromQuery)
      localStorage.setItem('pendingVerificationEmail', emailFromQuery)
    } else if (emailFromStorage) {
      setEmail(emailFromStorage)
    }
  }, [router.query.email])

  const resendVerification = async () => {
    if (!email) {
      toast.error('No email found. Please sign up again.')
      router.push('/signup')
      return
    }

    setIsResending(true)
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error
      
      toast.success('Verification email sent! Check your inbox.')
    } catch (error: any) {
      console.error('Resend verification error:', error)
      toast.error(error.message || 'Failed to resend verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <>
      <Head>
        <title>Verify Your Email - Investment Platform</title>
        <meta name="description" content="Please verify your email to complete registration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="Everest Global Holdings Logo" 
                  className="h-16 sm:h-20 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const textElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (textElement) textElement.style.display = 'block';
                  }}
                />
                <h1 className="text-xl font-bold text-slate-800 hidden">
                  Everest Global Holdings
                </h1>
              </div>

              <div className="flex items-center gap-3 sm:gap-6">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="hidden sm:inline">Home</span>
                </Link>

                <Link 
                  href="/signin" 
                  className="text-slate-800 font-medium text-sm px-3 sm:px-4 py-2 rounded-lg border-2 border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md">
            {/* Verification Card */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100 text-center">
              {/* Email Icon */}
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                Check Your Email
              </h2>

              {/* Message */}
              <div className="mb-6">
                <p className="text-gray-600 mb-4 leading-relaxed">
                  We've sent a verification link to:
                </p>
                <p className="text-slate-800 font-semibold bg-gray-50 px-4 py-2 rounded-lg">
                  {email || 'your email address'}
                </p>
                <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                  Click the link in the email to verify your account and complete your registration.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={resendVerification}
                  disabled={isResending || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isResending && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>

                <Link
                  href="/signin"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Back to Sign In
                </Link>
              </div>

              {/* Help Text */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Didn't receive the email? Check your spam folder or try resending the verification email.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Having trouble?{' '}
                  <Link href="/contact" className="text-blue-600 hover:text-blue-700 underline">
                    Contact support
                  </Link>
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Once verified, you'll be able to access your investment dashboard and start investing.
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}