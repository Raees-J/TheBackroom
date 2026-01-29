# WhatsApp Business API Explained

## The Big Picture: How Your App Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                         YOUR BUSINESS FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

1. Customer sends WhatsApp message: "Added 50 screws"
                    ↓
2. WhatsApp receives message on their servers
                    ↓
3. WhatsApp forwards message to YOUR server (webhook)
                    ↓
4. Your server processes message with AI
                    ↓
5. Your server sends response back to WhatsApp (using API key)
                    ↓
6. WhatsApp delivers response to customer
```

---

## Why You Need TWO Things

### 1. **Access Token (API Key)** - To SEND Messages

**What it does:**
- Allows YOUR server to send messages TO WhatsApp
- Like a password that proves you're authorized
- Used when you want to reply to customers

**Example:**
```javascript
// Your server wants to send a message
await whatsappService.sendMessage(
  phoneNumber,
  "✅ Added 50 screws to inventory"
);

// This uses your ACCESS TOKEN to authenticate with WhatsApp
```

**Without it:**
- ❌ You can't send messages to customers
- ❌ You can't reply to their inventory updates
- ❌ You can't send OTP codes via WhatsApp

---

### 2. **Webhook URL** - To RECEIVE Messages

**What it does:**
- Tells WhatsApp WHERE to send incoming messages
- Like giving WhatsApp your server's address
- WhatsApp calls this URL when customers message you

**Example:**
```
Customer sends: "Added 50 screws"
                    ↓
WhatsApp forwards to: https://thebackroom.onrender.com/webhook/whatsapp
                    ↓
Your server receives and processes it
```

**Without it:**
- ❌ You never receive customer messages
- ❌ WhatsApp doesn't know where to send them
- ❌ Your inventory system won't work

---

## Real-World Analogy

Think of it like a phone system:

### Access Token = Your Phone Number
- You need it to CALL people (send messages)
- Proves you're authorized to use the phone
- Without it, you can't make outgoing calls

### Webhook = Your Phone's Ringer
- Tells the phone system WHERE to ring when someone calls you
- Without it, you never know when someone is trying to reach you
- Incoming calls go nowhere

---

## The Complete Flow (Step by Step)

### Scenario: Customer adds inventory

```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Customer Sends Message                                   │
└──────────────────────────────────────────────────────────────────┘

Customer's Phone (WhatsApp)
    │
    │ "Added 50 screws"
    │
    ↓
WhatsApp Servers (Meta/Facebook)


┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: WhatsApp Forwards to Your Webhook                        │
└──────────────────────────────────────────────────────────────────┘

WhatsApp Servers
    │
    │ POST https://thebackroom.onrender.com/webhook/whatsapp
    │ {
    │   "from": "+27821234567",
    │   "body": "Added 50 screws"
    │ }
    │
    ↓
Your Server (Render.com)


┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: Your Server Processes Message                            │
└──────────────────────────────────────────────────────────────────┘

Your Server:
1. Receives webhook POST request
2. Extracts message: "Added 50 screws"
3. Sends to Gemini AI for parsing
4. AI returns: { action: "add", item: "screws", quantity: 50 }
5. Updates Supabase database
6. Prepares response message


┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: Your Server Sends Response (Using Access Token)          │
└──────────────────────────────────────────────────────────────────┘

Your Server
    │
    │ POST https://graph.facebook.com/v18.0/messages
    │ Headers: { Authorization: "Bearer YOUR_ACCESS_TOKEN" }
    │ Body: {
    │   "to": "+27821234567",
    │   "text": "✅ Added 50 screws to inventory"
    │ }
    │
    ↓
WhatsApp Servers


┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: WhatsApp Delivers to Customer                            │
└──────────────────────────────────────────────────────────────────┘

WhatsApp Servers
    │
    │ Delivers message
    │
    ↓
Customer's Phone (WhatsApp)
    Shows: "✅ Added 50 screws to inventory"
```

---

## What Each Component Does

### Access Token (WHATSAPP_ACCESS_TOKEN)

**Purpose:** Authentication for OUTGOING messages

**Used for:**
- ✅ Sending replies to customers
- ✅ Sending OTP codes
- ✅ Sending inventory confirmations
- ✅ Sending error messages

**How to get it:**
1. Go to Meta Business Manager
2. Create a System User
3. Generate a permanent token
4. Add to your `.env` file

**Example in code:**
```javascript
// backend/src/services/whatsappService.js
const axios = require('axios');

async function sendMessage(to, message) {
  await axios.post(
    'https://graph.facebook.com/v18.0/messages',
    {
      messaging_product: 'whatsapp',
      to: to,
      text: { body: message }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, // ← HERE
        'Content-Type': 'application/json'
      }
    }
  );
}
```

---

### Webhook URL

**Purpose:** Endpoint for INCOMING messages

**Used for:**
- ✅ Receiving customer messages
- ✅ Receiving voice notes
- ✅ Receiving media files
- ✅ Receiving delivery receipts

**How to set it up:**
1. Deploy your backend to Render.com
2. Get your URL: `https://thebackroom.onrender.com`
3. Add webhook endpoint: `/webhook/whatsapp`
4. Full URL: `https://thebackroom.onrender.com/webhook/whatsapp`
5. Configure in Meta Business Manager

