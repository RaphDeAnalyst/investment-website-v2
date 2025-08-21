// components/profile/ProfileInformationTab.tsx
import { useState, useCallback, useMemo } from 'react'
import { FileInput } from '../ui/FileInput'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useGlobalPopup } from '../ui/PopupProvider'
import { createSupabaseClient } from '../../lib/supabase'
import { useDebouncedCallback } from '../../hooks/useDebounce'

interface ProfileForm {
  full_name: string
  email: string
  phone_number: string
  country: string
  wallet_address_btc: string
  wallet_address_usdt_bep20: string
  wallet_address_usdt_erc20: string
}

interface ProfileInformationTabProps {
  user: any
  profile: any
  profileForm: ProfileForm
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileForm>>
  avatarPreview: string
  setAvatarPreview: React.Dispatch<React.SetStateAction<string>>
  saving: boolean
  updateProfile: (data: any) => Promise<void>
}

export function ProfileInformationTab({
  user,
  profile,
  profileForm,
  setProfileForm,
  avatarPreview,
  setAvatarPreview,
  saving,
  updateProfile
}: ProfileInformationTabProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fieldValidationStatus, setFieldValidationStatus] = useState<Record<string, 'validating' | 'valid' | 'invalid' | null>>({})
  const { showSuccess, showError } = useGlobalPopup()
  const supabase = createSupabaseClient()

  // Real-time field validation functions
  const validateField = useCallback((field: string, value: string): string | null => {
    switch (field) {
      case 'full_name':
        return value.trim() ? null : 'Full name is required'
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email'
        return null
      case 'phone_number':
        if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          return 'Please enter a valid phone number'
        }
        return null
      case 'wallet_address_btc':
        if (value && value.length < 25) {
          return 'Invalid Bitcoin address format'
        }
        return null
      case 'wallet_address_usdt_bep20':
        if (value && (!value.startsWith('0x') || value.length !== 42)) {
          return 'Invalid USDT-BEP20 address format (should start with 0x)'
        }
        return null
      case 'wallet_address_usdt_erc20':
        if (value && (!value.startsWith('0x') || value.length !== 42)) {
          return 'Invalid USDT-ERC20 address format (should start with 0x)'
        }
        return null
      default:
        return null
    }
  }, [])

  // Debounced validation function
  const debouncedValidateField = useDebouncedCallback((field: string, value: string) => {
    setFieldValidationStatus(prev => ({ ...prev, [field]: 'validating' }))
    
    setTimeout(() => {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error || '' }))
      setFieldValidationStatus(prev => ({ ...prev, [field]: error ? 'invalid' : 'valid' }))
    }, 100) // Small delay to show validating state
  }, 300)

  // Enhanced form change handler with real-time validation
  const handleFormChange = useCallback((field: keyof ProfileForm, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }))
    
    // Clear previous error immediately
    setErrors(prev => ({ ...prev, [field]: '' }))
    
    // Start real-time validation
    if (value.length > 0) {
      debouncedValidateField(field, value)
    } else {
      setFieldValidationStatus(prev => ({ ...prev, [field]: null }))
    }
  }, [setProfileForm, debouncedValidateField])

  // Memoized validation status for performance
  const getFieldValidationIcon = useMemo(() => {
    return (field: string, value: string) => {
      if (!value) return null
      
      const status = fieldValidationStatus[field]
      switch (status) {
        case 'validating':
          return <span className="text-blue-500 text-sm">⏳</span>
        case 'valid':
          return <span className="text-green-500 text-sm">✅</span>
        case 'invalid':
          return <span className="text-red-500 text-sm">❌</span>
        default:
          return null
      }
    }
  }, [fieldValidationStatus])

  // List of countries for dropdown
  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
    'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark',
    'Finland', 'Australia', 'New Zealand', 'Japan', 'South Korea', 'Singapore',
    'Hong Kong', 'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru',
    'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Morocco', 'Ghana', 'India',
    'China', 'Thailand', 'Malaysia', 'Indonesia', 'Philippines', 'Vietnam',
    'United Arab Emirates', 'Saudi Arabia', 'Israel', 'Turkey', 'Russia',
    'Ukraine', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria'
  ].sort()

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file)
    
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setAvatarPreview(profile?.avatar_url || '')
    }
  }

  // Image compression utility
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original if compression fails
          }
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user?.id) return null

    try {
      // Validate file size (max 5MB before compression)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (avatarFile.size > maxSize) {
        showError('File Too Large', 'Please select an image smaller than 5MB.');
        return null;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(avatarFile.type)) {
        showError('Invalid File Type', 'Please select a JPEG, PNG, or WebP image.');
        return null;
      }

      // Compress image for better performance
      console.log('🗜️ Compressing image...', { 
        originalSize: avatarFile.size,
        originalType: avatarFile.type 
      });
      const compressedFile = await compressImage(avatarFile);
      console.log('✅ Image compressed:', { 
        newSize: compressedFile.size,
        compressionRatio: ((avatarFile.size - compressedFile.size) / avatarFile.size * 100).toFixed(1) + '%'
      });

      const fileExt = 'jpg'; // Always use jpg after compression
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      // Fix: Remove 'public/' prefix to match RLS policy expectations
      const filePath = `${user.id}/${fileName}`;

      console.log('🔄 Starting avatar upload process...', {
        userId: user.id,
        fileName,
        filePath,
        fileSize: compressedFile.size,
        fileType: compressedFile.type
      });

      // Upload compressed avatar
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error details:', uploadError);
        
        if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
          showError(
            'Upload Permission Error', 
            'Unable to upload image due to security settings. Please try again or contact support.'
          );
        } else {
          showError('Upload Failed', `Failed to upload image: ${uploadError.message}`);
        }
        return null;
      }

      console.log('✅ File uploaded successfully:', uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('🔗 Generated public URL:', urlData.publicUrl);

      // Clean up old avatar after successful upload
      if (profile?.avatar_url) {
        try {
          // Extract path from old URL more reliably
          const oldUrl = profile.avatar_url;
          const oldPathMatch = oldUrl.match(/avatars\/(.+)$/);
          if (oldPathMatch) {
            const oldPath = oldPathMatch[1];
            console.log('🗑️ Cleaning up old avatar:', oldPath);
            await supabase.storage.from('avatars').remove([oldPath]);
            console.log('✅ Old avatar cleaned up successfully');
          }
        } catch (deleteError) {
          console.log('⚠️ Old avatar cleanup failed (non-critical):', deleteError);
        }
      }

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      showError(
        'Upload Error',
        error.message || 'Failed to upload image. Please try again.'
      );
      return null;
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!profileForm.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!profileForm.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (profileForm.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(profileForm.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number'
    }

    // Validate wallet addresses format
    if (profileForm.wallet_address_btc && profileForm.wallet_address_btc.length < 25) {
      newErrors.wallet_address_btc = 'Invalid Bitcoin address format'
    }

    if (profileForm.wallet_address_usdt_bep20 && (!profileForm.wallet_address_usdt_bep20.startsWith('0x') || profileForm.wallet_address_usdt_bep20.length !== 42)) {
      newErrors.wallet_address_usdt_bep20 = 'Invalid USDT-BEP20 address format (should start with 0x)'
    }

    if (profileForm.wallet_address_usdt_erc20 && (!profileForm.wallet_address_usdt_erc20.startsWith('0x') || profileForm.wallet_address_usdt_erc20.length !== 42)) {
      newErrors.wallet_address_usdt_erc20 = 'Invalid USDT-ERC20 address format (should start with 0x)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    console.log('🚀 Starting profile update process...');
    let uploadedAvatarUrl: string | null = null;
    let rollbackNeeded = false;

    try {
      let avatarUrl = profile?.avatar_url || ''

      // Upload avatar if a new file was selected
      if (avatarFile) {
        console.log('📤 Uploading new avatar...');
        uploadedAvatarUrl = await uploadAvatar()
        if (uploadedAvatarUrl) {
          avatarUrl = uploadedAvatarUrl
          rollbackNeeded = true; // Mark for potential rollback
          console.log('✅ Avatar uploaded successfully:', avatarUrl);
        } else {
          console.log('❌ Avatar upload failed, aborting profile update');
          return; // Exit early if avatar upload failed
        }
      }

      console.log('💾 Updating profile in database...');
      
      // Update profile in database
      await updateProfile({
        full_name: profileForm.full_name,
        phone_number: profileForm.phone_number,
        country: profileForm.country,
        wallet_address_btc: profileForm.wallet_address_btc,
        wallet_address_usdt_bep20: profileForm.wallet_address_usdt_bep20,
        wallet_address_usdt_erc20: profileForm.wallet_address_usdt_erc20,
        avatar_url: avatarUrl,
        profile_complete: true
      })

      console.log('✅ Profile updated in database successfully');
      rollbackNeeded = false; // Success, no rollback needed

      // Update email if changed
      if (profileForm.email !== user?.email) {
        console.log('📧 Updating email address...');
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileForm.email
        })
        
        if (emailError) {
          console.error('❌ Email update failed:', emailError);
          showError(
            'Email Update Failed',
            'Profile updated but email change failed: ' + emailError.message
          )
        } else {
          console.log('✅ Email updated successfully');
          showSuccess(
            'Profile Updated!',
            'Profile updated successfully! Please check your email to confirm the new email address.',
            4000
          )
        }
      } else {
        showSuccess(
          'Profile Updated!',
          'Your profile has been updated successfully.',
          3000
        )
      }

      // Clear avatar file selection
      setAvatarFile(null)
      console.log('🎉 Profile update process completed successfully');
      
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      
      // Rollback uploaded avatar if profile update failed
      if (rollbackNeeded && uploadedAvatarUrl) {
        console.log('🔄 Rolling back uploaded avatar due to profile update failure...');
        try {
          // Extract path from the uploaded URL
          const pathMatch = uploadedAvatarUrl.match(/avatars\/(.+)$/);
          if (pathMatch) {
            const uploadedPath = pathMatch[1];
            await supabase.storage.from('avatars').remove([uploadedPath]);
            console.log('✅ Avatar rollback completed');
          }
          
          // Reset avatar preview to original
          setAvatarPreview(profile?.avatar_url || '');
          setAvatarFile(null);
        } catch (rollbackError) {
          console.error('❌ Failed to rollback uploaded avatar:', rollbackError);
        }
      }

      // Enhanced error handling
      let errorTitle = 'Update Failed';
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.message) {
        if (error.message.includes('row-level security') || error.message.includes('policy')) {
          errorTitle = 'Permission Error';
          errorMessage = 'You do not have permission to update this profile. Please try signing out and back in.';
        } else if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          errorTitle = 'Duplicate Data';
          errorMessage = 'Some of the information you entered already exists. Please check your wallet addresses.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showError(errorTitle, errorMessage);
    }
  }

  const handleReset = () => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        email: profile.email || user.email || '',
        phone_number: profile.phone_number || '',
        country: profile.country || '',
        wallet_address_btc: profile.wallet_address_btc || '',
        wallet_address_usdt_erc20: profile.wallet_address_usdt_erc20 || '',
        wallet_address_usdt_bep20: profile.wallet_address_usdt_bep20 || ''
      })
      setAvatarPreview(profile.avatar_url || '')
      setAvatarFile(null)
    }
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Profile Information
        </h2>
        <p className="text-sm text-gray-600">
          Update your profile details and wallet addresses
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture */}
        <FileInput
          label="Profile Picture"
          onFileSelect={handleAvatarChange}
          preview={avatarPreview}
          accept="image/*"
        />

        {/* Personal Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="relative">
            <Input
              label="Full Name *"
              value={profileForm.full_name}
              onChange={(e) => handleFormChange('full_name', e.target.value)}
              error={errors.full_name}
              placeholder="Enter your full name"
              required
            />
            <div className="absolute right-3 top-8">
              {getFieldValidationIcon('full_name', profileForm.full_name)}
            </div>
          </div>

          <div className="relative">
            <Input
              label="Email Address *"
              type="email"
              value={profileForm.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              error={errors.email}
              placeholder="Enter your email"
              required
            />
            <div className="absolute right-3 top-8">
              {getFieldValidationIcon('email', profileForm.email)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="relative">
            <Input
              label="Phone Number"
              type="tel"
              value={profileForm.phone_number}
              onChange={(e) => handleFormChange('phone_number', e.target.value)}
              error={errors.phone_number}
              placeholder="+1 (555) 123-4567"
            />
            <div className="absolute right-3 top-8">
              {getFieldValidationIcon('phone_number', profileForm.phone_number)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={profileForm.country}
              onChange={(e) => setProfileForm(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select your country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Wallet Addresses Section */}
        <div className="mt-6 p-4 sm:p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔐</span>
            Cryptocurrency Wallet Addresses
          </h3>
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            Add your wallet addresses for receiving withdrawals. Make sure to double-check these addresses as incorrect addresses may result in permanent loss of funds.
          </p>

          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitcoin (BTC) Wallet Address
              </label>
              <input
                type="text"
                value={profileForm.wallet_address_btc}
                onChange={(e) => handleFormChange('wallet_address_btc', e.target.value)}
                placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                className={`w-full px-3 py-3 pr-10 border rounded-lg text-xs font-mono bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.wallet_address_btc ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="absolute right-3 top-8">
                {getFieldValidationIcon('wallet_address_btc', profileForm.wallet_address_btc)}
              </div>
              {errors.wallet_address_btc && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.wallet_address_btc}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                USDT (BEP20) Wallet Address
              </label>
              <input
                type="text"
                value={profileForm.wallet_address_usdt_bep20}
                onChange={(e) => handleFormChange('wallet_address_usdt_bep20', e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b8D7389a8C0e2e4f0e"
                className={`w-full px-3 py-3 pr-10 border rounded-lg text-xs font-mono bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.wallet_address_usdt_bep20 ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="absolute right-3 top-8">
                {getFieldValidationIcon('wallet_address_usdt_bep20', profileForm.wallet_address_usdt_bep20)}
              </div>
              {errors.wallet_address_usdt_bep20 && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.wallet_address_usdt_bep20}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                USDT (ERC20) Wallet Address
              </label>
              <input
                type="text"
                value={profileForm.wallet_address_usdt_erc20}
                onChange={(e) => handleFormChange('wallet_address_usdt_erc20', e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b8D7389a8C0e2e4f0e"
                className={`w-full px-3 py-3 pr-10 border rounded-lg text-xs font-mono bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.wallet_address_usdt_erc20 ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="absolute right-3 top-8">
                {getFieldValidationIcon('wallet_address_usdt_erc20', profileForm.wallet_address_usdt_erc20)}
              </div>
              {errors.wallet_address_usdt_erc20 && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.wallet_address_usdt_erc20}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 font-medium">
              ⚠️ Important: These wallet addresses will be used for withdrawals. Please ensure they are correct and that you have access to them.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={saving}
            disabled={saving}
            className="w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  )
}