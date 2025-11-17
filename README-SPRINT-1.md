# Croozer - WhatsApp Order Management Platform
## Sprint 1: Multi-Tenant Foundation Complete ✅

**Version**: 1.0.0 (Sprint 1)
**Status**: Ready for Meta API Configuration
**Last Updated**: 2025-10-21

---

## Overview

Croozer is a **multi-tenant WhatsApp Business API platform** designed to help small and medium-sized businesses (SMBs) like pizzerias, restaurants, and retail stores manage customer orders through WhatsApp.

### Key Features (Sprint 1)
- ✅ Multi-tenant architecture supporting unlimited businesses
- ✅ Secure WhatsApp Business API integration per business
- ✅ Encrypted token storage (AES-256-CBC)
- ✅ Complete order management system (database models)
- ✅ Customer relationship management
- ✅ Product/menu catalog
- ✅ Automated order tracking and status updates

---

## Quick Start

### 1. Installation

```bash
# Install dependencies
pnpm install

# Generate encryption keys
pnpm dlx tsx scripts/generate-encryption-keys.ts
```

### 2. Configuration

Follow [META-SETUP-CHECKLIST.md](META-SETUP-CHECKLIST.md) to:
1. Set up Meta Business Manager
2. Create System User with admin permissions
3. Get WhatsApp Business App credentials
4. Configure environment variables

### 3. Verify Setup

```bash
# Test Meta API configuration
pnpm dlx tsx scripts/test-meta-api.ts
```

### 4. Create Test Business

```bash
# Create test business with WhatsApp connection
pnpm dlx tsx scripts/create-test-business.ts
```

### 5. Test WhatsApp Service

