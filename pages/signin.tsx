// pages/signin.tsx - Mobile-Responsive with Tailwind CSS
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { SignInForm } from '../components/auth/SignInForm'
import { ChatWidget } from '../components/ChatWidget'

export default function SignInPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Sign In - Investment Platform</title>
        <meta name="description" content="Sign in to your investment account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left Side - Logo */}
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
                  Investment<span className="text-slate-600">Pro</span>
                </h1>
              </div>

              {/* Right Side - Navigation */}
              <div className="flex items-center gap-3 sm:gap-6">
                {/* Home Button */}
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="hidden sm:inline">Home</span>
                </Link>

                {/* Sign Up Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="text-gray-500 text-sm hidden sm:inline">
                    Don't have an account?
                  </span>
                  <Link 
                    href="/signup" 
                    className="text-slate-800 font-medium text-sm px-3 sm:px-4 py-2 rounded-lg border-2 border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-md flex flex-col gap-6 sm:gap-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-base text-slate-500">
                Sign in to your investment account
              </p>
            </div>

            {/* Auth Card */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-100">
              <SignInForm />
            </div>

            {/* Footer Links */}
            <div className="text-center">
              <p className="text-xs text-slate-500">
                By signing in, you agree to our{' '}
                <a 
                  href="/terms" 
                  className="text-slate-800 hover:text-slate-600 transition-colors"
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a 
                  href="/privacy" 
                  className="text-slate-800 hover:text-slate-600 transition-colors"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-slate-800 text-white px-4 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
              {/* Left Side - Logo & Info */}
              <div>
                <div className="flex items-center mb-6">
                  <img 
                    src="/logo.png" 
                    alt="Everest Global Holdings Logo"
                    className="h-12 w-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const textElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (textElement) textElement.style.display = 'block';
                    }}
                  />
                  <h2 className="text-2xl font-bold text-white hidden">
                    Investment<span className="text-slate-400">Pro</span>
                  </h2>
                </div>
                
                <div className="text-sm text-slate-300 leading-relaxed mb-6">
                  <div className="flex items-start gap-2 mb-2">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mt-0.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>20-22 Wenlock Road, London, N1 7GU England</span>
                  </div>
                </div>

                {/* Contact Button */}
                <button className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </button>
              </div>

              {/* Right Side - Quick Links */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">
                  Quick Links
                </h3>
                
                <ul className="space-y-3">
                  <li>
                    <Link 
                      href="/" 
                      className="text-slate-300 hover:text-white text-base transition-colors block"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/about" 
                      className="text-slate-300 hover:text-white text-base transition-colors block"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/plans" 
                      className="text-slate-300 hover:text-white text-base transition-colors block"
                    >
                      Investment Plans
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/industries" 
                      className="text-slate-300 hover:text-white text-base transition-colors block"
                    >
                      Industries
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/signin" 
                      className="text-slate-300 hover:text-white text-base transition-colors block"
                    >
                      Sign In
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-slate-600 mt-12 pt-6 text-center text-slate-400 text-sm">
              © 2025 Everest Global Holdings. All rights reserved.
            </div>
          </div>
        </footer>
        
        <ChatWidget />
      </div>
    </>
  )
}