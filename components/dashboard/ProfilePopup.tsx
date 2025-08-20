// components/dashboard/ProfilePopup.tsx (Fixed modal version)
import React, { useState } from 'react'
import { createSupabaseClient } from '../../lib/supabase'
import toast from 'react-hot-toast'

interface ProfilePopupProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function ProfilePopup({ isOpen, onClose, onComplete }: ProfilePopupProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    country: '',
    wallet_address_btc: '',
    wallet_address_usdt_erc20: '',
    wallet_address_usdt_bep20: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseClient()

  // Don't render anything if not open
  if (!isOpen) return null

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAvatarFile(file)
    
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setAvatarPreview('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('No authenticated user found')
      }

      // Prepare update data
      let updateData: any = {
        ...formData,
        profile_complete: true,
        updated_at: new Date().toISOString()
      }

      // Upload avatar if provided
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}/avatar.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) {
          console.error('Avatar upload error:', uploadError)
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          
          updateData.avatar_url = publicUrl
        }
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }
      
      toast.success('Profile completed successfully!')
      onComplete()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* Modal Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}>
          <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#111827',
                margin: 0
              }}>
                Complete Your Profile
              </h2>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '24px',
                  lineHeight: 1
                }}
                title="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Profile Picture */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Profile Picture (Optional)
                </label>
                
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  position: 'relative'
                }}>
                  {avatarPreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarFile(null)
                          setAvatarPreview('')
                        }}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px'
                      }}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6b7280">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p style={{ color: '#374151', fontSize: '14px', margin: '0 0 4px 0' }}>
                        Click to upload or drag and drop
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Country *
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your country"
                />
              </div>

              {/* Wallet Addresses */}
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 16px 0'
                }}>
                  Wallet Addresses *
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      Bitcoin (BTC) Wallet Address
                    </label>
                    <input
                      type="text"
                      value={formData.wallet_address_btc}
                      onChange={(e) => setFormData(prev => ({ ...prev, wallet_address_btc: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter your BTC wallet address"
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      USDT (ERC20) Wallet Address
                    </label>
                    <input
                      type="text"
                      value={formData.wallet_address_usdt_erc20}
                      onChange={(e) => setFormData(prev => ({ ...prev, wallet_address_usdt_erc20: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter your USDT-ERC20 wallet address"
                    />
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '4px'
                    }}>
                      USDT (BEP20) Wallet Address
                    </label>
                    <input
                      type="text"
                      value={formData.wallet_address_usdt_bep20}
                      onChange={(e) => setFormData(prev => ({ ...prev, wallet_address_usdt_bep20: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                      placeholder="Enter your USDT-BEP20 wallet address"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: loading ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  disabled={loading}
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
                  {loading ? 'Saving...' : 'Complete Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}