```bash
# Test multi-tenant service (replace with your business ID)
pnpm dlx tsx scripts/test-whatsapp-service.ts <business_id> +972501234567
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [IMPLEMENTATION-ROADMAP.md](IMPLEMENTATION-ROADMAP.md) | Complete 3-sprint implementation plan |
| [META-SETUP-CHECKLIST.md](META-SETUP-CHECKLIST.md) | Step-by-step Meta Business Platform setup |
| [SPRINT-1-SUMMARY.md](SPRINT-1-SUMMARY.md) | What was completed in Sprint 1 |
| [QUICK-START.md](QUICK-START.md) | Quick testing guide |
| [README-SPRINT-1.md](README-SPRINT-1.md) | This file |

---

## Architecture

### Database Models

#### 1. Business (`app/models/Business.ts`)
Central business entity with settings, subscription, and onboarding status.

**Key Fields**:
- `userId` - Owner Facebook ID
- `name`, `type`, `phone`, `email` - Business details
- `whatsappAccountId` - Reference to WhatsApp account
- `status` - active | suspended | trial | pending_setup
- `subscription` - Plan, features, expiration

**Methods**:
- `isActive()` - Check if business is active
- `hasWhatsAppConnected()` - Check WhatsApp connection
- `isSubscriptionActive()` - Check subscription validity

---

#### 2. BusinessWhatsAppAccount (`app/models/BusinessWhatsAppAccount.ts`)
Per-business WhatsApp credentials (encrypted).

**Key Fields**:
- `businessId` - One-to-one with Business
- `whatsappBusinessAccountId` - Meta WABA ID
- `phoneNumberId` - WhatsApp phone number ID
- `accessToken` - **Encrypted** access token
- `status` - pending | active | suspended | disconnected | error
- `permissions` - Meta API permissions granted
- `tier` - Messaging limit tier (free | core | business | unlimited)

**Methods**:
- `isActive()` - Check if account is active
- `isHealthy()` - Check health status
- `needsTokenRefresh()` - Check if token needs refresh
- `updateLastMessageSent()` - Update message timestamp
- `markAsError(message)` - Mark account as error state

---

#### 3. Order (`app/models/Order.ts`)
Complete order management with items, pricing, delivery, and timeline.

**Key Fields**:
- `businessId`, `customerId` - Relations
- `orderNumber` - Auto-generated unique ID (e.g., ORD-20251021-0001)
- `items[]` - Order items with variants, pricing
- `total`, `subtotal`, `tax`, `deliveryFee` - Pricing
- `status` - pending | confirmed | preparing | ready | out_for_delivery | delivered | cancelled
- `paymentStatus` - pending | paid | refunded | cancelled
- `source` - whatsapp | manual | web | phone
- `deliveryType` - pickup | delivery
- `timeline[]` - Status change history

**Methods**:
- `isPending()`, `isCompleted()`, `isCancelled()` - Status checks
- `canBeCancelled()` - Check if cancellation allowed
- `calculateTotal()` - Recalculate order total

**Static Methods**:
- `generateOrderNumber(businessId)` - Auto-generate unique order number

---

#### 4. Customer (`app/models/Customer.ts`)
Customer contact database with automatic segmentation.

**Key Fields**:
- `businessId`, `whatsappPhone` - Unique per business
- `name`, `email`, `defaultAddress` - Contact info
- `totalOrders`, `totalSpent`, `averageOrderValue` - Statistics
- `segment` - new | regular | vip | at_risk | inactive (auto-assigned)
- `tags[]` - Custom tags
- `preferredLanguage` - he | en | ar
- `conversationStatus` - active | inactive | blocked

**Methods**:
- `isVIP()` - Check if VIP customer
- `updateOrderStats(amount)` - Update statistics after order

**Static Methods**:
- `findOrCreate(businessId, phone, data)` - Find or create customer
- `findVIPCustomers(businessId)` - Get VIP customers
- `findAtRiskCustomers(businessId)` - Get at-risk customers

**Auto-Segmentation Logic**:
- `new` - 0 orders
- `regular` - 3+ orders, <1000 ILS spent
- `vip` - 1000+ ILS spent
- `at_risk` - No order in 30+ days
- `inactive` - No order in 90+ days

---

#### 5. Product (`app/models/Product.ts`)
Menu/product catalog with variants and availability.

**Key Fields**:
- `businessId` - Owner business
- `name`, `nameHe` - Product name (English + Hebrew)
- `price`, `currency` - Pricing
- `category`, `subcategory`, `tags[]` - Categorization
- `hasVariants`, `variants[]` - Size/toppings/options
- `trackInventory`, `stockQuantity` - Inventory management
- `available`, `availableFrom`, `availableUntil`, `availableDays[]` - Availability rules
- `images[]` - Product images
- `displayOrder`, `featured` - Display settings

**Methods**:
- `isAvailable()` - Check availability (time, day, stock)
- `isInStock()` - Check inventory
- `getPriceWithVariants(selectedVariants)` - Calculate price with variants

**Static Methods**:
- `findAvailableProducts(businessId)` - Get available products
- `findByCategory(businessId, category)` - Filter by category
- `incrementOrderCount(productId, amount)` - Update statistics
- `decrementStock(productId, quantity)` - Reduce inventory

---

### Services

#### MultiTenantWhatsAppService (`app/lib/services/MultiTenantWhatsAppService.ts`)
Core service for multi-tenant WhatsApp messaging.

**Methods**:

```typescript
// Send text message
await MultiTenantWhatsAppService.sendTextMessage(businessId, {
  phoneNumber: '+972501234567',
  message: 'Hello from Croozer!'
});

// Send template message
await MultiTenantWhatsAppService.sendTemplateMessage(businessId, {
  phoneNumber: '+972501234567',
  templateName: 'order_confirmation',
  languageCode: 'he',
  components: [...]
});

// Get templates
await MultiTenantWhatsAppService.getTemplates(businessId);

// Test connection
await MultiTenantWhatsAppService.testConnection(businessId);

// Check account status
await MultiTenantWhatsAppService.getAccountStatus(businessId);

// Check if has active account
await MultiTenantWhatsAppService.hasActiveAccount(businessId);
```

**Features**:
- Fetches business-specific credentials from database
- Decrypts access tokens on-the-fly
- Handles Meta API errors with specific messages
- Updates last message timestamp
- Marks accounts as error when token is invalid

---

#### EncryptionService (`app/lib/services/EncryptionService.ts`)
Secure encryption/decryption for access tokens.

**Methods**:

```typescript
// Encrypt sensitive data
const encrypted = EncryptionService.encrypt('my_access_token');

// Decrypt sensitive data
const decrypted = EncryptionService.decrypt(encrypted);

