# The Backroom 🏪

> AI-powered inventory management via WhatsApp with Supabase PostgreSQL database
> 
> **🆓 100% FREE STACK** - No monthly costs!

The Backroom is a professional inventory management service that bridges "on-the-ground" operations with digital record-keeping. Business owners manage their stock entirely through WhatsApp, using natural language or voice notes that get automatically converted to structured data in a real-time PostgreSQL database.

## 🆓 The Free Stack

| Component | Service | Free Tier |
|-----------|---------|-----------|
| **Backend** | Node.js (Express) | ✅ Free |
| **Messaging** | WhatsApp Cloud API | ✅ Unlimited (Service Convos) |
| **LLM** | Gemini 2.0 Flash-Lite | ✅ 1,500 RPD Free |
| **Speech-to-Text** | Transformers.js + Whisper | ✅ Local CPU - Free |
| **Storage** | Supabase PostgreSQL | ✅ 500MB Database Free |
| **Deployment** | Vercel Hobby Tier | ✅ 1M requests Free |

**Total Monthly Cost: $0** 🎉

## 🎯 Perfect For

- 🏪 Spaza shops & convenience stores
- ☀️ Solar installers & technicians
- 🔧 Mobile mechanics
- 👗 Boutique retailers
- 🍳 Catering kitchens
- 📦 Any business with mobile or high-speed workflows

## ✨ Features

- **Natural Language Processing**: Just text like you talk - "Got 50 bottles of Coke"
- **Voice Notes**: Send voice messages - transcribed locally with Whisper
- **Real-time Updates**: Instant PostgreSQL database synchronization
- **Transaction History**: Full audit trail of all stock movements in database
- **Smart Matching**: Fuzzy search and intelligent item matching
- **South African English**: Understands local terms and slang
- **Fast & Reliable**: PostgreSQL for instant queries and scalability

## 🛠️ Tech Stack

- **Node.js** with **Express** - Fast, reliable server
- **Google Gemini 2.0 Flash-Lite** - Natural language understanding (FREE)
- **Transformers.js + Whisper-Base** - Local voice transcription (FREE)
- **WhatsApp Cloud API** - Direct Meta integration (FREE)
- **Supabase PostgreSQL** - Scalable database with real-time capabilities (FREE)
- **Vercel** - Serverless deployment (FREE)

## 📋 Prerequisites

- Node.js 18+
- Meta Developer Account (for WhatsApp Cloud API)
- Supabase account (free tier)
- Google AI Studio account (for Gemini API key)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd "The Backroom"
npm install
```

### 2. Configure Environment

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server
PORT=3000
NODE_ENV=development

# WhatsApp Cloud API (FREE)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
WHATSAPP_VERIFY_TOKEN=your_custom_webhook_verify_token

# Gemini (FREE: 1,500 RPD)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-lite

# Supabase (FREE: 500MB Database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Local Whisper (FREE)
WHISPER_MODEL=Xenova/whisper-base
```

### 3. Set Up Services

#### Supabase Database (Step-by-Step)

