// components/layout/Navbar.tsx
import { Fragment, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function Navbar() {
  const { user, profile, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut()
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Investment<span className="text-blue-600">Pro</span>
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <a
              href="/dashboard"
              className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Portfolio
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Research
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
            >
              Reports
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="sr-only">Open user menu</span>
                {profile?.avatar_url ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={profile.avatar_url}
                    alt="Profile"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-900 font-medium">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile Settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Account Settings
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  )
}