// Generate new keys
const key = EncryptionService.generateKey(); // 64 char hex
const iv = EncryptionService.generateIV();   // 32 char hex

// Validate configuration
EncryptionService.validateConfiguration();

// Test encryption roundtrip
EncryptionService.test();
```

**Security**:
- AES-256-CBC encryption
- 32-byte key (256 bits)
- 16-byte IV (128 bits)
- Environment-based key management
- No keys stored in code

---

## Scripts

### Production Scripts

#### `test-meta-api.ts`
Verifies Meta Business Platform configuration.

```bash
pnpm dlx tsx scripts/test-meta-api.ts
```

**Tests**:
- ✅ Environment variables
- ✅ System User token validity
- ✅ Business Manager access
- ✅ WhatsApp Business Accounts
- ✅ Phone numbers
- ✅ Message templates
- ✅ Webhook configuration

---

#### `generate-encryption-keys.ts`
Generates secure encryption keys for `.env`.

```bash
pnpm dlx tsx scripts/generate-encryption-keys.ts
```

**Outputs**:
- `ENCRYPTION_KEY` (64 char hex)
- `ENCRYPTION_IV` (32 char hex)
- `WEBHOOK_VERIFY_TOKEN` (64 char hex)

---

#### `create-test-business.ts`
Creates a test business with WhatsApp connection.

```bash
pnpm dlx tsx scripts/create-test-business.ts
```

**Creates**:
- Test Business (Test Pizzeria)
- WhatsApp Account (with encrypted token)
- Links them together

---

#### `test-whatsapp-service.ts`
Tests multi-tenant WhatsApp service.

```bash
pnpm dlx tsx scripts/test-whatsapp-service.ts <business_id> [phone_number]
```

**Tests**:
1. Account status check
2. Connection test
3. Active account verification
4. Template fetching
5. Message sending (if phone provided)

---

## Environment Variables

### Required Variables

```env
# Database
MONGODB_URI=mongodb+srv://...

# Meta Business Platform
META_BUSINESS_MANAGER_ID=your_business_id
META_SYSTEM_USER_ACCESS_TOKEN=your_system_user_token
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
NEXT_PUBLIC_META_CONFIGURATION_ID=your_config_id

# WhatsApp (for testing)
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
WHATSAPP_PHONE_NUMBER_ID=your_phone_id

# Security
ENCRYPTION_KEY=64_character_hex_string
ENCRYPTION_IV=32_character_hex_string
WEBHOOK_VERIFY_TOKEN=random_secure_string

# Webhook
NEXT_PUBLIC_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp
```

See [META-SETUP-CHECKLIST.md](META-SETUP-CHECKLIST.md) for how to obtain these values.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.1.0 (App Router) |
| Language | TypeScript |
| Database | MongoDB (Mongoose 8.18.0) |
| Authentication | Facebook OAuth |
| UI | React 19, Tailwind CSS, shadcn/ui |
| API | WhatsApp Business API (Graph API v22.0) |
| Email | Resend |
| Encryption | Node.js crypto (AES-256-CBC) |

---

## Sprint Roadmap

### ✅ Sprint 1: Foundation (COMPLETED)
- [x] Database models (Business, Order, Customer, Product, WhatsAppAccount)
- [x] Multi-tenant WhatsApp service
- [x] Encryption service
- [x] Meta API verification scripts
- [x] Documentation

### 🔄 Sprint 2: Core Functionality (NEXT)
- [ ] Embedded Signup UI (businesses connect WhatsApp)
- [ ] Meta OAuth backend
- [ ] Webhook receiver for incoming messages
- [ ] Order creation from WhatsApp messages
- [ ] Order management APIs
- [ ] Orders dashboard tab
- [ ] Real-time message sync

### 🔜 Sprint 3: Polish & Testing
- [ ] AI message parser (order extraction)
- [ ] Customer management UI
- [ ] Menu/product management UI
- [ ] Security hardening (rate limiting, RBAC)
- [ ] Admin analytics
- [ ] Load testing
- [ ] Production deployment

---

## Testing

### Unit Tests (Planned)
```bash
pnpm test
```

### Integration Tests (Planned)
```bash
pnpm test:integration
```

### Manual Testing
See [QUICK-START.md](QUICK-START.md) for step-by-step testing guide.

---

## Deployment

### Prerequisites
- MongoDB Atlas (or self-hosted MongoDB)
- Meta Business Manager account (verified)
- WhatsApp Business API app (approved)
- Domain with SSL certificate

### Environment Setup
1. Create production `.env` file
2. Set all required environment variables
3. Disable `NEXT_PUBLIC_BYPASS_AUTH`
4. Update `NEXT_PUBLIC_WEBHOOK_URL` to production domain

### Build & Deploy
```bash
# Build
pnpm build

