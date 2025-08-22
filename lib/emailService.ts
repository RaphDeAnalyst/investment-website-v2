// lib/emailService.ts
import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailConfig {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export interface UserData {
  id: string
  email: string
  full_name?: string
}

export interface InvestmentRequestData {
  id: string
  plan_name: string
  amount_usd: number
  expected_return: number
  duration_days: number
  interest_rate: number
  payment_method: string
  transaction_hash?: string
  maturity_date: string
  created_at: string
}

export interface WithdrawalRequestData {
  id: string
  amount: number
  payment_method: string
  wallet_address: string
  created_at: string
}

export class EmailService {
  private static fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@everestglobal.com'
  private static adminEmail = process.env.ADMIN_EMAIL || 'admin@everestglobal.com'

  private static async sendEmail(config: EmailConfig): Promise<boolean> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log('📧 DEVELOPMENT MODE - Email would be sent:')
        console.log(`To: ${config.to}`)
        console.log(`Subject: ${config.subject}`)
        console.log('---')
        return true
      }

      const message = {
        to: config.to,
        from: {
          email: this.fromEmail,
          name: 'Everest Global Holdings'
        },
        subject: config.subject,
        html: config.html,
        text: config.text,
        ...(config.replyTo && { replyTo: config.replyTo })
      }

      await sgMail.send(message)
      console.log(`✅ Email sent successfully to ${config.to}`)
      return true
    } catch (error) {
      console.error('❌ Email sending failed:', error)
      return false
    }
  }

  // Investment Request Emails
  static async sendInvestmentRequestConfirmation(user: UserData, request: InvestmentRequestData): Promise<boolean> {
    const config: EmailConfig = {
      to: user.email,
      subject: `Investment Request Received - ${request.plan_name}`,
      html: this.generateInvestmentConfirmationHTML(user, request),
      text: this.generateInvestmentConfirmationText(user, request)
    }
    return this.sendEmail(config)
  }

  static async sendInvestmentAdminNotification(user: UserData, request: InvestmentRequestData): Promise<boolean> {
    const config: EmailConfig = {
      to: this.adminEmail,
      subject: `🔔 New Investment Request - $${request.amount_usd.toLocaleString()} from ${user.email}`,
      html: this.generateInvestmentAdminHTML(user, request),
      text: this.generateInvestmentAdminText(user, request),
      replyTo: user.email
    }
    return this.sendEmail(config)
  }

  static async sendInvestmentApproval(user: UserData, request: InvestmentRequestData): Promise<boolean> {
    const config: EmailConfig = {
      to: user.email,
      subject: `✅ Investment Approved - ${request.plan_name}`,
      html: this.generateInvestmentApprovalHTML(user, request),
      text: this.generateInvestmentApprovalText(user, request)
    }
    return this.sendEmail(config)
  }

  static async sendInvestmentRejection(user: UserData, request: InvestmentRequestData, reason?: string): Promise<boolean> {
    const config: EmailConfig = {
      to: user.email,
      subject: `❌ Investment Request Update - ${request.plan_name}`,
      html: this.generateInvestmentRejectionHTML(user, request, reason),
      text: this.generateInvestmentRejectionText(user, request, reason)
    }
    return this.sendEmail(config)
  }

  // Withdrawal Request Emails
  static async sendWithdrawalRequestConfirmation(user: UserData, request: WithdrawalRequestData): Promise<boolean> {
    const config: EmailConfig = {
      to: user.email,
      subject: `Withdrawal Request Received - $${request.amount.toLocaleString()}`,
      html: this.generateWithdrawalConfirmationHTML(user, request),
      text: this.generateWithdrawalConfirmationText(user, request)
    }
    return this.sendEmail(config)
  }

  static async sendWithdrawalAdminNotification(user: UserData, request: WithdrawalRequestData): Promise<boolean> {
    const config: EmailConfig = {
      to: this.adminEmail,
      subject: `💳 New Withdrawal Request - $${request.amount.toLocaleString()} from ${user.email}`,
      html: this.generateWithdrawalAdminHTML(user, request),
      text: this.generateWithdrawalAdminText(user, request),
      replyTo: user.email
    }
    return this.sendEmail(config)
  }

  static async sendWithdrawalApproval(user: UserData, request: WithdrawalRequestData, transactionHash?: string): Promise<boolean> {
    const config: EmailConfig = {
      to: user.email,
      subject: `✅ Withdrawal Approved - $${request.amount.toLocaleString()}`,
      html: this.generateWithdrawalApprovalHTML(user, request, transactionHash),
      text: this.generateWithdrawalApprovalText(user, request, transactionHash)
    }
    return this.sendEmail(config)
  }

  static async sendWithdrawalRejection(user: UserData, request: WithdrawalRequestData, reason?: string): Promise<boolean> {
    const config: EmailConfig = {
      to: user.email,
      subject: `❌ Withdrawal Request Update - $${request.amount.toLocaleString()}`,
      html: this.generateWithdrawalRejectionHTML(user, request, reason),
      text: this.generateWithdrawalRejectionText(user, request, reason)
    }
    return this.sendEmail(config)
  }

  // HTML Template Generators
  private static generateInvestmentConfirmationHTML(user: UserData, request: InvestmentRequestData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Investment Request Received</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #111827, #374151); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              🎯 Investment Request Received
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
              Everest Global Holdings
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Dear ${user.full_name || user.email},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for your investment request. We have received your application and it is currently awaiting verification by our admin team.
            </p>

            <!-- Investment Details -->
            <div style="background: #EDE8D0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                Investment Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Plan:</span>
                  <span style="color: #111827; font-weight: 600;">${request.plan_name}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Amount:</span>
                  <span style="color: #111827; font-weight: 600;">$${request.amount_usd.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Expected Return:</span>
                  <span style="color: #111827; font-weight: 600;">$${request.expected_return.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Duration:</span>
                  <span style="color: #111827; font-weight: 600;">${request.duration_days} days</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Interest Rate:</span>
                  <span style="color: #111827; font-weight: 600;">${request.interest_rate}% daily</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Payment Method:</span>
                  <span style="color: #111827; font-weight: 600;">${request.payment_method.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #0369a1; font-size: 14px;">
                <strong>Next Steps:</strong> Our admin team will review your request within 24-48 hours. You will receive an email notification once your investment has been approved and activated.
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              Best regards,<br>
              <strong>Everest Global Holdings Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #EDE8D0; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This is an automated message from Everest Global Holdings.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateInvestmentConfirmationText(user: UserData, request: InvestmentRequestData): string {
    return `
Investment Request Received - Everest Global Holdings

Dear ${user.full_name || user.email},

Thank you for your investment request. We have received your application and it is currently awaiting verification by our admin team.

Investment Details:
- Plan: ${request.plan_name}
- Amount: $${request.amount_usd.toLocaleString()}
- Expected Return: $${request.expected_return.toLocaleString()}
- Duration: ${request.duration_days} days
- Interest Rate: ${request.interest_rate}% daily
- Payment Method: ${request.payment_method.toUpperCase()}

Next Steps: Our admin team will review your request within 24-48 hours. You will receive an email notification once your investment has been approved and activated.

If you have any questions, please don't hesitate to contact our support team.

Best regards,
Everest Global Holdings Team

---
This is an automated message from Everest Global Holdings.
    `
  }

  private static generateInvestmentAdminHTML(user: UserData, request: InvestmentRequestData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Investment Request</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              🔔 New Investment Request
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
              Admin Notification - Action Required
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <!-- User Info -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
              <h3 style="color: #111827; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                User Information
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">User ID:</span>
                  <span style="color: #111827; font-weight: 600;">${user.id}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Email:</span>
                  <span style="color: #111827; font-weight: 600;">${user.email}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Name:</span>
                  <span style="color: #111827; font-weight: 600;">${user.full_name || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <!-- Investment Details -->
            <div style="background: #EDE8D0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                Investment Request Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Request ID:</span>
                  <span style="color: #111827; font-weight: 600;">${request.id}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Plan:</span>
                  <span style="color: #111827; font-weight: 600;">${request.plan_name}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Amount:</span>
                  <span style="color: #111827; font-weight: 600; font-size: 18px;">$${request.amount_usd.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Expected Return:</span>
                  <span style="color: #111827; font-weight: 600;">$${request.expected_return.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Duration:</span>
                  <span style="color: #111827; font-weight: 600;">${request.duration_days} days</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Interest Rate:</span>
                  <span style="color: #111827; font-weight: 600;">${request.interest_rate}% daily</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Payment Method:</span>
                  <span style="color: #111827; font-weight: 600;">${request.payment_method.toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Maturity Date:</span>
                  <span style="color: #111827; font-weight: 600;">${new Date(request.maturity_date).toLocaleDateString()}</span>
                </div>
                ${request.transaction_hash ? `
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Transaction Hash:</span>
                  <span style="color: #111827; font-weight: 600; font-family: monospace; font-size: 12px;">${request.transaction_hash}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Action Required -->
            <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                Action Required:
              </h4>
              <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.4;">
                Please log into the admin panel to review and approve/reject this investment request. The user is waiting for confirmation.
              </p>
            </div>

            <!-- Quick Actions -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
                Quick Actions:
              </p>
              <div style="display: inline-flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                <a href="mailto:${user.email}?subject=Re: Your Investment Request - ${request.plan_name}" 
                   style="background: #111827; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                  📧 Contact User
                </a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              Investment request submitted: ${new Date(request.created_at).toLocaleString()}<br>
              Admin Panel - Everest Global Holdings
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateInvestmentAdminText(user: UserData, request: InvestmentRequestData): string {
    return `
New Investment Request - Admin Notification

User Information:
- User ID: ${user.id}
- Email: ${user.email}
- Name: ${user.full_name || 'Not provided'}

Investment Request Details:
- Request ID: ${request.id}
- Plan: ${request.plan_name}
- Amount: $${request.amount_usd.toLocaleString()}
- Expected Return: $${request.expected_return.toLocaleString()}
- Duration: ${request.duration_days} days
- Interest Rate: ${request.interest_rate}% daily
- Payment Method: ${request.payment_method.toUpperCase()}
- Maturity Date: ${new Date(request.maturity_date).toLocaleDateString()}
${request.transaction_hash ? `- Transaction Hash: ${request.transaction_hash}` : ''}

Action Required: Please log into the admin panel to review and approve/reject this investment request.

Investment request submitted: ${new Date(request.created_at).toLocaleString()}

---
Reply to this email to contact the user directly.
    `
  }

  private static generateInvestmentApprovalHTML(user: UserData, request: InvestmentRequestData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Investment Approved</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              ✅ Investment Approved!
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
              Your ${request.plan_name} is now active
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Dear ${user.full_name || user.email},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Great news! Your investment request has been approved and is now active. You will start earning daily returns according to your selected plan.
            </p>

            <!-- Investment Details -->
            <div style="background: #EDE8D0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                Active Investment Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Plan:</span>
                  <span style="color: #111827; font-weight: 600;">${request.plan_name}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Investment Amount:</span>
                  <span style="color: #111827; font-weight: 600;">$${request.amount_usd.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Expected Total Return:</span>
                  <span style="color: #059669; font-weight: 600; font-size: 18px;">$${request.expected_return.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Daily Interest Rate:</span>
                  <span style="color: #111827; font-weight: 600;">${request.interest_rate}%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Investment Period:</span>
                  <span style="color: #111827; font-weight: 600;">${request.duration_days} days</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Maturity Date:</span>
                  <span style="color: #111827; font-weight: 600;">${new Date(request.maturity_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                <strong>What happens next:</strong> Your daily returns will be automatically credited to your account balance. You can track your investment performance and withdraw profits through your dashboard.
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for choosing Everest Global Holdings for your investment needs. We're committed to helping you achieve your financial goals.
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              Best regards,<br>
              <strong>Everest Global Holdings Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #EDE8D0; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This is an automated message from Everest Global Holdings.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateInvestmentApprovalText(user: UserData, request: InvestmentRequestData): string {
    return `
Investment Approved! - Everest Global Holdings

Dear ${user.full_name || user.email},

Great news! Your investment request has been approved and is now active. You will start earning daily returns according to your selected plan.

Active Investment Details:
- Plan: ${request.plan_name}
- Investment Amount: $${request.amount_usd.toLocaleString()}
- Expected Total Return: $${request.expected_return.toLocaleString()}
- Daily Interest Rate: ${request.interest_rate}%
- Investment Period: ${request.duration_days} days
- Maturity Date: ${new Date(request.maturity_date).toLocaleDateString()}

What happens next: Your daily returns will be automatically credited to your account balance. You can track your investment performance and withdraw profits through your dashboard.

Thank you for choosing Everest Global Holdings for your investment needs. We're committed to helping you achieve your financial goals.

Best regards,
Everest Global Holdings Team

---
This is an automated message from Everest Global Holdings.
    `
  }

  private static generateInvestmentRejectionHTML(user: UserData, request: InvestmentRequestData, reason?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Investment Request Update</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              Investment Request Update
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
              Everest Global Holdings
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Dear ${user.full_name || user.email},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for your interest in our ${request.plan_name}. After careful review, we are unable to approve your investment request at this time.
            </p>

            <!-- Investment Details -->
            <div style="background: #EDE8D0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                Request Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Plan:</span>
                  <span style="color: #111827; font-weight: 600;">${request.plan_name}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Amount:</span>
                  <span style="color: #111827; font-weight: 600;">$${request.amount_usd.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Submitted:</span>
                  <span style="color: #111827; font-weight: 600;">${new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            ${reason ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 8px 0; color: #dc2626; font-size: 14px; font-weight: 600;">
                Reason:
              </h4>
              <p style="margin: 0; color: #dc2626; font-size: 14px; line-height: 1.4;">
                ${reason}
              </p>
            </div>
            ` : ''}

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #0369a1; font-size: 14px;">
                <strong>Next Steps:</strong> You are welcome to submit a new investment request or contact our support team for assistance. We remain committed to helping you find the right investment opportunity.
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              If you have any questions about this decision or would like to discuss alternative investment options, please don't hesitate to contact our support team.
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              Best regards,<br>
              <strong>Everest Global Holdings Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #EDE8D0; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This is an automated message from Everest Global Holdings.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateInvestmentRejectionText(user: UserData, request: InvestmentRequestData, reason?: string): string {
    return `
Investment Request Update - Everest Global Holdings

Dear ${user.full_name || user.email},

Thank you for your interest in our ${request.plan_name}. After careful review, we are unable to approve your investment request at this time.

Request Details:
- Plan: ${request.plan_name}
- Amount: $${request.amount_usd.toLocaleString()}
- Submitted: ${new Date(request.created_at).toLocaleDateString()}

${reason ? `Reason: ${reason}` : ''}

Next Steps: You are welcome to submit a new investment request or contact our support team for assistance. We remain committed to helping you find the right investment opportunity.

If you have any questions about this decision or would like to discuss alternative investment options, please don't hesitate to contact our support team.

Best regards,
Everest Global Holdings Team

---
This is an automated message from Everest Global Holdings.
    `
  }

  // Withdrawal Templates (similar structure, different content)
  private static generateWithdrawalConfirmationHTML(user: UserData, request: WithdrawalRequestData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdrawal Request Received</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #111827, #374151); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              💳 Withdrawal Request Received
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
              Everest Global Holdings
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Dear ${user.full_name || user.email},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              We have received your withdrawal request. Our admin team will review and process your request within 24-48 hours.
            </p>

            <!-- Withdrawal Details -->
            <div style="background: #EDE8D0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                Withdrawal Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Amount:</span>
                  <span style="color: #111827; font-weight: 600; font-size: 18px;">$${request.amount.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Payment Method:</span>
                  <span style="color: #111827; font-weight: 600;">${request.payment_method.toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Wallet Address:</span>
                  <span style="color: #111827; font-weight: 600; font-family: monospace; font-size: 12px;">${request.wallet_address}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Request Date:</span>
                  <span style="color: #111827; font-weight: 600;">${new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #0369a1; font-size: 14px;">
                <strong>Processing Time:</strong> Withdrawal requests are typically processed within 24-48 hours. You will receive an email notification once your withdrawal has been processed and the funds have been sent.
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              If you have any questions about your withdrawal, please contact our support team.
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              Best regards,<br>
              <strong>Everest Global Holdings Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #EDE8D0; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This is an automated message from Everest Global Holdings.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateWithdrawalConfirmationText(user: UserData, request: WithdrawalRequestData): string {
    return `
Withdrawal Request Received - Everest Global Holdings

Dear ${user.full_name || user.email},

We have received your withdrawal request. Our admin team will review and process your request within 24-48 hours.

Withdrawal Details:
- Amount: $${request.amount.toLocaleString()}
- Payment Method: ${request.payment_method.toUpperCase()}
- Wallet Address: ${request.wallet_address}
- Request Date: ${new Date(request.created_at).toLocaleDateString()}

Processing Time: Withdrawal requests are typically processed within 24-48 hours. You will receive an email notification once your withdrawal has been processed and the funds have been sent.

If you have any questions about your withdrawal, please contact our support team.

Best regards,
Everest Global Holdings Team

---
This is an automated message from Everest Global Holdings.
    `
  }

  private static generateWithdrawalAdminHTML(user: UserData, request: WithdrawalRequestData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Withdrawal Request</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed, #8b5cf6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              💳 New Withdrawal Request
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
              Admin Notification - Action Required
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <!-- User Info -->
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #7c3aed;">
              <h3 style="color: #111827; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">
                User Information
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">User ID:</span>
                  <span style="color: #111827; font-weight: 600;">${user.id}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Email:</span>
                  <span style="color: #111827; font-weight: 600;">${user.email}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Name:</span>
                  <span style="color: #111827; font-weight: 600;">${user.full_name || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <!-- Withdrawal Details -->
            <div style="background: #EDE8D0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                Withdrawal Request Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Request ID:</span>
                  <span style="color: #111827; font-weight: 600;">${request.id}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Amount:</span>
                  <span style="color: #111827; font-weight: 600; font-size: 18px;">$${request.amount.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Payment Method:</span>
                  <span style="color: #111827; font-weight: 600;">${request.payment_method.toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="color: #6b7280; font-weight: 500;">Wallet Address:</span>
                  <span style="color: #111827; font-weight: 600; font-family: monospace; font-size: 12px; word-break: break-all; text-align: right; max-width: 200px;">${request.wallet_address}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Request Date:</span>
                  <span style="color: #111827; font-weight: 600;">${new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                Action Required:
              </h4>
              <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.4;">
                Please log into the admin panel to review and approve/reject this withdrawal request. Verify the user's available balance and wallet address before processing.
              </p>
            </div>

            <!-- Quick Actions -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
                Quick Actions:
              </p>
              <div style="display: inline-flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                <a href="mailto:${user.email}?subject=Re: Your Withdrawal Request - $${request.amount.toLocaleString()}" 
                   style="background: #111827; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                  📧 Contact User
                </a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              Withdrawal request submitted: ${new Date(request.created_at).toLocaleString()}<br>
              Admin Panel - Everest Global Holdings
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateWithdrawalAdminText(user: UserData, request: WithdrawalRequestData): string {
    return `
New Withdrawal Request - Admin Notification

User Information:
- User ID: ${user.id}
- Email: ${user.email}
- Name: ${user.full_name || 'Not provided'}

Withdrawal Request Details:
- Request ID: ${request.id}
- Amount: $${request.amount.toLocaleString()}
- Payment Method: ${request.payment_method.toUpperCase()}
- Wallet Address: ${request.wallet_address}
- Request Date: ${new Date(request.created_at).toLocaleDateString()}

Action Required: Please log into the admin panel to review and approve/reject this withdrawal request. Verify the user's available balance and wallet address before processing.

Withdrawal request submitted: ${new Date(request.created_at).toLocaleString()}

---
Reply to this email to contact the user directly.
    `
  }

  private static generateWithdrawalApprovalHTML(user: UserData, request: WithdrawalRequestData, transactionHash?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdrawal Approved</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              ✅ Withdrawal Approved!
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
              Your funds have been sent
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Dear ${user.full_name || user.email},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Great news! Your withdrawal request has been approved and processed. The funds have been sent to your specified wallet address.
            </p>

            <!-- Withdrawal Details -->
            <div style="background: #EDE8D0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                Withdrawal Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Amount Sent:</span>
                  <span style="color: #059669; font-weight: 600; font-size: 18px;">$${request.amount.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Payment Method:</span>
                  <span style="color: #111827; font-weight: 600;">${request.payment_method.toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="color: #6b7280; font-weight: 500;">Wallet Address:</span>
                  <span style="color: #111827; font-weight: 600; font-family: monospace; font-size: 12px; word-break: break-all; text-align: right; max-width: 300px;">${request.wallet_address}</span>
                </div>
                ${transactionHash ? `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <span style="color: #6b7280; font-weight: 500;">Transaction Hash:</span>
                  <span style="color: #111827; font-weight: 600; font-family: monospace; font-size: 12px; word-break: break-all; text-align: right; max-width: 300px;">${transactionHash}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Processed Date:</span>
                  <span style="color: #111827; font-weight: 600;">${new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                <strong>Processing Complete:</strong> Your withdrawal has been successfully processed. Depending on the blockchain network, it may take a few minutes to several hours for the transaction to be confirmed and appear in your wallet.
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for using Everest Global Holdings. We appreciate your business and look forward to serving you again.
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              Best regards,<br>
              <strong>Everest Global Holdings Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #EDE8D0; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This is an automated message from Everest Global Holdings.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateWithdrawalApprovalText(user: UserData, request: WithdrawalRequestData, transactionHash?: string): string {
    return `
Withdrawal Approved! - Everest Global Holdings

Dear ${user.full_name || user.email},

Great news! Your withdrawal request has been approved and processed. The funds have been sent to your specified wallet address.

Withdrawal Details:
- Amount Sent: $${request.amount.toLocaleString()}
- Payment Method: ${request.payment_method.toUpperCase()}
- Wallet Address: ${request.wallet_address}
${transactionHash ? `- Transaction Hash: ${transactionHash}` : ''}
- Processed Date: ${new Date().toLocaleDateString()}

Processing Complete: Your withdrawal has been successfully processed. Depending on the blockchain network, it may take a few minutes to several hours for the transaction to be confirmed and appear in your wallet.

Thank you for using Everest Global Holdings. We appreciate your business and look forward to serving you again.

Best regards,
Everest Global Holdings Team

---
This is an automated message from Everest Global Holdings.
    `
  }

  private static generateWithdrawalRejectionHTML(user: UserData, request: WithdrawalRequestData, reason?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdrawal Request Update</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
              Withdrawal Request Update
            </h1>
            <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px;">
              Everest Global Holdings
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Dear ${user.full_name || user.email},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              We have reviewed your withdrawal request and are unable to process it at this time.
            </p>

            <!-- Withdrawal Details -->
            <div style="background: #EDE8D0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                Request Details
              </h3>
              <div style="display: grid; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Amount:</span>
                  <span style="color: #111827; font-weight: 600;">$${request.amount.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Payment Method:</span>
                  <span style="color: #111827; font-weight: 600;">${request.payment_method.toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280; font-weight: 500;">Submitted:</span>
                  <span style="color: #111827; font-weight: 600;">${new Date(request.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            ${reason ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h4 style="margin: 0 0 8px 0; color: #dc2626; font-size: 14px; font-weight: 600;">
                Reason:
              </h4>
              <p style="margin: 0; color: #dc2626; font-size: 14px; line-height: 1.4;">
                ${reason}
              </p>
            </div>
            ` : ''}

            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0; color: #0369a1; font-size: 14px;">
                <strong>Next Steps:</strong> You can submit a new withdrawal request once any issues have been resolved. Your funds remain safe in your account. Contact our support team if you need assistance.
              </p>
            </div>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              If you have any questions about this decision or need assistance with your withdrawal, please contact our support team.
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              Best regards,<br>
              <strong>Everest Global Holdings Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #EDE8D0; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This is an automated message from Everest Global Holdings.<br>
              Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private static generateWithdrawalRejectionText(user: UserData, request: WithdrawalRequestData, reason?: string): string {
    return `
Withdrawal Request Update - Everest Global Holdings

Dear ${user.full_name || user.email},

We have reviewed your withdrawal request and are unable to process it at this time.

Request Details:
- Amount: $${request.amount.toLocaleString()}
- Payment Method: ${request.payment_method.toUpperCase()}
- Submitted: ${new Date(request.created_at).toLocaleDateString()}

${reason ? `Reason: ${reason}` : ''}

Next Steps: You can submit a new withdrawal request once any issues have been resolved. Your funds remain safe in your account. Contact our support team if you need assistance.

If you have any questions about this decision or need assistance with your withdrawal, please contact our support team.

Best regards,
Everest Global Holdings Team

---
This is an automated message from Everest Global Holdings.
    `
  }
}