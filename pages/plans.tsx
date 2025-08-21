// pages/plans.tsx - Investment Plans Page (Fixed)
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Clock, Shield, TrendingUp, Users, CheckCircle, Star, Zap } from 'lucide-react'
import { ChatWidget } from '../components/ChatWidget'

export default function InvestmentPlansPage() {
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('📨 Submitting contact form from Plans page:', {
        name: contactForm.name,
        email: contactForm.email,
        messageLength: contactForm.message.length
      })

      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: contactForm.email,
          message: `Name: ${contactForm.name}\n\nMessage: ${contactForm.message}\n\nSource: Investment Plans Page`,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Plans page contact form API error:', response.status, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to send message`)
      }

      const result = await response.json()
      console.log('✅ Plans page contact form sent successfully:', result)
      
      setContactForm({ name: '', email: '', message: '' })
      setContactFormOpen(false)
      alert('Thank you for your message! We have received it and will get back to you soon.')
      
    } catch (error: unknown) {
      console.error('❌ Plans page contact form submission error:', error)
      const errorMessage = (error as Error)?.message || 'Sorry, there was an error sending your message. Please try again.'
      alert(errorMessage)
    }
  }

  return (
    <>
      <Head>
        <title>Investment Plans - Everest Global Holdings</title>
        <meta name="description" content="Choose from our professional investment plans designed to maximize returns. Compact, Master, and Ultimate plans with guaranteed daily returns." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
        {/* Navigation */}
        <nav className="fixed w-full top-0 bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo - Bigger than homepage */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-3 no-underline">
                  <img 
                    src="/logo.png" 
                    alt="Everest Global Holdings Logo" 
                    className="h-16 w-auto"
                    onError={(e) => {
                      // First fallback
                      if (e.currentTarget.src !== "/everest-logo.png") {
                        e.currentTarget.src = "/everest-logo.png"
                      } else {
                        // Final fallback to company initials
                        e.currentTarget.style.display = 'none';
                        const fallbackElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallbackElement) fallbackElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-14 h-14 bg-blue-600 rounded-xl items-center justify-center hidden">
                    <span className="text-white font-bold text-2xl">E</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    Everest <span className="text-gray-600">Global Holdings</span>
                  </div>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Home</Link>
                <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">About Us</Link>
                <Link href="/plans" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Investment Plans</Link>
                <Link href="#" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Industries</Link>
                <button
                  onClick={() => setContactFormOpen(true)}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Contact
                </button>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex items-center space-x-4">
                <Link href="/signin" className="hidden sm:block text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 font-medium transition-colors">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20">
          {/* Hero Section */}
          <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  Our Investment Plans
                </h1>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Choose from our carefully structured investment plans designed to maximize your returns with guaranteed daily profits and flexible investment periods.
                </p>
                <div className="flex items-center justify-center space-x-8 text-blue-200">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm">100% Secure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">Guaranteed Returns</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">Quick Payouts</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Investment Plans Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                {/* Compact Plan */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-3 border-2 border-gray-200 relative">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Zap className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Compact Plan</h3>
                    <div className="text-5xl font-bold text-green-600 mb-2">2.5%</div>
                    <div className="text-gray-500 text-lg">Daily Return</div>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    {/* Investment Details */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Investment Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Investment:</span>
                          <span className="font-semibold text-gray-900">$200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Maximum Investment:</span>
                          <span className="font-semibold text-gray-900">$20,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Investment Period:</span>
                          <span className="font-semibold text-gray-900">5 Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Return:</span>
                          <span className="font-semibold text-green-600">12.5%</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Plan Features</h4>
                      <ul className="space-y-3">
                        {[
                          'Daily profit payments',
                          'Perfect for beginners',
                          'Low risk investment',
                          'Principal returned after 5 days',
                          '24/7 customer support',
                          'Instant withdrawals'
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Link href="/signup" className="w-full bg-green-600 text-white py-4 rounded-2xl hover:bg-green-700 font-semibold transition-colors text-center block text-lg">
                    Start Investing
                  </Link>
                </div>

                {/* Master Plan - Featured */}
                <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-blue-600 relative hover:shadow-2xl transition-all hover:-translate-y-3 transform scale-105">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-8 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                  
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Star className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Master Plan</h3>
                    <div className="text-5xl font-bold text-blue-600 mb-2">3.5%</div>
                    <div className="text-gray-500 text-lg">Daily Return</div>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    {/* Investment Details */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Investment Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Investment:</span>
                          <span className="font-semibold text-gray-900">$20,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Maximum Investment:</span>
                          <span className="font-semibold text-gray-900">$100,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Investment Period:</span>
                          <span className="font-semibold text-gray-900">10 Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Return:</span>
                          <span className="font-semibold text-blue-600">35%</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Plan Features</h4>
                      <ul className="space-y-3">
                        {[
                          'Daily profit payments',
                          'Recommended for most investors',
                          'Balanced risk-reward ratio',
                          'Principal + profits paid together',
                          'Priority customer support',
                          'Instant withdrawals',
                          'Personal account manager'
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Link href="/signup" className="w-full bg-blue-600 text-white py-4 rounded-2xl hover:bg-blue-700 font-semibold transition-colors text-center block text-lg">
                    Start Investing
                  </Link>
                </div>

                {/* Ultimate Plan */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-3 border-2 border-gray-200 relative">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <TrendingUp className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ultimate Plan</h3>
                    <div className="text-5xl font-bold text-purple-600 mb-2">5.0%</div>
                    <div className="text-gray-500 text-lg">Daily Return</div>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    {/* Investment Details */}
                    <div className="bg-purple-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Investment Details</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Investment:</span>
                          <span className="font-semibold text-gray-900">$100,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Maximum Investment:</span>
                          <span className="font-semibold text-gray-900">Unlimited</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Investment Period:</span>
                          <span className="font-semibold text-gray-900">20 Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Return:</span>
                          <span className="font-semibold text-purple-600">100%</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">Plan Features</h4>
                      <ul className="space-y-3">
                        {[
                          'Daily profit payments',
                          'For serious investors',
                          'Highest return potential',
                          'VIP customer service',
                          'Dedicated relationship manager',
                          'Priority withdrawal processing',
                          'Exclusive market insights',
                          'Custom investment strategies'
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Link href="/signup" className="w-full bg-purple-600 text-white py-4 rounded-2xl hover:bg-purple-700 font-semibold transition-colors text-center block text-lg">
                    Start Investing
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Start earning guaranteed returns in just 4 simple steps
                </p>
              </div>
              
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  {
                    step: "1",
                    title: "Choose Your Plan",
                    description: "Select the investment plan that matches your goals and budget",
                    icon: "📋"
                  },
                  {
                    step: "2", 
                    title: "Make Investment",
                    description: "Fund your chosen plan securely through our payment gateway",
                    icon: "💳"
                  },
                  {
                    step: "3",
                    title: "Earn Daily Returns",
                    description: "Watch your investment grow with guaranteed daily profits",
                    icon: "📈"
                  },
                  {
                    step: "4",
                    title: "Withdraw Profits",
                    description: "Access your earnings anytime with instant withdrawals",
                    icon: "💰"
                  }
                ].map((item, index) => (
                  <div key={index} className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-bold text-white">{item.step}</span>
                    </div>
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 bg-blue-900 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Didn't find your answer?</h2>
                <p className="text-xl text-blue-200 mb-8">
                  Our investment experts are here to help you make the right choice
                </p>
                <button
                  onClick={() => setContactFormOpen(true)}
                  className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-colors text-lg"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </section>
        </main>

     {/* Footer */}
<footer className="bg-gray-100 text-gray-800 py-8">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
        <div className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Everest Global Holdings Logo" 
            className="h-16 w-auto mr-2"
            onError={(e) => {
              // First fallback
              if (e.currentTarget.src !== "/everest-logo.png") {
                e.currentTarget.src = "/everest-logo.png"
              } else {
                // Final fallback to company initials
                e.currentTarget.style.display = 'none';
                const fallbackElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallbackElement) fallbackElement.style.display = 'flex';
              }
            }}
          />
          <div className="w-8 h-8 bg-blue-600 rounded-lg items-center justify-center mr-2 hidden">
            <span className="text-white font-bold">E</span>
          </div>
          <div className="text-lg font-bold">Everest Global Holdings</div>
        </div>
        <div className="text-sm text-gray-600">
          20-22 Wenlock Road, London, N1 7GU England
        </div>
      </div>
      
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
    
    <div className="mt-6 pt-4 border-t border-gray-300 text-center">
      <p className="text-sm text-gray-600">
        &copy; 2025 Everest Global Holdings. All rights reserved.
      </p>
    </div>
  </div>
</footer>

        {/* Contact Form Modal */}
        {contactFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="relative p-6">
                <button
                  onClick={() => setContactFormOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl bg-transparent border-0 cursor-pointer"
                >
                  ×
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Our Experts</h2>
                  <p className="text-gray-600">
                    Get personalized investment advice from our professional team.
                  </p>
                </div>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell us about your investment goals..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setContactFormOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Chat Widget */}
        <ChatWidget />
      </div>
    </>
  )
}