# Security Hardening Documentation

## Overview
This document outlines the security measures implemented in The Backroom application following OWASP best practices.

---

## Security Features Implemented

### 1. Rate Limiting (OWASP API4:2023)

**Implementation:** `backend/src/middleware/rateLimiter.js`

All public endpoints are protected with rate limiting to prevent abuse and DoS attacks:

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| General API | 100 requests | 15 minutes | Prevent API abuse |
| Authentication | 5 requests | 15 minutes | Prevent brute force |
| OTP Send | 3 requests | 1 hour | Prevent SMS bombing |
| Webhook | 60 requests | 1 minute | Protect WhatsApp endpoint |
| Support Chat | 10 requests | 1 minute | Prevent spam |
| Dashboard API | 30 requests | 1 minute | Protect authenticated endpoints |

**Features:**
- IP-based rate limiting
- User-based rate limiting (for authenticated requests)
- Graceful 429 responses with `Retry-After` headers
- Detailed logging of rate limit violations

**Configuration:**
```javascript
const { apiLimiter, authLimiter, otpSendLimiter } = require('./middleware/rateLimiter');

// Apply to routes
app.use(apiLimiter); // Global
router.post('/send-otp', otpSendLimiter); // Specific endpoint
```

---

### 2. Input Validation & Sanitization (OWASP API3:2023, API8:2023)

**Implementation:** `backend/src/middleware/validation.js`

All user inputs are validated and sanitized before processing:

#### Phone Number Validation
- Format: `+27XXXXXXXXX` (South African format)
- Regex validation
- Length limits
- Sanitization of control characters

#### OTP Validation
- Exactly 6 digits
- Numeric only
- Length validation

#### Message Validation
- Max length: 500 characters
- Sanitization of null bytes and control characters
- Whitespace trimming

#### Field Whitelisting
```javascript
// Only accept specific fields, reject unexpected ones
allowOnlyFields(['phoneNumber', 'code'])
```

**Usage:**
```javascript
router.post('/send-otp',
  allowOnlyFields(['phoneNumber']),
  validatePhoneNumberMiddleware,
  handler
);
```

---

### 3. Secure API Key Handling

**Implementation:** `backend/src/config/index.js`

#### Environment Variables
All sensitive credentials are loaded from environment variables:

```bash
# Required in production
JWT_SECRET=<strong-secret-min-32-chars>
WHATSAPP_ACCESS_TOKEN=<token>
GEMINI_API_KEY=<key>
SUPABASE_URL=<url>
SUPABASE_ANON_KEY=<key>
```

#### Security Measures
- ✅ No hardcoded secrets in source code
- ✅ Configuration validation on startup
- ✅ Production checks for critical variables
- ✅ JWT secret strength validation (min 32 chars)
- ✅ Graceful degradation in development
- ✅ Clear error messages for missing config

#### Generating Secure Secrets
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate API key
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

---

### 4. Authentication & Authorization (OWASP API2:2023)

**Implementation:** `backend/src/middleware/auth.js`

#### JWT Authentication
- Token-based authentication
- 30-day expiration
- Issuer and audience validation
- Secure token extraction from headers

#### Protected Routes
```javascript
const { requireAuth } = require('./middleware/auth');

router.get('/inventory', requireAuth, handler);
```

#### Token Format
```
Authorization: Bearer <jwt-token>
```

#### Token Payload
```json
{
  "phoneNumber": "+27821234567",
  "type": "auth",
  "iat": 1234567890,
  "exp": 1234567890,
  "iss": "the-backroom",
  "aud": "the-backroom-api"
}
```

---

### 5. Security Headers (Helmet)

**Implementation:** `backend/src/index.js`

Helmet middleware adds security headers:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}));
```

**Headers Added:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy`

---

### 6. Request Size Limits

**Implementation:** `backend/src/index.js`

Prevents DoS attacks via large payloads:

