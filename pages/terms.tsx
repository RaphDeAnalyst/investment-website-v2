import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'

export default function TermsOfService() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const { stay } = router.query
    if (user && !loading && !stay) {
      router.push('/dashboard')
    }
  }, [user, loading, router.query])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Terms of Service - Everest Global Holdings</title>
        <meta name="description" content="Terms of Service for Everest Global Holdings - Read our terms and conditions for using our investment platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="page-wrapper">
        {/* Navigation */}
        <nav className="fixed w-full top-0 bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2 no-underline">
                  <img 
                    src="/logo.png" 
                    alt="Everest Global Holdings Logo" 
                    className="h-12 w-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const textElement = e.currentTarget.nextElementSibling as HTMLElement
                      if (textElement) textElement.style.display = 'block'
                    }}
                  />
                  <div className="w-14 h-14 bg-blue-600 rounded-xl items-center justify-center hidden">
                    <span className="text-white font-bold text-2xl">E</span>
                  </div>
                  <div className="text-1xl font-bold text-gray-900">
                    Everest <span className="text-gray-600">Global Holdings</span>
                  </div>
                </Link>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Home</Link>
                <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">About</Link>
                <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Contact</Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-4">
                  <Link href="/signin" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link href="/signup" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium transition-colors">
                    Get Started
                  </Link>
                </div>
                
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden text-gray-700 hover:text-gray-900 bg-transparent border-0 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 px-4 py-6">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>About</Link>
                <Link href="/contact" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                <hr className="border-gray-200" />
                <Link href="/signin" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link href="/signup" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium text-center" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="pt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:p-12">
              
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  These terms govern your use of Everest Global Holdings' investment platform and services.
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  Last updated: January 21, 2025
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                  <p className="leading-relaxed">
                    By accessing or using the services provided by Everest Global Holdings ("Company", "we", "our", or "us"), 
                    you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
                    you may not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
                  <p className="leading-relaxed mb-4">
                    Everest Global Holdings provides investment management services, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Investment portfolio management across diverse sectors</li>
                    <li>Strategic investment planning and consultation</li>
                    <li>Risk assessment and management services</li>
                    <li>Market analysis and investment recommendations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Investment Risks</h2>
                  <p className="leading-relaxed mb-4">
                    All investments carry inherent risks, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Market volatility and potential loss of principal</li>
                    <li>Fluctuations in investment value</li>
                    <li>Economic and political factors affecting markets</li>
                    <li>Industry-specific risks related to our investment sectors</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    Past performance does not guarantee future results. You should carefully consider your 
                    financial situation and risk tolerance before making any investment decisions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Obligations</h2>
                  <p className="leading-relaxed mb-4">By using our services, you agree to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Not engage in fraudulent or deceptive practices</li>
                    <li>Report any unauthorized access to your account immediately</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Account Security</h2>
                  <p className="leading-relaxed">
                    You are responsible for maintaining the security of your account and password. 
                    We implement industry-standard security measures, but cannot guarantee absolute security. 
                    You agree to notify us immediately of any unauthorized access or security breach.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Fees and Payments</h2>
                  <p className="leading-relaxed">
                    Investment fees, management charges, and payment terms are outlined in your specific 
                    investment agreement. All fees are subject to change with proper notice. 
                    Withdrawal and transfer policies are detailed in your account documentation.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
                  <p className="leading-relaxed">
                    To the fullest extent permitted by law, Everest Global Holdings shall not be liable 
                    for any indirect, incidental, special, or consequential damages arising from your use 
                    of our services. Our liability is limited to the amount of fees paid by you in the 
                    twelve months preceding the claim.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
                  <p className="leading-relaxed">
                    Your privacy is important to us. Our collection, use, and protection of your personal 
                    information is governed by our Privacy Policy, which is incorporated into these Terms 
                    by reference. Please review our Privacy Policy to understand our data practices.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
                  <p className="leading-relaxed">
                    Either party may terminate this agreement with proper notice as specified in your 
                    investment agreement. Upon termination, you remain liable for any outstanding obligations, 
                    and we will process the return of your investments according to our standard procedures.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
                  <p className="leading-relaxed">
                    These Terms are governed by the laws of England and Wales. Any disputes arising from 
                    these Terms or your use of our services shall be subject to the exclusive jurisdiction 
                    of the courts of England and Wales.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
                  <p className="leading-relaxed">
                    We reserve the right to modify these Terms at any time. We will notify you of 
                    significant changes via email or through our platform. Continued use of our services 
                    after changes constitutes acceptance of the modified Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
                  <p className="leading-relaxed">
                    If you have questions about these Terms of Service, please contact us at:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <p className="font-semibold text-gray-900">Everest Global Holdings</p>
                    <p>20-22 Wenlock Road, London, N1 7GU England</p>
                    <p>Email: legal@everestglobalholdings.com</p>
                  </div>
                </section>

              </div>

              {/* Footer Actions */}
              <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                <Link 
                  href="/" 
                  className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors inline-block"
                >
                  Return to Homepage
                </Link>
              </div>

            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 text-gray-800 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Logo and Company Info */}
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <div className="flex items-center">
                  <img 
                    src="/logo.png" 
                    alt="Everest Global Holdings Logo" 
                    className="h-12 w-auto mr-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const textElement = e.currentTarget.nextElementSibling as HTMLElement
                      if (textElement) textElement.style.display = 'block'
                    }}
                  />
                  <div className="text-lg font-bold hidden">Everest Global Holdings</div>
                </div>
                
                {/* Address */}
                <div className="text-sm text-gray-600">
                  20-22 Wenlock Road, London, N1 7GU England
                </div>
              </div>
              
              {/* Legal Links */}
              <div className="flex items-center space-x-6 text-sm">
                <Link href="/privacy" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-gray-400">/</span>
                <Link href="/terms" className="text-gray-600 hover:text-gray-800 transition-colors">
                  Terms of Use
                </Link>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="mt-6 pt-4 border-t border-gray-300 text-center">
              <p className="text-sm text-gray-600">
                &copy; 2025 Everest Global Holdings. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}