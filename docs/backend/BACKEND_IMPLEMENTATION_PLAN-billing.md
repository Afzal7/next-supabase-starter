# BACKEND_IMPLEMENTATION_PLAN-billing.md

## 1. Executive Summary

This backend implementation plan transforms the billing design spec into a production-ready system using Stripe as the primary payment processor. The architecture leverages Stripe Pages extensively: Stripe Checkout for trial initiation and pro plan purchases, and Stripe Billing portal for subscription management (updating payment methods, viewing invoices, cancelling subscriptions). Backend responsibilities are minimized to webhook handling, user plan status management, and session creation for Stripe Pages.

Key design decisions:
- **Stripe-First Approach**: All payment UI handled by Stripe to reduce PCI compliance burden and leverage Stripe's optimized flows.
- **Webhook-Driven Updates**: Subscription status changes (activations, cancellations, failures) update user records via Stripe webhooks.
- **Minimal Custom UI**: Only trial confirmation modal and plan selection; all payment forms use Stripe.
- **Plan-Based Access Control**: User plan status determines feature access, cached for performance.

Technology stack: NextJS API routes, Supabase for user data, Stripe SDK for integrations, RTK Query for frontend state.

Implementation timeline: 2-3 weeks for MVP, with phases for Stripe setup, checkout integration, portal integration, and webhook handling.

Critical assumptions: Stripe account configured, webhook endpoints secured, user authentication via Supabase.

## 2. Data Architecture

### Database Schema Design

Create new subscriptions table for billing data (users table is protected):

**subscriptions table:**
- `id: uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id: uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE` (one subscription per user)
- `plan_type: text DEFAULT 'free' CHECK (plan_type IN ('free', 'trial', 'pro'))`
- `subscription_status: text DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'))`
- `stripe_customer_id: text UNIQUE` (Stripe customer ID)
- `trial_end_date: timestamp` (for trial tracking and UI calculations)
- `subscription_id: text` (Stripe subscription ID)
- `current_period_end: timestamp` (subscription end date for UI calculations)
- `created_at: timestamp DEFAULT now()`
- `updated_at: timestamp DEFAULT now()`

**Indexes:**
- `idx_subscriptions_user_id` on user_id (for user lookups)
- `idx_subscriptions_stripe_customer_id` on stripe_customer_id (for webhook lookups)
- `idx_subscriptions_plan_type` on plan_type (for feature gating queries)
- `idx_subscriptions_subscription_status` on subscription_status (for status checks)

**Notes:**
- Trial and expiry dates are used for client-side calculations to determine if subscription is active (e.g., current time < trial_end_date or current_period_end).
- Updated_at should be manually updated on changes (no automatic triggers needed for MVP).

**Relations:**
- subscriptions.user_id → users.id (one-to-one relationship, one subscription per user)

**Row-Level Security Policies:**
- No RLS required - access controlled at application level.

**Enums:**
- PlanType: 'free', 'trial', 'pro'
- SubscriptionStatus: 'inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'

## 3. API Specification

### POST /api/billing/create-checkout-session
Creates Stripe Checkout session for trial or pro purchase.

**Request:**
- Body: `{ mode: 'trial' | 'subscription', priceId: string }`
- Auth: Required (user must be logged in)

**Response (200):**
- `{ url: string }` (redirect URL to Stripe Checkout)

**Error Responses:**
- 400: Invalid price ID or mode
- 401: Unauthorized
- 500: Stripe error

**Business Logic:**
- Create Stripe customer if not exists
- Set up session with trial (no payment) or subscription (with payment)
- Redirect user to Stripe Checkout

### POST /api/billing/create-portal-session
Creates Stripe Billing portal session for subscription management.

**Request:**
- Body: `{}` (empty)
- Auth: Required, user must have active subscription

**Response (200):**
- `{ url: string }` (redirect URL to Stripe Billing portal)

**Error Responses:**
- 400: No active subscription
- 401: Unauthorized
- 500: Stripe error

**Business Logic:**
- Verify user has subscription
- Create portal session with return URL
- Redirect to portal for self-service management

### POST /api/billing/webhook
Stripe webhook endpoint for subscription events.

**Request:**
- Body: Stripe webhook payload
- Headers: Stripe signature for verification

**Response (200):**
- `{ received: true }`

