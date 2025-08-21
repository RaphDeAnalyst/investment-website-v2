// pages/api/send-reset-confirmation.ts
import { NextApiRequest, NextApiResponse } from 'next'

interface ResetConfirmationRequest {
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
    const { email }: ResetConfirmationRequest = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // In a real application, you would:
    // 1. Use a proper email service (SendGrid, AWS SES, Nodemailer, etc.)
    // 2. Use email templates
    // 3. Handle email delivery failures
    // 4. Log the email sending attempts
    
    // For demonstration purposes, we'll simulate sending an email
    console.log('📧 Sending password reset confirmation email to:', email)
    
    // Simulate email content
    const emailContent = {
      to: email,
      subject: 'Password Reset Request Confirmation - Investment Platform',
      html: generateConfirmationEmailHTML(email),
      text: generateConfirmationEmailText(email)
    }

    // Here you would actually send the email using your preferred email service
    // Example with a hypothetical email service:
    /*
    const emailService = new EmailService(process.env.EMAIL_API_KEY)
    await emailService.send({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })
    */

    console.log('✅ Password reset confirmation email sent successfully')

    return res.status(200).json({ 
      message: 'Reset confirmation email sent successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error sending reset confirmation email:', error)
    return res.status(500).json({ 
      message: 'Failed to send confirmation email' 
    })
  }
}

function generateConfirmationEmailHTML(email: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; }
        .alert-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #64748b; }
        .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request Confirmation</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p>We wanted to let you know that a password reset request has been made for your Investment Platform account associated with this email address: <strong>${email}</strong></p>
          
          <div class="alert-box">
            <strong>⚠️ Important Security Notice:</strong><br>
            If you did not request this password reset, please ignore this email and consider changing your password immediately for security purposes.
          </div>
          
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>You should receive a separate email with a password reset link shortly</li>
            <li>This reset link will be valid for 24 hours</li>
            <li>The link can only be used once for security reasons</li>
          </ul>
          
          <p><strong>If you didn't receive the reset email:</strong></p>
          <ul>
            <li>Check your spam/junk folder</li>
            <li>Make sure the email address is correct</li>
            <li>Try requesting a new reset link</li>
          </ul>
          
          <p>If you continue to experience issues, please contact our support team.</p>
          
          <p>Best regards,<br>
          The Investment Platform Security Team</p>
        </div>
        <div class="footer">
          <p>This is an automated security notification. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} Investment Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateConfirmationEmailText(email: string): string {
  return `
Password Reset Request Confirmation - Investment Platform

Hello,

We wanted to let you know that a password reset request has been made for your Investment Platform account associated with this email address: ${email}

⚠️ IMPORTANT SECURITY NOTICE:
If you did not request this password reset, please ignore this email and consider changing your password immediately for security purposes.

What happens next:
- You should receive a separate email with a password reset link shortly
- This reset link will be valid for 24 hours
- The link can only be used once for security reasons

If you didn't receive the reset email:
- Check your spam/junk folder
- Make sure the email address is correct
- Try requesting a new reset link

If you continue to experience issues, please contact our support team.

Best regards,
The Investment Platform Security Team

---
This is an automated security notification. Please do not reply to this email.
© ${new Date().getFullYear()} Investment Platform. All rights reserved.
  `
}