```javascript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

---

### 7. Error Handling

**Implementation:** `backend/src/middleware/errorHandler.js`

- Sanitized error messages (no stack traces in production)
- Detailed logging for debugging
- Consistent error response format
- HTTP status code mapping

---

### 8. Logging & Monitoring

**Implementation:** `backend/src/utils/logger.js`

All security events are logged:

- Authentication attempts (success/failure)
- Rate limit violations
- Invalid input attempts
- API errors
- Suspicious activity

**Log Format:**
```json
{
  "level": "warn",
  "message": "Rate limit exceeded",
  "ip": "192.168.1.1",
  "path": "/api/auth/send-otp",
  "user": "anonymous",
  "timestamp": "2026-01-14T17:00:00.000Z"
}
```

---

## OWASP API Security Top 10 Coverage

| Risk | Status | Implementation |
|------|--------|----------------|
| API1:2023 Broken Object Level Authorization | ✅ | User-based access control in API routes |
| API2:2023 Broken Authentication | ✅ | JWT authentication, OTP verification |
| API3:2023 Broken Object Property Level Authorization | ✅ | Field whitelisting, input validation |
| API4:2023 Unrestricted Resource Consumption | ✅ | Rate limiting on all endpoints |
| API5:2023 Broken Function Level Authorization | ✅ | Role-based middleware |
| API6:2023 Unrestricted Access to Sensitive Business Flows | ✅ | Rate limiting, authentication |
| API7:2023 Server Side Request Forgery | ✅ | Input validation, URL sanitization |
| API8:2023 Security Misconfiguration | ✅ | Helmet headers, secure defaults |
| API9:2023 Improper Inventory Management | ✅ | API documentation, endpoint inventory |
| API10:2023 Unsafe Consumption of APIs | ✅ | Input validation on external API responses |

---

## Security Checklist

### Development
- [x] No hardcoded secrets
- [x] Environment variables for all credentials
- [x] Input validation on all endpoints
- [x] Rate limiting configured
- [x] Authentication middleware
- [x] Error handling
- [x] Security headers
- [x] Request logging

### Production Deployment
- [ ] Generate strong JWT secret (min 32 chars)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Backup and disaster recovery plan

---

## Environment Variables

### Required in Production

```bash
# Server
PORT=5000
NODE_ENV=production

# JWT (CRITICAL)
JWT_SECRET=<generate-with-crypto.randomBytes(32)>
JWT_EXPIRES_IN=30d

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=<your-phone-id>
WHATSAPP_ACCESS_TOKEN=<your-access-token>
WHATSAPP_VERIFY_TOKEN=<your-verify-token>

# Gemini AI
GEMINI_API_KEY=<your-api-key>

# Supabase
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
```

---

## Security Best Practices

### 1. API Keys
- ✅ Never commit API keys to version control
- ✅ Use environment variables
- ✅ Rotate keys regularly (every 90 days)
- ✅ Use different keys for dev/staging/production
- ✅ Revoke compromised keys immediately

### 2. Authentication
- ✅ Use strong JWT secrets (min 32 characters)
- ✅ Set reasonable token expiration (30 days)
- ✅ Implement token refresh mechanism
- ✅ Log all authentication attempts
- ✅ Rate limit authentication endpoints

### 3. Input Validation
- ✅ Validate all user inputs
- ✅ Sanitize data before processing
- ✅ Use whitelist approach (allow known good)
- ✅ Reject unexpected fields
- ✅ Enforce length limits

### 4. Rate Limiting
- ✅ Apply to all public endpoints
- ✅ Use both IP and user-based limits
- ✅ Return graceful 429 responses
- ✅ Log rate limit violations
- ✅ Adjust limits based on usage patterns

### 5. Error Handling
- ✅ Never expose stack traces in production
- ✅ Use generic error messages for users
- ✅ Log detailed errors for debugging
- ✅ Return consistent error format
- ✅ Map errors to appropriate HTTP status codes

---

## Testing Security

### Manual Testing

```bash
# Test rate limiting
for i in {1..10}; do curl http://localhost:5000/api/auth/send-otp -X POST -H "Content-Type: application/json" -d '{"phoneNumber":"+27821234567"}'; done

# Test input validation
curl http://localhost:5000/api/auth/send-otp -X POST -H "Content-Type: application/json" -d '{"phoneNumber":"invalid"}'

# Test authentication
curl http://localhost:5000/api/inventory -H "Authorization: Bearer invalid-token"

# Test field whitelisting
curl http://localhost:5000/api/auth/send-otp -X POST -H "Content-Type: application/json" -d '{"phoneNumber":"+27821234567","malicious":"field"}'
```

### Automated Testing

```bash
# Install security testing tools
npm install --save-dev jest supertest

# Run security tests
npm test
```

---

## Incident Response

### If API Key is Compromised

1. **Immediate Actions:**
   - Revoke the compromised key
   - Generate new key
   - Update environment variables
   - Restart application

2. **Investigation:**
   - Check logs for unauthorized access
   - Identify scope of breach
   - Document timeline

3. **Prevention:**
   - Review access controls
   - Update security policies
   - Implement additional monitoring

### If Rate Limit is Bypassed

1. **Immediate Actions:**
   - Block offending IPs
   - Increase rate limits temporarily
   - Enable additional logging

2. **Investigation:**
   - Analyze attack pattern
   - Check for distributed attacks
   - Review rate limit configuration

3. **Prevention:**
   - Implement IP reputation checking
   - Add CAPTCHA for suspicious activity
   - Consider CDN/WAF solution

---

## Security Contacts

- **Security Issues:** Report to [security@thebackroom.com]
- **Bug Bounty:** [Coming soon]
- **Responsible Disclosure:** 90-day disclosure policy

---

## References

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)

---

**Last Updated:** January 14, 2026
**Version:** 1.0.0
