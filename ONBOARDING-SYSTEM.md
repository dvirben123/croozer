# Multi-Tenant WhatsApp Onboarding System

## Overview

This document describes the complete multi-tenant WhatsApp Business onboarding system implemented for Croozer. The system allows businesses (restaurants, pizzerias, fast food) to onboard themselves, connect their WhatsApp accounts, build menus, and start receiving automated orders through WhatsApp conversations.

## Architecture

### Key Components

1. **Database Models** (`app/models/`)
   - `ConversationState.ts` - Tracks customer conversation flow and shopping cart
   - `MessageTemplate.ts` - Stores customizable message templates
   - `PaymentProvider.ts` - Manages payment provider credentials (encrypted)
   - `Business.ts` - Enhanced with category and payment providers
   - `Order.ts` - Enhanced with payment link and provider reference

2. **Services** (`app/lib/services/`)
   - `ConversationFlowService.ts` - Orchestrates automated WhatsApp conversations
   - `PaymentService.ts` - Handles payment link generation across providers
   - `MultiTenantWhatsAppService.ts` - Sends messages per business
   - `EncryptionService.ts` - Encrypts sensitive credentials

3. **API Endpoints** (`app/api/`)
   - `/onboarding/*` - Onboarding flow management
   - `/products/*` - Product CRUD operations
   - `/payments/*` - Payment provider management and webhooks
   - `/meta/*` - WhatsApp Embedded Signup integration
   - `/webhooks/whatsapp` - Incoming message handler

4. **UI Components** (`app/components/onboarding/`)
   - `WizardStepper.tsx` - Progress indicator
   - `BusinessDetailsStep.tsx` - Step 1: Business information
   - `CategorySelectionStep.tsx` - Step 2: Restaurant vs Fast Food
   - `MenuBuilderStep.tsx` - Step 3: Product catalog
   - `WhatsAppSetupStep.tsx` - Step 4: Connect WhatsApp
   - `PaymentSetupStep.tsx` - Step 5: Payment providers
   - `ConversationFlowStep.tsx` - Step 6: Message customization
   - `CompletionStep.tsx` - Step 7: Success screen

## Onboarding Flow

### Step 1: Business Details
- Business name, phone, email
- Physical address (optional)
- Business hours (optional)

### Step 2: Category Selection
- **Restaurant**: Full menu, table management, complex orders
- **Fast Food**: Simple menu, quick orders, delivery focus

### Step 3: Menu Builder
- Add products with variants (size, toppings, etc.)
- Set prices and availability
- Upload product images
- Organize by categories

### Step 4: WhatsApp Setup
- Click "Connect WhatsApp Business"
- Meta Embedded Signup dialog opens
- User authorizes with Facebook account
- System exchanges code for permanent access token
- Token encrypted and stored in database
- Webhook automatically subscribed

### Step 5: Payment Setup
- Add payment providers:
  - **International**: Stripe, PayPal
  - **Israeli**: Tranzila, Meshulam, Cardcom
- Set primary payment method
- Test mode vs production mode
- Credentials encrypted before storage

### Step 6: Conversation Flow
- Customize welcome message
- Preview conversation flow
- System automatically handles:
  1. Welcome message
  2. Category selection
  3. Product selection
  4. Variant configuration
  5. Cart management
  6. Checkout
  7. Payment link generation

### Step 7: Completion
- Summary of configuration
- Next steps checklist
- Redirect to dashboard

## Automated Conversation Flow

### Customer Journey

```
Customer sends message → Webhook receives
  ↓
Check ConversationState (24h TTL)
  ↓
New conversation:
  → Send welcome message
  → Show menu categories
  ↓
Customer selects category:
  → Show products in category
  ↓
Customer selects product:
  → If has variants: Show variant options
  → Else: Add to cart
  ↓
Customer configures variants:
  → Add to cart
  → Show cart summary
  ↓
Customer chooses action:
  → Add more items: Back to categories
  → Checkout: Create order
  → Clear cart: Start over
  ↓
Checkout:
  → Create order in database
  → Generate payment link
  → Send link via WhatsApp
  ↓
Customer completes payment:
  → Payment webhook received
  → Order status updated to 'confirmed'
  → Send confirmation message
  → Notify business owner
```

### Conversation State Management

- Each customer has a `ConversationState` document
- Tracks current step, shopping cart, and context
- Auto-expires after 24 hours
- Persists across messages

### Message Types

1. **Template Messages** (require Meta approval)
   - Welcome message
   - Order confirmation
   - Payment reminder

2. **Interactive Messages** (no approval needed)
   - Category selection
   - Product options
   - Cart actions

3. **Text Messages**
   - Order summary
   - Payment link
   - General responses

## Payment Integration

### Supported Providers

#### Stripe
- International credit cards
- Apple Pay, Google Pay
- Test mode available

