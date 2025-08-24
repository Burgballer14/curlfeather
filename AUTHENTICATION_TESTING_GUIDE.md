# Customer Authentication System Testing Guide

## Phase 2.6: Customer Authentication System Testing

### Overview
This guide provides comprehensive testing procedures for the customer authentication system integrated with the Phase 2 database schema and Stripe payment system.

---

## 🔧 1. Authentication System Components

### Core Components
- **Auth Client** ([`auth-client.ts`](src/lib/auth/auth-client.ts)) - Supabase authentication integration
- **Auth Modal** ([`AuthModal.tsx`](src/components/auth/AuthModal.tsx)) - Sign-up/sign-in UI component
- **Customer Portal** ([`customer-portal/page.tsx`](src/app/customer-portal/page.tsx)) - Protected customer dashboard
- **Database Schema** - Phase 2 customer_profiles table with RLS policies

### Database Schema Integration
```sql
-- customer_profiles table structure
id: uuid (primary key, references auth.users)
email: varchar
first_name: varchar
last_name: varchar
phone: varchar
address: jsonb
project_ids: text[]
stripe_customer_id: varchar
communication_preferences: jsonb
created_at: timestamp
updated_at: timestamp
```

---

## 🧪 2. Testing Endpoints

### Authentication Test API
**Base URL**: `/api/auth/test`

#### Available Test Types:

| Test Type | Endpoint | Description |
|-----------|----------|-------------|
| Basic Config | `GET /api/auth/test?type=basic` | Tests Supabase configuration |
| Database Schema | `GET /api/auth/test?type=database` | Verifies Phase 2 table access |
| Customer Profile | `GET /api/auth/test?type=customer_profile` | Tests profile creation workflow |
| Project Association | `GET /api/auth/test?type=project_association` | Tests customer-project linking |
| RLS Policies | `GET /api/auth/test?type=rls` | Verifies row-level security |

#### Example Test Commands:
```bash
# Test basic configuration
curl http://localhost:3000/api/auth/test?type=basic

# Test database schema
curl http://localhost:3000/api/auth/test?type=database

# Test customer profile creation
curl http://localhost:3000/api/auth/test?type=customer_profile

# Test project association
curl http://localhost:3000/api/auth/test?type=project_association

# Test RLS policies
curl http://localhost:3000/api/auth/test?type=rls
```

---

## 📋 3. Manual Testing Checklist

### Pre-Testing Setup
- [ ] Supabase project configured
- [ ] Environment variables set (.env.local)
- [ ] Phase 2 database schema applied
- [ ] RLS policies enabled
- [ ] Development server running

### Authentication Flow Testing

#### 3.1 Customer Sign-Up
- [ ] **Access customer portal**: `http://localhost:3000/customer-portal`
- [ ] **Click "Create Account"** button
- [ ] **Fill sign-up form**:
  - Email: `test@example.com`
  - Name: `John Smith`
  - Phone: `(555) 123-4567`
  - Password: `testpassword123`
  - Confirm Password: `testpassword123`
- [ ] **Submit form** and verify:
  - ✅ Success message displayed
  - ✅ Verification email sent (check Supabase logs)
  - ✅ Customer profile created in database
  - ✅ Stripe customer created automatically

#### 3.2 Email Verification
- [ ] **Check Supabase inbox** (or test email)
- [ ] **Click verification link**
- [ ] **Verify email confirmed** in Supabase Auth dashboard

#### 3.3 Customer Sign-In
- [ ] **Return to customer portal**
- [ ] **Click "Sign In"** button
- [ ] **Enter credentials**:
  - Email: `test@example.com`
  - Password: `testpassword123`
- [ ] **Submit form** and verify:
  - ✅ Successful login
  - ✅ Redirected to customer dashboard
  - ✅ User data loaded correctly

#### 3.4 Password Reset
- [ ] **Click "Forgot your password?"**
- [ ] **Enter email address**
- [ ] **Submit reset request** and verify:
  - ✅ Reset email sent
  - ✅ Reset link functional
  - ✅ Password update works

#### 3.5 Session Management
- [ ] **Refresh page** - verify user stays logged in
- [ ] **Close/reopen browser** - verify session persistence
- [ ] **Sign out** - verify clean logout
- [ ] **Access protected routes** - verify redirect to auth

---

## 🔗 4. Database Integration Testing

### Customer Profile Creation
```sql
-- Verify customer profile was created
SELECT * FROM customer_profiles WHERE email = 'test@example.com';

-- Check required fields
SELECT 
  id, email, first_name, last_name, phone,
  stripe_customer_id, project_ids, created_at
FROM customer_profiles 
WHERE email = 'test@example.com';
```