**Error Responses:**
- 400: Invalid signature or payload

**Business Logic:**
- Verify webhook signature
- Handle events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
- Update user plan status accordingly
- Send notifications if needed

### GET /api/billing/plan
Get current user's billing plan information.

**Request:**
- Query: None
- Auth: Required

**Response (200):**
- `{ planType: string, status: string, trialEndDate?: string, currentPeriodEnd?: string }`

**Error Responses:**
- 401: Unauthorized

**Business Logic:**
- Return user's current plan data from database

## 4. TypeScript & Validation Architecture

### Database Types
```typescript
type Subscription = {
  id: string;
  user_id: string;
  plan_type: 'free' | 'trial' | 'pro';
  subscription_status: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  stripe_customer_id?: string;
  trial_end_date?: Date;
  subscription_id?: string;
  current_period_end?: Date;
  created_at: Date;
  updated_at: Date;
};
```

### Request/Response DTOs with Zod
```typescript
import { z } from 'zod';

const CreateCheckoutRequestSchema = z.object({
  mode: z.enum(['trial', 'subscription']),
  priceId: z.string(),
});

const CreatePortalRequestSchema = z.object({});

const PlanResponseSchema = z.object({
  planType: z.enum(['free', 'trial', 'pro']),
  status: z.enum(['inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid']),
  trialEndDate: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
});

type CreateCheckoutRequest = z.infer<typeof CreateCheckoutRequestSchema>;
type PlanResponse = z.infer<typeof PlanResponseSchema>;
```

### API Response Envelope
Standardized as before.

## 5. Service Layer & Middleware

### Services
**stripe.service.ts:**
- createCustomer(userId): Create Stripe customer, store ID
- createCheckoutSession(userId, mode, priceId): Create checkout session
- createPortalSession(userId): Create billing portal session
- updateUserPlan(userId, updates): Update user billing fields

**billing.service.ts:**
- getUserPlan(userId): Fetch user plan data
- handleWebhook(event): Process Stripe webhook events

### Middleware
**webhook.middleware.ts:**
- Verify Stripe webhook signature using stripe.webhooks.constructEvent
- Parse JSON payload
- Pass to handler

## 6. Scalability & Future Planning

**Scalability Challenges:**
- Webhook volume during peak subscription events
- Database updates on status changes

**Strategies:**
- Webhook queue with retry logic
- Cache user plan data in Redis
- Read replicas for plan queries

**Stripe Integration Benefits:**
- Stripe handles payment processing scale
- Portal offloads management UI
- Webhooks are reliable and retried by Stripe

## 7. RTK Query Architecture

**Cache Tags:**
- 'Billing' for user plan data

**Endpoints:**
- getUserPlan: Query for current plan
- createCheckoutSession: Mutation to start checkout
- createPortalSession: Mutation to access portal

**Invalidation:**
- Webhook updates invalidate 'Billing' tag

## 8. Implementation Roadmap

**Phase 1: Stripe Setup**
- Configure Stripe account, products/prices
- Add billing fields to users table
- Set up webhook endpoint with signature verification

**Phase 2: Checkout Integration**
- Implement create-checkout-session API
- Handle trial vs subscription modes
- Test checkout flows

**Phase 3: Portal Integration**
- Implement create-portal-session API
- Configure portal settings in Stripe
- Test management flows

**Phase 4: Webhook Handling**
- Implement webhook processing
- Update user status on events
- Add notifications

## 9. Migration Strategy

**supabase/migrations/202511XX_XXXXXX_create_subscriptions_table.sql:**
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'trial', 'pro')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  stripe_customer_id TEXT UNIQUE,
  trial_end_date TIMESTAMP,
  subscription_id TEXT,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX idx_subscriptions_subscription_status ON subscriptions(subscription_status);
```

## 10. Environment & Security

**Required Environment Variables:**
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_PRICE_ID_FREE (optional, for free plan reference)
- STRIPE_PRICE_ID_TRIAL (for trial checkout)
- STRIPE_PRICE_ID_PRO (for pro subscription)

**Security:**
- Webhook signature verification
- HTTPS required for webhooks
- Stripe customer data not stored locally (only IDs)
- RLS policies protect billing data</content>
<parameter name="filePath">docs/backend/BACKEND_IMPLEMENTATION_PLAN-billing.md