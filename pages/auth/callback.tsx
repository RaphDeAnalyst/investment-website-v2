// pages/auth/callback.tsx - Handle email verification callback
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the code from URL parameters
        const { code } = router.query

        if (code && typeof code === 'string') {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error('Email verification error:', error)
            setStatus('error')
            setMessage('Failed to verify email. The verification link may be expired or invalid.')
            return
          }

          if (data.user && data.user.email_confirmed_at) {
            // Email successfully verified
            setStatus('success')
            setMessage('Email verified successfully! You can now access your dashboard.')
            toast.success('Email verified successfully!')
            
            // Clear any pending verification email from storage
            localStorage.removeItem('pendingVerificationEmail')
            
            // Redirect to dashboard after a brief delay
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          } else {
            setStatus('error')
            setMessage('Email verification incomplete. Please try again.')
          }
        } else {
          // No code provided
          setStatus('error')
          setMessage('Invalid verification link. Please check your email and try again.')
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage('An error occurred during email verification. Please try again.')
      }
    }

    // Only run when router is ready and we have query params
    if (router.isReady) {
      handleAuthCallback()
    }
  }, [router.isReady, router.query, supabase.auth])

  return (
    <>
      <Head>
        <title>Email Verification - Investment Platform</title>
        <meta name="description" content="Verifying your email address" />
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md">
            {/* Status Card */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100 text-center">
              {status === 'loading' && (
                <>
                  {/* Loading Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                    Verifying Your Email
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed">
                    Please wait while we verify your email address...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  {/* Success Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">
                    Email Verified!
                  </h2>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {message}
                  </p>
                  
                  <div className="text-sm text-gray-500">
                    Redirecting to dashboard...
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  {/* Error Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">
                    Verification Failed
                  </h2>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {message}
                  </p>
                  
                  <div className="space-y-3">
                    <Link
                      href="/verify-email"
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      Try Again
                    </Link>
                    
                    <Link
                      href="/signin"
                      className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Help Text */}
            {status === 'error' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Having trouble?{' '}
                  <Link href="/contact" className="text-blue-600 hover:text-blue-700 underline">
                    Contact support
                  </Link>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}