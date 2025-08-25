// pages/index.tsx - Complete Restructured Homepage with Monochromatic Design
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
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [investmentCalculator, setInvestmentCalculator] = useState({
    amount: 10000,
    plan: 'compact',
    expectedReturn: 11250
  })
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  })

  // Hero carousel state and data
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 3

  const heroImages = [
  'hero/hero-background1.jpg',
  'hero/hero-background2.jpg',
  'hero/hero-background3.jpg'
]

  // Auto-rotate hero carousel
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }, 5000)
  return () => clearInterval(interval)
}, [])

const goToSlide = (slideIndex: number) => {
  setCurrentSlide(slideIndex)
}

  // Industry image error states
  const [industryImageErrors, setIndustryImageErrors] = useState({
    oil: false,
    realestate: false,
    stocks: false,
    ai: false,
    agro: false,
    gold: false
  })

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prevIndex) => (prevIndex + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

   
   const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('📨 Submitting contact form:', {
        name: contactForm.name,
        email: contactForm.email,
        messageLength: contactForm.message.length
      })

      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: contactForm.email,
          message: `Name: ${contactForm.name}\n\nMessage: ${contactForm.message}`,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Contact form API error:', response.status, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to send message`)
      }

      const result = await response.json()
      console.log('✅ Contact form sent successfully:', result)
      
      setContactForm({ name: '', email: '', message: '' })
      setContactFormOpen(false)
      alert('Thank you for your message! We have received it and will get back to you soon.')
      
    } catch (error: unknown) {
      console.error('❌ Contact form submission error:', error)
      const errorMessage = (error as Error)?.message || 'Sorry, there was an error sending your message. Please try again.'
      alert(errorMessage)
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Everest Global Holdings - Professional Investment Platform</title>
        <meta name="description" content="Professional investment management with guaranteed returns across diverse markets" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="page-wrapper">
        {/* Navigation */}
        <nav className="fixed w-full top-0 shadow-sm z-50 border-b border-gray-200" style={{backgroundColor: '#FFFFFF'}}>
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
                <a href="#home" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Home</a>
                <a href="#about" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">About</a>
                <a href="#plans" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Plans</a>
                <a href="#expertise" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">Expertise</a>
                <button
                  onClick={() => setContactFormOpen(true)}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Contact
                </button>
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
            <div className="md:hidden border-t border-gray-200 px-4 py-6" style={{backgroundColor: '#FFFFFF'}}>
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</a>
                <a href="#about" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>About</a>
                <a href="#plans" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Plans</a>
                <a href="#expertise" className="text-gray-700 hover:text-gray-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Expertise</a>
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

        {/* Hero Carousel Section JSX: */}
        {/* Hero Carousel Section */}
        <section id="home" className="relative h-screen overflow-hidden">
          {/* Carousel Container */}
          <div className="relative w-full h-full">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out ${
                  index === currentSlide ? 'translate-x-0' : 
                  index < currentSlide ? '-translate-x-full' : 'translate-x-full'
                }`}
              >
                <img src={image} alt={`Hero ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
              </div>
            ))}
          </div>

          {/* Hero Content Overlay - Left Justified */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Professional Investment Management
                </h1>
                <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                  Partner with Everest Global Holdings for strategic investment solutions that deliver consistent returns across diverse market conditions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup" className="px-8 py-4 rounded-2xl font-semibold transition-colors text-center text-gray-900 hover:bg-gray-100" style={{backgroundColor: '#FFFFFF'}}>
                    Start Investing
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-opacity ${
                  index === currentSlide ? 'bg-white opacity-100' : 'bg-white opacity-50'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Features Section - Why Choose Us */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-200">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              WHY CHOOSE US?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We provide secure, transparent, and profitable investment opportunities designed for modern investors.
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#EDE8D0'}}>
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Guaranteed Returns
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Earn 2.5% to 5% returns on your investments with our proven strategies and risk management approach.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#EDE8D0'}}>
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Secure Platform
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Your investments are protected with bank-level security measures and regulatory compliance.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#EDE8D0'}}>
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                Quick Returns
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Get your returns in as little as 5 days with our flexible short-term investment plans.
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
      <section id="about" className="py-20" style={{backgroundColor: '#EDE8D0'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Solution-Oriented Investment Partnerships
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At Everest Global Holdings, we focus on building long-term partnerships with anyone; beginner investors, sophisticated investors, institutions, and high-net-worth individuals. Our approach combines rigorous analysis with innovative strategies to achieve sustainable growth.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Partnership Focus</h3>
                  <p className="text-gray-600 text-sm">We focus on long-term partnerships with talented and motivated entrepreneurs, managers, colleagues and investors to achieve common goals.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Creative Solutions</h3>
                  <p className="text-gray-600 text-sm">Our thoughtful and flexible approach allows us to develop creative solutions that meet the needs of business owners and management teams.</p>
                </div>
              </div>
              
              <Link href="/about" className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors inline-block">
                Learn More About Our Approach
              </Link>
            </div>
            
            {/* Professional Team Image */}
            <div className="order-first lg:order-last">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Professional Investment Team at Everest Global Holdings" 
                className="w-full h-96 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                onError={(e) => {
                  // First fallback
                  if (e.currentTarget.src !== "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80") {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  } else {
                    // Final fallback to local image
                    e.currentTarget.src = "/about-us-image.jpg"
                  }}}
              />
            </div>
          </div>
        </div>
      </section>

        {/* Investment Plans */}
        <section id="plans" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Investment Plans</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose from our carefully structured investment plans designed to match your financial objectives and risk profile.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Compact Plan */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Compact Plan</h3>
                  <div className="text-3xl font-bold text-gray-800 mt-2">2.5%</div>
                  <div className="text-gray-500">per day for 5 days</div>
                </div>
                
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Minimum $200 investment
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Maximum $20,000
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Perfect for beginners
                  </li>
                </ul>
                
                <Link href="/signup" className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors text-center block">
                  Get Started
                </Link>
              </div>

              {/* Master Plan */}
              <div className="bg-white rounded-2xl p-8 shadow-2xl border-2 border-gray-900 relative hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Master Plan</h3>
                  <div className="text-3xl font-bold text-gray-800 mt-2">3.5%</div>
                  <div className="text-gray-500">per day for 10 days</div>
                </div>
                
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Minimum $20,000 investment
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Maximum $100,000
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Recommended choice
                  </li>
                </ul>
                
                <Link href="/signup" className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors text-center block">
                  Get Started
                </Link>
              </div>

              {/* Ultimate Plan */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Ultimate Plan</h3>
                  <div className="text-3xl font-bold text-gray-800 mt-2">5.0%</div>
                  <div className="text-gray-500">per day for 20 days</div>
                </div>
                
                <ul className="space-y-3 mb-8 text-gray-600">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    Minimum $100,000+
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    No maximum limit
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-gray-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    For serious investors
                  </li>
                </ul>
                
                <Link href="/signup" className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 font-medium transition-colors text-center block">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Expertise & Industries */}
        <section id="expertise" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Investment Expertise</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Diversified portfolio management across high-growth sectors with proven track records.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Oil & Gas */}
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                  {!industryImageErrors.oil ? (
                    <img 
                      src="/industries/oil-gas.jpg" 
                      alt="Oil & Gas Industry" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setIndustryImageErrors(prev => ({ ...prev, oil: true }))}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">Oil & Gas Industry</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Oil & Gas</h3>
                
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  Strategic investments in energy sector companies and exploration projects with stable long-term returns.
                </p>
                
                <Link href="/industries" className="text-gray-700 hover:text-gray-900 text-xs px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors inline-block">
                  Read More
                </Link>
              </div>

              {/* Real Estate */}
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                  {!industryImageErrors.realestate ? (
                    <img 
                      src="/industries/real-estate.jpg" 
                      alt="Real Estate Industry" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setIndustryImageErrors(prev => ({ ...prev, realestate: true }))}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">Real Estate Industry</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Real Estate</h3>
                
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  Premium property investments and development projects in high-growth markets worldwide.
                </p>
                
                <Link href="/industries" className="text-gray-700 hover:text-gray-900 text-xs px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors inline-block">
                  Read More
                </Link>
              </div>

              {/* Stocks */}
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                  {!industryImageErrors.stocks ? (
                    <img 
                      src="/industries/stocks.jpg" 
                      alt="Stocks & Trading" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setIndustryImageErrors(prev => ({ ...prev, stocks: true }))}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">Stocks & Trading</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Stocks</h3>
                
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  Diversified equity portfolios focused on blue-chip companies and emerging market opportunities.
                </p>
                
                <Link href="/industries" className="text-gray-700 hover:text-gray-900 text-xs px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors inline-block">
                  Read More
                </Link>
              </div>

              {/* AI Arbitrage */}
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                  {!industryImageErrors.ai ? (
                    <img 
                      src="/industries/ai-arbitrage.png" 
                      alt="AI Arbitrage Technology" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setIndustryImageErrors(prev => ({ ...prev, ai: true }))}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">AI Arbitrage Technology</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Arbitrage</h3>
                
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  Advanced algorithmic trading strategies leveraging artificial intelligence for market inefficiencies.
                </p>
                
                <Link href="/industries" className="text-gray-700 hover:text-gray-900 text-xs px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors inline-block">
                  Read More
                </Link>
              </div>

              {/* Agro Farming */}
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                  {!industryImageErrors.agro ? (
                    <img 
                      src="/industries/agro-farming.jpg" 
                      alt="Agriculture & Farming" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setIndustryImageErrors(prev => ({ ...prev, agro: true }))}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">Agriculture & Farming</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Agro Farming</h3>
                
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  Sustainable agriculture investments and modern farming technologies for food security.
                </p>
                
                <Link href="/industries" className="text-gray-700 hover:text-gray-900 text-xs px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors inline-block">
                  Read More
                </Link>
              </div>

              {/* Gold Mining */}
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-200">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                  {!industryImageErrors.gold ? (
                    <img 
                      src="/industries/gold-mining.jpg" 
                      alt="Gold Mining Operations" 
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => setIndustryImageErrors(prev => ({ ...prev, gold: true }))}
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">Gold Mining Operations</span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Gold Mining</h3>
                
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                  Precious metals extraction and trading operations for portfolio stability and inflation hedging.
                </p>
                
                <Link href="/industries" className="text-gray-700 hover:text-gray-900 text-xs px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors inline-block">
                  Read More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Leadership Team</h2>
              <p className="text-xl text-gray-600">
                Experienced professionals dedicated to your investment success.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  initials: 'KM', 
                  name: 'Kevin Marchetti', 
                  role: 'Chief Lending Strategist', 
                  desc: '15+ years experience in credit analysis and portfolio management',
                  image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                },
                { 
                  initials: 'RB', 
                  name: 'Robby Bourgeois', 
                  role: 'Chief Financial Officer', 
                  desc: 'Financial planning and investment strategy expert',
                  image: '/Robby Bourgeois.jpeg'
                },
                { 
                  initials: 'KC', 
                  name: 'Keith Carter', 
                  role: 'Head of Portfolio Origination', 
                  desc: 'Originations leadership and client relationships',
                  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                },
                { 
                  initials: 'MB', 
                  name: 'Michael Blumberg', 
                  role: 'Senior Managing Director', 
                  desc: 'Chief Credit Officer and risk assessment specialist',
                  image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                }
              ].map((member, index) => (
                <div key={index} className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-2 border border-gray-200">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={`${member.name} - ${member.role}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gray-100 rounded-full hidden items-center justify-center">
                      <span className="text-xl font-bold text-gray-600">{member.initials}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm mb-2" style={{color: '#C9C5B1'}}>{member.role}</p>
                  <p className="text-xs text-gray-500">{member.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Client Success Stories</h2>
              <p className="text-xl text-gray-600">
                Trusted by investors worldwide for consistent results.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  quote: "Everest Global Holdings has transformed my financial future. The returns are consistent and the platform is incredibly user-friendly.", 
                  name: "John Davidson", 
                  role: "Senior Financial Analyst",
                  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                },
                { 
                  quote: "As a business owner, I needed reliable investment options. The Master Plan delivered exactly what was promised.", 
                  name: "Sarah Mitchell", 
                  role: "Business Owner",
                  image: "/Sarah Mitchel.jpg"
                },
                { 
                  quote: "I was skeptical about online investments, but the transparency convinced me. Three successful investments later, I'm very satisfied.", 
                  name: "Robert Chen", 
                  role: "Retired Engineer",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="text-5xl text-gray-300 mb-4">"</div>
                  <p className="text-gray-600 mb-6 italic">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full mr-4 overflow-hidden">
                      <img 
                        src={testimonial.image} 
                        alt={`${testimonial.name} - ${testimonial.role}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to gray placeholder if image fails
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <div className="w-full h-full bg-gray-100 rounded-full hidden items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* CTA Section */}
        <section className="py-20 text-black" style={{backgroundColor: '#C9C5B1'}}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Your Investment Journey?</h2>
            <p className="text-xl mb-8 text-gray-800">
              Join thousands of investors who trust Everest Global Holdings for their financial growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Investing Today
              </Link>
              <button
                onClick={() => setContactFormOpen(true)}
                className="border-2 border-black text-black px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
       {/* Footer */}
      <footer className="text-gray-800 py-8" style={{backgroundColor: '#EDE8D0'}}>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setContactFormOpen(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
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