**Example in code:**
```javascript
// backend/src/routes/webhook.js
router.post('/whatsapp', async (req, res) => {
  // WhatsApp sends messages HERE
  const { from, body } = req.body;
  
  console.log(`Received from ${from}: ${body}`);
  
  // Process the message
  await processInventoryMessage(from, body);
  
  res.sendStatus(200); // Tell WhatsApp we received it
});
```

---

### Verify Token (WHATSAPP_VERIFY_TOKEN)

**Purpose:** Security check when setting up webhook

**Used for:**
- ✅ One-time verification when configuring webhook
- ✅ Proves you own the server
- ✅ Prevents unauthorized webhook setup

**How it works:**
```javascript
// When you configure webhook in Meta, they send:
GET /webhook/whatsapp?hub.verify_token=YOUR_VERIFY_TOKEN&hub.challenge=12345

// Your server checks:
if (req.query['hub.verify_token'] === process.env.WHATSAPP_VERIFY_TOKEN) {
  res.send(req.query['hub.challenge']); // ✅ Verified!
} else {
  res.sendStatus(403); // ❌ Wrong token
}
```

---

## Why You Can't Use Regular WhatsApp

### Regular WhatsApp (Personal)
- ❌ No API access
- ❌ Can't receive webhooks
- ❌ Can't automate messages
- ❌ Manual replies only
- ❌ No business features

### WhatsApp Business API
- ✅ Full API access
- ✅ Webhook support
- ✅ Automated messages
- ✅ AI integration
- ✅ Scale to thousands of customers

---

## Common Questions

### Q: Can I use my personal WhatsApp number?
**A:** No. You need a separate business number registered with WhatsApp Business API.

### Q: Why do I need to verify my business?
**A:** Meta requires verification to prevent spam and ensure legitimate business use.

### Q: Can I test without verification?
**A:** Yes! Meta provides a test number for development. But you need verification for production.

### Q: How much does it cost?
**A:** 
- First 1,000 conversations/month: **FREE**
- After that: ~R0.50 per conversation
- Much cheaper than SMS!

### Q: What's a "conversation"?
**A:** A 24-hour window of messages between you and a customer. Multiple messages = 1 conversation.

---

## Your Current Setup

### What You Have:
```bash
# In backend/.env
WHATSAPP_PHONE_NUMBER_ID=100677914582363  # Test number
WHATSAPP_ACCESS_TOKEN=EAAT4YZA...         # Permanent token ✅
WHATSAPP_VERIFY_TOKEN=thebackroom_...     # Your verify token ✅
WHATSAPP_BUSINESS_ACCOUNT_ID=207728...    # Your business ID ✅
```

### What You Need to Do:
1. ✅ Access Token - You have it!
2. ✅ Verify Token - You have it!
3. ⏳ Business Verification - In progress
4. ❌ Add your real phone number (083 930 0255)
5. ❌ Configure webhook URL in Meta

---

## Setting Up Webhook (After Verification)

### Step 1: Get Your Server URL
```
Your backend is deployed at: https://thebackroom.onrender.com
Webhook endpoint: /webhook/whatsapp
Full URL: https://thebackroom.onrender.com/webhook/whatsapp
```

### Step 2: Configure in Meta
1. Go to Meta Business Manager
2. Select your WhatsApp app
3. Go to "Configuration" → "Webhooks"
4. Click "Edit"
5. Enter:
   - **Callback URL:** `https://thebackroom.onrender.com/webhook/whatsapp`
   - **Verify Token:** `thebackroom_secure_verify_token_2026`
6. Subscribe to events:
   - ✅ messages
   - ✅ message_status
7. Click "Verify and Save"

### Step 3: Test It
```bash
# Send a test message from your phone
"Test message"

# Check your server logs
# You should see: "Received from +27839300255: Test message"
```

---

## Security Note

### Keep These SECRET:
- ❌ Never commit `WHATSAPP_ACCESS_TOKEN` to GitHub
- ❌ Never share your access token publicly
- ❌ Never expose it in frontend code

### Why?
- Anyone with your access token can send messages as your business
- They can spam customers
- They can impersonate you
- You'll be charged for their usage

### How to Protect:
- ✅ Store in environment variables
- ✅ Use `.env` file (not committed to git)
- ✅ Rotate tokens regularly
- ✅ Use different tokens for dev/prod

---

## Summary

### Access Token = Your Key to SEND Messages
```javascript
// You → WhatsApp
sendMessage(customer, "Your order is ready!");
```

### Webhook = WhatsApp's Way to SEND You Messages
```javascript
// Customer → WhatsApp → Your Server
receiveMessage(customer, "Where is my order?");
```

### Both Are Required:
- Without Access Token: You can receive but not reply
- Without Webhook: You can send but never receive
- With Both: Full two-way communication! 🎉

---

## Next Steps

1. **Wait for Business Verification** (2-5 business days)
2. **Add Your Phone Number** (083 930 0255) to WhatsApp API
3. **Configure Webhook** in Meta Business Manager
4. **Test End-to-End** with real messages
5. **Go Live!** 🚀

---

## Need Help?

- **Meta Documentation:** https://developers.facebook.com/docs/whatsapp
- **Your Backend:** https://thebackroom.onrender.com
- **Test Webhook:** Use ngrok for local testing
- **Support:** WhatsApp Business API Support in Meta Business Manager

---

**Remember:** The webhook and access token work together like a two-way radio:
- **Access Token** = Your transmitter (send messages)
- **Webhook** = Your receiver (get messages)
- **Both needed** = Full communication! 📡

