// hooks/useAuth.ts (Fixed version)
import { useState, useEffect } from 'react'
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createSupabaseClient } from '../lib/supabase'
import toast from 'react-hot-toast'

// Add this import at the top
import { v4 as uuidv4 } from 'uuid'

// Simple Profile type
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  wallet_address_btc: string | null
  wallet_address_usdt_erc20: string | null
  wallet_address_usdt_bep20: string | null
  profile_complete: boolean | null
  phone_number: string | null
  country: string | null
  created_at: string
  updated_at: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createSupabaseClient()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...')
        
        // Get initial session with better error handling
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          // Only treat as error if it's not just "no session"
          if (sessionError.message !== 'Auth session missing!' && 
              !sessionError.message.includes('session missing') &&
              !sessionError.message.includes('no session')) {
            console.error('❌ Session error:', sessionError)
            setError(sessionError.message)
            return
          } else {
            // No session is normal for public pages
            console.log('ℹ️ No active session (normal for public pages)')
          }
        }

        if (mounted) {
          setUser(session?.user ?? null)
          console.log('✅ Session loaded:', !!session?.user)
        }
        
      } catch (err: any) {
        console.error('❌ Auth initialization error:', err)
        // Check for various session error patterns
        const isSessionError = err.message.includes('session missing') || 
                              err.message.includes('Auth session missing') ||
                              err.message.includes('AuthSessionMissingError') ||
                              err.name === 'AuthSessionMissingError'
        
        if (mounted && !isSessionError) {
          setError(err.message)
        } else if (isSessionError) {
          console.log('ℹ️ Session error handled gracefully (normal for public pages)')
          // Set user to null for public pages
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          console.log('🔄 Auth state changed:', event, !!session?.user)
          
          if (mounted) {
            setUser(session?.user ?? null)
            setError(null)
            
            // Handle email verification
            if (event === 'SIGNED_IN' && session?.user) {
              if (session.user.email_confirmed_at) {
                // Email is verified, proceed normally
                await fetchProfile(session.user.id)
              } else {
                // Email not verified, redirect to verification page
                if (typeof window !== 'undefined') {
                  window.location.href = `/verify-email?email=${encodeURIComponent(session.user.email || '')}`
                }
                return
              }
            } else if (session?.user) {
              await fetchProfile(session.user.id)
            } else {
              setProfile(null)
            }
          }
        }
      )
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔄 Fetching profile for:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('⚠️ Profile not found, creating mock profile')
        // Create a basic profile object if none exists
        const mockProfile: Profile = {
          id: userId,
          email: user?.email || 'user@example.com',
          full_name: user?.user_metadata?.full_name || 'User',
          avatar_url: null,
          wallet_address_btc: null,
          wallet_address_usdt_erc20: null,
          wallet_address_usdt_bep20: null,
          profile_complete: false,
          phone_number: null,
          country: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setProfile(mockProfile)
      } else {
        console.log('✅ Profile loaded successfully')
        setProfile(data)
      }
    } catch (err: any) {
      console.error('❌ Profile fetch error:', err)
      // Don't show error toast for profile fetch issues
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Signing up user...')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        console.log('✅ Sign up successful')
        return { data, error: null }
      } else {
        throw new Error('Sign up failed - no user returned')
      }
    } catch (error: any) {
      console.error('❌ Sign up error:', error)
      const errorMessage = error.message || 'Failed to create account'
      setError(errorMessage)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Signing in user...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        console.log('✅ Sign in successful')
        return { data, error: null }
      } else {
        throw new Error('Sign in failed - no user returned')
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error)
      const errorMessage = error.message || 'Failed to sign in'
      setError(errorMessage)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      console.log('🔄 Signing out...')
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear local state
      setUser(null)
      setProfile(null)
      setError(null)
      
      console.log('✅ Sign out successful')
    } catch (error: any) {
      console.error('❌ Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user?.id) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      
      setProfile(data)
      return data
    } catch (error: any) {
      console.error('❌ Profile update error:', error)
      throw error
    }
  }

  // Add these methods to your useAuth hook:

const uploadAvatar = async (userId: string, file: File) => {
  try {
    console.log('🔄 Uploading avatar...')
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}_${uuidv4()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // Update local state
    setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null)
    
    console.log('✅ Avatar uploaded successfully')
    
    return publicUrl
  } catch (error: any) {
    console.error('❌ Avatar upload error:', error)
    throw error
  }
}

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar, // Add this
    fetchProfile
  }
}