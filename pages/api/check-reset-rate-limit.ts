// pages/api/check-reset-rate-limit.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { checkRateLimit, getRemainingTime } from '../../lib/rateLimiter'

interface RateLimitRequest {
  email: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email }: RateLimitRequest = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    const rateLimitResult = checkRateLimit(email)

    if (!rateLimitResult.allowed && rateLimitResult.resetTime) {
      const remainingTime = getRemainingTime(rateLimitResult.resetTime)
      return res.status(429).json({
        allowed: false,
        message: 'Rate limit exceeded',
        remainingTime
      })
    }

    return res.status(200).json({
      allowed: true,
      message: 'Request allowed'
    })

  } catch (error) {
    console.error('❌ Error checking rate limit:', error)
    return res.status(500).json({ 
      message: 'Failed to check rate limit' 
    })
  }
}