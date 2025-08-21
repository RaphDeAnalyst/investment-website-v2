// lib/rateLimiter.ts - Simple rate limiter for password reset requests

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>()

const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const MAX_REQUESTS = 3 // Maximum 3 password reset requests per hour

export function checkRateLimit(email: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(email)

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(email)
  }

  const currentEntry = rateLimitStore.get(email)

  if (!currentEntry) {
    // First request
    rateLimitStore.set(email, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return { allowed: true }
  }

  if (currentEntry.count >= MAX_REQUESTS) {
    return { 
      allowed: false, 
      resetTime: currentEntry.resetTime 
    }
  }

  // Increment counter
  currentEntry.count += 1
  rateLimitStore.set(email, currentEntry)

  return { allowed: true }
}

export function getRemainingTime(resetTime: number): string {
  const now = Date.now()
  const remaining = Math.max(0, resetTime - now)
  const minutes = Math.ceil(remaining / (60 * 1000))
  
  if (minutes <= 1) {
    return 'less than a minute'
  } else if (minutes < 60) {
    return `${minutes} minutes`
  } else {
    const hours = Math.ceil(minutes / 60)
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
}