#### PayPal
- PayPal balance
- Credit/debit cards
- Test sandbox available

#### Tranzila (Israel)
- Israeli credit cards
- Direct payment page
- Test mode available

#### Meshulam (Israel)
- Israeli credit cards
- Hosted payment page
- Sandbox environment

#### Cardcom (Israel)
- Israeli credit cards
- Low profile API
- Test environment

### Payment Flow

1. Order created in database
2. `PaymentService.createPaymentLink()` called
3. Primary provider selected
4. Provider-specific API called
5. Payment URL returned
6. URL sent to customer via WhatsApp
7. Customer completes payment
8. Webhook received
9. Order status updated
10. Confirmation sent

### Security

- All credentials encrypted with AES-256-CBC
- Webhook signatures verified
- Test mode clearly indicated
- Minimum/maximum amounts enforced

## Meta Embedded Signup

### Setup Requirements

1. **Meta Business Manager**
   - Business Manager ID
   - System User with admin permissions
   - Permanent access token

2. **WhatsApp App**
   - App ID and App Secret
   - WhatsApp product enabled
   - Embedded Signup configuration ID

3. **Environment Variables**
   ```env
   META_APP_ID=your_app_id
   META_APP_SECRET=your_app_secret
   NEXT_PUBLIC_META_CONFIGURATION_ID=your_config_id
   WEBHOOK_VERIFY_TOKEN=random_secure_string
   NEXT_PUBLIC_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp
   ```

### OAuth Flow

1. User clicks "Connect WhatsApp"
2. `WhatsAppConnectButton` launches FB.login()
3. Meta shows Embedded Signup dialog
4. User selects/creates WhatsApp Business Account
5. User authorizes permissions
6. Meta returns authorization code
7. Code sent to `/api/meta/exchange-token`
8. Server exchanges code for access token
9. Token encrypted and stored
10. Business updated with WhatsApp account reference
11. Webhook subscribed automatically

## Database Schema

### ConversationState
```typescript
{
  businessId: ObjectId,
  customerId: ObjectId,
  phoneNumber: string,
  currentStep: 'welcome' | 'category_selection' | ...,
  cart: IOrderItem[],
  context: {
    selectedCategory?: string,
    selectedProduct?: ObjectId,
    selectedVariants?: string[]
  },
  expiresAt: Date (TTL index)
}
```

### MessageTemplate
```typescript
{
  businessId: ObjectId,
  type: 'welcome' | 'order_confirmation' | ...,
  content: string,
  contentHe: string,
  variables: string[],
  templateId?: string (Meta template ID),
  approved: boolean,
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION'
}
```

### PaymentProvider
```typescript
{
  businessId: ObjectId,
  provider: 'stripe' | 'paypal' | 'tranzila' | ...,
  credentials: string (encrypted),
  webhookSecret: string,
  testMode: boolean,
  isPrimary: boolean,
  supportedCurrencies: string[],
  healthStatus: 'healthy' | 'error'
}
```

## API Reference

### Onboarding

#### POST /api/onboarding/start
Initialize onboarding for a user.

**Request:**
```json
{
  "userId": "facebook_user_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "business_id",
    "onboarding": {
      "completed": false,
      "currentStep": 0
    }
  }
}
```

#### PUT /api/onboarding/step
Save progress for a step.

**Request:**
```json
{
  "businessId": "business_id",
  "stepNumber": 1,
  "stepName": "step_1",
  "data": {
    "name": "Pizza Plus",
    "phone": "0501234567"
  }
}
```

#### GET /api/onboarding/status
Get current onboarding status.

**Query:** `?businessId=xxx` or `?userId=xxx`

### Products

#### GET /api/products
List products for a business.

**Query:** `?businessId=xxx&category=pizza&available=true`

#### POST /api/products
Create a new product.

**Request:**
```json
{
  "businessId": "business_id",
  "name": "Margherita Pizza",
  "nameHe": "פיצה מרגריטה",
  "price": 45,
  "category": "pizza",
  "hasVariants": true,
  "variants": [
    {
      "name": "Size",
      "required": true,
      "options": [
        { "label": "Small", "priceModifier": 0 },
        { "label": "Large", "priceModifier": 15 }
      ]
    }
  ]
}
```

#### PUT /api/products/[id]
Update a product.

#### DELETE /api/products/[id]
Delete a product.

### Payments

#### GET /api/payments/providers
List payment providers for a business.

**Query:** `?businessId=xxx`

#### POST /api/payments/providers
Add a payment provider.

**Request:**
```json
{
  "businessId": "business_id",
  "provider": "stripe",
  "providerName": "Stripe",
  "credentials": {
    "apiKey": "sk_test_...",
    "publicKey": "pk_test_..."
  },
  "testMode": true,
  "isPrimary": true
}
```

