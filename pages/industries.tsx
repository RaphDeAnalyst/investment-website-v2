import { useState } from 'react'
import Head from 'next/head'
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
      content: {
        overview: 'Strategic investments in energy sector companies and exploration projects with stable long-term returns across Australia and Canada\'s most promising fields.',
        highlights: [
          'Access premium oil, gas, and LNG opportunities in fast-growing energy markets',
          'Partner directly with seasoned operators driving high-yield projects',
          'Benefit from exclusive tax incentives designed for energy investors',
          'Tap into a sector known for strong, consistent profitability and global demand',
          'Gain exposure to niche plays often overlooked by mainstream investors'
        ],
        investment_focus: 'At Everest Global Holdings, we specialize in connecting ambitious investors with high-quality oil and gas ventures. With strategic projects in lower Australia and Canada, we leverage Australia\'s position as one of the world\'s top LNG exporters to meet rising energy demand from China, India, and other key markets. Our selection process focuses on high-return opportunities backed by decades of technical and industry expertise.',
        returns: 'Profit Potential: The oil and gas sector remains one of the most lucrative investment opportunities worldwide, driven by rising energy demand and limited supply. Passive Income Opportunities: Investors can generate steady returns from oil and gas projects, independent of traditional stock or bond market fluctuations. Tax Advantages: Enjoy incentives such as deductions on drilling costs and other energy-specific allowances. Long-Term Growth: Investments in oil and gas projects benefit from market stability, technological innovation, and strategic resource positioning.',
        why_choose: 'With decades of combined industry experience, Everest Global Holdings provides investors with a trusted gateway into profitable energy ventures. Our edge comes from: Elite Access: High-value mineral tracts, prime leaseholds, and exclusive participation opportunities. Experienced Operators: Partnering with teams using cutting-edge drilling and production technologies for maximum yields. Strategic Approach: Focused on mitigating risk while delivering consistent and above-average returns. At Everest Global Holdings, we don\'t just offer oil and gas investments — we offer a chance to participate in a highly profitable, resilient, and growing sector, while giving you the tools to maximize returns and diversify your portfolio confidently.'
      }
    },
    'real-estate': {
      title: 'Real Estate',
      content: {
        overview: 'Premium property investments and development projects in high-growth markets worldwide, focusing on sustainable appreciation and income generation.',
        highlights: [
          'Access world-class commercial real estate investment opportunities across Australia and global markets',
          'Partner with experts managing billions in assets and delivering high-yield, data-driven strategies',
          'Benefit from ESG-focused, sustainable investments that create long-term value for communities and investors',
          'Leverage insights and analytics to optimize returns across property types and geographies',
          'Invest in a sector renowned for stability, growth potential, and portfolio diversification'
        ],
        investment_focus: 'At Everest Global Holdings, we specialize in connecting investors with premium real estate opportunities. From commercial leasing and property management to development and asset valuation, our approach combines global expertise with local market knowledge. Every investment is guided by rigorous research, insights-driven analysis, and a full-lifecycle perspective, ensuring assets are optimized for performance and long-term growth.',
        returns: 'Steady Profit Potential: Commercial real estate offers reliable income streams through leasing, sales, and development returns. Portfolio Diversification: Real estate investments provide stability independent of stock and bond market fluctuations. Sustainable Impact: ESG-focused strategies support low-carbon, inclusive, and environmentally responsible development. Data-Driven Advantage: Investors benefit from comprehensive market analytics, insights, and risk-mitigation strategies.',
        why_choose: 'With decades of experience managing large-scale real estate assets, Everest Global Holdings offers investors: Elite Access: Premium commercial properties and development opportunities in high-growth markets. Expert Management: Hands-on investment teams optimize asset performance from acquisition to exit. Responsible Investing: Sustainable, ESG-aligned projects that enhance both social and financial returns. At Everest Global Holdings, we don\'t just manage properties — we create investment opportunities that grow wealth, empower communities, and shape the future of the built environment.'
      }
    },
    'stocks': {
      title: 'Stocks & Equities',
      content: {
        overview: 'Access a diversified portfolio of stocks across multiple industries and markets with professional fund management by experienced traders and financial experts.',
        highlights: [
          'Access a diversified portfolio of stocks across multiple industries and markets',
          'Professional fund management by experienced traders and financial experts',
          'Leverage advanced analytics and technology to identify market trends and opportunities',
          'Benefit from stable, consistent returns through strategic stock selection',
          'Full transparency with regular updates and detailed performance reports',
          'Access to educational resources and insights to make informed investment decisions'
        ],
        investment_focus: 'At Everest Global Holdings, we help investors navigate the stock market with confidence. Our approach combines diversification, expert management, and advanced analytics to identify high-potential opportunities while mitigating risks. Every portfolio is designed to balance growth, stability, and long-term profitability.',
        returns: 'Profit Potential: Strategic stock selection aims to deliver stable and sustainable returns. Risk Mitigation: Diversified investments across sectors reduce exposure to market volatility. Data-Driven Decisions: Cutting-edge analytics inform every investment choice for maximum efficiency. Investor Empowerment: Educational resources and insights equip investors to understand market dynamics and make confident decisions.',
        why_choose: 'With decades of combined experience in financial markets, Everest Global Holdings provides investors with: Expert Portfolio Management: Professional oversight to optimize growth and minimize risk. Transparent Operations: Regular performance updates and detailed reports ensure full confidence. Strategic Advantage: Access to research, analytics, and market insights that guide smarter investments. At Everest Global Holdings, investing in the stock market is not just about buying shares — it\'s about building a well-managed, diversified portfolio that grows wealth, reduces risk, and empowers you with knowledge.'
      }
    },
    'ai-arbitrage': {
      title: 'AI Arbitrage',
      content: {
        overview: 'Advanced A.I.-driven arbitrage trading strategies that exploit market inefficiencies with consistent and predictable returns in volatile markets.',
        highlights: [
          'Access advanced A.I.-driven arbitrage trading strategies that exploit market inefficiencies',
          'Benefit from consistent and predictable returns in volatile markets',
          'Low-risk investment model that minimizes exposure to market swings',
          'Diversify your portfolio across multiple asset classes and global markets',
          'Partner with a team of experienced traders and financial experts',
          'Full transparency with regular performance reports and updates'
        ],
        investment_focus: 'At Everest Global Holdings, our A.I.-powered arbitrage trading leverages sophisticated algorithms and machine learning to identify profitable opportunities across markets in real-time. By simultaneously buying and selling equivalent assets where price discrepancies exist, we capture value efficiently while minimizing risk exposure.',
        returns: 'Stable Profit Potential: Generate steady returns even in fluctuating markets. Portfolio Diversification: Reduce overall risk by spreading strategies across multiple markets and asset classes. Technological Edge: Cutting-edge A.I. ensures rapid trade execution and maximized efficiency. Expert Management: Experienced traders and financial professionals monitor and optimize performance continuously.',
        why_choose: 'With Everest Global Holdings, arbitrage trading is not just about capturing small market inefficiencies — it\'s about leveraging technology, expertise, and strategic insight to deliver consistent, low-risk returns. Investors gain: Advanced A.I. Strategies: Sophisticated algorithms that identify and execute profitable trades with precision. Risk-Managed Approach: Minimized exposure to market volatility while enhancing stability. Transparent Reporting: Regular updates and detailed performance reports for peace of mind. At Everest Global Holdings, we combine innovation, expertise, and transparency to make arbitrage trading an accessible, profitable, and secure investment opportunity.'
      }
    },
    'agro-farming': {
      title: 'Agro Farming',
      content: {
        overview: 'Sustainable agriculture investments and modern farming technologies focused on food security, environmental stewardship, and profitable crop production.',
        highlights: [
          'Invest in a fully integrated agriculture platform with access to high-quality, low-risk farming operations',
          'Partner with a team that combines experience, scale, and innovation to deliver sustainable, profitable returns',
          'Benefit from ESG-driven practices that enhance long-term asset value and community impact',
          'Tap into a sector with rising global food demand and export growth potential',
          'Engage with innovative agriculture and advanced food processing initiatives that drive measurable impact'
        ],
        investment_focus: 'At Everest Global Holdings, we connect forward-thinking investors with premium agribusiness opportunities. Leveraging decades of experience in farming and food production, we focus on sustainable, high-yield investments across food and fiber sectors. Our operations are designed to reduce risk, optimize productivity, and maximize profitability, while supporting local rural communities and promoting responsible stewardship of farmland.',
        returns: 'Profit Potential: The global food market is booming, and sustainable agriculture provides long-term, reliable returns. Sustainable Impact: Investments support ESG-driven practices, from soil health and water conservation to ethical labor and community development. Innovation Advantage: Advanced farming techniques, export-grade production, and cutting-edge food processing technologies increase efficiency and output. Portfolio Diversification: Agriculture investments provide a hedge against traditional markets while addressing essential human needs.',
        why_choose: 'With a legacy rooted in agriculture and a commitment to innovation, Everest Global Holdings offers investors: Access to Premium Assets: High-quality farmland and agribusiness projects with proven growth potential. Responsible Operations: Sustainable practices that protect the environment, empower communities, and enhance long-term value. Strategic Growth: Investment opportunities in scalable production, food processing, and export-focused initiatives. At Everest Global Holdings, we don\'t just grow crops — we cultivate opportunities for financial growth, sustainability, and global food security, helping investors thrive while making a positive impact.'
      }
    },
    'gold-mining': {
      title: 'Gold Mining',
      content: {
        overview: 'Precious metals extraction and trading operations providing portfolio stability, inflation protection, and exposure to one of history\'s most reliable stores of value.',
        highlights: [
          'Access high-potential gold mining opportunities backed by thorough geological surveys and proven reserves',
          'Partner with a team of experienced geologists, engineers, and mining professionals',
          'Leverage advanced mining technologies to maximize productivity and optimize recovery rates',
          'Benefit from geographically diversified operations that reduce regional and market-specific risks',
          'Invest in a historically stable, high-demand asset that serves as a hedge against economic uncertainty',
          'Engage with sustainable and environmentally responsible mining practices'
        ],
        investment_focus: 'At Everest Global Holdings, we connect investors with premium gold mining projects designed to deliver long-term wealth creation. Our operations focus on maximizing efficiency, reducing environmental impact, and maintaining rigorous safety and regulatory standards. Each project is carefully selected to balance profitability with risk mitigation.',
        returns: 'Strong Profit Potential: Gold mining provides access to a highly sought-after asset with consistent demand. Portfolio Diversification: Gold behaves differently from traditional financial markets, offering stability and protection. Sustainable Operations: Environmentally responsible practices ensure long-term operational viability. Risk Mitigation: Strategic management reduces exposure to price volatility, geopolitical risk, and operational challenges.',
        why_choose: 'With decades of combined experience in precious metals and mining, Everest Global Holdings provides investors with: Elite Access: Premium gold reserves and high-yield mining projects. Expert Oversight: Skilled teams ensure efficient, safe, and profitable operations. Long-Term Stability: Gold\'s historical performance offers wealth preservation and steady returns. Transparency & Trust: Regular reporting and adherence to environmental and safety standards build investor confidence. At Everest Global Holdings, gold mining is more than extraction — it\'s an opportunity to grow wealth, diversify portfolios, and invest in a stable, globally valued asset.'
      }
    }
  }

  const expertiseKeys = Object.keys(expertiseData)
  const currentExpertise = expertiseData[activeExpertise as keyof typeof expertiseData]

  return (
    <>
      <Head>
        <title>Investment Industries - Everest Global Holdings</title>
        <meta name="description" content="Explore our investment expertise across Oil & Gas, Real Estate, Stocks, AI Arbitrage, Agriculture, and Gold Mining sectors." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
      {/* Navigation */}
       <nav className="fixed w-full top-0 shadow-sm z-50 border-b border-gray-200" style={{backgroundColor: '#FFFFFF'}}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo - Bigger than homepage */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center gap-3 no-underline">
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
                  <div className="w-14 h-4 bg-blue-600 rounded-xl items-center justify-center hidden">
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
                <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">About Us</Link>
                <Link href="/plans" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Plans</Link>
                <Link href="/industries" className="text-gray-900 hover:text-gray-900 font-medium transition-colors">Industries</Link>
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
        </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 px-4 py-6" style={{backgroundColor: '#FFFFFF'}}>
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href="/about" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                <Link href="/plans" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Plans</Link>
                <Link href="/industries" className="text-gray-900 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Industries</Link>
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

      {/* Hero Section */}
      <section className="py-20 text-black" style={{backgroundColor: '#EDE8D0'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Our Investment Expertise
          </h1>
          <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
            Diversified portfolio management across high-growth sectors with proven track records. 
            Explore our specialized investment strategies designed to maximize returns while managing risk.
          </p>
        </div>
      </section>

      {/* Expertise Navigation Tabs */}
      <section className="shadow-sm sticky top-16 z-40" style={{backgroundColor: '#FFFFFF'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-2 sm:space-x-4 scrollbar-hide">
            {expertiseKeys.map((key) => {
              const expertise = expertiseData[key as keyof typeof expertiseData]
              const isActive = activeExpertise === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveExpertise(key)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                    isActive 
                      ? 'text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={isActive ? {backgroundColor: '#111827'} : {}}
                >
                  <span>{expertise.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Expertise Content */}
      <section className="py-16" style={{backgroundColor: '#ffffffff'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-black" style={{backgroundColor: '#EDE8D0'}}>
              <div className="flex items-center space-x-4 mb-3 sm:mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold break-words">{currentExpertise.title}</h2>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-800 leading-relaxed break-words">
                {currentExpertise.content.overview}
              </p>
            </div>

            {/* Content Grid */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column */}
                <div className="space-y-6 lg:space-y-8">
                  {/* Key Highlights */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 break-words">
                      Key Highlights
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                      {currentExpertise.content.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 rounded-full mt-2 mr-3 sm:mr-4 flex-shrink-0 bg-gray-900"></div>
                          <span className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Investment Focus */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 break-words">
                      Investment Focus
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed break-words">
                      {currentExpertise.content.investment_focus}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 lg:space-y-8">
                  {/* Expected Returns */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 break-words">
                      Returns & Benefits
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed break-words">
                      {currentExpertise.content.returns}
                    </p>
                  </div>

                  {/* Why Choose Us */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 break-words">
                      Why Choose Everest
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed break-words">
                      {currentExpertise.content.why_choose}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="rounded-xl p-4 sm:p-6 border border-gray-200" style={{backgroundColor: '#FFFFFF'}}>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 break-words">Ready to Invest?</h4>
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 break-words">
                      Start your journey with {currentExpertise.title} investments today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/signup" className="bg-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors text-center text-sm sm:text-base">
                        Get Started
                      </Link>
                      <button
                        onClick={() => setContactFormOpen(true)}
                        className="border-2 border-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl hover:border-gray-400 font-medium transition-colors text-center text-sm sm:text-base"
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
      <section className="py-20 text-black" style={{backgroundColor: '#ffffffff'}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Diversify Your Portfolio Across Multiple Sectors
          </h2>
          <p className="text-xl mb-8 text-gray-800">
            Don't limit yourself to one investment type. Explore our comprehensive range of 
            expertise areas to build a robust, diversified portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-gray-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold hover:bg-gray-800 transition-colors text-base sm:text-lg text-center">
              Start Investing Today
            </Link>
            <button
              onClick={() => setContactFormOpen(true)}
              className="border-2 border-black text-black px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold hover:bg-white hover:text-black transition-colors text-base sm:text-lg"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none" style={{'--tw-ring-color': '#C9C5B1'} as any}
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

      <ChatWidget />
      </div>
    </>
  )
}