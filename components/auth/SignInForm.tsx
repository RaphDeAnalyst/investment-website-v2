// components/auth/SignInForm.tsx (Updated with Password Visibility)
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'

export function SignInForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { signIn, loading } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const { data, error } = await signIn(formData.email, formData.password)

    if (data?.user && !error) {
      router.push('/dashboard')
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

      {/* Password with Visibility Toggle */}
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
            placeholder="Enter your password"
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
              justifyContent: 'center'
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: loading ? '#9ca3af' : '#475569',
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
        Sign In
      </button>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus {
          outline: none;
          border-color: #2563eb !important;
          box-shadow: 0 0 0 1px #2563eb;
        }
        
        button:hover:not(:disabled) {
          background-color: #7b889bff !important;
        }
      `}</style>
    </form>
  )
}