# Start production server
pnpm start
```

---

## Security Considerations

### ✅ Implemented
- [x] Encrypted access tokens (AES-256-CBC)
- [x] Environment-based secrets management
- [x] No hardcoded credentials
- [x] Input validation (Mongoose schemas)
- [x] Compound unique indexes (prevent duplicates)

### 🔜 Planned (Sprint 3)
- [ ] Webhook signature verification
- [ ] Rate limiting (API endpoints)
- [ ] RBAC (role-based access control)
- [ ] Audit logging
- [ ] CSRF protection
- [ ] Session management

---

## API Limits & Quotas

### WhatsApp Business API
- **Free Tier**: 1,000 conversations/month
- **Core Tier**: 10,000 conversations/month
- **Business Tier**: 100,000 conversations/month
- **Unlimited Tier**: Unlimited conversations

### Message Types
- **Text Messages**: Only within 24-hour window (after customer message)
- **Template Messages**: Can be sent anytime (no 24-hour limit)

### Rate Limits
- **Messages**: 80 messages/second per phone number
- **API Calls**: 200 requests/hour per business

---

## Troubleshooting

### Common Issues

#### 1. "WhatsApp account not configured for this business"
**Solution**: Create BusinessWhatsAppAccount entry for the business
```bash
pnpm dlx tsx scripts/create-test-business.ts
```

#### 2. "Failed to decrypt access token"
**Solution**: Regenerate encryption keys
```bash
pnpm dlx tsx scripts/generate-encryption-keys.ts
```

#### 3. "Cannot send text message: 24-hour window expired"
**Solution**: Use template messages or wait for customer to message first

#### 4. "Access token expired or invalid" (Error 190)
**Solution**: Regenerate System User token in Meta Business Manager

#### 5. Meta API test script fails
**Solution**: Follow [META-SETUP-CHECKLIST.md](META-SETUP-CHECKLIST.md)

---

## Support & Resources

### Documentation
- Meta Business Platform: https://business.facebook.com/
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp
- Meta for Developers: https://developers.facebook.com/

### Internal Docs
- [IMPLEMENTATION-ROADMAP.md](IMPLEMENTATION-ROADMAP.md) - Full roadmap
- [META-SETUP-CHECKLIST.md](META-SETUP-CHECKLIST.md) - Setup guide
- [QUICK-START.md](QUICK-START.md) - Quick testing guide

---

## Contributing

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional commits

### Pull Request Process
1. Create feature branch
2. Write tests
3. Update documentation
4. Submit PR with detailed description

---

## License

Proprietary - All rights reserved

---

## Changelog

### Version 1.0.0 (Sprint 1) - 2025-10-21
- ✅ Initial release
- ✅ Multi-tenant architecture
- ✅ Database models (5 models)
- ✅ Multi-tenant WhatsApp service
- ✅ Encryption service
- ✅ Test scripts
- ✅ Complete documentation

---

## Next Steps

### For Developers
1. Complete [META-SETUP-CHECKLIST.md](META-SETUP-CHECKLIST.md)
2. Run `pnpm dlx tsx scripts/test-meta-api.ts`
3. Create test business: `pnpm dlx tsx scripts/create-test-business.ts`
4. Test service: `pnpm dlx tsx scripts/test-whatsapp-service.ts <business_id>`
5. Proceed to Sprint 2

### For Business Users
1. Wait for Sprint 2 completion (Embedded Signup UI)
2. Connect your WhatsApp Business account through the UI
3. Start receiving orders via WhatsApp
4. Manage orders through the dashboard

---

**Status**: 🟢 Sprint 1 Complete - Ready for Meta API Configuration

**Built with ❤️ for small businesses in Israel** 🇮🇱