### Project Association Testing
```sql
-- Create test project
INSERT INTO projects (id, name, customer_id, status, created_at)
VALUES ('test-project-123', 'Test Project', '[customer-id]', 'planning', NOW());

-- Associate customer with project
UPDATE customer_profiles 
SET project_ids = array_append(project_ids, 'test-project-123')
WHERE email = 'test@example.com';

-- Verify association
SELECT email, project_ids FROM customer_profiles 
WHERE email = 'test@example.com';
```

### Row Level Security (RLS) Testing
```sql
-- Test RLS policies are enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('customer_profiles', 'projects', 'project_milestones');

-- Verify policies exist
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('customer_profiles', 'projects', 'project_milestones');
```

---

## 🚨 5. Error Handling Testing

### Invalid Credentials
- [ ] **Test invalid email**: `invalid@email.com`
- [ ] **Test wrong password**: `wrongpassword`
- [ ] **Verify error messages** are user-friendly

### Duplicate Registration
- [ ] **Try registering same email twice**
- [ ] **Verify duplicate prevention**
- [ ] **Check error handling**

### Network Failures
- [ ] **Disconnect internet** during auth request
- [ ] **Verify timeout handling**
- [ ] **Test retry mechanisms**

### Database Errors
- [ ] **Simulate database connection issues**
- [ ] **Verify graceful degradation**
- [ ] **Check error logging**

---

## 🔒 6. Security Testing

### Authentication Security
- [ ] **Password complexity** enforcement
- [ ] **SQL injection** prevention in auth forms
- [ ] **XSS protection** in user inputs
- [ ] **CSRF protection** on auth endpoints

### Session Security
- [ ] **JWT token validation**
- [ ] **Session timeout** functionality
- [ ] **Secure cookie** settings
- [ ] **Multi-tab** session sync

### Data Protection
- [ ] **Email validation** prevents invalid formats
- [ ] **Phone number** sanitization
- [ ] **Address data** validation
- [ ] **PII encryption** in database

---

## 📊 7. Performance Testing

### Load Testing
```bash
# Test concurrent sign-ups
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/test \
    -H "Content-Type: application/json" \
    -d '{"action":"signup_workflow","testData":{"email":"test'$i'@example.com"}}' &
done
```

### Database Performance
```sql
-- Check query performance
EXPLAIN ANALYZE 
SELECT * FROM customer_profiles WHERE email = 'test@example.com';

-- Index verification
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'customer_profiles';
```

---

## 🔧 8. Integration Testing

### Stripe Integration
- [ ] **Customer profile creation** triggers Stripe customer
- [ ] **Profile updates** sync to Stripe
- [ ] **Customer deletion** handles Stripe cleanup

### Email Integration
- [ ] **Welcome emails** sent on registration
- [ ] **Verification emails** functional
- [ ] **Password reset emails** working
- [ ] **Project notifications** delivered

### Project System Integration
- [ ] **Customer-project association** working
- [ ] **Project access control** enforced
- [ ] **Milestone permissions** correct
- [ ] **Payment permissions** validated

---

## 📋 9. Test Results Documentation

### Expected Results Template
```json
{
  "testSuite": "customer_authentication",
  "timestamp": "2024-01-15T10:30:00Z",
  "environment": "development",
  "results": {
    "signup": "✅ PASS",
    "signin": "✅ PASS", 
    "passwordReset": "✅ PASS",
    "sessionManagement": "✅ PASS",
    "databaseIntegration": "✅ PASS",
    "stripeIntegration": "✅ PASS",
    "rlsPolicies": "✅ PASS",
    "errorHandling": "✅ PASS",
    "security": "✅ PASS",
    "performance": "✅ PASS"
  },
  "issues": [],
  "recommendations": []
}
```

---

## 🚀 10. Next Steps

After successful authentication testing:
1. ✅ **Phase 2.6 Complete** - Customer Authentication System
2. 🔄 **Phase 2.7** - End-to-End Payment Workflow Testing
3. 🔄 **Phase 2.8** - Production Deployment & Verification

### Production Readiness Checklist
- [ ] All authentication tests passing
- [ ] RLS policies enforced
- [ ] Error handling robust
- [ ] Performance acceptable
- [ ] Security measures verified
- [ ] Integration points functional

---

## 🆘 11. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Supabase connection failed | Check environment variables |
| RLS blocking queries | Verify user context in policies |
| Email verification not working | Check Supabase email settings |
| Stripe customer not created | Verify webhook configuration |
| Session not persisting | Check cookie settings |

### Debug Commands
```bash
# Check Supabase logs
npx supabase logs

# Test database connection
npx supabase db ping

# Verify environment variables
npm run env:check

# Clear local storage
localStorage.clear()
```

---

*Comprehensive authentication testing ensures secure, reliable customer access to the project transparency platform.*