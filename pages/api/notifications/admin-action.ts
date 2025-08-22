// pages/api/notifications/admin-action.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { EmailService, UserData, InvestmentRequestData, WithdrawalRequestData } from '../../../lib/emailService'

interface AdminActionRequest {
  user: UserData
  action: 'approve' | 'reject'
  type: 'investment' | 'withdrawal'
  request: InvestmentRequestData | WithdrawalRequestData
  reason?: string
  transactionHash?: string
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
  console.log('📧 Admin action notification API called:', {
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📧 Admin action notification API received request body:', {
      bodyExists: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
      fullBody: JSON.stringify(req.body, null, 2)
    })

    const { user, action, type, request, reason, transactionHash }: AdminActionRequest = req.body

    // Validate required fields
    if (!user || !action || !type || !request) {
      console.log('❌ Validation failed - missing fields:', {
        hasUser: !!user,
        hasAction: !!action,
        hasType: !!type,
        hasRequest: !!request,
        receivedBody: req.body
      })
      return res.status(400).json({ error: 'Missing required fields: user, action, type, and request are required' })
    }

    if (!user.email || !user.id) {
      console.log('❌ Invalid user data:', { hasEmail: !!user.email, hasId: !!user.id })
      return res.status(400).json({ error: 'Invalid user data: email and id are required' })
    }

    if (!['approve', 'reject'].includes(action)) {
      console.log('❌ Invalid action:', action)
      return res.status(400).json({ error: 'Invalid action: must be approve or reject' })
    }

    if (!['investment', 'withdrawal'].includes(type)) {
      console.log('❌ Invalid type:', type)
      return res.status(400).json({ error: 'Invalid type: must be investment or withdrawal' })
    }

    console.log('✅ Validation passed for admin action notification:', {
      userEmail: user.email.substring(0, 10) + '...',
      action,
      type,
      requestId: request.id
    })

    let emailResult: boolean = false

    // Send appropriate email based on action and type
    if (type === 'investment') {
      const investmentRequest = request as InvestmentRequestData
      if (action === 'approve') {
        emailResult = await EmailService.sendInvestmentApproval(user, investmentRequest)
      } else {
        emailResult = await EmailService.sendInvestmentRejection(user, investmentRequest, reason)
      }
    } else {
      const withdrawalRequest = request as WithdrawalRequestData
      if (action === 'approve') {
        emailResult = await EmailService.sendWithdrawalApproval(user, withdrawalRequest, transactionHash)
      } else {
        emailResult = await EmailService.sendWithdrawalRejection(user, withdrawalRequest, reason)
      }
    }

    console.log('📧 Admin action notification result:', {
      emailSent: emailResult,
      userEmail: user.email.substring(0, 10) + '...',
      action,
      type,
      requestId: request.id
    })

    if (emailResult) {
      res.status(200).json({ 
        success: true, 
        message: `${type} ${action} notification sent successfully` 
      })
    } else {
      res.status(500).json({ 
        error: `Failed to send ${type} ${action} notification, but admin action was still processed` 
      })
    }

  } catch (error: unknown) {
    console.error('❌ Admin action notification error:', error)
    
    res.status(500).json({ 
      error: 'Failed to send notification, but admin action was still processed',
      ...(process.env.NODE_ENV === 'development' && { details: (error as Error)?.message || 'Unknown error' })
    })
  }
}