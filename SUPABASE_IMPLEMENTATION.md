# Supabase Implementation Guide

Complete step-by-step guide to implement Supabase for The Backroom property management platform.

## Prerequisites

- Supabase account (free tier works)
- Your Supabase project URL: `https://dcdejvshrdczjldtgnma.supabase.co`
- Environment variables already configured in `.env.local`

---

## Step 1: Run the Database Schema

1. **Open Supabase Dashboard**
   - Go to https://dcdejvshrdczjldtgnma.supabase.co
   - Login to your account

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run Schema**
   - Open `supabase/schema.sql` from your project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see 10 tables:
     - landlords
     - properties
     - tenants
     - leases
     - ledger
     - maintenance_tickets
     - documents
     - transactions
     - messages
     - checklists

---

## Step 2: Create Your Landlord Account

Your User ID: `2fd4406b-dd11-42a1-9fa5-5316352a3595`

1. **Verify Auth User Exists**
   - Go to "Authentication" → "Users" in Supabase dashboard
   - You should see a user with ID: `2fd4406b-dd11-42a1-9fa5-5316352a3595`
   - If not, create a new user with your email/password

2. **Create Landlord Record**
   - Go to "SQL Editor"
   - Run this query (update with your details):

```sql
INSERT INTO landlords (user_id, first_name, last_name, email, phone, company_name)
VALUES (
  '2fd4406b-dd11-42a1-9fa5-5316352a3595',
  'Raees',
  'Johaadien',
  'raeesjohaadien1423@gmail.com',
  '+27 60 478 4145',
  'The Backroom'
);
```

3. **Verify Landlord Created**
   - Go to "Table Editor" → "landlords"
   - You should see your record with the matching user_id

---

## Step 3: Configure Storage Buckets

The schema already created 4 storage buckets, but verify they exist:

1. **Check Storage**
   - Go to "Storage" in the left sidebar
   - You should see:
     - `property-images` (public)
     - `documents` (private)
     - `receipts` (private)
     - `maintenance-images` (public)

2. **If Buckets Don't Exist**
   - The schema creates them automatically
   - If you see errors, manually create them:
     - Click "New bucket"
     - Enter bucket name
     - Set public/private as noted above

---

## Step 4: Configure Authentication

1. **Enable Email Auth**
   - Go to "Authentication" → "Providers"
   - Ensure "Email" is enabled
   - Configure email templates if needed

2. **Enable Magic Links (for Tenant Portal)**
   - Go to "Authentication" → "Email Templates"
   - Find "Magic Link" template
   - You can customize the email text if you want
   - The redirect URL will be configured in the next step

3. **Configure Site URL (IMPORTANT)**
   - Go to "Authentication" → "URL Configuration"
   - Set **Site URL**: `http://localhost:3000`
   - Under **Redirect URLs**, add these two URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/portal`
   - Click "Save"
   
   **Note:** When you deploy to production later, you'll change these to your real domain (like `https://yourapp.vercel.app`)

---

## Step 5: Test Database Connection

1. **Run Test Script**
   ```bash
   node scripts/test-supabase.js
   ```

2. **Expected Output**
   - Should show "Connected to Supabase successfully"
   - Should display your landlord record

3. **If Connection Fails**
   - Verify `.env.local` has correct credentials
   - Check Supabase project is not paused
   - Verify RLS policies are enabled

---

## Step 6: Add Sample Data (Optional but Recommended)

To test the application with realistic data that matches your frontend:

1. **Get Your Landlord ID**
   - Go to SQL Editor in Supabase
   - Run this query:
   ```sql
   SELECT id FROM landlords WHERE user_id = '2fd4406b-dd11-42a1-9fa5-5316352a3595';
   ```
   - Copy the landlord ID (it will be a UUID like `abc123...`)

2. **Use the Sample Data File**
   - Open `SAMPLE_DATA.sql` in your project
   - Find and replace ALL instances of `YOUR_LANDLORD_ID` with your actual landlord ID
   - Copy the entire file contents
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **What Gets Created**
   - 5 Properties (Sandton, Cape Town, Pretoria, Durban, Rosebank)
   - 4 Tenants (Thabo, Zanele, Sarah, Pieter)
   - 4 Active Leases
   - Current month rent payments (3 paid, 1 overdue)
   - 2 Maintenance tickets

4. **Verify Data**
   - Go to "Table Editor" → "properties"
   - You should see 5 properties
   - Check "tenants" table for 4 tenants
   - All data matches your frontend exactly!

---

## Step 7: Remove Hardcoded Data

Once database is working, remove hardcoded data from components:

### Files to Update:

1. **Properties Page** - `app/properties/page.tsx`
   - Remove hardcoded `MOCK_PROPERTIES`
   - Fetch from database using Supabase client

2. **Tenants Page** - `components/tenants/tenants-page.tsx`
   - Remove hardcoded `MOCK_TENANTS`
   - Fetch from database

3. **Maintenance Page** - `app/maintenance/page.tsx`
   - Remove hardcoded `MOCK_TICKETS`
   - Fetch from database

4. **Financial Page** - `app/financial/page.tsx`
   - Remove hardcoded `MOCK_TRANSACTIONS`
   - Fetch from database

5. **Dashboard** - `components/dashboard/dashboard.tsx`
   - Remove all hardcoded stats
   - Calculate from database

### Example: Fetching Properties

```typescript
// Before (hardcoded)
const properties = MOCK_PROPERTIES;

// After (from database)
const { data: properties, error } = await supabase
  .from('properties')
  .select('*')
  .eq('landlord_id', landlordId);
```

---

## Step 8: Test All Features

1. **Login**
   - Go to `/auth/login`
   - Login with your landlord account
   - Should redirect to dashboard

2. **Properties**
   - Add a new property
   - Edit property details
   - Upload property images

3. **Tenants**
   - Add a new tenant
   - View tenant details
   - Record payments

4. **Maintenance**
   - Create maintenance ticket
   - Update ticket status
   - Upload images

5. **Financial**
   - Add transactions
   - Scan receipts
   - View reports

6. **Tenant Portal**
   - Send magic link to tenant email
   - Tenant logs in via `/portal/login`
   - Tenant views their dashboard

---

## Troubleshooting

### "Row Level Security policy violation"
- Make sure you're logged in as the landlord user
- Verify RLS policies are enabled
- Check that landlord record exists with correct user_id

### "relation does not exist"
- Schema wasn't run successfully
- Go to SQL Editor and run schema again
- Check for error messages

### "Invalid API key"
- Verify `.env.local` has correct keys
- Check keys match your Supabase project
- Restart development server after changing .env

### Storage upload fails
- Verify storage buckets exist
- Check storage policies are created
- Ensure bucket names match exactly

### Can't login
- Verify auth user exists in Authentication → Users
- Check landlord record has correct user_id
- Verify email matches between auth.users and landlords table

---

## Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Enable 2FA for Supabase account
- [ ] Review and test all RLS policies
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Add monitoring and alerts
- [ ] Update Site URL to production domain
- [ ] Enable email verification
- [ ] Set up custom SMTP for emails
- [ ] Review storage bucket permissions

---

## Next Steps

1. **Remove hardcoded data** from all components
2. **Test thoroughly** with real data
3. **Set up backups** in Supabase dashboard
4. **Configure production environment** variables
5. **Deploy to production** (Vercel recommended)

---

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Dashboard: https://dcdejvshrdczjldtgnma.supabase.co
