// pages/auth/confirm.tsx - Handle auth confirmation (email verification and password reset)
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { createSupabaseClient } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthConfirm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [authType, setAuthType] = useState<'email' | 'recovery' | 'unknown'>('unknown')
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const handleAuthConfirm = async () => {
      try {
        const { token_hash, type, next } = router.query

        if (!token_hash || !type) {
          setStatus('error')
          setMessage('Invalid confirmation link. Missing required parameters.')
          return
        }

        console.log('Auth confirm params:', { token_hash, type, next })
        setAuthType(type as 'email' | 'recovery')

        // Verify the token hash
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token_hash as string,
          type: type as 'email' | 'recovery'
        })

        if (error) {
          console.error('Auth confirmation error:', error)
          setStatus('error')
          
          if (type === 'recovery') {
            setMessage('Password reset link is invalid or expired. Please request a new reset link.')
          } else {
            setMessage('Email verification link is invalid or expired. Please request a new verification email.')
          }
          return
        }

        if (data.user) {
          setStatus('success')
          
          if (type === 'recovery') {
            // Password reset flow - redirect to reset password page
            setMessage('Password reset verified! Redirecting to password reset form...')
            toast.success('Password reset verified!')
            
            setTimeout(() => {
              // Redirect to reset password page with the next parameter
              const redirectUrl = (next as string) || '/reset-password'
              router.push(redirectUrl)
            }, 2000)
            
          } else if (type === 'email') {
            // Email confirmation flow - redirect to dashboard
            setMessage('Email verified successfully! You can now access your dashboard.')
            toast.success('Email verified successfully!')
            
            // Clear any pending verification email from storage
            localStorage.removeItem('pendingVerificationEmail')
            
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } else {
          setStatus('error')
          setMessage('Authentication verification failed. Please try again.')
        }

      } catch (error: any) {
        console.error('Auth confirm error:', error)
        setStatus('error')
        setMessage('An error occurred during verification. Please try again.')
      }
    }

    // Only run when router is ready and we have query params
    if (router.isReady && router.query.token_hash) {
      handleAuthConfirm()
    }
  }, [router.isReady, router.query, supabase.auth])

  const getTitle = () => {
    if (authType === 'recovery') return 'Password Reset Verification'
    if (authType === 'email') return 'Email Verification'
    return 'Authentication Verification'
  }

  const getLoadingMessage = () => {
    if (authType === 'recovery') return 'Verifying password reset request...'
    if (authType === 'email') return 'Verifying your email address...'
    return 'Verifying authentication...'
  }

  const getSuccessTitle = () => {
    if (authType === 'recovery') return 'Reset Verified!'
    if (authType === 'email') return 'Email Verified!'
    return 'Verified!'
  }

  const getRetryLink = () => {
    if (authType === 'recovery') return '/forgot-password'
    return '/verify-email'
  }

  const getRetryText = () => {
    if (authType === 'recovery') return 'Request New Reset Link'
    return 'Resend Verification'
  }

  return (
    <>
      <Head>
        <title>{getTitle()} - Everest Global Holdings</title>
        <meta name="description" content="Verifying your authentication request" />
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
                    {getTitle()}
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {getLoadingMessage()}
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
                    {getSuccessTitle()}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {message}
                  </p>
                  
                  <div className="text-sm text-gray-500">
                    {authType === 'recovery' ? 'Redirecting to password reset...' : 'Redirecting to dashboard...'}
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
                      href={getRetryLink()}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      {getRetryText()}
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