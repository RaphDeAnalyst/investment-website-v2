// pages/api/notifications/investment-request.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { EmailService, UserData, InvestmentRequestData } from '../../../lib/emailService'

interface InvestmentNotificationRequest {
  user: UserData
  request: InvestmentRequestData
}

interface ApiResponse {
  success?: boolean
  message?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  console.log('📧 Investment notification API called:', {
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📧 Investment notification API received request body:', {
      bodyExists: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      userExists: !!req.body?.user,
      requestExists: !!req.body?.request,
      fullBody: JSON.stringify(req.body, null, 2)
    })

    const { user, request }: InvestmentNotificationRequest = req.body

    // Validate required fields
    if (!user || !request) {
      console.log('❌ Validation failed - missing fields:', {
        hasUser: !!user,
        hasRequest: !!request,
        receivedBody: req.body
      })
      return res.status(400).json({ error: 'Missing required fields: user and request are required' })
    }

    if (!user.email || !user.id) {
      console.log('❌ Invalid user data:', { hasEmail: !!user.email, hasId: !!user.id })
      return res.status(400).json({ error: 'Invalid user data: email and id are required' })
    }

    if (!request.id || !request.plan_name || !request.amount_usd) {
      console.log('❌ Invalid request data:', { 
        hasId: !!request.id, 
        hasPlanName: !!request.plan_name, 
        hasAmount: !!request.amount_usd 
      })
      return res.status(400).json({ error: 'Invalid request data: id, plan_name, and amount_usd are required' })
    }

    console.log('✅ Validation passed for investment notification:', {
      userEmail: user.email.substring(0, 10) + '...',
      planName: request.plan_name,
      amount: request.amount_usd
    })

    // Send both emails concurrently
    const [userEmailResult, adminEmailResult] = await Promise.allSettled([
      EmailService.sendInvestmentRequestConfirmation(user, request),
      EmailService.sendInvestmentAdminNotification(user, request)
    ])

    // Check results
    const userEmailSent = userEmailResult.status === 'fulfilled' && userEmailResult.value
    const adminEmailSent = adminEmailResult.status === 'fulfilled' && adminEmailResult.value

    // Log results
    if (userEmailResult.status === 'rejected') {
      console.error('❌ User email failed:', userEmailResult.reason)
    }
    if (adminEmailResult.status === 'rejected') {
      console.error('❌ Admin email failed:', adminEmailResult.reason)
    }

    console.log('📧 Investment notification results:', {
      userEmailSent,
      adminEmailSent,
      userEmail: user.email.substring(0, 10) + '...',
      requestId: request.id
    })

    // Return success if at least one email was sent
    if (userEmailSent || adminEmailSent) {
      res.status(200).json({ 
        success: true, 
        message: `Investment notifications sent (user: ${userEmailSent}, admin: ${adminEmailSent})` 
      })
    } else {
      res.status(500).json({ 
        error: 'Failed to send notifications, but investment request was still created successfully' 
      })
    }

  } catch (error: unknown) {
    console.error('❌ Investment notification error:', error)
    
    res.status(500).json({ 
      error: 'Failed to send notifications, but investment request was still created successfully',
      ...(process.env.NODE_ENV === 'development' && { details: (error as Error)?.message || 'Unknown error' })
    })
  }
}