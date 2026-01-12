# The Backroom - Scaling Guide 🚀

This document outlines the scaling strategy as your client base grows from 1 to 100+ businesses.

---

## 📊 Scaling Phases

### Phase 1: 10-25 Clients (Stay on Free Tier)
**Current stack works fine, but add:**

- ✅ **Redis caching** (Upstash free tier)
  - Cache common queries ("help", "list inventory")
  - Cache inventory snapshots (5-min refresh)
  - 10K commands/day free

- ✅ **Rate limiting per user**
  ```javascript
  const limits = {
    messagesPerHour: 50,
    maxInventoryItems: 100
  };
  ```

- ✅ **Basic monitoring**
  - Sentry for error tracking (free tier)
  - Log aggregation with Better Stack

**Estimated monthly cost**: **$0** (all free tiers)

---

### Phase 2: 25-50 Clients (First Paid Services)
**Critical migrations:**

- 🔄 **Migrate to Supabase/Neon** (PostgreSQL)
  - Google Sheets = 300 RPM limit (too low)
  - Supabase free tier: 500MB database
  - Rewrite `sheetsService.js` → `databaseService.js`

- 🔄 **Message Queue** (Bull + Redis)
  - Handle concurrent messages
  - Prevent race conditions
  - Asynchronous processing

- 🔄 **Upgrade Gemini to paid tier**
  - Free tier = 1,500 RPD = only 30 requests/client/day
  - Paid: $0.075 per 1M tokens (very affordable)
  - Implement smart caching to reduce costs

**Estimated monthly cost**: **$10-20**
- Upstash Redis Pro: $10/month
- Gemini API: ~$5-10/month

---

### Phase 3: 50-100 Clients (Scale Infrastructure)

- 🔄 **Upgrade Vercel to Pro** ($20/month)
  - Hobby tier = 1M requests/month limit
  - Pro = Unlimited requests

- 🔄 **Supabase Pro** ($25/month)
  - 8GB database
  - Better performance

- 🔄 **Add monitoring & analytics**
  - Posthog for usage analytics
  - Track messages per client
  - Monitor API usage per client

- 🔄 **Implement tiered pricing**
  ```
  Free:    50 messages/day, 50 items
  Starter: 200 messages/day, 500 items ($5/mo)
  Pro:     Unlimited messages, unlimited items ($15/mo)
  ```

**Estimated monthly cost**: **$56**
**Potential revenue (at $10/client avg)**: **$1,000/month**
**Profit**: **$944/month** 💰

---

### Phase 4: 100+ Clients (Enterprise Scale)

- 🔄 **Dedicated infrastructure**
  - Consider Railway, Render, or Fly.io
  - Better control over resources

- 🔄 **Customer support tools**
  - Admin dashboard for monitoring
  - Automated health checks
  - Client usage reports

- 🔄 **Advanced features**
  - Multi-user support per business
  - Advanced analytics dashboard
  - API webhooks for integrations
  - Export to accounting software

**Estimated monthly cost**: **$100-200**
**Potential revenue**: **$1,000-2,000/month**

---

## 🛠️ Critical Scaling Actions

### 1. Database Migration (When to do it: 25+ clients)
**Problem**: Google Sheets rate limit = 300 RPM
**Solution**: PostgreSQL (Supabase/Neon)

**Migration steps**:
1. Set up Supabase project
2. Create tables:
   ```sql
   CREATE TABLE inventory (
     id SERIAL PRIMARY KEY,
     client_id TEXT NOT NULL,
     item_name TEXT NOT NULL,
     quantity DECIMAL NOT NULL,
     unit TEXT NOT NULL,
     last_updated TIMESTAMP DEFAULT NOW(),
     updated_by TEXT
   );

   CREATE TABLE transactions (
     id SERIAL PRIMARY KEY,
     client_id TEXT NOT NULL,
     timestamp TIMESTAMP DEFAULT NOW(),
     action TEXT NOT NULL,
     item_name TEXT NOT NULL,
     quantity DECIMAL NOT NULL,
     unit TEXT,
     user_id TEXT,
     notes TEXT
   );
   ```
3. Rewrite `sheetsService.js`
4. Migrate existing data
5. Test thoroughly before switching

---

### 2. Message Queue (When to do it: 25+ clients)
**Problem**: Concurrent messages cause race conditions
**Solution**: Bull queue with Redis

```bash
npm install bull ioredis
```

**Implementation**:
```javascript
// Create queue
const Queue = require('bull');
const messageQueue = new Queue('whatsapp-messages', {
  redis: process.env.REDIS_URL
});

// Add message to queue
messageQueue.add({ messageData });

// Process queue
messageQueue.process(async (job) => {
  await processMessage(job.data.messageData);
});
```

