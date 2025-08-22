# Investment Maturity Processing System Setup Guide

This guide explains how to set up and test the complete investment maturity processing system that includes automated database processing, email notifications, and admin monitoring.

## 🎯 What This System Does

Your current cron job:
```sql
SELECT process_matured_investments();
```

Now does the following automatically:

1. **Daily Processing** (Midnight): Finds investments that have reached their maturity date
2. **Balance Updates**: Adds principal + returns to user's available balance
3. **Status Changes**: Marks investments as 'completed'
4. **Transaction Records**: Creates audit trail entries
5. **Email Notifications**: Sends maturity notifications to users and admin summary
6. **Admin Monitoring**: Provides dashboard view of the entire process

## 📋 Setup Steps

### 1. Install Database Functions
Run these SQL files in your Supabase SQL Editor in order:

```sql
-- First: Run this to create all the core functions
-- File: investment-maturity-system.sql
```

```sql 
-- Second: Run this to add email notification support
-- File: enhanced-maturity-processing.sql
```

### 2. Install Node.js Dependencies
Add these to your package.json if not already present:

```bash
npm install @supabase/supabase-js node-fetch dotenv
```

### 3. Set Environment Variables
Ensure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=your_from_email
ADMIN_EMAIL=your_admin_email
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

### 4. Test the System

#### A. Test Database Functions
```sql
-- Test basic maturity processing
SELECT * FROM process_matured_investments();

-- Test getting investments maturing soon
SELECT * FROM get_investments_maturing_soon(7);

-- Test getting recent matured investments
SELECT * FROM get_recent_matured_investments(1);
```

#### B. Test Manual Processing
1. Go to your admin dashboard
2. Click the "Maturity Monitoring" tab
3. Click "Manual Process Maturity" button
4. Check for success message and updated data

#### C. Test Email Notifications
```bash
# Run the email trigger script manually
cd scripts
node trigger-maturity-emails.js
```

## 🔧 System Components

### Database Functions Created
- `process_matured_investments()` - Main processing function (used by your cron)
- `calculate_investment_returns(investment_id)` - Calculate total returns
- `update_user_balance_on_maturity(user_id, amount)` - Update balances
- `create_maturity_transaction(user_id, investment_id, amount, name)` - Create transactions
- `get_investments_maturing_soon(days)` - Get upcoming maturities
- `process_specific_investment(investment_id)` - Manual processing tool

### API Endpoints Added
- `/api/notifications/maturity-processing` - Handle email notifications

### Email Templates Added
- Investment maturity notification (user email)
- Daily processing summary (admin email)

### Admin Dashboard Features Added
- "Maturity Monitoring" tab
- Manual processing button
- Upcoming maturities view (next 7 days)
- Recent maturities view (last 30 days)
- Processing status and counts

### Scripts Created
- `scripts/trigger-maturity-emails.js` - Node.js script for email notifications

## 🚀 Enhanced Cron Job Setup (Optional)

To add email notifications to your existing cron job, you can either:

### Option 1: Keep Current Setup
Your current cron job will continue to work and process maturities. Emails won't be sent automatically, but admins can view results in the dashboard and trigger emails manually.

### Option 2: Add Email Notifications
Modify your cron job to include email notifications:

```sql
-- Your current cron job
| jobid | schedule  | command                               |
| ----- | --------- | ------------------------------------- |
| 2     | 0 0 * * * | SELECT process_matured_investments(); |

-- Add a second cron job for emails (runs 5 minutes after processing)
| jobid | schedule    | command                                    |
| ----- | ----------- | ------------------------------------------ |
| 3     | 5 0 * * *   | cd /path/to/your/app && node scripts/trigger-maturity-emails.js |
```

### Option 3: Combined Processing (Advanced)
For advanced setups, you could create a webhook-triggered process, but the current setup is sufficient for most needs.

## 📊 Monitoring and Alerts

### Admin Dashboard
- View investments maturing in the next 7 days
- See recently processed maturities (last 30 days)
- Manual processing capability
- Real-time status updates

### Email Reports
- Daily admin summary with processing statistics
- Individual user notifications for matured investments
- Error reporting and processing logs

### Database Logging
All processing is logged with:
- NOTICE messages for successful operations
- WARNING messages for errors
- Detailed transaction records

## 🔍 Troubleshooting

### Common Issues

1. **Cron job fails**: Check database function permissions
   ```sql
   GRANT EXECUTE ON FUNCTION process_matured_investments() TO postgres;
   ```

2. **Emails not sending**: Check environment variables and SendGrid configuration
   ```bash
   node scripts/trigger-maturity-emails.js  # Test manually
   ```

3. **Balance updates fail**: Check user_balances table and triggers
   ```sql
   SELECT * FROM user_balances WHERE user_id = 'user_id_here';
   ```

4. **Admin dashboard errors**: Check database function permissions
   ```sql
   GRANT EXECUTE ON FUNCTION get_investments_maturing_soon(integer) TO authenticated;
   ```

### Debug Queries
```sql
-- Check for investments that should mature today
SELECT * FROM investments 
WHERE status = 'active' 
AND maturity_date <= CURRENT_DATE;

-- Check recent transactions
SELECT * FROM transactions 
WHERE transaction_type = 'return' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check user balances
SELECT ub.*, p.email 
FROM user_balances ub
JOIN profiles p ON ub.user_id = p.id
ORDER BY ub.updated_at DESC 
LIMIT 10;
```

## ✅ Testing Checklist

- [ ] Database functions installed and working
- [ ] Cron job processes matured investments
- [ ] User balances update correctly
- [ ] Transaction records created
- [ ] Investment status changes to 'completed'
- [ ] Email notifications send to users
- [ ] Admin summary emails send
- [ ] Admin dashboard shows maturity data
- [ ] Manual processing works
- [ ] Error handling works correctly

## 🎉 Summary

Your investment maturity processing system is now complete with:

1. **Automated Daily Processing**: Your existing cron job now has full functionality
2. **Email Notifications**: Professional branded emails to users and admin
3. **Admin Monitoring**: Complete visibility into the maturity process
4. **Manual Override**: Ability to process maturities manually if needed
5. **Audit Trail**: Complete logging and transaction history
6. **Error Handling**: Robust error management that won't break your system

The system will now automatically handle the complete investment lifecycle from approval to maturity with minimal manual intervention required.

## 🔄 Next Steps

1. Run the database setup scripts
2. Test the system with a few investments
3. Monitor the admin dashboard
4. Set up any additional cron jobs for email notifications if desired
5. Consider adding more automated features like:
   - Weekly investment performance reports
   - Monthly user statements
   - Automated reinvestment suggestions