# Deployment Guide - The Backroom

## Current Setup: Render.com (Free Tier)

**Status:** MVP/Testing Phase  
**Cost:** $0/month  
**Limitation:** Spins down after 15 min idle (30 sec cold start)

---

## Quick Deploy to Render.com

### Step 1: Sign Up
1. Go to https://render.com/
2. Click "Get Started"
3. Sign up with GitHub (no credit card required!)

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect repository: **Raees-J/TheBackroom**
3. Click "Connect"

### Step 3: Configure Service
- **Name**: `the-backroom`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: **Free** ✅

### Step 4: Add Environment Variables

Click "Add Environment Variable" for each:

```
PORT=3000
NODE_ENV=production

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=100677914582363
WHATSAPP_ACCESS_TOKEN=EAAT4YZAZAfqD4BQVwsppboBaPjgq39Gtbs3Pp4Uini36a8Um4TIONFWT2gibbZBHVOU0d7Fj1yy0fnJPiaI9wgCVPSQonmICU0pGpCi2eRhoJPSVu2n0ZAEWvthu6HBrUqUHpCeKa8oZA6UHLV7DwlZAfQB3OnHtXo19W06CTqfnTzMr8rIIQnwzabL2klOjB2CALJJoCtX3uLL7rpvMjYUMTYECwpcRKZBM1wKBdPSItWEbzNWPBSRtTiw8YVQH1fYLEsjZAVTui9urZBVVBS9G17UYC
WHATSAPP_VERIFY_TOKEN=thebackroom_secure_verify_token_2026

# Gemini
GEMINI_API_KEY=AIzaSyC-L9bQbXOkU2A7bN5CuH-9oE6fvPxLxED

# Supabase
SUPABASE_URL=https://wkxxpzhwypuntrgqjiou.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreHhwemh3eXB1bnRyZ3FqaW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDA2NjEsImV4cCI6MjA4Mzg3NjY2MX0.gp8RcAvSNjObWSAeMHsNR0Pj6X5Q-OfQNdviZBfFb8g
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait ~3 minutes for build
3. Your app will be live at: `https://the-backroom-XXXX.onrender.com`

### Step 6: Update WhatsApp Webhook
1. Go to [Meta Developer Console](https://developers.facebook.com/apps/)
2. Select your app → WhatsApp → Configuration
3. Edit Webhook:
   - **Callback URL**: `https://your-app.onrender.com/webhook/whatsapp`
   - **Verify Token**: `thebackroom_secure_verify_token_2026`
4. Click "Verify and Save"
5. Subscribe to "messages" field

### Step 7: Test
Send a WhatsApp message to your test number:
```
Added 30 screws
```

Check:
- ✅ Render logs show message received
- ✅ Supabase database has new "screws" entry
- ✅ You receive WhatsApp reply

---

## When to Upgrade to Railway.app

**Upgrade when you have:**
- 5+ paying clients
- Need always-on reliability
- Cold starts annoy customers
- Monthly revenue > R500

**Railway Benefits:**
- No spin down (always instant)
- Better performance
- Better logs
- $5/month (~R80)

**How to Upgrade:**
1. Sign up at https://railway.app/
2. Add credit card (required)
3. Deploy same way as Render
4. Update WhatsApp webhook URL
5. Delete Render service

---

## Troubleshooting

### Service Won't Start
- Check Render logs for errors
- Verify all environment variables are set
- Check `npm start` works locally

### Webhook Not Receiving Messages
- Verify webhook URL in Meta console
- Check verify token matches
- Test with curl:
  ```bash
  curl https://your-app.onrender.com/health
  ```

### Database Not Writing
- Check Supabase credentials
- Verify RLS is disabled (for testing)
- Check Render logs for Supabase errors

### Cold Start Too Slow
- This is normal for free tier
- Upgrade to Railway for always-on
- Or use a cron job to ping every 10 min

---

## Cost Comparison

| Platform | Free Tier | Always-On | Cost/Month |
|----------|-----------|-----------|------------|
| **Render** | ✅ Yes | ❌ No (spins down) | $0 |
| **Railway** | ✅ $5 credit | ✅ Yes | $5-20 |
| **Vercel** | ✅ Yes | ❌ Doesn't work | $0 |

**Recommendation:** Start with Render (free), upgrade to Railway when profitable.

---

## Production Checklist

Before going live with paying clients:

- [ ] Test all message types (add, remove, check, list)
- [ ] Verify Supabase data is persisting
- [ ] Test voice notes (if enabled)
- [ ] Set up monitoring/alerts
- [ ] Enable RLS on Supabase (security)
- [ ] Create database backups
- [ ] Document for your team
- [ ] Consider upgrading to Railway

---

**Current Status:** ✅ Ready for MVP testing on Render.com free tier
