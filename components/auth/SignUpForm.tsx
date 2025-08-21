// components/auth/SignUpForm.tsx (Fixed Version with Styled Popups)
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import { useGlobalPopup } from '../ui/PopupProvider'

export function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { signUp, loading } = useAuth()
  const router = useRouter()
  const { showSuccess, showError } = useGlobalPopup()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      )

      if (data?.user && !error) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          // Email already confirmed (shouldn't happen on first signup)
          showSuccess(
            'Account Created!',
            'Your account has been created successfully. Redirecting to dashboard...',
            2000
          )
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          // Email verification required - redirect to verification page
          showSuccess(
            'Account Created!',
            'Please check your email to verify your account before signing in.',
            3000
          )
          localStorage.setItem('pendingVerificationEmail', formData.email)
          setTimeout(() => {
            router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
          }, 3000)
        }
      } else if (error) {
        console.error('❌ Sign up form error:', error)
        showError(
          'Sign Up Failed',
          error.message || 'Failed to create account. Please try again.'
        )
      }
    } catch (error: unknown) {
      console.error('❌ Sign up form submission error:', error)
      showError(
        'Sign Up Error',
        'An unexpected error occurred. Please try again.'
      )
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Full Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151'
        }}>
          Full Name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          placeholder="Enter your full name"
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            border: errors.fullName ? '1px solid #dc2626' : '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#111827',
            backgroundColor: 'white',
            boxSizing: 'border-box'
          }}
        />
        {errors.fullName && (
          <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>
            {errors.fullName}
          </p>
        )}
      </div>

      {/* Email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151'
        }}>
          Email Address
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            width: '100%',
            padding: '8px 12px',
            border: errors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#111827',
            backgroundColor: 'white',
            boxSizing: 'border-box'
          }}
        />
        {errors.email && (
          <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151'
        }}>
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Create a password"
            required
            style={{
              width: '100%',
              padding: '8px 40px 8px 12px',
              border: errors.password ? '1px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#111827',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'none'
            }}
          >
            {showPassword ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151'
        }}>
          Confirm Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            required
            style={{
              width: '100%',
              padding: '8px 40px 8px 12px',
              border: errors.confirmPassword ? '1px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#111827',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {showConfirmPassword ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>
            {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: loading ? '#475569' : '#475569',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background-color 0.2s'
        }}
      >
        {loading && (
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        )}
        Create Account
      </button>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus {
          outline: none;
          border-color: #2563eb !important;
          box-shadow: 0 0 0 1px #475569;
        }
        
        button:hover:not(:disabled) {
          background-color: #747880ff !important;
        }
      `}</style>
    </form>
  )
}