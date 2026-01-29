# Authentication System - Complete Guide

## ✅ What's Been Built

### Frontend (Next.js)
1. **Sign In Page** (`/auth/signin`) - Phone number entry
2. **Verification Page** (`/auth/verify`) - 6-digit OTP input
3. **Dashboard** (`/dashboard`) - View inventory & transactions
4. **Updated Navbar** - "Dashboard" button instead of "Start Building"

### Backend (Express)
1. **SMS Service** - Generate and verify OTP codes
2. **Auth Service** - JWT token generation and verification
3. **Auth Routes** - `/api/auth/send-otp` and `/api/auth/verify-otp`
4. **API Routes** - `/api/inventory` and `/api/transactions` (protected)
5. **Auth Middleware** - Verify JWT tokens on protected routes

## 🔐 How It Works

### Sign In Flow:
```
1. User enters phone number (083 930 0255)
   ↓
2. Frontend sends POST to /api/auth/send-otp
   ↓
3. Backend generates 6-digit OTP
   ↓
4. OTP logged to console (SMS integration pending)
   ↓
5. User enters OTP on verify page
   ↓
6. Frontend sends POST to /api/auth/verify-otp
   ↓
7. Backend verifies OTP and returns JWT token
   ↓
8. Frontend stores token in localStorage
   ↓
9. User redirected to dashboard
```

### Dashboard Access:
```
1. User visits /dashboard
   ↓
2. Frontend checks for authToken in localStorage
   ↓
3. If no token → redirect to /auth/signin
   ↓
4. If token exists → fetch data from API
   ↓
5. API verifies JWT token
   ↓
6. If valid → return inventory & transactions
   ↓
7. If invalid → return 401 error
```

## 🚀 Testing the System

### Step 1: Start Backend

```bash
cd backend
npm start
```

Backend runs on `http://localhost:3000`

### Step 2: Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000` (or 3001 if backend is on 3000)

### Step 3: Test Sign In

1. Go to http://localhost:3000/auth/signin
2. Enter phone number: `083 930 0255`
3. Click "Continue"
4. Check backend console for OTP code (6 digits)
5. Enter the OTP on verify page
6. You'll be redirected to dashboard!

## 📝 OTP Codes (Development)

Since SMS integration isn't set up yet, OTP codes are logged to the backend console:

```
🔐 OTP CODE: 123456 (for +27839300255)
```

Just copy this code and paste it into the verification page.

## 🔧 Configuration

### Backend Environment Variables

Add to `backend/.env`:

```bash
# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# SMS Provider (optional - for future integration)
# TWILIO_ACCOUNT_SID=your-twilio-sid
# TWILIO_AUTH_TOKEN=your-twilio-token
# TWILIO_PHONE_NUMBER=+1234567890
```

### Frontend Environment Variables

Already configured in `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production, change to:
```bash
NEXT_PUBLIC_API_URL=https://thebackroom.onrender.com
```

## 🌐 Production Deployment

### Backend (Render.com)

Add environment variable:
```
JWT_SECRET=your-production-secret-key
```

### Frontend (Vercel)

Add environment variable:
```
NEXT_PUBLIC_API_URL=https://thebackroom.onrender.com
```

## 📱 SMS Integration (Future)

To enable real SMS sending, integrate with an SMS provider:

### Option 1: Twilio (International)
```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

await client.messages.create({
  body: `Your Backroom verification code is: ${otp}`,
  from: twilioNumber,
  to: phoneNumber
});
```

### Option 2: Africa's Talking (South Africa)
```javascript
const AfricasTalking = require('africastalking');
const sms = AfricasTalking({ apiKey, username }).SMS;

await sms.send({
  to: [phoneNumber],
  message: `Your Backroom verification code is: ${otp}`
});
```

### Option 3: Clickatell (South Africa)
```javascript
const clickatell = require('clickatell');

await clickatell.sendMessage({
  to: phoneNumber,
  text: `Your Backroom verification code is: ${otp}`
});
```

## 🔒 Security Features

### Implemented:
- ✅ JWT tokens with 30-day expiry
- ✅ OTP expires after 10 minutes
- ✅ Max 3 OTP attempts per phone number
- ✅ Phone number format validation
- ✅ Protected API routes with middleware
- ✅ Secure token storage (localStorage)

### Recommended for Production:
- [ ] HTTPS only (enforce in production)
- [ ] Rate limiting on auth endpoints
- [ ] IP-based throttling
- [ ] Device fingerprinting
- [ ] Suspicious activity detection
- [ ] Redis for OTP storage (instead of in-memory)
- [ ] Refresh tokens
- [ ] 2FA for admin users

## 📊 Dashboard Features

### Current:
- ✅ View all inventory items
- ✅ View transaction history
- ✅ Export to CSV
- ✅ Refresh data
- ✅ Logout
- ✅ Stats cards (total items, SKUs, transactions)
- ✅ Responsive design

### Future Enhancements:
- [ ] Search and filter inventory
- [ ] Date range filters for transactions
- [ ] Charts and analytics
- [ ] Low stock alerts
- [ ] Bulk operations
- [ ] User management (for teams)
- [ ] Settings page
- [ ] Profile management

## 🐛 Troubleshooting

### "Authentication required" error
- Check if token exists in localStorage
- Verify token hasn't expired (30 days)
- Check backend JWT_SECRET matches

### OTP not working
- Check backend console for OTP code
- Verify phone number format (+27XXXXXXXXX)
- Check OTP hasn't expired (10 minutes)
- Try requesting a new OTP

### Dashboard not loading data
- Check backend is running
- Verify API URL in frontend .env.local
- Check browser console for errors
- Verify Supabase connection

### CORS errors
- Backend already has CORS enabled
- Check API URL matches exactly
- Verify no trailing slashes

## 📱 User Experience

### Sign In:
- Clean, minimal design
- Phone number auto-formatting
- Clear error messages
- Security reassurance

### Verification:
- Auto-focus on code inputs
- Auto-submit when complete
- Resend code after 60 seconds
- Clear countdown timer

### Dashboard:
- Fast loading with skeleton states
- Real-time data refresh
- Easy export to CSV
- Intuitive navigation

## 🎯 Next Steps

1. ✅ Test the complete flow locally
2. ✅ Deploy backend with JWT_SECRET
3. ✅ Deploy frontend with API_URL
4. ✅ Test in production
5. [ ] Integrate SMS provider
6. [ ] Add more dashboard features
7. [ ] Implement team management
8. [ ] Add analytics and reports

---

**Status:** ✅ Fully Functional (SMS integration pending)

**Ready for:** Local testing and production deployment

