import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

interface KeepaliveResponse {
  success: boolean
  message: string
  timestamp: string
  profileCount?: number
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KeepaliveResponse>
) {
  console.log('🔄 Keepalive endpoint called:', {
    method: req.method,
    userAgent: req.headers['user-agent']?.substring(0, 50),
    timestamp: new Date().toISOString()
  })

  // Allow both GET and POST for flexibility
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      timestamp: new Date().toISOString()
    })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase configuration missing')
      return res.status(500).json({
        success: false,
        message: 'Database configuration error',
        timestamp: new Date().toISOString(),
        error: 'Missing Supabase credentials'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Perform a simple query to keep database active
    // Using count() to minimize data transfer
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Database query failed:', error.message)
      return res.status(500).json({
        success: false,
        message: 'Database query failed',
        timestamp: new Date().toISOString(),
        error: error.message
      })
    }

    console.log(`✅ Keepalive successful - Found ${count} profiles`)

    return res.status(200).json({
      success: true,
      message: 'Database keepalive successful',
      timestamp: new Date().toISOString(),
      profileCount: count || 0
    })

  } catch (error: unknown) {
    console.error('❌ Keepalive error:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during keepalive',
      timestamp: new Date().toISOString(),
      error: (error as Error)?.message || 'Unknown error'
    })
  }
}