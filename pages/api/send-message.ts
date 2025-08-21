// pages/api/send-message.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import sgMail from '@sendgrid/mail'

interface MessageRequest {
  userEmail: string
  message: string
  timestamp: string
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
  console.log('📧 API /send-message called:', {
    method: req.method,
    hasBody: !!req.body,
    userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
    timestamp: new Date().toISOString()
  })

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method)
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📋 Request body received:', {
      hasEmail: !!req.body?.userEmail,
      hasMessage: !!req.body?.message,
      hasTimestamp: !!req.body?.timestamp,
      bodySize: JSON.stringify(req.body || {}).length
    })

    const { userEmail, message, timestamp }: MessageRequest = req.body

    // Validate required fields
    if (!userEmail || !message) {
      console.log('❌ Validation failed - missing fields:', {
        hasEmail: !!userEmail,
        hasMessage: !!message
      })
      return res.status(400).json({ error: 'Missing required fields: userEmail and message are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail)) {
      console.log('❌ Invalid email format:', userEmail.substring(0, 10) + '...')
      return res.status(400).json({ error: 'Invalid email format' })
    }

    console.log('✅ Validation passed for email:', userEmail.substring(0, 10) + '...')

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('❌ SendGrid API key not configured')
      
      // In development mode, just log the message instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 DEVELOPMENT MODE - Chat message received:')
        console.log(`From: ${userEmail}`)
        console.log(`Time: ${timestamp}`)
        console.log(`Message: ${message}`)
        console.log('---')
        return res.status(200).json({ success: true, message: 'Message logged (development mode)' })
      }
      
      return res.status(500).json({ error: 'Email service not configured' })
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.error('❌ SendGrid from email not configured')
      return res.status(500).json({ error: 'Email service not properly configured' })
    }

    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@investmentpro.com'
    const fromEmail = process.env.SENDGRID_FROM_EMAIL

    // Sanitize message content to prevent XSS
    const sanitizedMessage = message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')

    // Create email message
    const emailMessage = {
      to: adminEmail,
      from: {
        email: fromEmail,
        name: 'InvestmentPro Support'
      },
      replyTo: {
        email: userEmail,
        name: userEmail.split('@')[0]
      },
      subject: `💬 New Chat Message from ${userEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Chat Message</title>
        </head>
        <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
                💬 New Chat Message
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
                InvestmentPro Support System
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              
              <!-- User Info -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #2563eb;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                  <div style="width: 40px; height: 40px; background: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
                    <span style="color: white; font-weight: bold; font-size: 16px;">
                      ${userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p style="margin: 0; font-weight: 600; color: #1f2937; font-size: 16px;">
                      ${userEmail}
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      ${new Date(timestamp).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZoneName: 'short'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Message -->
              <div style="margin-bottom: 24px;">
                <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                  Message:
                </h3>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; line-height: 1.6; color: #374151;">
                  ${sanitizedMessage}
                </div>
              </div>

              <!-- Action Instructions -->
              <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <div style="display: flex; align-items: flex-start;">
                  <span style="margin-right: 8px; font-size: 18px;">💡</span>
                  <div>
                    <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                      How to Respond:
                    </h4>
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.4;">
                      Simply <strong>reply to this email</strong> and your response will be sent directly to the user. 
                      The user's email (${userEmail}) is set as the reply-to address.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
                  Quick Actions:
                </p>
                <div style="display: inline-flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                  <a href="mailto:${userEmail}?subject=Re: Your InvestmentPro Support Inquiry" 
                     style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                    📧 Reply to User
                  </a>
                  <a href="mailto:${adminEmail}?subject=Escalate: Chat from ${userEmail}" 
                     style="background: #059669; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                    🔄 Escalate Issue
                  </a>
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This message was sent via the InvestmentPro chat system.<br>
                Time sent: ${new Date(timestamp).toISOString()}
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
      text: `
New Chat Message from InvestmentPro

From: ${userEmail}
Time: ${new Date(timestamp).toLocaleString()}

Message:
${message}

---
Reply to this email to respond directly to the user.
      `
    }

    console.log('📧 Sending email via SendGrid...')
    console.log(`From: ${fromEmail}`)
    console.log(`To: ${adminEmail}`)
    console.log(`Reply-To: ${userEmail}`)

    // Send email via SendGrid
    await sgMail.send(emailMessage)

    console.log('✅ Email sent successfully via SendGrid')

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully to admin team' 
    })

  } catch (error: unknown) {
    console.error('❌ Error sending message:', error)
    console.error('❌ Error details:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      code: (error as any)?.code,
      response: (error as any)?.response?.status || 'N/A'
    })
    
    // Handle specific SendGrid errors
    if ((error as any).response?.body?.errors) {
      const sgErrors = (error as any).response.body.errors
      console.error('SendGrid errors:', sgErrors)
      
      // Check for common SendGrid issues
      if (sgErrors.some((e: unknown) => (e as any).message?.includes('does not contain a valid address'))) {
        return res.status(400).json({ error: 'Invalid email configuration. Please contact support.' })
      }
      
      if (sgErrors.some((e: unknown) => (e as any).message?.includes('The from address does not match a verified Sender Identity'))) {
        return res.status(500).json({ error: 'Email service configuration error. Please contact support.' })
      }
    }

    res.status(500).json({ 
      error: 'Failed to send message. Please try again or contact support directly.',
      ...(process.env.NODE_ENV === 'development' && { details: (error as Error)?.message || 'Unknown error' })
    })
  }
}