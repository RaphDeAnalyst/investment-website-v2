#!/usr/bin/env node

// scripts/trigger-maturity-emails.js
// This script is called after the database cron job completes to send email notifications

const { createClient } = require('@supabase/supabase-js')
const fetch = require('node-fetch')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const apiBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function triggerMaturityEmails() {
  try {
    console.log('🚀 Starting maturity email notification process...')
    console.log('📅 Timestamp:', new Date().toISOString())

    // Get recently matured investments (last 1 day)
    console.log('📊 Fetching recent matured investments from database...')
    
    const { data, error } = await supabase.rpc('get_recent_matured_investments', { days_back: 1 })
    
    if (error) {
      console.error('❌ Database error:', error)
      process.exit(1)
    }

    if (!data || !data[0] || !data[0].investment_data_json) {
      console.log('ℹ️ No recent matured investments found')
      return
    }

    // Parse the investment data
    const investmentDataString = data[0].investment_data_json
    if (!investmentDataString || investmentDataString === '') {
      console.log('ℹ️ No investment data to process')
      return
    }

    const investmentJsonStrings = investmentDataString.split('|||')
    const maturedInvestments = investmentJsonStrings
      .filter(jsonStr => jsonStr.trim() !== '')
      .map(jsonStr => {
        try {
          return JSON.parse(jsonStr)
        } catch (e) {
          console.error('❌ Error parsing investment JSON:', jsonStr, e)
          return null
        }
      })
      .filter(inv => inv !== null)

    console.log(`📧 Found ${maturedInvestments.length} matured investments to notify`)

    if (maturedInvestments.length === 0) {
      console.log('ℹ️ No valid investment data to process')
      return
    }

    // Prepare the API payload
    const payload = {
      maturedInvestments,
      summary: `Automated processing completed. ${maturedInvestments.length} investments matured on ${new Date().toLocaleDateString()}.`
    }

    console.log('📤 Sending email notification request to API...')
    
    // Call the Next.js API endpoint
    const response = await fetch(`${apiBaseUrl}/api/notifications/maturity-processing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Email notifications sent successfully!')
      console.log('📊 Results:', {
        emailsSent: result.emailsSent,
        emailsFailed: result.emailsFailed,
        message: result.message
      })
    } else {
      console.error('❌ Email notification API error:', result.error)
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Fatal error in maturity email process:', error)
    process.exit(1)
  }
}

// Run the script
triggerMaturityEmails()
  .then(() => {
    console.log('🎉 Maturity email notification process completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Maturity email notification process failed:', error)
    process.exit(1)
  })