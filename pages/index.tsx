// pages/index.tsx - Complete Mobile-Responsive Homepage
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { ChatWidget } from '../components/ChatWidget'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [industryImageErrors, setIndustryImageErrors] = useState({
    oil: false,
    realestate: false,
    stocks: false,
    ai: false,
    agro: false,
    gold: false
  })
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prevIndex) => (prevIndex + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('Contact form submitted:', contactForm)
      setContactForm({ name: '', email: '', message: '' })
      setContactFormOpen(false)
      alert('Thank you for your message! We will get back to you soon.')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Sorry, there was an error sending your message. Please try again.')
    }
  }

  useEffect(() => {
    const { stay } = router.query
    if (user && !loading && !stay) {
      router.push('/dashboard')
    }
  }, [user, loading, router.query])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Everest Global Holdings - Professional Investment Platform</title>
        <meta name="description" content="Your gateway to professional investment management with guaranteed returns" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header */}
        <header className="nav-main sticky top-0 z-50">
          <div className="nav-container">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 no-underline">
                <img 
                  src="/logo.png" 
                  alt="Everest Global Holdings Logo" 
                  className="h-12 sm:h-16 lg:h-20 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const textElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (textElement) textElement.style.display = 'block';
                  }}
                />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 m-0 hidden">
                  Investment<span className="text-blue-600">Pro</span>
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="nav-links">
              <Link href="/" className="nav-link">Home</Link>
              <Link href="/about" className="nav-link">About</Link>
              <Link href="/plans" className="nav-link">Plans</Link>
              <Link href="/industries" className="nav-link">Industries</Link>
              <button
                onClick={() => setContactFormOpen(true)}
                className="nav-link bg-transparent border-0 cursor-pointer"
              >
                Contact
              </button>
            </nav>

            {/* Auth Buttons + Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {/* Desktop Auth Buttons */}
              <div className="hidden md:flex items-center gap-4">
                <Link href="/signin" className="text-gray-500 no-underline font-medium text-sm hover:text-blue-600 transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-gray-700 text-white px-4 py-2 rounded-md no-underline font-medium text-sm hover:bg-gray-800 transition-colors">
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden bg-transparent border-0 cursor-pointer p-2 text-gray-700 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu">
              <div className="flex flex-col gap-3">
                <Link href="/" className="mobile-menu-item">Home</Link>
                <Link href="/about" className="mobile-menu-item">About</Link>
                <Link href="/plans" className="mobile-menu-item">Plans</Link>
                <Link href="/industries" className="mobile-menu-item">Industries</Link>
                <button
                  onClick={() => {
                    setContactFormOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="mobile-menu-item bg-transparent border-0 cursor-pointer text-left w-full p-0"
                >
                  Contact
                </button>
                <hr className="my-3 border-gray-200" />
                <Link href="/signin" className="mobile-menu-item">Sign In</Link>
                <Link href="/signup" className="bg-gray-700 text-white px-4 py-3 rounded-md no-underline font-medium text-sm text-center block hover:bg-gray-800 transition-colors">
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="welcome-icon lg:mx-0">
                <div className="text-2xl sm:text-3xl">📈</div>
              </div>
              
              <h1 className="welcome-title">
                Secure Investments.<br />
                <span className="text-slate-400">Trusted Growth.</span>
              </h1>
              
              <p className="welcome-subtitle">
                Join thousands of investors who trust us for their financial growth.
              </p>
              
              <Link href="/signup" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4 hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Why Choose Us */}
        <section className="section-padding container-responsive border-b border-gray-200">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              WHY CHOOSE US?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              We provide secure, transparent, and profitable investment opportunities designed for modern investors.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="card-base p-6 sm:p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">
                Guaranteed Returns
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Earn 2.5% to 5% returns on your investments with our proven strategies and risk management approach.
              </p>
            </div>

            <div className="card-base p-6 sm:p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">
                Secure Platform
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Your investments are protected with bank-level security measures and regulatory compliance.
              </p>
            </div>

            <div className="card-base p-6 sm:p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3">
                Quick Returns
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Get your returns in as little as 5 days with our flexible short-term investment plans.
              </p>
            </div>
          </div>
        </section>

        {/* Investment Plans Section */}
        <section className="section-padding container-responsive bg-gray-50 border-b border-gray-200">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              CHOOSE YOUR PLANS
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Select the investment plan that matches your financial goals and risk tolerance.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Compact Plan */}
            <div className="plan-card">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              
              <h3 className="plan-title">Compact Plan</h3>
              
              <div className="text-sm text-slate-600 mb-6 leading-relaxed space-y-2">
                <div>• 5 days duration</div>
                <div>• 2.5% return rate</div>
                <div>• Quick turnaround</div>
                <div>• Perfect for beginners</div>
              </div>
              
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                $200 - $20K
              </div>
              
              <Link href="/signup" className="btn-primary w-full text-center inline-flex items-center justify-center hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Master Plan - Highlighted */}
            <div className="plan-card border-slate-800 bg-blue-50 relative transform scale-105 shadow-xl">
              {/* Popular Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wide">
                Most Popular
              </div>
              
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              
              <h3 className="plan-title">Master Plan</h3>
              
              <div className="text-sm text-slate-600 mb-6 leading-relaxed space-y-2">
                <div>• 10 days duration</div>
                <div>• 3.5% return rate</div>
                <div>• Balanced approach</div>
                <div>• Recommended choice</div>
              </div>
              
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                $20K - $100K
              </div>
              
              <Link href="/signup" className="btn-primary w-full text-center inline-flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Ultimate Plan */}
            <div className="plan-card">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              
              <h3 className="plan-title">Ultimate Plan</h3>
              
              <div className="text-sm text-slate-600 mb-6 leading-relaxed space-y-2">
                <div>• 20 days duration</div>
                <div>• 5.0% return rate</div>
                <div>• Maximum returns</div>
                <div>• For serious investors</div>
              </div>
              
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                $100K+
              </div>
              
              <Link href="/signup" className="btn-primary w-full text-center inline-flex items-center justify-center hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="section-padding container-responsive border-b border-gray-200">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              INDUSTRIES
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              We invest across diverse industries to maximize returns and minimize risk through strategic portfolio diversification.
            </p>
          </div>

          {/* Industries Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Oil & Gas */}
            <div className="card-base p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-full h-45 bg-gray-50 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                {!industryImageErrors.oil ? (
                  <img 
                    src="/industries/oil-gas.jpg" 
                    alt="Oil & Gas Industry" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setIndustryImageErrors(prev => ({ ...prev, oil: true }))}
                  />
                ) : (
                  <span className="text-slate-500 text-sm">Oil & Gas Industry</span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Oil & Gas</h3>
              
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Strategic investments in energy sector companies and exploration projects with stable long-term returns.
              </p>
              
              <Link href="/industries" className="btn-secondary text-xs px-4 py-2 hover:bg-gray-100 transition-colors">
                Read More
              </Link>
            </div>

            {/* Real Estate */}
            <div className="card-base p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-full h-45 bg-gray-50 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                {!industryImageErrors.realestate ? (
                  <img 
                    src="/industries/real-estate.jpg" 
                    alt="Real Estate Industry" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setIndustryImageErrors(prev => ({ ...prev, realestate: true }))}
                  />
                ) : (
                  <span className="text-slate-500 text-sm">Real Estate Industry</span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Real Estate</h3>
              
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Premium property investments and development projects in high-growth markets worldwide.
              </p>
              
              <Link href="/industries" className="btn-secondary text-xs px-4 py-2 hover:bg-gray-100 transition-colors">
                Read More
              </Link>
            </div>

            {/* Stocks */}
            <div className="card-base p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-full h-45 bg-gray-50 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                {!industryImageErrors.stocks ? (
                  <img 
                    src="/industries/stocks.jpg" 
                    alt="Stocks & Trading" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setIndustryImageErrors(prev => ({ ...prev, stocks: true }))}
                  />
                ) : (
                  <span className="text-slate-500 text-sm">Stocks & Trading</span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Stocks</h3>
              
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Diversified equity portfolios focused on blue-chip companies and emerging market opportunities.
              </p>
              
              <Link href="/industries" className="btn-secondary text-xs px-4 py-2 hover:bg-gray-100 transition-colors">
                Read More
              </Link>
            </div>

            {/* AI Arbitrage */}
            <div className="card-base p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-full h-45 bg-gray-50 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                {!industryImageErrors.ai ? (
                  <img 
                    src="/industries/ai-arbitrage.jpg" 
                    alt="AI Arbitrage Technology" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setIndustryImageErrors(prev => ({ ...prev, ai: true }))}
                  />
                ) : (
                  <span className="text-slate-500 text-sm">AI Arbitrage Technology</span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">AI Arbitrage</h3>
              
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Advanced algorithmic trading strategies leveraging artificial intelligence for market inefficiencies.
              </p>
              
              <Link href="/industries" className="btn-secondary text-xs px-4 py-2 hover:bg-gray-100 transition-colors">
                Read More
              </Link>
            </div>

            {/* Agro Farming */}
            <div className="card-base p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-full h-45 bg-gray-50 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                {!industryImageErrors.agro ? (
                  <img 
                    src="/industries/agro-farming.jpg" 
                    alt="Agriculture & Farming" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setIndustryImageErrors(prev => ({ ...prev, agro: true }))}
                  />
                ) : (
                  <span className="text-slate-500 text-sm">Agriculture & Farming</span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Agro Farming</h3>
              
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Sustainable agriculture investments and modern farming technologies for food security.
              </p>
              
              <Link href="/industries" className="btn-secondary text-xs px-4 py-2 hover:bg-gray-100 transition-colors">
                Read More
              </Link>
            </div>

            {/* Gold Mining */}
            <div className="card-base p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-full h-45 bg-gray-50 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                {!industryImageErrors.gold ? (
                  <img 
                    src="/industries/gold-mining.jpg" 
                    alt="Gold Mining Operations" 
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setIndustryImageErrors(prev => ({ ...prev, gold: true }))}
                  />
                ) : (
                  <span className="text-slate-500 text-sm">Gold Mining Operations</span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Gold Mining</h3>
              
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                Precious metals extraction and trading operations for portfolio stability and inflation hedging.
              </p>
              
              <Link href="/industries" className="btn-secondary text-xs px-4 py-2 hover:bg-gray-100 transition-colors">
                Read More
              </Link>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="section-padding container-responsive bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            {/* Left Side - Image */}
            <div className="w-full h-64 sm:h-96 lg:h-[500px] rounded-lg overflow-hidden relative order-2 lg:order-1">
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/about-us-image.jpg)' }}
              />
              {/* Fallback for missing image */}
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-medium -z-10">
                Professional Investment Team
              </div>
            </div>
            
            {/* Right Side - Content */}
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 leading-tight">
                About Us
              </h2>
              
              <h3 className="text-lg sm:text-xl font-semibold text-slate-600 mb-6 leading-relaxed">
                Building Wealth with Trust and Transparency
              </h3>
              
              <p className="text-sm sm:text-base text-slate-600 mb-8 leading-relaxed">
                At Everest Global Holdings, we are committed to empowering individuals and institutions to achieve their financial goals through strategic, secure, and transparent investment solutions. With over a decade of experience in the financial markets, our team of expert analysts and portfolio managers combines cutting-edge technology with proven investment strategies to deliver consistent, long-term growth.
              </p>
              
              <p className="text-sm sm:text-base text-slate-600 mb-8 leading-relaxed">
                We believe that everyone deserves access to professional-grade investment opportunities. Our platform is built on the foundations of trust, transparency, and unwavering commitment to our clients' success.
              </p>
              
              <Link href="/about" className="btn-primary inline-flex items-center gap-2 hover:bg-blue-700 transition-colors">
                Learn More
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="section-padding bg-white border-b border-gray-200">
          <div className="container-responsive">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
                Trusted by Investors Worldwide
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Join thousands of satisfied investors who have achieved their financial goals with Everest Global Holdings.
              </p>
            </div>

            {/* Testimonials Carousel */}
            <div className="relative max-w-2xl mx-auto overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
              >
                {/* Testimonial 1 */}
                <div className="min-w-full bg-white p-6 sm:p-8 text-center shadow-sm">
                  <div className="text-4xl sm:text-5xl text-gray-200 leading-none mb-4">"</div>
                  <p className="text-sm sm:text-base text-slate-600 italic leading-relaxed mb-5 max-w-lg mx-auto">
                    Everest Global Holdings has transformed my financial future. The returns are consistent and the platform is incredibly user-friendly.
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    — John Davidson, Senior Financial Analyst
                  </p>
                </div>

                {/* Testimonial 2 */}
                <div className="min-w-full bg-white p-6 sm:p-8 text-center shadow-sm">
                  <div className="text-4xl sm:text-5xl text-gray-200 leading-none mb-4">"</div>
                  <p className="text-sm sm:text-base text-slate-600 italic leading-relaxed mb-5 max-w-lg mx-auto">
                    As a business owner, I needed reliable investment options. Everest Global Holdings's Master Plan delivered exactly what was promised.
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    — Sarah Mitchell, Business Owner & Entrepreneur
                  </p>
                </div>

                {/* Testimonial 3 */}
                <div className="min-w-full bg-white p-6 sm:p-8 text-center shadow-sm">
                  <div className="text-4xl sm:text-5xl text-gray-200 leading-none mb-4">"</div>
                  <p className="text-sm sm:text-base text-slate-600 italic leading-relaxed mb-5 max-w-lg mx-auto">
                    I was skeptical about online investments, but Everest Global Holdings's transparency convinced me. Three successful investments later, I'm very satisfied.
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    — Robert Chen, Retired Engineer
                  </p>
                </div>
              </div>

              {/* Carousel Navigation Dots */}
              <div className="flex justify-center gap-3 mt-6">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setTestimonialIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full border-0 cursor-pointer transition-all ${
                      testimonialIndex === index ? 'bg-slate-800' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Members Section */}
        <section className="section-padding container-responsive bg-gray-50 border-b border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              Meet Our Team
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              A team of dedicated professionals committed to exceeding your expectations.
            </p>
          </div>

          {/* Team Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {/* Team Member 1 */}
            <div className="card-base p-5 text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden relative">
                <img 
                  src="/team/kevin-marchetti.jpg" 
                  alt="Kevin Marchetti" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 bg-slate-100 hidden items-center justify-center text-2xl font-bold text-slate-600">
                  KM
                </div>
              </div>
              
              <h3 className="text-base font-bold text-slate-800 mb-1.5">Kevin Marchetti</h3>
              <p className="text-xs text-slate-600 font-semibold mb-3">Head of US Direct Lending</p>
              
              <div className="text-xs text-slate-500 leading-tight space-y-1">
                <div>• 15+ years experience</div>
                <div>• Credit analysis expert</div>
                <div>• Portfolio management</div>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="card-base p-5 text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden relative">
                <img 
                  src="/team/robby-bourgeois.jpg" 
                  alt="Robby Bourgeois" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 bg-slate-100 hidden items-center justify-center text-2xl font-bold text-slate-600">
                  RB
                </div>
              </div>
              
              <h3 className="text-base font-bold text-slate-800 mb-1.5">Robby Bourgeois</h3>
              <p className="text-xs text-slate-600 font-semibold mb-3">Chief Financial Officer</p>
              
              <div className="text-xs text-slate-500 leading-tight space-y-1">
                <div>• Financial planning</div>
                <div>• Investment strategy</div>
                <div>• Risk management</div>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="card-base p-5 text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden relative">
                <img 
                  src="/team/keith-carter.jpg" 
                  alt="Keith Carter" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 bg-slate-100 hidden items-center justify-center text-2xl font-bold text-slate-600">
                  KC
                </div>
              </div>
              
              <h3 className="text-base font-bold text-slate-800 mb-1.5">Keith Carter</h3>
              <p className="text-xs text-slate-600 font-semibold mb-3">Senior Managing Director</p>
              
              <div className="text-xs text-slate-500 leading-tight space-y-1">
                <div>• Originations leadership</div>
                <div>• Client relationships</div>
                <div>• Market development</div>
              </div>
            </div>

            {/* Team Member 4 */}
            <div className="card-base p-5 text-center hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden relative">
                <img 
                  src="/team/michael-blumberg.jpg" 
                  alt="Michael Blumberg" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 bg-slate-100 hidden items-center justify-center text-2xl font-bold text-slate-600">
                  MB
                </div>
              </div>
              
              <h3 className="text-base font-bold text-slate-800 mb-1.5">Michael Blumberg</h3>
              <p className="text-xs text-slate-600 font-semibold mb-3">Senior Managing Director</p>
              
              <div className="text-xs text-slate-500 leading-tight space-y-1">
                <div>• Chief Credit Officer</div>
                <div>• Underwriting standards</div>
                <div>• Credit risk assessment</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gray-50 border-t border-gray-200 border-b border-gray-200">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
              Ready to Start Investing?
            </h2>
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
              Join thousands of investors who trust Everest Global Holdings for their financial growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup" className="btn-primary hover:bg-blue-700 transition-colors">
                Start Investing Today
              </Link>
              <Link href="/plans" className="btn-secondary hover:bg-gray-100 transition-colors">
                View Investment Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12 sm:py-16">
          <div className="container-responsive">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-15 items-start">
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
                  <h2 className="text-xl sm:text-2xl font-bold text-white m-0 hidden">
                    Everest Global Holdings
                  </h2>
                </div>
                
                <div className="text-sm text-gray-300 leading-relaxed mb-6">
                  <div className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    20-22 Wenlock Road, London, N1 7GU England
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <button
                    onClick={() => setContactFormOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg border-0 cursor-pointer text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Us
                  </button>
                  
                  <a
                    href="mailto:info@everestglobalholdings.com"
                    className="flex items-center gap-2 text-gray-300 no-underline text-sm hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@everestglobalholdings.com
                  </a>
                </div>
              </div>

              {/* Right Side - Quick Links */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-6">
                  Quick Links
                </h3>
                
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  <li>
                    <Link href="/" className="text-gray-300 no-underline text-base hover:text-white transition-colors block">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="text-gray-300 no-underline text-base hover:text-white transition-colors block">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/plans" className="text-gray-300 no-underline text-base hover:text-white transition-colors block">
                      Investment Plans
                    </Link>
                  </li>
                  <li>
                    <Link href="/industries" className="text-gray-300 no-underline text-base hover:text-white transition-colors block">
                      Industries
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => setContactFormOpen(true)}
                      className="text-gray-300 bg-transparent border-0 text-base cursor-pointer hover:text-white transition-colors text-left p-0"
                    >
                      Contact
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-600 mt-12 pt-6 text-center text-gray-400 text-sm">
              © 2025 Everest Global Holdings. All rights reserved.
            </div>
          </div>
        </footer>

        {/* Contact Form Modal */}
        {contactFormOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              {/* Close Button */}
              <button
                onClick={() => setContactFormOpen(false)}
                className="absolute top-4 right-4 bg-transparent border-0 text-2xl cursor-pointer text-gray-500 hover:text-gray-700"
              >
                ×
              </button>

              <div className="modal-header">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">
                  Contact Us
                </h2>
              </div>
              
              <div className="modal-body">
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Send us a message and we'll get back to you as soon as possible.
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="form-input"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="form-textarea"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={() => setContactFormOpen(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
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