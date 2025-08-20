// pages/industries.tsx - Mobile Responsive Version
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ChevronDown, ChevronUp, TrendingUp, Shield, Users, Star, CheckCircle } from 'lucide-react'
import { ChatWidget } from '../components/ChatWidget'

export default function IndustriesPage() {
  const [activeIndustry, setActiveIndustry] = useState<number | null>(null)
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)

  // Industries from homepage
  const industries = [
    {
      id: 1,
      name: 'Oil & Gas',
      summary: 'Strategic investments in energy infrastructure and renewable oil alternatives for sustainable returns.',
      details: {
        overview: 'Our Oil & Gas portfolio focuses on strategic investments across the entire energy value chain, from upstream exploration to downstream refining operations. We target companies with strong fundamentals, proven reserves, and innovative approaches to sustainable energy production.',
        keyAreas: [
          'Upstream exploration and production companies',
          'Midstream pipeline and transportation infrastructure',
          'Downstream refining and petrochemical facilities',
          'Renewable oil alternatives and biofuels',
          'Energy storage and distribution technologies'
        ],
        marketOpportunity: 'The global oil and gas market is valued at over $3.3 trillion, with continued demand driven by emerging markets and industrial growth. Despite the shift toward renewable energy, oil and gas remain critical components of the global energy mix for the foreseeable future.',
        investmentStrategy: 'We employ a diversified approach, balancing traditional energy investments with forward-looking renewable alternatives. Our strategy emphasizes companies with strong ESG practices, efficient operations, and adaptability to changing market conditions.',
        riskManagement: 'Our risk management approach includes geographic diversification, commodity price hedging, and careful evaluation of regulatory environments. We focus on companies with strong balance sheets and proven ability to navigate commodity cycles.',
        returns: 'Historical returns in this sector have averaged 12-15% annually, with dividend yields typically ranging from 4-8%. Our selective approach has consistently outperformed sector benchmarks.'
      }
    },
    {
      id: 2,
      name: 'Real Estate',
      summary: 'Premium commercial and residential properties across major metropolitan markets worldwide.',
      details: {
        overview: 'Our Real Estate investments span commercial, residential, and mixed-use properties in prime locations across major metropolitan areas. We focus on assets with strong cash flow potential, appreciation prospects, and strategic value in growing markets.',
        keyAreas: [
          'Prime commercial office buildings in business districts',
          'Luxury residential developments and apartment complexes',
          'Retail and shopping centers in high-traffic locations',
          'Industrial and logistics facilities',
          'Mixed-use developments combining residential and commercial spaces'
        ],
        marketOpportunity: 'The global real estate market represents over $280 trillion in value, with institutional-quality properties offering stable income streams and long-term appreciation potential. Urban population growth and changing work patterns create new investment opportunities.',
        investmentStrategy: 'We target properties in markets with strong demographic trends, economic growth, and infrastructure development. Our approach emphasizes location quality, tenant diversity, and properties with value-add potential through renovation or repositioning.',
        riskManagement: 'Risk mitigation includes geographic diversification, tenant diversification, and thorough due diligence on market fundamentals. We maintain conservative leverage ratios and focus on markets with strong regulatory frameworks.',
        returns: 'Real estate investments typically generate 8-12% annual returns through a combination of rental income and property appreciation. Our portfolio has consistently delivered above-market performance with lower volatility.'
      }
    },
    {
      id: 3,
      name: 'Stocks',
      summary: 'Diversified equity portfolios targeting blue-chip companies and high-growth opportunities.',
      details: {
        overview: 'Our Stock portfolio encompasses a carefully curated selection of public equities across multiple sectors and market capitalizations. We focus on companies with strong fundamentals, competitive advantages, and sustainable growth prospects in both domestic and international markets.',
        keyAreas: [
          'Large-cap blue-chip companies with proven track records',
          'Growth stocks in emerging sectors and technologies',
          'Dividend-paying stocks for income generation',
          'International equities for global diversification',
          'ESG-focused companies with sustainable business practices'
        ],
        marketOpportunity: 'Global equity markets represent over $100 trillion in value, providing vast opportunities for capital appreciation and income generation. Market innovations, technological disruption, and emerging market growth continue to create new investment opportunities.',
        investmentStrategy: 'We employ a fundamental analysis approach, focusing on companies with strong balance sheets, competitive moats, and experienced management teams. Our strategy balances growth and value investing while maintaining sector and geographic diversification.',
        riskManagement: 'Risk management includes diversification across sectors, market caps, and geographies. We use stop-loss orders, position sizing, and regular portfolio rebalancing to manage downside risk while capturing upside potential.',
        returns: 'Stock investments have historically generated 10-12% annual returns over the long term. Our active management approach aims to outperform market indices while managing volatility through strategic allocation and timing.'
      }
    },
    {
      id: 4,
      name: 'Technology',
      summary: 'Cutting-edge tech companies driving digital transformation and innovation across industries.',
      details: {
        overview: 'Our Technology portfolio targets companies at the forefront of digital innovation, from established tech giants to emerging disruptors. We focus on businesses with scalable models, strong competitive moats, and transformative potential across various sectors.',
        keyAreas: [
          'Cloud computing and Software-as-a-Service (SaaS) platforms',
          'Artificial Intelligence and Machine Learning technologies',
          'Cybersecurity and data protection solutions',
          'Fintech and digital payment platforms',
          'Biotechnology and healthcare technology innovations'
        ],
        marketOpportunity: 'The global technology market exceeds $5 trillion, with continued growth driven by digital transformation, AI adoption, and emerging technologies. The sector offers significant scalability and margin expansion potential.',
        investmentStrategy: 'We invest in companies with proven business models, strong management teams, and sustainable competitive advantages. Our focus includes both growth-stage companies and established technology leaders with continued innovation potential.',
        riskManagement: 'Technology investments require careful evaluation of competitive positioning, technological obsolescence risk, and regulatory challenges. We diversify across subsectors and stages of company maturity to manage portfolio risk.',
        returns: 'Technology investments have historically generated 15-25% annual returns, though with higher volatility. Our disciplined approach focuses on companies with strong fundamentals and long-term growth prospects.'
      }
    },
    {
      id: 5,
      name: 'Agriculture',
      summary: 'Sustainable agricultural investments in farmland, food production, and agritech innovations.',
      details: {
        overview: 'Our Agriculture portfolio encompasses farmland investments, food production companies, and agricultural technology innovations. We focus on sustainable farming practices, food security solutions, and technologies that improve agricultural productivity and efficiency.',
        keyAreas: [
          'Premium farmland in high-yield agricultural regions',
          'Sustainable farming and organic food production',
          'Agricultural technology and precision farming solutions',
          'Food processing and distribution companies',
          'Water management and irrigation systems'
        ],
        marketOpportunity: 'The global agriculture market is valued at over $4 trillion, driven by growing global population, rising food demand, and the need for sustainable farming practices. Climate change and food security concerns create new investment opportunities.',
        investmentStrategy: 'We target agricultural assets with strong fundamentals, including soil quality, water access, and favorable climate conditions. Our approach emphasizes sustainable practices, technological adoption, and value-chain integration.',
        riskManagement: 'Agricultural investments face weather, commodity price, and regulatory risks. We diversify across geographic regions, crop types, and agricultural subsectors while focusing on climate-resilient farming practices.',
        returns: 'Agricultural investments typically generate 8-14% annual returns through a combination of land appreciation and operational income. The sector provides natural inflation protection and portfolio diversification benefits.'
      }
    },
    {
      id: 6,
      name: 'Cryptocurrency',
      summary: 'Digital asset investments in established cryptocurrencies and blockchain technologies.',
      details: {
        overview: 'Our Cryptocurrency portfolio includes strategic investments in major digital assets, blockchain technologies, and crypto-related infrastructure. We focus on established cryptocurrencies with strong fundamentals and emerging blockchain applications with real-world utility.',
        keyAreas: [
          'Major cryptocurrencies like Bitcoin and Ethereum',
          'DeFi protocols and decentralized applications',
          'Blockchain infrastructure and mining operations',
          'NFTs and digital collectibles platforms',
          'Cryptocurrency exchanges and trading platforms'
        ],
        marketOpportunity: 'The cryptocurrency market has grown to over $2 trillion in total market capitalization, with increasing institutional adoption and regulatory clarity. Blockchain technology applications continue to expand across multiple industries.',
        investmentStrategy: 'We employ a research-driven approach, focusing on cryptocurrencies with strong technological foundations, active development communities, and clear use cases. Our strategy includes both long-term holdings and tactical trading opportunities.',
        riskManagement: 'Cryptocurrency investments are inherently volatile and require careful risk management. We use position sizing, diversification across assets, and regular portfolio rebalancing to manage the high-risk, high-reward nature of digital assets.',
        returns: 'Cryptocurrency investments have shown potential for significant returns, with Bitcoin and Ethereum delivering substantial gains over the long term. However, volatility is high, and investors should expect significant price fluctuations.'
      }
    }
  ]

  const faqs = [
    {
      id: 1,
      question: 'What is the minimum investment amount?',
      answer: 'Our minimum investment varies by plan: Compact Plan requires $200 minimum, Master Plan requires $20,000, and Ultimate Plan requires $100,000. These minimums ensure we can effectively deploy capital and provide meaningful returns to our investors.'
    },
    {
      id: 2,
      question: 'How are returns distributed across different industries?',
      answer: 'Returns vary by industry based on market conditions and risk profiles. Technology typically offers 15-25% returns with higher volatility, while Real Estate provides 8-12% returns with more stability. We provide detailed performance metrics for each industry to help you make informed decisions.'
    },
    {
      id: 3,
      question: 'Can I invest in multiple industries simultaneously?',
      answer: 'Absolutely! We encourage diversification across multiple industries to balance risk and optimize returns. Our investment platform allows you to allocate funds across different sectors based on your risk tolerance and investment goals.'
    },
    {
      id: 4,
      question: 'What is your risk management strategy?',
      answer: 'We employ comprehensive risk management including geographic diversification, sector allocation limits, regular portfolio rebalancing, and thorough due diligence. Each industry has specific risk mitigation strategies tailored to its unique characteristics and market dynamics.'
    },
    {
      id: 5,
      question: 'How often can I review my investment performance?',
      answer: 'You can access your investment dashboard 24/7 to monitor performance in real-time. We provide monthly detailed reports, quarterly strategy updates, and annual comprehensive reviews. Our transparent reporting ensures you\'re always informed about your investments.'
    },
    {
      id: 6,
      question: 'What fees are associated with investing?',
      answer: 'We maintain a transparent fee structure with no hidden charges. Management fees vary by investment plan and are clearly outlined before you invest. We believe in aligning our success with yours through performance-based compensation.'
    }
  ]

  const toggleIndustry = (id: number) => {
    setActiveIndustry(activeIndustry === id ? null : id)
  }

  const toggleFAQ = (id: number) => {
    setActiveFAQ(activeFAQ === id ? null : id)
  }

  return (
    <>
      <Head>
        <title>Investment Industries - Everest Global Holdings</title>
        <meta name="description" content="Explore our comprehensive investment opportunities across six major industries including Oil & Gas, Real Estate, Technology, Agriculture, Stocks, and Cryptocurrency." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 font-sans">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="container-responsive flex h-16 justify-between items-center">
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
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 m-0 hidden">
                Investment<span className="text-slate-600">Pro</span>
              </h1>
            </div>

            {/* Right Side - Navigation */}
            <div className="hidden sm:flex items-center gap-4 lg:gap-6">
              <Link href="/" className="text-gray-700 no-underline text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-gray-100">
                Home
              </Link>

              <Link href="/signin" className="text-slate-800 no-underline font-medium text-sm px-3 py-2 rounded-lg border-2 border-slate-800 transition-all hover:bg-slate-800 hover:text-white">
                Sign In
              </Link>

              <Link href="/signup" className="bg-slate-800 text-white no-underline font-medium text-sm px-4 py-2.5 rounded-lg transition-all hover:bg-slate-700">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <Link href="/signup" className="bg-slate-800 text-white no-underline font-medium text-sm px-4 py-2 rounded-lg">
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="section-padding">
          <div className="container-narrow">
            {/* Page Header */}
            <div className="welcome-section mb-8 sm:mb-12">
              <h1 className="welcome-title">
                Investment Industries
              </h1>
              <p className="welcome-subtitle">
                Explore our comprehensive investment opportunities across six major industries, each offering unique growth potential and strategic advantages.
              </p>
            </div>

            {/* Stats Bar */}
            <div className="stats-grid mb-8 sm:mb-12">
              {[
                { icon: Users, value: '10,000+', label: 'Active Investors' },
                { icon: TrendingUp, value: '$2.5B', label: 'Assets Under Management' },
                { icon: Shield, value: '98.5%', label: 'Success Rate' },
                { icon: Star, value: '4.9/5', label: 'Client Satisfaction' }
              ].map((stat, index) => (
                <div key={index} className="card-base p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <stat.icon size={20} className="sm:w-6 sm:h-6 text-slate-800" />
                  </div>
                  <div className="stat-number text-slate-800 mb-1">
                    {stat.value}
                  </div>
                  <div className="stat-label text-slate-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Industries Accordion */}
            <div className="flex flex-col gap-4 mb-12 sm:mb-16">
              {industries.map((industry) => (
                <div
                  key={industry.id}
                  className="card-base overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Industry Header */}
                  <button
                    onClick={() => industry.id && toggleIndustry(industry.id)}
                    className={`w-full p-4 sm:p-6 border-0 cursor-pointer flex items-center justify-between transition-colors ${
                      activeIndustry === industry.id ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 text-left flex-1">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-800 mb-1 sm:mb-2">
                          {industry.name}
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 m-0 leading-relaxed">
                          {industry.summary}
                        </p>
                      </div>
                    </div>
                    <div className="text-slate-600 ml-4 flex-shrink-0">
                      {activeIndustry === industry.id ? (
                        <ChevronUp size={20} className="sm:w-6 sm:h-6" />
                      ) : (
                        <ChevronDown size={20} className="sm:w-6 sm:h-6" />
                      )}
                    </div>
                  </button>

                  {/* Industry Details */}
                  {activeIndustry === industry.id && (
                    <div className="p-4 sm:p-6 border-t border-gray-100 bg-slate-50">
                      <div className="flex flex-col gap-6 sm:gap-8">
                        {/* Overview */}
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">
                            Overview
                          </h3>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed m-0">
                            {industry.details.overview}
                          </p>
                        </div>

                        {/* Two Column Layout for Key Areas and Market Opportunity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                          {/* Key Investment Areas */}
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">
                              Key Investment Areas
                            </h3>
                            <ul className="list-none p-0 m-0 space-y-2">
                              {industry.details.keyAreas.map((area, index) => (
                                <li key={index} className="text-sm sm:text-base text-slate-700 pl-5 relative">
                                  <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Market Opportunity */}
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">
                              Market Opportunity
                            </h3>
                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed m-0">
                              {industry.details.marketOpportunity}
                            </p>
                          </div>
                        </div>

                        {/* Investment Strategy and Risk Management */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">
                              Investment Strategy
                            </h3>
                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed m-0">
                              {industry.details.investmentStrategy}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">
                              Risk Management
                            </h3>
                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed m-0">
                              {industry.details.riskManagement}
                            </p>
                          </div>
                        </div>

                        {/* Expected Returns */}
                        <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200">
                          <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">
                            Expected Returns
                          </h3>
                          <p className="text-sm sm:text-base text-slate-700 leading-relaxed m-0">
                            {industry.details.returns}
                          </p>
                        </div>

                        {/* CTA Button */}
                        <div className="text-center mt-4">
                          <Link href="/signup" className="bg-slate-800 text-white no-underline font-semibold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-lg inline-block transition-all hover:bg-slate-700">
                            Start Investing in {industry.name}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mb-12 sm:mb-16 p-6 sm:p-8 lg:p-12 bg-white rounded-2xl border border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
                Ready to Diversify Your Portfolio?
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
                Join thousands of investors who trust Everest Global Holdings to manage their investments across these dynamic industries.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Link href="/signup" className="w-full sm:w-auto bg-slate-800 text-white no-underline font-semibold text-base px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg transition-all hover:bg-slate-700">
                  Get Started Today
                </Link>
                <Link href="/signin" className="w-full sm:w-auto bg-transparent text-slate-800 no-underline font-semibold text-base px-6 sm:px-7 py-3 sm:py-3.5 rounded-lg border-2 border-slate-800 transition-all hover:bg-slate-800 hover:text-white">
                  Sign In
                </Link>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12 sm:mb-16">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
                  Get answers to common questions about our investment opportunities and processes.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="card-base overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className={`w-full p-4 sm:p-6 border-0 cursor-pointer flex items-center justify-between transition-colors text-left ${
                        activeFAQ === faq.id ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-slate-800 m-0 pr-4 leading-relaxed">
                        {faq.question}
                      </h3>
                      <div className="text-slate-600 flex-shrink-0">
                        {activeFAQ === faq.id ? (
                          <ChevronUp size={18} className="sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronDown size={18} className="sm:w-5 sm:h-5" />
                        )}
                      </div>
                    </button>

                    {activeFAQ === faq.id && (
                      <div className="p-4 sm:p-6 border-t border-gray-100 bg-slate-50">
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed m-0">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 text-white pt-12 sm:pt-15 pb-8 sm:pb-10">
          <div className="container-responsive">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-15 items-start">
              {/* Left Side - Logo & Info */}
              <div>
                <div className="flex items-center mb-6">
                  <img 
                    src="/logo.png" 
                    alt="Everest Global Holdings Logo"
                    className="h-10 sm:h-12 w-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const textElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (textElement) textElement.style.display = 'block';
                    }}
                  />
                  <h2 className="text-xl sm:text-2xl font-bold text-white m-0 hidden">
                    Investment<span className="text-slate-400">Pro</span>
                  </h2>
                </div>
                
                <div className="text-sm text-slate-400 leading-relaxed mb-6">
                  <div className="flex items-center mb-2">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    20-22 Wenlock Road, London, N1 7GU England
                  </div>
                </div>

                <div>
                  <button className="flex items-center gap-2 bg-slate-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg border-0 cursor-pointer text-sm font-medium transition-all hover:bg-slate-600">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Us
                  </button>
                </div>
              </div>

              {/* Right Side - Quick Links */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
                  Quick Links
                </h3>
                
                <ul className="list-none p-0 m-0 flex flex-col gap-2 sm:gap-3">
                  <li>
                    <Link href="/" className="text-slate-300 no-underline text-base transition-colors hover:text-white block">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-slate-300 no-underline text-base transition-colors hover:text-white block">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/plans" className="text-slate-300 no-underline text-base transition-colors hover:text-white block">
                      Investment Plans
                    </Link>
                  </li>
                  <li>
                    <Link href="/industries" className="text-slate-300 no-underline text-base transition-colors hover:text-white block">
                      Industries
                    </Link>
                  </li>
                  <li>
                    <Link href="/signin" className="text-slate-300 no-underline text-base transition-colors hover:text-white block">
                      Sign In
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-slate-700 mt-8 sm:mt-12 pt-4 sm:pt-6 text-center text-slate-400 text-sm">
              © 2025 Everest Global Holdings. All rights reserved.
            </div>
          </div>
        </footer>

        {/* Chat Widget */}
        <ChatWidget />
      </div>
    </>
  )
}