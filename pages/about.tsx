// pages/about.tsx - Mobile Responsive Version
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { TrendingUp, Shield, Users, Star, Award, Target, Zap, Globe } from 'lucide-react'
import { ChatWidget } from '../components/ChatWidget'

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us - Everest Global Holdings</title>
        <meta name="description" content="Learn about Everest Global Holdings - your trusted partner in professional investment management with cutting-edge technology and proven strategies." />
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
            {/* Hero Section */}
            <div className="text-center mb-12 sm:mb-16">
              <h1 className="text-responsive-2xl font-bold text-slate-800 mb-4 sm:mb-6">
                About Everest Global Holdings
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
                Your trusted partner in professional investment management, delivering exceptional returns through innovative strategies and cutting-edge technology.
              </p>
            </div>

            {/* Stats Section */}
            <div className="stats-grid mb-16 sm:mb-20">
              {[
                { icon: Users, value: '10,000+', label: 'Trusted Investors' },
                { icon: TrendingUp, value: '$2.5B', label: 'Assets Under Management' },
                { icon: Award, value: '15+', label: 'Years of Excellence' },
                { icon: Star, value: '4.9/5', label: 'Client Satisfaction' }
              ].map((stat, index) => (
                <div key={index} className="card-base p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5">
                    <stat.icon size={28} className="text-slate-800" />
                  </div>
                  <div className="stat-number text-slate-800 mb-2">
                    {stat.value}
                  </div>
                  <div className="stat-label text-slate-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Our Story Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 sm:mb-20 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-responsive-xl font-bold text-slate-800 mb-4 sm:mb-6">
                  Our Story
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                    Founded in 2008, Everest Global Holdings emerged from a simple belief: every investor deserves access to institutional-quality investment strategies and transparent performance.
                  </p>
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                    What started as a boutique firm has grown into a trusted investment partner managing over $2.5 billion in assets across diverse global markets. Our success is built on rigorous research, disciplined risk management, and an unwavering commitment to our clients' financial goals.
                  </p>
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                    Today, we combine traditional investment wisdom with cutting-edge technology to deliver consistent, superior returns while maintaining the personal touch that defines our client relationships.
                  </p>
                </div>
              </div>
              
              <div className="order-1 lg:order-2 card-base p-6 sm:p-8 lg:p-10">
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-6 text-center">
                  Why Choose Us?
                </h3>
                <div className="space-y-5">
                  {[
                    { icon: Shield, title: 'Proven Track Record', desc: 'Consistent outperformance with 98.5% success rate' },
                    { icon: Target, title: 'Tailored Strategies', desc: 'Customized investment plans for every risk profile' },
                    { icon: Zap, title: 'Advanced Technology', desc: 'AI-powered analytics and real-time monitoring' },
                    { icon: Globe, title: 'Global Reach', desc: 'Diversified portfolio across 6 major industries' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 sm:gap-4">
                      <div className="p-2 bg-slate-50 rounded-lg flex-shrink-0">
                        <item.icon size={20} className="text-slate-800" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-slate-800 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed m-0">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20">
              <div className="card-base p-6 sm:p-8 lg:p-10 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Target size={28} className="sm:w-8 sm:h-8 text-slate-800" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-3 sm:mb-4">
                  Our Mission
                </h3>
                <p className="text-base text-slate-600 leading-relaxed m-0">
                  To democratize access to sophisticated investment strategies, empowering individuals and institutions to achieve their financial aspirations through transparent, innovative, and results-driven investment management.
                </p>
              </div>

              <div className="card-base p-6 sm:p-8 lg:p-10 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Globe size={28} className="sm:w-8 sm:h-8 text-slate-800" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-3 sm:mb-4">
                  Our Vision
                </h3>
                <p className="text-base text-slate-600 leading-relaxed m-0">
                  To become the world's most trusted investment partner, setting new standards for performance, transparency, and client satisfaction while driving positive impact across global markets.
                </p>
              </div>
            </div>

            {/* Values Section */}
            <div className="mb-16 sm:mb-20">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-responsive-xl font-bold text-slate-800 mb-3 sm:mb-4">
                  Our Core Values
                </h2>
                <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
                  The principles that guide every decision we make and every relationship we build.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  <div key={index} className="card-base p-6 text-center">
                    <div className="text-3xl sm:text-4xl mb-4 sm:mb-5">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 sm:mb-3">
                      {value.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed m-0">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center p-8 sm:p-12 lg:p-16 bg-white rounded-2xl border border-gray-200 mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3 sm:mb-4">
                Ready to Start Your Investment Journey?
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of investors who trust us with their financial future. Let's build your wealth together.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Link href="/signup" className="w-full sm:w-auto bg-slate-800 text-white no-underline font-semibold text-base px-6 sm:px-8 py-3 sm:py-4 rounded-lg transition-all hover:bg-slate-700">
                  Get Started Today
                </Link>
                <Link href="/industries" className="w-full sm:w-auto bg-transparent text-slate-800 no-underline font-semibold text-base px-6 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-slate-800 transition-all hover:bg-slate-800 hover:text-white">
                  Explore Industries
                </Link>
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

          {/* Mobile-specific responsive adjustments */}
          <style jsx>{`
            @media (max-width: 640px) {
              .footer-grid {
                grid-template-columns: 1fr !important;
                gap: 32px !important;
              }
            }
          `}</style>
        </footer>

        {/* Chat Widget */}
        <ChatWidget />
      </div>
    </>
  )
}