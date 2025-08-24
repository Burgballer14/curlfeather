# Stripe Webhook Configuration Guide

## Phase 2.5: Environment Variables & Webhook Configuration

### Overview
This guide walks through setting up Stripe webhooks to enable real-time payment and invoice event processing for the Curl Feather autonomous platform.

---

## 🔧 1. Stripe Dashboard Configuration

### Create Webhook Endpoint

1. **Login to Stripe Dashboard**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Switch to your Curl Feather account

2. **Navigate to Webhooks**
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**

3. **Configure Endpoint**
   ```
   Endpoint URL: https://your-domain.vercel.app/api/stripe/webhook
   Description: Curl Feather Platform - Payment & Invoice Events
   ```

4. **Select Events to Send**
   ```
   ✅ payment_intent.succeeded
   ✅ payment_intent.payment_failed
   ✅ payment_method.attached
   ✅ customer.created
   ✅ invoice.payment_succeeded
   ✅ invoice.payment_failed
   ✅ invoice.finalized
   ✅ invoice.sent
   ✅ invoice.voided
   ```

5. **Save and Get Signing Secret**
   - Click **Add endpoint**
   - Copy the **Signing secret** (starts with `whsec_`)

---

## 🌍 2. Environment Variables Configuration

### Local Development (.env.local)
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SendGrid Configuration
SENDGRID_API_KEY=SG.your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@curlfeather.com
ADMIN_EMAIL=admin@curlfeather.com
```

### Production (Vercel)
Set the following environment variables in Vercel:

```bash
# Production Stripe Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Production SendGrid
SENDGRID_API_KEY=SG.your-production-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@curlfeather.com
ADMIN_EMAIL=admin@curlfeather.com
```

---

## 🧪 3. Webhook Testing

### Test Events
Use Stripe CLI or Dashboard to send test events:

```bash
# Install Stripe CLI
stripe login

# Forward events to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Send test events
stripe trigger payment_intent.succeeded
stripe trigger invoice.payment_succeeded
stripe trigger customer.created
```

### Expected Webhook Events Flow

#### Invoice Payment Flow:
1. **invoice.finalized** → Invoice ready for payment
2. **invoice.sent** → Invoice sent to customer
3. **invoice.payment_succeeded** → Payment completed
4. **payment_intent.succeeded** → Payment confirmed

#### Failed Payment Flow:
1. **invoice.payment_failed** → Payment attempt failed
2. **payment_intent.payment_failed** → Payment method declined

---

## 📊 4. Monitoring & Logging

### Webhook Logs
Monitor webhook delivery in:
- **Stripe Dashboard** → **Developers** → **Webhooks** → **[Your Endpoint]**
- **Vercel Functions** → **View Function Logs**

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Webhook signature verification failed | Check `STRIPE_WEBHOOK_SECRET` matches dashboard |
| 404 errors | Verify webhook URL matches deployment |
| Timeout errors | Check function execution time limits |
| Missing metadata | Ensure invoice/payment includes required metadata |

---

## 🔒 5. Security Best Practices

### Webhook Security
- ✅ Always verify webhook signatures
- ✅ Use HTTPS endpoints only  
- ✅ Process events idempotently
- ✅ Store webhook secrets securely
- ✅ Log all webhook events for audit

### Environment Security
- ✅ Never commit API keys to Git
- ✅ Use different keys for dev/prod
- ✅ Rotate keys regularly
- ✅ Restrict API key permissions
- ✅ Monitor key usage

---

## 📋 6. Configuration Checklist

### Development Setup
- [ ] Stripe test keys added to `.env.local`
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook secret copied to environment
- [ ] Local webhook forwarding working
- [ ] Test events triggering successfully

### Production Setup  
- [ ] Stripe live keys added to Vercel
- [ ] Production webhook endpoint configured
- [ ] Production webhook secret set
- [ ] SSL certificate valid
- [ ] Webhook events processing correctly

### Verification Steps
- [ ] Payment intent succeeds → updates database
- [ ] Invoice payment → sends confirmation email
- [ ] Failed payment → sends notification
- [ ] Customer created → logs in console
- [ ] All events logged properly

---

## 🚀 7. Next Steps

After webhook configuration:
1. **Test end-to-end payment flow**
2. **Verify customer authentication**
3. **Test milestone completion workflow**
4. **Deploy to production**
5. **Monitor payment processing**

---

## 🆘 8. Troubleshooting

### Debug Commands
```bash
# Check webhook endpoint
curl -X POST https://your-domain.com/api/stripe/webhook

# Test environment variables
npm run build && npm run start

# View webhook logs
stripe logs tail
```

### Support Resources
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Supabase Environment Setup](https://supabase.com/docs/guides/cli/config)

---

*Configured webhook system enables real-time payment transparency and automated customer communications for seamless project management.*