// pages/about.tsx - Updated with Homepage Format & Improved Cards
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
// Removed icon imports as per requirements
import { ChatWidget } from '../components/ChatWidget'

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('📨 Submitting contact form from About page:', {
        name: contactForm.name,
        email: contactForm.email,
        messageLength: contactForm.message.length
      })

      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: contactForm.email,
          message: `Name: ${contactForm.name}\n\nMessage: ${contactForm.message}\n\nSource: About Page`,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ About page contact form API error:', response.status, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to send message`)
      }

      const result = await response.json()
      console.log('✅ About page contact form sent successfully:', result)
      
      setContactForm({ name: '', email: '', message: '' })
      setContactFormOpen(false)
      alert('Thank you for your message! We have received it and will get back to you soon.')
      
    } catch (error: unknown) {
      console.error('❌ About page contact form submission error:', error)
      const errorMessage = (error as Error)?.message || 'Sorry, there was an error sending your message. Please try again.'
      alert(errorMessage)
    }
  }

  return (
    <>
      <Head>
        <title>About Us - Everest Global Holdings</title>
        <meta name="description" content="Learn about Everest Global Holdings - your trusted partner in professional investment management with cutting-edge technology and proven strategies." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 overflow-x-hidden max-w-full">
        {/* Navigation */}
        <nav className="fixed w-full top-0 shadow-sm z-50 border-b border-gray-200" style={{backgroundColor: '#FFFFFF'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2 no-underline">
                  <img 
                    src="/logo.png" 
                    alt="Everest Global Holdings Logo" 
                    className="h-12 w-auto"
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
                  <div className="text-1xl font-bold text-gray-900">
                    Everest <span className="text-gray-600">Global Holdings</span>
                  </div>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Home</Link>
                <Link href="/about" className="text-gray-900 hover:text-gray-900 font-medium transition-colors">About Us</Link>
                <Link href="/plans" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Plans</Link>
                <Link href="/industries" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Industries</Link>
                <button
                  onClick={() => setContactFormOpen(true)}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Contact
                </button>
              </div>
              
              {/* CTA Buttons */}
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
            <div className="md:hidden border-t border-gray-200 px-4 py-6" style={{backgroundColor: '#FFFFFF'}}>
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/about" className="text-gray-900 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                <Link href="/plans" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Plans</Link>
                <Link href="/industries" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Industries</Link>
                <button
                  onClick={() => {
                    setContactFormOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="text-gray-700 hover:text-gray-900 font-medium text-left bg-transparent border-0 cursor-pointer"
                >
                  Contact
                </button>
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
        <main className="pt-20">
          {/* Hero Section */}
          <section className="py-20 text-black" style={{backgroundColor: '#EDE8D0'}}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  About Everest Global Holdings
                </h1>
                <p className="text-xl text-gray-800 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Your trusted partner in professional investment management, delivering exceptional returns through innovative strategies and cutting-edge technology.
                </p>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: '10,000+', label: 'Trusted Investors' },
                  { value: '$2.5B', label: 'Assets Under Management' },
                  { value: '15+', label: 'Years of Excellence' },
                  { value: '4.9/5', label: 'Client Satisfaction' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Our Story Section */}
          <section className="py-20" style={{backgroundColor: '#EDE8D0'}}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">
                    Our Story
                  </h2>
                  <div className="space-y-6">
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Founded in 2008, Everest Global Holdings emerged from a simple belief: every investor deserves access to institutional-quality investment strategies and transparent performance.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      What started as a boutique firm has grown into a trusted investment partner managing over $2.5 billion in assets across diverse global markets. Our success is built on rigorous research, disciplined risk management, and an unwavering commitment to our clients' financial goals.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Today, we combine traditional investment wisdom with cutting-edge technology to deliver consistent, superior returns while maintaining the personal touch that defines our client relationships.
                    </p>
                  </div>
                </div>
                
                <div>
                  <img 
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="Our Story - Professional Investment Team" 
                    className="w-full h-96 object-cover rounded-2xl shadow-lg"
                    onError={(e) => {
                      if (e.currentTarget.src !== "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80") {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                      } else {
                        e.currentTarget.src = "/about-story-image.jpg"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  We provide secure, transparent, and profitable investment opportunities designed for modern investors.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { title: 'Proven Track Record', desc: 'Consistent outperformance with 98.5% success rate' },
                  { title: 'Tailored Strategies', desc: 'Customized investment plans for every risk profile' },
                  { title: 'Advanced Technology', desc: 'AI-powered analytics and real-time monitoring' },
                  { title: 'Global Reach', desc: 'Diversified portfolio across 6 major industries' }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trusted Partners Carousel Section */}
        <section className="py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted Partners</h2>
             </div>
            
            {/* Auto-scrolling Partners Container */}
            <div className="relative">
              <div className="flex animate-scroll">
                <div className="flex space-x-16 items-center">
                  {/* First Set of Partners */}
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <span className="text-gray-500 text-sm font-medium">3tD</span>
                      <div className="text-xs text-gray-400">THE TRAFFIC SOLUTION</div>
                    </div>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-gray-500 text-lg font-bold">ARCAD</span>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <span className="text-gray-500 text-sm font-medium">ESM</span>
                      <div className="text-xs text-gray-400">Metro politan</div>
                    </div>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <span className="text-gray-500 text-sm font-medium">ESM</span>
                      <div className="text-xs text-gray-400">Metro politan</div>
                    </div>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-gray-500 text-lg font-bold">ELFA</span>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-gray-500 text-lg font-bold">Wellesley</span>
                  </div>
                  
                  {/* Duplicate Set for Seamless Loop */}
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <span className="text-gray-500 text-sm font-medium">3tD</span>
                      <div className="text-xs text-gray-400">THE TRAFFIC SOLUTION</div>
                    </div>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-gray-500 text-lg font-bold">ARCAD</span>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <span className="text-gray-500 text-sm font-medium">ESM</span>
                      <div className="text-xs text-gray-400">Metro politan</div>
                    </div>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-center">
                      <span className="text-gray-500 text-sm font-medium">ESM</span>
                      <div className="text-xs text-gray-400">Metro politan</div>
                    </div>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-gray-500 text-lg font-bold">ELFA</span>
                  </div>
                  
                  <div className="h-12 w-32 bg-gray-200 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                    <span className="text-gray-500 text-lg font-bold">Wellesley</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

          {/* Mission & Vision Section */}
          <section className="py-20" style={{backgroundColor: '#EDE8D0'}}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Mission & Vision</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our driving purpose and aspirational future
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200 text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Our Mission
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    To democratize access to sophisticated investment strategies, empowering individuals and institutions to achieve their financial aspirations through transparent, innovative, and results-driven investment management.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-10 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200 text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    Our Vision
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    To become the world's most trusted investment partner, setting new standards for performance, transparency, and client satisfaction while driving positive impact across global markets.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Our Core Values
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  The principles that guide every decision we make and every relationship we build.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    title: 'Transparency',
                    description: 'Clear communication, honest reporting, and full disclosure in all our operations.',
                    icon: '🔍'
                  },
                  {
                    title: 'Excellence',
                    description: 'Continuous pursuit of superior performance and exceptional client service.',
                    icon: '⭐'
                  },
                  {
                    title: 'Innovation',
                    description: 'Embracing technology and forward-thinking strategies to stay ahead of markets.',
                    icon: '💡'
                  },
                  {
                    title: 'Integrity',
                    description: 'Ethical practices and responsible investing in everything we do.',
                    icon: '🛡️'
                  }
                ].map((value, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200 text-center">
                    <div className="text-4xl mb-6">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-white text-black" style={{backgroundColor: '#ffffffff'}}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold mb-6">Ready to Start Your Investment Journey?</h2>
              <p className="text-xl mb-8 text-gray-800">
                Join thousands of investors who trust us with their financial future. Let's build your wealth together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="bg-gray-700 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-colors text-lg">
                  Get Started Today
                </Link>
                <button
                  onClick={() => setContactFormOpen(true)}
                  className="border-2 border-black text-black px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-black transition-colors"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="text-gray-800 py-8" style={{backgroundColor: '#EDE8D0'}}>
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h2>
                  <p className="text-gray-600">
                    Send us a message and we'll get back to you as soon as possible.
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                      placeholder="Tell us how we can help you..."
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
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
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