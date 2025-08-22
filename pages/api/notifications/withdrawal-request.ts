// pages/api/notifications/withdrawal-request.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { EmailService, UserData, WithdrawalRequestData } from '../../../lib/emailService'

interface WithdrawalNotificationRequest {
  user: UserData
  request: WithdrawalRequestData
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
  console.log('📧 Withdrawal notification API called:', {
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { user, request }: WithdrawalNotificationRequest = req.body

    // Validate required fields
    if (!user || !request) {
      console.log('❌ Validation failed - missing fields:', {
        hasUser: !!user,
        hasRequest: !!request
      })
      return res.status(400).json({ error: 'Missing required fields: user and request are required' })
    }

    if (!user.email || !user.id) {
      console.log('❌ Invalid user data:', { hasEmail: !!user.email, hasId: !!user.id })
      return res.status(400).json({ error: 'Invalid user data: email and id are required' })
    }

    if (!request.id || !request.amount || !request.payment_method || !request.wallet_address) {
      console.log('❌ Invalid request data:', { 
        hasId: !!request.id, 
        hasAmount: !!request.amount, 
        hasPaymentMethod: !!request.payment_method,
        hasWalletAddress: !!request.wallet_address
      })
      return res.status(400).json({ error: 'Invalid request data: id, amount, payment_method, and wallet_address are required' })
    }

    console.log('✅ Validation passed for withdrawal notification:', {
      userEmail: user.email.substring(0, 10) + '...',
      amount: request.amount,
      paymentMethod: request.payment_method
    })

    // Send both emails concurrently
    const [userEmailResult, adminEmailResult] = await Promise.allSettled([
      EmailService.sendWithdrawalRequestConfirmation(user, request),
      EmailService.sendWithdrawalAdminNotification(user, request)
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

    console.log('📧 Withdrawal notification results:', {
      userEmailSent,
      adminEmailSent,
      userEmail: user.email.substring(0, 10) + '...',
      requestId: request.id
    })

    // Return success if at least one email was sent
    if (userEmailSent || adminEmailSent) {
      res.status(200).json({ 
        success: true, 
        message: `Withdrawal notifications sent (user: ${userEmailSent}, admin: ${adminEmailSent})` 
      })
    } else {
      res.status(500).json({ 
        error: 'Failed to send notifications, but withdrawal request was still created successfully' 
      })
    }

  } catch (error: unknown) {
    console.error('❌ Withdrawal notification error:', error)
    
    res.status(500).json({ 
      error: 'Failed to send notifications, but withdrawal request was still created successfully',
      ...(process.env.NODE_ENV === 'development' && { details: (error as Error)?.message || 'Unknown error' })
    })
  }
}