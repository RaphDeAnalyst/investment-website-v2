// pages/api/notifications/maturity-processing.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { EmailService, MaturedInvestmentData, UserData } from '../../../lib/emailService'

interface MaturityProcessingRequest {
  maturedInvestments: MaturedInvestmentData[]
  summary: string
}

interface ApiResponse {
  success?: boolean
  message?: string
  error?: string
  emailsSent?: number
  emailsFailed?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  console.log('📧 Maturity processing notification API called:', {
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📧 Maturity processing API received request body:', {
      bodyExists: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : []
    })

    const { maturedInvestments, summary }: MaturityProcessingRequest = req.body

    // Validate required fields
    if (!Array.isArray(maturedInvestments)) {
      console.log('❌ Validation failed - invalid maturedInvestments array:', {
        receivedType: typeof maturedInvestments,
        receivedValue: maturedInvestments
      })
      return res.status(400).json({ error: 'maturedInvestments must be an array' })
    }

    console.log('✅ Validation passed for maturity processing notification:', {
      investmentsCount: maturedInvestments.length,
      summary: summary?.substring(0, 100) + '...'
    })

    let emailsSent = 0
    let emailsFailed = 0

    // Send individual user notifications
    if (maturedInvestments.length > 0) {
      console.log(`📧 Sending individual notifications to ${maturedInvestments.length} users...`)

      const emailPromises = maturedInvestments.map(async (investment) => {
        try {
          const user: UserData = {
            id: investment.user_id,
            email: investment.user_email,
            full_name: investment.user_name
          }

          console.log(`📧 Sending maturity notification to ${investment.user_email} for ${investment.investment_name}`)

          const emailResult = await EmailService.sendInvestmentMaturityNotification(user, investment)
          
          if (emailResult) {
            emailsSent++
            console.log(`✅ Maturity notification sent successfully to ${investment.user_email}`)
          } else {
            emailsFailed++
            console.log(`❌ Failed to send maturity notification to ${investment.user_email}`)
          }

          return emailResult
        } catch (error) {
          emailsFailed++
          console.error(`❌ Error sending notification to ${investment.user_email}:`, error)
          return false
        }
      })

      // Wait for all individual emails to complete
      await Promise.allSettled(emailPromises)
    }

    // Send admin summary email
    try {
      console.log('📧 Sending admin summary email...')
      const adminEmailResult = await EmailService.sendMaturityProcessingSummary(maturedInvestments, summary || 'Processing completed successfully.')
      
      if (adminEmailResult) {
        console.log('✅ Admin summary email sent successfully')
      } else {
        console.log('❌ Failed to send admin summary email')
        emailsFailed++
      }
    } catch (error) {
      console.error('❌ Error sending admin summary email:', error)
      emailsFailed++
    }

    console.log('📧 Maturity processing notification results:', {
      totalInvestments: maturedInvestments.length,
      emailsSent,
      emailsFailed,
      summary: summary?.substring(0, 50) + '...'
    })

    // Return success response
    res.status(200).json({ 
      success: true, 
      message: `Maturity processing notifications completed. Sent: ${emailsSent}, Failed: ${emailsFailed}`,
      emailsSent,
      emailsFailed
    })

  } catch (error: unknown) {
    console.error('❌ Maturity processing notification error:', error)
    
    res.status(500).json({ 
      error: 'Failed to process maturity notifications',
      ...(process.env.NODE_ENV === 'development' && { details: (error as Error)?.message || 'Unknown error' })
    })
  }
}