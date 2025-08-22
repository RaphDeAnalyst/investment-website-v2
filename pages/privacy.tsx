import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'

export default function PrivacyPolicy() {
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
        <title>Privacy Policy - Everest Global Holdings</title>
        <meta name="description" content="Privacy Policy for Everest Global Holdings - Learn how we protect and handle your personal information" />
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
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  Last updated: January 21, 2025
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                  <p className="leading-relaxed mb-4">
                    We collect information you provide directly to us, information we obtain automatically when you use our services, 
                    and information from third parties. This includes:
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li>Name, email address, phone number, and postal address</li>
                    <li>Government-issued identification numbers for verification</li>
                    <li>Financial information, including bank account details and investment history</li>
                    <li>Employment information and source of funds</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Device information, IP address, and browser type</li>
                    <li>Usage data, including pages visited and time spent on our platform</li>
                    <li>Location information based on your IP address</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                  <p className="leading-relaxed mb-4">We use your information to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide and maintain our investment services</li>
                    <li>Process transactions and manage your investment portfolio</li>
                    <li>Verify your identity and comply with legal requirements</li>
                    <li>Communicate with you about your account and our services</li>
                    <li>Improve our platform and develop new features</li>
                    <li>Detect and prevent fraud and security threats</li>
                    <li>Comply with regulatory obligations and legal processes</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
                  <p className="leading-relaxed mb-4">
                    We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Service Providers:</strong> Third-party vendors who help us operate our business</li>
                    <li><strong>Legal Compliance:</strong> When required by law, regulation, or legal process</li>
                    <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                    <li><strong>Consent:</strong> When you have given us explicit permission</li>
                    <li><strong>Protection:</strong> To protect our rights, property, or safety, or that of others</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                  <p className="leading-relaxed mb-4">
                    We implement industry-standard security measures to protect your information, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Multi-factor authentication for account access</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls limiting who can view your information</li>
                    <li>Secure data centers with physical and logical protections</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    While we strive to protect your information, no security system is completely impenetrable. 
                    We cannot guarantee absolute security of your data.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
                  <p className="leading-relaxed">
                    We retain your information for as long as necessary to provide our services, comply with legal obligations, 
                    resolve disputes, and enforce our agreements. Investment records are typically retained for at least 
                    seven years after account closure as required by financial regulations.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
                  <p className="leading-relaxed mb-4">You have the following rights regarding your personal information:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Access:</strong> Request a copy of the information we hold about you</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
                    <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                    <li><strong>Restriction:</strong> Limit how we process your information</li>
                    <li><strong>Objection:</strong> Object to certain types of processing</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    To exercise these rights, please contact us using the information provided at the end of this policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
                  <p className="leading-relaxed mb-4">
                    We use cookies and similar technologies to enhance your experience on our platform. 
                    These technologies help us:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Remember your preferences and settings</li>
                    <li>Analyze how our platform is used</li>
                    <li>Provide personalized content and features</li>
                    <li>Improve security and prevent fraud</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    You can control cookie settings through your browser preferences, though disabling cookies 
                    may affect the functionality of our platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
                  <p className="leading-relaxed">
                    Your information may be transferred to and processed in countries other than your country of residence. 
                    We ensure appropriate safeguards are in place to protect your information when it is transferred 
                    internationally, including through adequacy decisions, standard contractual clauses, or other approved mechanisms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
                  <p className="leading-relaxed">
                    Our services are not intended for individuals under 18 years of age. We do not knowingly collect 
                    personal information from children under 18. If we become aware that we have collected such information, 
                    we will take steps to delete it promptly.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
                  <p className="leading-relaxed">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
                    We will notify you of significant changes by email or through our platform. Your continued use of our 
                    services after such changes constitutes acceptance of the updated policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
                  <p className="leading-relaxed">
                    If you have questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <p className="font-semibold text-gray-900">Everest Global Holdings</p>
                    <p>Data Protection Officer</p>
                    <p>20-22 Wenlock Road, London, N1 7GU England</p>
                    <p>Email: privacy@everestglobalholdings.com</p>
                    <p>Phone: +44 (0) 20 7946 0958</p>
                  </div>
                  <p className="leading-relaxed mt-4">
                    If you are located in the European Union and have concerns about our data practices, 
                    you also have the right to lodge a complaint with your local data protection authority.
                  </p>
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