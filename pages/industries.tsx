import { useState } from 'react'
import Link from 'next/link'
import { ChatWidget } from '../components/ChatWidget'

export default function ExpertisePage() {
  const [activeExpertise, setActiveExpertise] = useState('oil-gas')
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
      console.log('📨 Submitting contact form from Industries page:', {
        name: contactForm.name,
        email: contactForm.email,
        messageLength: contactForm.message.length
      })

      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: contactForm.email,
          message: `Name: ${contactForm.name}\n\nMessage: ${contactForm.message}\n\nSource: Industries Page`,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Industries page contact form API error:', response.status, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to send message`)
      }

      const result = await response.json()
      console.log('✅ Industries page contact form sent successfully:', result)
      
      setContactForm({ name: '', email: '', message: '' })
      setContactFormOpen(false)
      alert('Thank you for your message! We have received it and will get back to you soon.')
      
    } catch (error: unknown) {
      console.error('❌ Industries page contact form submission error:', error)
      const errorMessage = (error as Error)?.message || 'Sorry, there was an error sending your message. Please try again.'
      alert(errorMessage)
    }
  }

  const expertiseData = {
    'oil-gas': {
      title: 'Oil & Gas',
      icon: '⚡',
      content: {
        overview: 'Strategic investments in energy sector companies and exploration projects with stable long-term returns across Australia and Canada\'s most promising fields.',
        highlights: [
          'Access to premium LNG export opportunities in growing Asian markets',
          'Direct participation in proven drilling operations with experienced partners',
          'Attractive tax deductions including Intangible Drilling Costs (IDC)',
          'Monthly revenue streams within 90 days of initial investment'
        ],
        investment_focus: 'We focus on proven operators in lower-risk zones, leveraging Australia\'s strategic position as a major LNG exporter to meet growing demand from China and India.',
        returns: 'Investors benefit from passive income streams, significant tax advantages, and portfolio diversification independent of traditional stock market fluctuations.',
        why_choose: 'Over decades of energy industry experience, elite access to compelling mineral tracts, and partnerships with operators using cutting-edge drilling technology for maximum yields.'
      }
    },
    'real-estate': {
      title: 'Real Estate',
      icon: '🏢',
      content: {
        overview: 'Premium property investments and development projects in high-growth markets worldwide, focusing on sustainable appreciation and income generation.',
        highlights: [
          'Strategic commercial and residential developments in emerging markets',
          'Direct ownership opportunities in prime metropolitan locations',
          'Consistent rental income streams with capital appreciation potential',
          'Professional property management and maintenance services included'
        ],
        investment_focus: 'We target undervalued properties in growth corridors, luxury developments in stable markets, and commercial real estate with strong tenant profiles.',
        returns: 'Dual benefit of regular rental income plus long-term capital gains, with typical annual returns ranging from 8-15% depending on market conditions.',
        why_choose: 'Extensive market research capabilities, established relationships with leading developers, and comprehensive due diligence processes ensure quality opportunities.'
      }
    },
    'stocks': {
      title: 'Stocks & Equities',
      icon: '📈',
      content: {
        overview: 'Diversified equity portfolios focused on blue-chip companies and emerging market opportunities, managed by experienced financial professionals.',
        highlights: [
          'Balanced portfolios across multiple sectors and geographic regions',
          'Focus on dividend-paying stocks for consistent income generation',
          'Growth opportunities in emerging technologies and markets',
          'Professional risk management and portfolio rebalancing'
        ],
        investment_focus: 'We emphasize fundamentally strong companies with proven track records, sustainable competitive advantages, and strong management teams.',
        returns: 'Target annual returns of 10-18% through a combination of capital appreciation and dividend income, with quarterly portfolio reviews.',
        why_choose: 'Rigorous fundamental analysis, advanced market research tools, and decades of combined investment experience across global markets.'
      }
    },
    'ai-arbitrage': {
      title: 'AI Arbitrage',
      icon: '🤖',
      content: {
        overview: 'Advanced algorithmic trading strategies leveraging artificial intelligence to identify and capitalize on market inefficiencies across global financial markets.',
        highlights: [
          'Proprietary AI algorithms for real-time market analysis',
          'High-frequency trading capabilities across multiple exchanges',
          'Risk-managed arbitrage opportunities in forex, crypto, and commodities',
          'Consistent returns independent of overall market direction'
        ],
        investment_focus: 'Our AI systems identify price discrepancies across markets, executing trades within milliseconds to capture profit margins unavailable to traditional investors.',
        returns: 'Target monthly returns of 2-5% through systematic arbitrage strategies, with daily monitoring and risk adjustment protocols.',
        why_choose: 'Cutting-edge technology infrastructure, experienced quantitative analysts, and proven algorithmic strategies with extensive backtesting results.'
      }
    },
    'agro-farming': {
      title: 'Agro Farming',
      icon: '🌾',
      content: {
        overview: 'Sustainable agriculture investments and modern farming technologies focused on food security, environmental stewardship, and profitable crop production.',
        highlights: [
          'Investment in precision agriculture and smart farming technologies',
          'Sustainable crop production with environmental responsibility',
          'Direct partnerships with experienced agricultural operators',
          'Growing global demand for organic and specialty crops'
        ],
        investment_focus: 'We invest in fertile farmland, modern irrigation systems, and agricultural technology that increases yields while promoting sustainability.',
        returns: 'Annual returns of 6-12% through crop sales, land appreciation, and agricultural technology licensing, with inflation hedge benefits.',
        why_choose: 'Deep agricultural expertise, relationships with top farming operations, and focus on sustainable practices that ensure long-term viability.'
      }
    },
    'gold-mining': {
      title: 'Gold Mining',
      icon: '🏆',
      content: {
        overview: 'Precious metals extraction and trading operations providing portfolio stability, inflation protection, and exposure to one of history\'s most reliable stores of value.',
        highlights: [
          'Direct investment in proven gold mining operations worldwide',
          'Portfolio hedge against inflation and currency devaluation',
          'Physical gold storage and trading opportunities',
          'Strategic partnerships with established mining companies'
        ],
        investment_focus: 'We target established mines with proven reserves, new exploration projects in geologically favorable regions, and gold trading opportunities.',
        returns: 'Long-term appreciation potential with gold price appreciation, plus immediate returns from mining operations and trading activities.',
        why_choose: 'Geological expertise, established mining partnerships, secure storage facilities, and comprehensive understanding of precious metals markets.'
      }
    }
  }

  const expertiseKeys = Object.keys(expertiseData)
  const currentExpertise = expertiseData[activeExpertise as keyof typeof expertiseData]

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Our Investment Expertise
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Diversified portfolio management across high-growth sectors with proven track records. 
            Explore our specialized investment strategies designed to maximize returns while managing risk.
          </p>
        </div>
      </section>

      {/* Expertise Navigation Tabs */}
      <section className="bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-2 sm:space-x-4">
            {expertiseKeys.map((key) => {
              const expertise = expertiseData[key as keyof typeof expertiseData]
              const isActive = activeExpertise === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveExpertise(key)}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-blue-400 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{expertise.icon}</span>
                  <span>{expertise.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Expertise Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-500 to-gray-500 px-8 py-8 text-white">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">{currentExpertise.icon}</div>
                <h2 className="text-3xl font-bold">{currentExpertise.title}</h2>
              </div>
              <p className="text-xl text-gray-200 leading-relaxed">
                {currentExpertise.content.overview}
              </p>
            </div>

            {/* Content Grid */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Key Highlights */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      Key Highlights
                    </h3>
                    <ul className="space-y-4">
                      {currentExpertise.content.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                          <span className="text-gray-700 leading-relaxed">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Investment Focus */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      Investment Focus
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {currentExpertise.content.investment_focus}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Expected Returns */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Returns & Benefits
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {currentExpertise.content.returns}
                    </p>
                  </div>

                  {/* Why Choose Us */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Why Choose Everest
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {currentExpertise.content.why_choose}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Ready to Invest?</h4>
                    <p className="text-gray-600 mb-4">
                      Start your journey with {currentExpertise.title} investments today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/signup" className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 font-medium transition-colors text-center">
                        Get Started
                      </Link>
                      <button
                        onClick={() => setContactFormOpen(true)}
                        className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-2xl hover:border-gray-400 font-medium transition-colors text-center"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Diversify Your Portfolio Across Multiple Sectors
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Don't limit yourself to one investment type. Explore our comprehensive range of 
            expertise areas to build a robust, diversified portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-colors">
              Start Investing Today
            </Link>
            <button
              onClick={() => setContactFormOpen(true)}
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

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

      <ChatWidget />
    </div>
  )
}