#### POST /api/payments/create-link
Generate payment link for an order.

**Request:**
```json
{
  "businessId": "business_id",
  "orderId": "order_id",
  "amount": 100,
  "currency": "ILS",
  "customerPhone": "972501234567"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://checkout.stripe.com/..."
}
```

#### POST /api/payments/webhook/[provider]
Handle payment completion webhooks.

### Meta Integration

#### POST /api/meta/exchange-token
Exchange authorization code for access token.

**Request:**
```json
{
  "code": "authorization_code",
  "businessId": "business_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "whatsappAccountId": "account_id",
    "phoneNumber": "+972501234567",
    "displayName": "Pizza Plus"
  }
}
```

## Testing

### Manual Testing Checklist

1. **Onboarding Flow**
   - [ ] Start onboarding as new user
   - [ ] Complete all 7 steps
   - [ ] Verify data saved to database
   - [ ] Check business status changed to 'active'

2. **WhatsApp Connection**
   - [ ] Click "Connect WhatsApp"
   - [ ] Complete Meta authorization
   - [ ] Verify token encrypted in database
   - [ ] Check webhook subscribed

3. **Product Management**
   - [ ] Add product with variants
   - [ ] Edit product details
   - [ ] Delete product
   - [ ] Reorder products

4. **Conversation Flow**
   - [ ] Send message to business WhatsApp
   - [ ] Receive welcome message
   - [ ] Select category
   - [ ] Select product
   - [ ] Configure variants
   - [ ] Add to cart
   - [ ] Checkout
   - [ ] Receive payment link

5. **Payment Integration**
   - [ ] Add payment provider
   - [ ] Generate payment link
   - [ ] Complete payment (test mode)
   - [ ] Verify webhook received
   - [ ] Check order status updated

### Test Scripts

Create test scripts in `scripts/onboarding/`:

```typescript
// scripts/onboarding/test-full-flow.ts
// Simulates complete onboarding and order flow
```

## Deployment

### Environment Variables

```env
# Meta Business Platform
META_APP_ID=
META_APP_SECRET=
META_BUSINESS_MANAGER_ID=
META_SYSTEM_USER_ACCESS_TOKEN=
NEXT_PUBLIC_META_CONFIGURATION_ID=

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=

# Webhooks
WEBHOOK_VERIFY_TOKEN=
NEXT_PUBLIC_WEBHOOK_URL=

# Security
ENCRYPTION_KEY=
ENCRYPTION_IV=

# Database
MONGODB_URI=
```

### Production Checklist

- [ ] All environment variables set
- [ ] Encryption keys generated (64 char hex)
- [ ] Webhook URL publicly accessible (HTTPS)
- [ ] Meta app in production mode
- [ ] Payment providers in production mode
- [ ] Database backups configured
- [ ] Error monitoring enabled (Sentry)
- [ ] Rate limiting configured
- [ ] CORS properly configured

## Security Considerations

1. **Credential Encryption**
   - All access tokens encrypted with AES-256-CBC
   - Payment credentials encrypted before storage
   - Encryption keys stored in environment variables

2. **Webhook Verification**
   - Meta webhook signature verified
   - Payment webhook signatures verified
   - Invalid requests rejected

3. **Access Control**
   - Users can only access their own businesses
   - Business ID validated on all API calls
   - WhatsApp messages routed to correct business

4. **Data Privacy**
   - Customer phone numbers hashed
   - Payment details never stored
   - Conversation states auto-expire

## Troubleshooting

### Common Issues

**Issue**: WhatsApp connection fails
- Check META_CONFIGURATION_ID is correct
- Verify app permissions include WhatsApp
- Ensure webhook URL is publicly accessible

**Issue**: Payment link generation fails
- Check payment provider credentials
- Verify provider is active and primary
- Check amount is within allowed range

**Issue**: Messages not received
- Verify webhook subscribed
- Check WEBHOOK_VERIFY_TOKEN matches
- Ensure phone number ID is correct

**Issue**: Conversation flow stuck
- Check ConversationState in database
- Verify products exist and are available
- Check for errors in logs

## Future Enhancements

1. **AI-Powered Order Parsing**
   - Natural language understanding
   - Handle free-text orders
   - Multi-language support

2. **Advanced Analytics**
   - Conversion funnel tracking
   - Popular products analysis
   - Customer segmentation

3. **Multi-Channel Support**
   - Instagram Direct integration
   - Facebook Messenger
   - SMS fallback

4. **Enhanced Automation**
   - Scheduled messages
   - Abandoned cart recovery
   - Loyalty programs

## Support

For issues or questions:
- Check logs in `/api/webhooks/whatsapp`
- Review conversation states in database
- Contact support with business ID and timestamp

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-20  
**Author**: Croozer Development Team