---

### 3. Redis Caching (When to do it: 10+ clients)
**What to cache**:
- Common LLM responses ("help", "hi", "hello")
- Inventory snapshots (TTL: 5 minutes)
- User session data

```javascript
const redis = new Redis(process.env.REDIS_URL);

// Cache inventory
await redis.setex(`inventory:${clientId}`, 300, JSON.stringify(inventory));

// Get from cache
const cached = await redis.get(`inventory:${clientId}`);
```

---

### 4. Rate Limiting (Immediate)
**Per-client limits**:
```javascript
const clientLimits = {
  free: {
    messagesPerHour: 50,
    messagesPerDay: 200,
    maxInventoryItems: 100
  },
  paid: {
    messagesPerHour: 500,
    messagesPerDay: 2000,
    maxInventoryItems: 1000
  }
};
```

---

### 5. LLM Cost Optimization
**Strategies**:
1. **Pattern matching first**: Use regex for simple operations
   ```javascript
   if (/^(hi|hello|hey)/i.test(message)) {
     return helpMessage; // Skip LLM
   }
   ```

2. **Cache common queries**: Store frequent responses in Redis

3. **Batch processing**: Group similar requests when possible

4. **Use cheaper models for simple tasks**: 
   - Gemini Flash for parsing
   - Gemini Pro only for complex queries

---

## 💰 Cost Breakdown at Different Scales

### 10 Clients (Free Tier)
| Service | Cost |
|---------|------|
| Gemini API (1,500 RPD) | $0 |
| WhatsApp Cloud API | $0 |
| Google Sheets | $0 |
| Vercel Hobby | $0 |
| **Total** | **$0/month** |

### 50 Clients (Paid Tiers)
| Service | Cost |
|---------|------|
| Supabase Starter | $25 |
| Gemini API (~5M tokens) | $5 |
| Upstash Redis | $10 |
| Vercel Pro | $20 |
| **Total** | **$60/month** |
| **Revenue** (avg $8/client) | **$400/month** |
| **Profit** | **$340/month** 💰 |

### 100 Clients (Scale)
| Service | Cost |
|---------|------|
| Supabase Pro | $25 |
| Gemini API (~10M tokens) | $10 |
| Upstash Redis | $10 |
| Vercel Pro | $20 |
| Monitoring (Sentry + Posthog) | $20 |
| **Total** | **$85/month** |
| **Revenue** (avg $10/client) | **$1,000/month** |
| **Profit** | **$915/month** 💰 |

---

## 🎯 Recommended Pricing Tiers

### Free Tier
- 50 messages per day
- 50 inventory items max
- Basic support
- Google Sheets integration

### Starter - $5/month
- 200 messages per day
- 500 inventory items
- Email support
- Data export (CSV)

### Pro - $15/month
- Unlimited messages
- Unlimited inventory items
- Priority support
- Advanced analytics
- API access
- Multi-user support

### Enterprise - Custom
- Dedicated infrastructure
- Custom integrations
- White-label option
- SLA guarantee
- Account manager

---

## 📈 Growth Milestones

| Clients | Action Required |
|---------|-----------------|
| 10 | Add Redis caching, implement rate limiting |
| 25 | Migrate to PostgreSQL, add message queue |
| 50 | Upgrade to paid tiers, implement pricing |
| 100 | Optimize infrastructure, add support tools |
| 250 | Consider dedicated servers, hire support |
| 500+ | Build dedicated team, enterprise features |

---

## 🚨 Warning Signs You Need to Scale

1. **Google Sheets errors**: Rate limit exceeded (300 RPM)
2. **Gemini quota exceeded**: 1,500 RPD limit hit
3. **Slow response times**: Messages taking >5 seconds
4. **Vercel quota warnings**: Approaching 1M requests/month
5. **Customer complaints**: Service degradation
6. **Error rates spike**: >5% of requests failing

---

## ✅ Pre-Launch Checklist

Before scaling to 50+ clients:

- [ ] Database migration complete and tested
- [ ] Message queue implemented
- [ ] Redis caching layer active
- [ ] Rate limiting per client active
- [ ] Monitoring dashboards set up
- [ ] Error tracking configured
- [ ] Pricing page created
- [ ] Payment processing integrated (Stripe/Paddle)
- [ ] Terms of Service written
- [ ] Privacy Policy written
- [ ] Customer support email set up
- [ ] Backup strategy implemented

---

## 🔗 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Upstash Redis](https://upstash.com/)
- [Bull Queue Guide](https://github.com/OptimalBits/bull)
- [Vercel Pricing](https://vercel.com/pricing)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)

---

**Last Updated**: January 12, 2026
**Version**: 1.0