1. **Create a Supabase Account**
   - Go to [Supabase](https://supabase.com/)
   - Click **"Start your project"** and sign up (free)

2. **Create a New Project**
   - Click **"New Project"**
   - Enter project name (e.g., "the-backroom")
   - Set a strong database password
   - Choose a region close to you
   - Click **"Create new project"** (takes ~2 minutes)

3. **Get Your API Credentials**
   - Go to **Settings** → **API**
   - Copy **Project URL** → This is your `SUPABASE_URL`
   - Copy **anon/public key** → This is your `SUPABASE_ANON_KEY`

4. **Create Database Tables**
   - Go to **SQL Editor** in the left sidebar
   - Click **"New query"**
   - Copy the contents of `supabase-schema.sql` from this project
   - Paste and click **"Run"** or press Ctrl+Enter
   - Verify tables created: Go to **Table Editor** → You should see `inventory` and `transactions` tables

5. **Verify Setup**
   - Go to **Table Editor** → **inventory**
   - You should see a test item with quantity 0
   - Your database is ready! 🎉

#### WhatsApp Cloud API (Step-by-Step)

1. **Create a Meta Developer Account**
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Click **"Get Started"** or **"Log In"** (use your Facebook account)
   - Complete the developer registration if prompted

2. **Create a New App**
   - Go to [My Apps](https://developers.facebook.com/apps/)
   - Click **"Create App"**
   - Select **"Other"** for use case → Click **"Next"**
   - Select **"Business"** as the app type → Click **"Next"**
   - Enter an app name (e.g., "The Backroom") and your email
   - Click **"Create App"**

3. **Add WhatsApp Product**
   - On your app dashboard, scroll down to **"Add products to your app"**
   - Find **"WhatsApp"** and click **"Set Up"**
   - If prompted, create or select a Meta Business Account

4. **Get Your API Credentials**
   - In the left sidebar, go to **WhatsApp → API Setup**
   - You'll see a **test phone number** provided by Meta
   - Copy the **"Phone number ID"** → This is your `WHATSAPP_PHONE_NUMBER_ID`
   - Copy the **"Temporary access token"** → This is your `WHATSAPP_ACCESS_TOKEN`
   
   > ⚠️ The temporary token expires in 24 hours. For production, create a permanent token (see step 7)

5. **Add Your Phone Number for Testing**
   - Under **"Send and receive messages"**, click **"Add phone number"**
   - Enter your WhatsApp phone number
   - Verify with the code sent to your WhatsApp
   - Now you can send test messages to this number

6. **Configure Webhook**
   - In the left sidebar, go to **WhatsApp → Configuration**
   - Under **"Webhook"**, click **"Edit"**
   - **Callback URL**: `https://your-vercel-app.vercel.app/webhook/whatsapp`
   - **Verify token**: Enter any secret string (e.g., `my-secret-token-123`)
     - This must match your `WHATSAPP_VERIFY_TOKEN` in `.env`
   - Click **"Verify and Save"**
   - Subscribe to webhook fields: Check **"messages"** → Click **"Done"**

7. **Create Permanent Access Token (For Production)**
   - Go to [Business Settings](https://business.facebook.com/settings/)
   - Navigate to **Users → System Users**
   - Click **"Add"** → Create a system user (Admin role)
   - Click on the system user → **"Add Assets"**
   - Select your WhatsApp app → Grant **"Full Control"**
   - Click **"Generate New Token"**
   - Select your app and add permission: **"whatsapp_business_messaging"**
   - Copy this token → This is your permanent `WHATSAPP_ACCESS_TOKEN`

8. **Test Your Setup**
   - Send a WhatsApp message to the test number shown in API Setup
   - Your webhook should receive the message!

> 💡 **Tip**: Service conversations (user-initiated) are FREE. Marketing/utility messages have costs.

#### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Create an API key (FREE - 1,500 requests/day)
3. Copy the key → This is your `GEMINI_API_KEY`

### 4. Run the Application

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 5. Deploy to Vercel (FREE)

```bash
npm install -g vercel
vercel
```

**Important**: Add environment variables in Vercel dashboard:
1. Go to your project settings → Environment Variables
2. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Add `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`
4. Add `GEMINI_API_KEY`
5. Redeploy to apply changes

## 💬 Usage Examples

Send these messages via WhatsApp:

| Message | Action |
|---------|--------|
| "Got 50 bottles of Coke" | ➕ Adds 50 Coke bottles |
| "Received 20 solar panels" | ➕ Adds 20 solar panels |
| "Sold 3 car batteries" | ➖ Removes 3 batteries |
| "Used 10 screws for job" | ➖ Removes 10 screws |
| "How many batteries?" | 🔍 Shows battery stock |
| "What's in stock?" | 📋 Lists all inventory |
| "Stock count: 100 bolts" | 🔄 Sets bolts to exactly 100 |
| "help" | ❓ Shows help menu |

### Voice Notes 🎤

Just record a voice message describing the stock change - Whisper will transcribe it locally (no API costs!) and process it the same way!

## 📊 Database Structure

### Inventory Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Item name (lowercase) |
| quantity | NUMERIC | Current stock level |
| unit | TEXT | Unit of measurement |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| updated_by | TEXT | User who updated |
| created_at | TIMESTAMPTZ | Creation timestamp |

### Transactions Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| action | TEXT | ADD, REMOVE, ADJUST |
| item_name | TEXT | Item name |
| quantity | NUMERIC | Quantity changed |
| unit | TEXT | Unit of measurement |
| user_id | TEXT | User phone number |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMPTZ | Transaction timestamp |

## 🏗️ Project Structure

```
The Backroom/
├── api/
│   └── index.js              # Vercel serverless entry
├── src/
│   ├── config/
│   │   └── index.js          # Environment configuration
│   ├── controllers/
│   │   └── inventoryController.js  # Message processing logic
│   ├── middleware/
│   │   └── errorHandler.js   # Global error handling
│   ├── routes/
│   │   ├── health.js         # Health check endpoints
│   │   └── webhook.js        # WhatsApp webhook routes
│   ├── services/
│   │   ├── geminiService.js      # Gemini NLP (FREE)
│   │   ├── transcriptionService.js # Local Whisper (FREE)
│   │   ├── supabaseService.js    # Supabase database operations
│   │   └── whatsappService.js    # WhatsApp Cloud API
│   ├── utils/
│   │   ├── helpers.js        # Utility functions
│   │   ├── logger.js         # Winston logging
│   │   └── rateLimiter.js    # Rate limiting
│   └── index.js              # Application entry point
├── .env.example              # Environment template
├── .gitignore
├── package.json
├── vercel.json               # Vercel deployment config
└── README.md
```

## 🔒 Security

- WhatsApp webhook verification
- Rate limiting per user
- Secure credential management via environment variables
- Helmet.js security headers

## 📈 Rate Limits (Free Tier)

| Service | Limit | Notes |
|---------|-------|-------|
| Gemini | 1,500 RPD | ~50 messages/day per user (plenty!) |
| Supabase | 500MB DB | Unlimited API requests on free tier |
| WhatsApp | Unlimited | Service conversations are free |
| Vercel | 1M/month | ~33k requests/day |

## 🧪 Testing

```bash
npm test
```

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check |
| `/health/ready` | GET | Readiness check |
| `/health/live` | GET | Liveness check |
| `/webhook/whatsapp` | GET | Webhook verification |
| `/webhook/whatsapp` | POST | Incoming messages |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this for your business!

---

Built with ❤️ for South African businesses | **100% FREE to run!**
