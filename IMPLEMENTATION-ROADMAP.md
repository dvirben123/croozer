# Croozer - WhatsApp Order Management System
## Multi-Tenant Implementation Roadmap

**Last Updated**: 2025-10-21
**Project Goal**: Build a multi-tenant WhatsApp Business API platform for SMBs (pizzerias, restaurants, retail stores) to manage orders through WhatsApp

---

## Table of Contents
1. [Current State Assessment](#current-state-assessment)
2. [Architecture Overview](#architecture-overview)
3. [Implementation Phases](#implementation-phases)
4. [Sprint Breakdown](#sprint-breakdown)
5. [Meta API Requirements Checklist](#meta-api-requirements-checklist)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Testing Strategy](#testing-strategy)

---

## Current State Assessment

### ✅ What's Working
- [x] Facebook OAuth authentication
- [x] Contact form with email notifications
- [x] Basic WhatsApp API integration (single account)
- [x] Dashboard with mock analytics
- [x] Admin leads management
- [x] MongoDB data persistence
- [x] Responsive UI with Hebrew RTL support

### ⚠️ Partially Implemented
- [ ] WhatsApp message history (shows mock data)
- [ ] Settings tab (no functionality)
- [ ] Admin authentication guard
- [ ] Real-time messaging sync

### ❌ Critical Gaps for Multi-Tenant System
- [ ] Multi-tenant WhatsApp account management
- [ ] Meta Embedded Signup flow
- [ ] Business account provisioning
- [ ] Order management system
- [ ] Customer database
- [ ] Product/Menu management
- [ ] Webhook handler for incoming WhatsApp messages
- [ ] Per-business WhatsApp credentials storage
- [ ] Message parser/NLP for order extraction
- [ ] Real-time order notifications

---

## Architecture Overview

### Current Architecture (Single-Tenant)
```
User → Facebook Login → Dashboard → Single WhatsApp Account (Hardcoded)
```

### Target Architecture (Multi-Tenant)
```
User → Facebook Login → Create/Select Business → WhatsApp Setup Flow
  ↓
Business connects own WhatsApp → Store credentials (encrypted)
  ↓
Incoming WhatsApp Messages → Webhook → Parse Order → Create Order in DB
  ↓
Dashboard shows Orders → Business manages status → WhatsApp notifications to customer
```

---

## Implementation Phases

## Phase 1: Foundation & Database Schema
**Duration**: 1-2 weeks
**Status**: 🟡 In Progress

### Components

#### 1.1 Database Models
- [ ] **Business Model** - Store business details, settings, subscription
- [ ] **BusinessWhatsAppAccount Model** - Per-business WhatsApp credentials
- [ ] **Order Model** - Core order management
- [ ] **Customer Model** - Customer contact database
- [ ] **Product Model** - Menu/product catalog

**Status**: Not started
**Priority**: CRITICAL
**Files to create**:
- `app/models/Business.ts`
- `app/models/BusinessWhatsAppAccount.ts`
- `app/models/Order.ts`
- `app/models/Customer.ts`
- `app/models/Product.ts`

#### 1.2 Meta Business Manager Setup
- [ ] Verify Meta Business Manager account exists
- [ ] Create/verify System User with admin permissions
- [ ] Generate permanent access token for System User
- [ ] Configure WhatsApp Business API app
- [ ] Get Embedded Signup configuration ID
- [ ] Request necessary permissions

**Status**: Needs verification
**Priority**: CRITICAL
**Required permissions**:
- `whatsapp_business_management`
- `whatsapp_business_messaging`
- `business_management`

#### 1.3 Multi-Tenant WhatsApp Service
- [ ] Refactor `WhatsAppAPI` class to support multiple accounts
- [ ] Create `MultiTenantWhatsAppService` class
- [ ] Implement per-business credential fetching
- [ ] Add token encryption/decryption
- [ ] Create test suite for multi-account messaging

**Status**: Not started
**Priority**: CRITICAL
**Files to modify**:
- `app/lib/whatsapp-api.ts` → Refactor
- Create: `app/lib/services/MultiTenantWhatsAppService.ts`
- Create: `app/lib/services/EncryptionService.ts`

#### 1.4 WhatsApp Connection Wizard (Frontend)
- [ ] Create wizard component for WhatsApp account connection
- [ ] Implement Meta Embedded Signup flow
- [ ] Build step-by-step onboarding UI
- [ ] Add connection status indicators
- [ ] Create WhatsApp setup dashboard tab

**Status**: Not started
**Priority**: HIGH
**Files to create**:
- `app/components/WhatsAppConnectWizard.tsx`
- `app/components/WhatsAppSetupTab.tsx`
- `app/dashboard/whatsapp-setup/page.tsx`

---

## Phase 2: Core Functionality
**Duration**: 2-3 weeks
**Status**: 🔴 Not Started

### Components

#### 2.1 Embedded Signup Backend
- [ ] Create Meta OAuth token exchange endpoint
- [ ] Implement WABA (WhatsApp Business Account) details fetching
- [ ] Store encrypted access tokens in database
- [ ] Handle token refresh logic
- [ ] Subscribe to webhooks for connected accounts

**Status**: Not started
**Priority**: CRITICAL
**Files to create**:
- `app/api/meta/connect/route.ts`
- `app/api/meta/token-refresh/route.ts`
- `app/lib/services/MetaAPIService.ts`

#### 2.2 WhatsApp Webhook Handler
- [ ] Create webhook verification endpoint (GET)
- [ ] Implement webhook message receiver (POST)
- [ ] Add signature verification
- [ ] Parse incoming message types (text, media, location)
- [ ] Route messages to correct business account
- [ ] Store message history in database

**Status**: Not started
**Priority**: CRITICAL
**Files to create**:
- `app/api/webhooks/whatsapp/route.ts`
- `app/lib/services/WebhookService.ts`
- `app/lib/services/MessageRouter.ts`

#### 2.3 Order Management System
- [ ] Create order creation API
- [ ] Implement order status update workflow
- [ ] Add order assignment to business
- [ ] Build order timeline tracking
- [ ] Create customer auto-creation from WhatsApp messages
- [ ] Add order search and filtering

**Status**: Not started
**Priority**: CRITICAL
**Files to create**:
- `app/api/orders/route.ts`
- `app/api/orders/[id]/route.ts`
- `app/api/orders/[id]/status/route.ts`
- `app/lib/services/OrderService.ts`

#### 2.4 Orders Dashboard Tab
- [ ] Create Orders tab component
- [ ] Build order list view with real-time updates
- [ ] Add order detail modal
- [ ] Implement status update controls
- [ ] Add order search and filters
- [ ] Create order statistics cards

**Status**: Not started
**Priority**: HIGH
**Files to create**:
- `app/components/OrdersTab.tsx`
- `app/components/OrderListItem.tsx`
- `app/components/OrderDetailModal.tsx`
- `app/components/OrderStatusBadge.tsx`

---

## Phase 3: Enhancement & Testing
**Duration**: 1-2 weeks
**Status**: 🔴 Not Started

### Components

#### 3.1 Message Parser / Order Extraction
- [ ] Implement basic keyword-based order parser
- [ ] Add regex patterns for common order formats
- [ ] Integrate AI/LLM for natural language order parsing
- [ ] Create order confirmation flow
- [ ] Handle order modifications and cancellations

**Status**: Not started
**Priority**: MEDIUM
**Files to create**:
- `app/lib/services/MessageParserService.ts`
- `app/lib/services/AIOrderParser.ts`

#### 3.2 Customer Management
- [ ] Create customer list view
- [ ] Add customer detail page
- [ ] Implement customer order history
- [ ] Add customer notes and tags
- [ ] Create customer analytics

**Status**: Not started
**Priority**: MEDIUM
**Files to create**:
- `app/components/CustomersTab.tsx`
- `app/api/customers/route.ts`

#### 3.3 Menu/Product Management
- [ ] Create product CRUD operations
- [ ] Add product categories
- [ ] Implement product availability toggle
- [ ] Add product images upload
- [ ] Create menu display for customers

**Status**: Not started
**Priority**: MEDIUM
**Files to create**:
- `app/components/MenuTab.tsx`
- `app/api/products/route.ts`

#### 3.4 Security Hardening
- [ ] Implement access token encryption at rest
- [ ] Add webhook signature verification
- [ ] Create rate limiting for API endpoints
- [ ] Add RBAC (role-based access control)
- [ ] Implement audit logging

**Status**: Not started
**Priority**: HIGH
**Files to create**:
- `app/lib/middleware/rateLimit.ts`
- `app/lib/middleware/rbac.ts`
- `app/lib/services/AuditLogger.ts`

---

## Sprint Breakdown

### Sprint 1: Foundation (Week 1-2)
**Goal**: Database models + Meta API verification + Multi-tenant WhatsApp service

#### Sprint 1 Tasks
- [x] ~~Create implementation roadmap document~~
- [ ] Create all database models with proper indexing
- [ ] Verify Meta Business Manager setup
- [ ] Generate and test System User token
- [ ] Refactor WhatsApp service to multi-tenant
- [ ] Create encryption service for tokens
- [ ] Write unit tests for new services
- [ ] Create Meta API verification script
- [ ] Test multi-account message sending

**Deliverables**:
- ✅ 5 new MongoDB models
- ✅ Multi-tenant WhatsApp service
- ✅ Meta API connectivity verified
- ✅ Test script for sending messages to multiple accounts

**Success Criteria**:
- Can create Business and WhatsAppAccount in database
- Can send WhatsApp messages using business-specific credentials
- Meta API returns valid responses
- All tokens properly encrypted

---

### Sprint 2: Core Functionality (Week 3-4)
**Goal**: Embedded signup + Webhook handler + Order system

#### Sprint 2 Tasks
- [ ] Implement Embedded Signup frontend wizard
- [ ] Create Meta OAuth backend endpoints
- [ ] Build webhook handler with signature verification
- [ ] Create order management APIs
- [ ] Build Orders dashboard tab
- [ ] Implement real-time message receiving
- [ ] Add order status notification system
- [ ] Test end-to-end order flow

**Deliverables**:
- ✅ WhatsApp connection wizard
- ✅ Working webhook handler
- ✅ Order creation and management
- ✅ Orders dashboard tab

**Success Criteria**:
- Business can connect WhatsApp account through UI
- Incoming WhatsApp messages trigger webhook
- Orders created from WhatsApp messages
- Business can update order status
- Customer receives WhatsApp notification on status change

---

### Sprint 3: Polish & Testing (Week 5-6)
**Goal**: Message parser + Customer/Menu management + Security

#### Sprint 3 Tasks
- [ ] Implement message parser with AI
- [ ] Create customer management UI
- [ ] Build menu/product management
- [ ] Add security features (encryption, rate limiting)
- [ ] Create admin analytics dashboard
- [ ] Perform load testing
- [ ] Security audit
- [ ] End-to-end testing with real businesses

**Deliverables**:
- ✅ AI-powered order extraction
- ✅ Customer and menu management
- ✅ Production-ready security
- ✅ Complete test coverage

**Success Criteria**:
- Natural language orders parsed correctly (>85% accuracy)
- Customers and products fully manageable
- System handles 100+ concurrent businesses
- All security vulnerabilities addressed

---

## Meta API Requirements Checklist

### Pre-Implementation Verification
**Complete this checklist before starting Sprint 1**

#### Meta Business Manager Setup
- [ ] **Meta Business Manager Account Created**
  - URL: https://business.facebook.com/
  - Business verified: Yes/No
  - Business ID: `_________________`

- [ ] **System User Created**
  - Name: `_________________`
  - Role: Admin
  - System User ID: `_________________`

- [ ] **Permanent Access Token Generated**
  - Token generated: Yes/No
  - Token stored securely: Yes/No
  - Token expiration: Never/Date
  - Permissions granted:
    - [ ] whatsapp_business_management
    - [ ] whatsapp_business_messaging
    - [ ] business_management

#### WhatsApp Business API App
- [ ] **App Created in Meta App Dashboard**
  - App ID: `_________________`
  - App Secret: `_________________`
  - WhatsApp product added: Yes/No

- [ ] **Embedded Signup Configuration**
  - Configuration ID: `_________________`
  - Redirect URL configured: `_________________`
  - Business verification tier: Verified/Unverified

#### Webhook Configuration
- [ ] **Webhook URL Publicly Accessible**
  - URL: `https://your-domain.com/api/webhooks/whatsapp`
  - HTTPS enabled: Yes/No
  - SSL certificate valid: Yes/No

- [ ] **Webhook Verify Token Set**
  - Token: `_________________`
  - Environment variable set: `WEBHOOK_VERIFY_TOKEN`

- [ ] **Webhook Subscribed to Events**
  - [ ] messages
  - [ ] message_status
  - [ ] messaging_postbacks

#### App Review (For Production)
- [ ] **Permissions Submitted for Review**
  - whatsapp_business_messaging: Pending/Approved
  - Review use case documented: Yes/No
  - Privacy policy URL provided: `_________________`

#### Test Environment
- [ ] **Test WhatsApp Business Account**
  - Phone number: `_________________`
  - Account ID: `_________________`
  - Test messages working: Yes/No

- [ ] **Development Phone Numbers Added**
  - Test phone 1: `_________________`
  - Test phone 2: `_________________`

---

## Database Schema

### Business Model
```typescript
interface Business {
  _id: ObjectId;
  userId: string; // Facebook user ID (owner)
  name: string;
  type: 'restaurant' | 'pizzeria' | 'retail' | 'service' | 'other';
  phone: string;
  email: string;
  address?: {
    street: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  settings: {
    currency: string; // ILS, USD, EUR
    timezone: string; // Asia/Jerusalem
    language: string; // he, en
    businessHours?: {
      [day: string]: { open: string; close: string };
    };
  };
  whatsappAccountId?: ObjectId; // Reference to BusinessWhatsAppAccount
  status: 'active' | 'suspended' | 'trial' | 'pending_setup';
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    startDate: Date;
    expiresAt?: Date;
    features: string[];
  };
  onboarding: {
    completed: boolean;
    currentStep: number;
    stepsCompleted: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `userId` (for user lookup)
- `status` (for filtering)
- `createdAt` (for sorting)

**Status**: ❌ Not created

---

### BusinessWhatsAppAccount Model
```typescript
interface BusinessWhatsAppAccount {
  _id: ObjectId;
  businessId: ObjectId; // Reference to Business
  userId: string; // Facebook user ID

  // WhatsApp Business Account details
  whatsappBusinessAccountId: string; // WABA ID from Meta
  phoneNumberId: string; // Phone number ID for API calls
  phoneNumber: string; // Display number (+972...)
  displayName: string; // Business display name on WhatsApp

  // Access credentials (ENCRYPTED)
  accessToken: string; // Encrypted access token
  tokenType: 'permanent' | 'temporary';
  tokenExpiresAt?: Date;
  refreshToken?: string; // Encrypted

  // Webhook configuration
  webhookVerifyToken: string; // For webhook verification
  webhookSubscribed: boolean;
  subscribedFields: string[]; // ['messages', 'message_status']

  // Permissions and limits
  permissions: string[]; // Meta API permissions granted
  tier: 'free' | 'core' | 'business' | 'unlimited'; // Meta tier
  messagingLimit: number; // Messages per 24h

  // Status and health
  status: 'pending' | 'active' | 'suspended' | 'disconnected' | 'error';
  lastHealthCheck?: Date;
  errorMessage?: string;

  // Metadata
  connectedAt: Date;
  lastMessageSentAt?: Date;
  lastMessageReceivedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `businessId` (unique - one WhatsApp account per business)
- `whatsappBusinessAccountId` (unique)
- `phoneNumberId` (for webhook routing)
- `status` (for health monitoring)

**Status**: ❌ Not created

---

### Order Model
```typescript
interface Order {
  _id: ObjectId;
  businessId: ObjectId; // Reference to Business
  customerId: ObjectId; // Reference to Customer

  // Order details
  orderNumber: string; // Auto-generated: ORD-20251021-0001
  items: Array<{
    productId?: ObjectId; // Reference to Product (optional)
    name: string;
    quantity: number;
    price: number;
    currency: string;
    variants?: string[]; // e.g., ["Large", "Extra Cheese"]
    notes?: string;
    subtotal: number; // quantity * price
  }>;

  // Pricing
  subtotal: number;
  tax?: number;
  deliveryFee?: number;
  discount?: number;
  total: number;
  currency: string;

  // Status tracking
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'online' | 'other';

  // Source tracking
  source: 'whatsapp' | 'manual' | 'web' | 'phone';
  whatsappMessageId?: string; // Original message ID
  whatsappConversationId?: string;

  // Customer details
  customerPhone: string; // WhatsApp number
  customerName?: string;
  customerEmail?: string;

  // Delivery details
  deliveryType?: 'pickup' | 'delivery';
  deliveryAddress?: {
    street: string;
    city: string;
    building?: string;
    floor?: string;
    apartment?: string;
    notes?: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
  deliveryTime?: Date; // Estimated or requested

  // Additional info
  notes?: string; // Internal notes
  customerNotes?: string; // From customer
  specialInstructions?: string;

  // Timeline
  timeline: Array<{
    status: string;
    timestamp: Date;
    updatedBy: string; // userId or 'system'
    notes?: string;
  }>;

  // Timestamps
  orderedAt: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `businessId` + `createdAt` (compound - for business order history)
- `customerId` (for customer order history)
- `orderNumber` (unique - for quick lookup)
- `status` (for filtering)
- `whatsappMessageId` (for message correlation)

**Status**: ❌ Not created

---

### Customer Model
```typescript
interface Customer {
  _id: ObjectId;
  businessId: ObjectId; // Reference to Business

  // Primary identifier
  whatsappPhone: string; // Primary contact (+972...)

  // Customer details
  name?: string;
  email?: string;
  alternatePhone?: string;

  // Address
  defaultAddress?: {
    street: string;
    city: string;
    building?: string;
    floor?: string;
    apartment?: string;
    notes?: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
  savedAddresses?: Array<{
    label: string; // "Home", "Work"
    address: typeof defaultAddress;
  }>;

  // Statistics
  totalOrders: number;
  totalSpent: number;
  currency: string;
  averageOrderValue: number;
  lastOrderDate?: Date;
  firstOrderDate?: Date;

  // Preferences
  preferredPaymentMethod?: string;
  preferredDeliveryTime?: string;
  dietaryRestrictions?: string[];

  // Engagement
  tags: string[]; // ["VIP", "Regular", "New"]
  segment?: string; // "high_value", "at_risk", "new"
  notes?: string; // Internal notes

  // Communication preferences
  optInMarketing: boolean;
  preferredLanguage: string; // he, en
  doNotDisturb?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };

  // WhatsApp specific
  whatsappName?: string; // Name from WhatsApp profile
  whatsappProfilePicture?: string;
  lastMessageAt?: Date;
  conversationStatus: 'active' | 'inactive' | 'blocked';

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `businessId` + `whatsappPhone` (compound unique - one customer per business)
- `businessId` + `totalSpent` (for high-value customer queries)
- `lastOrderDate` (for engagement analytics)
- `tags` (for segmentation)

**Status**: ❌ Not created

---

### Product Model
```typescript
interface Product {
  _id: ObjectId;
  businessId: ObjectId; // Reference to Business

  // Basic details
  name: string;
  nameHe?: string; // Hebrew translation
  description?: string;
  descriptionHe?: string;
  sku?: string; // Stock keeping unit

  // Categorization
  category: string; // "Pizza", "Drinks", "Sides"
  categoryHe?: string;
  subcategory?: string;
  tags: string[]; // ["vegetarian", "spicy", "popular"]

  // Pricing
  price: number;
  currency: string;
  compareAtPrice?: number; // Original price for sales
  costPrice?: number; // For profit calculation

  // Variants (e.g., sizes, toppings)
  hasVariants: boolean;
  variants?: Array<{
    name: string; // "Size"
    nameHe?: string;
    required: boolean;
    options: Array<{
      label: string; // "Large"
      labelHe?: string;
      priceModifier: number; // +10, -5
    }>;
  }>;

  // Inventory
  trackInventory: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  allowBackorder: boolean;

  // Availability
  available: boolean;
  availableFrom?: string; // "09:00"
  availableUntil?: string; // "23:00"
  availableDays?: string[]; // ["sunday", "monday"]

  // Media
  images: Array<{
    url: string;
    alt?: string;
    isPrimary: boolean;
  }>;

  // Additional info
  preparationTime?: number; // minutes
  calories?: number;
  allergens?: string[];
  ingredients?: string[];

  // SEO & Display
  displayOrder: number; // For sorting in menu
  featured: boolean;

  // Analytics
  viewCount: number;
  orderCount: number;
  revenue: number;

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `businessId` + `displayOrder` (for menu display)
- `businessId` + `category` (for category filtering)
- `available` (for quick filtering)
- `featured` (for homepage display)

**Status**: ❌ Not created

---

### Message Model (Optional - for history)
```typescript
interface Message {
  _id: ObjectId;
  businessId: ObjectId;
  customerId: ObjectId;

  // Message details
  whatsappMessageId: string; // Meta message ID
  direction: 'inbound' | 'outbound';
  type: 'text' | 'image' | 'video' | 'document' | 'location' | 'template';

  // Content
  content: {
    text?: string;
    mediaUrl?: string;
    mimeType?: string;
    caption?: string;
    location?: {
      lat: number;
      lng: number;
      address?: string;
    };
    templateName?: string;
    templateParams?: Record<string, string>;
  };

  // Status (for outbound)
  status?: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  errorCode?: string;
  errorMessage?: string;

  // Metadata
  from: string; // Phone number
  to: string;
  timestamp: Date;
  conversationId?: string;

  // Order correlation
  orderId?: ObjectId;

  createdAt: Date;
}
```

**Indexes**:
- `businessId` + `timestamp` (for conversation history)
- `customerId` + `timestamp` (for customer chat history)
- `whatsappMessageId` (unique)
- `orderId` (for order-related messages)

**Status**: ❌ Not created (Optional for v1)

---

## API Endpoints

### Business Management

#### Create Business
```
POST /api/businesses
Body: { name, type, phone, email, settings }
Response: { business }
```
**Status**: ❌ Not created

#### Get Business Details
```
GET /api/businesses/[id]
Response: { business, whatsappAccount, stats }
```
**Status**: ❌ Not created

#### Update Business
```
PATCH /api/businesses/[id]
Body: { name?, settings?, ... }
Response: { business }
```
**Status**: ❌ Not created

---

### WhatsApp Account Management

#### Connect WhatsApp Account (Embedded Signup)
```
POST /api/meta/connect
Body: { code, businessId }
Response: { whatsappAccount, success }
```
**Status**: ❌ Not created

#### Get WhatsApp Account Status
```
GET /api/businesses/[id]/whatsapp
Response: { account, health, limits }
```
**Status**: ❌ Not created

#### Disconnect WhatsApp
```
DELETE /api/businesses/[id]/whatsapp
Response: { success }
```
**Status**: ❌ Not created

#### Test WhatsApp Connection
```
POST /api/businesses/[id]/whatsapp/test
Response: { success, latency, capabilities }
```
**Status**: ❌ Not created

---

### Messaging

#### Send Message
```
POST /api/businesses/[id]/messages
Body: { to, message, type: 'text' | 'template' }
Response: { messageId, status }
```
**Status**: ⚠️ Partially exists (single account only)

#### Get Message History
```
GET /api/businesses/[id]/messages?customerId=xxx
Response: { messages, pagination }
```
**Status**: ❌ Not created

#### Webhook Receiver
```
POST /api/webhooks/whatsapp
Body: { entry: [...] } (Meta webhook format)
Response: 200 OK
```
**Status**: ❌ Not created

#### Webhook Verification
```
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=xxx
Response: hub.challenge
```
**Status**: ❌ Not created

---

### Order Management

#### Create Order
```
POST /api/orders
Body: { businessId, customerId, items, deliveryDetails }
Response: { order }
```
**Status**: ❌ Not created

#### Get Orders
```
GET /api/orders?businessId=xxx&status=pending
Response: { orders, pagination, stats }
```
**Status**: ❌ Not created

#### Get Order Details
```
GET /api/orders/[id]
Response: { order, customer, timeline }
```
**Status**: ❌ Not created

#### Update Order Status
```
PATCH /api/orders/[id]/status
Body: { status, notes }
Response: { order, notificationSent }
```
**Status**: ❌ Not created

#### Cancel Order
```
POST /api/orders/[id]/cancel
Body: { reason }
Response: { order, refundInitiated }
```
**Status**: ❌ Not created

---

### Customer Management

#### Get Customers
```
GET /api/customers?businessId=xxx
Response: { customers, pagination }
```
**Status**: ❌ Not created

#### Get Customer Details
```
GET /api/customers/[id]
Response: { customer, orderHistory, stats }
```
**Status**: ❌ Not created

#### Update Customer
```
PATCH /api/customers/[id]
Body: { name?, email?, tags?, notes? }
Response: { customer }
```
**Status**: ❌ Not created

---

### Product/Menu Management

#### Get Products
```
GET /api/products?businessId=xxx&category=pizza
Response: { products }
```
**Status**: ❌ Not created

#### Create Product
```
POST /api/products
Body: { businessId, name, price, category, ... }
Response: { product }
```
**Status**: ❌ Not created

#### Update Product
```
PATCH /api/products/[id]
Body: { name?, price?, available? }
Response: { product }
```
**Status**: ❌ Not created

#### Delete Product
```
DELETE /api/products/[id]
Response: { success }
```
**Status**: ❌ Not created

---

## Testing Strategy

### Unit Tests
**Tools**: Jest, Testing Library
**Coverage Target**: 80%+

- [ ] Database models validation
- [ ] Encryption/decryption service
- [ ] Multi-tenant WhatsApp service
- [ ] Order calculation logic
- [ ] Message parser

**Status**: ❌ Not created

---

### Integration Tests
**Tools**: Jest + MongoDB Memory Server

- [ ] Order creation flow (message → order → notification)
- [ ] WhatsApp account connection flow
- [ ] Webhook message processing
- [ ] Multi-business isolation (ensure Business A can't access Business B data)

**Status**: ❌ Not created

---

### E2E Tests
**Tools**: Playwright

- [ ] Complete business onboarding
- [ ] WhatsApp account connection
- [ ] Receive order via WhatsApp
- [ ] Update order status
- [ ] Customer receives notification

**Status**: ❌ Not created

---

### Meta API Test Script
**Purpose**: Verify Meta API connectivity before implementation

```bash
# Test script to run in Sprint 1
node scripts/test-meta-api.js

# Tests:
# 1. System User token validity
# 2. WABA list retrieval
# 3. Send test message
# 4. Get message templates
# 5. Webhook subscription check
```

**Status**: ❌ Not created

---

## Environment Variables

### Required for Sprint 1
```env
# Existing
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# New - Meta Business Platform
META_BUSINESS_MANAGER_ID=<your_business_manager_id>
META_SYSTEM_USER_ACCESS_TOKEN=<permanent_token>
META_APP_ID=<whatsapp_app_id>
META_APP_SECRET=<whatsapp_app_secret>
NEXT_PUBLIC_META_CONFIGURATION_ID=<embedded_signup_config_id>

# New - Webhook
WEBHOOK_VERIFY_TOKEN=<random_secure_string>
NEXT_PUBLIC_WEBHOOK_URL=https://your-domain.com/api/webhooks/whatsapp

# New - Security
ENCRYPTION_KEY=<32_byte_hex_string>
ENCRYPTION_IV=<16_byte_hex_string>

# Existing WhatsApp (for testing)
WHATSAPP_PHONE_NUMBER_ID=821921634328544
WHATSAPP_ACCESS_TOKEN=<token>
WHATSAPP_BUSINESS_ACCOUNT_ID=2040143710146940
```

---

## Success Metrics

### Sprint 1
- [ ] All 5 database models created and tested
- [ ] Can create Business with encrypted WhatsApp credentials
- [ ] Multi-tenant WhatsApp service sends messages using business-specific tokens
- [ ] Meta API test script passes all checks
- [ ] System User token verified and working

### Sprint 2
- [ ] Business can connect WhatsApp account via Embedded Signup
- [ ] Webhook receives incoming messages
- [ ] Order created from WhatsApp message
- [ ] Customer receives order confirmation via WhatsApp
- [ ] Dashboard shows real orders

### Sprint 3
- [ ] AI parser extracts order with >85% accuracy
- [ ] System handles 10+ concurrent businesses
- [ ] Security audit shows no critical vulnerabilities
- [ ] Load test: 1000 messages/minute processed successfully

---

## Risk Assessment

### High Risk
- **Meta API rate limits**: Could block businesses during high traffic
  - **Mitigation**: Implement queue system, monitor usage

- **Webhook downtime**: Missed messages = lost orders
  - **Mitigation**: Implement retry logic, message polling fallback

- **Token expiration**: Could break customer accounts
  - **Mitigation**: Automatic token refresh, alert system

### Medium Risk
- **Message parsing accuracy**: NLP might misinterpret orders
  - **Mitigation**: Confirmation flow, manual review option

- **Multi-tenant data leakage**: Business A seeing Business B data
  - **Mitigation**: Strict DB queries with businessId, integration tests

### Low Risk
- **UI complexity**: Too many features overwhelming users
  - **Mitigation**: Progressive disclosure, onboarding wizard

---

## Next Steps

### Immediate Actions (Sprint 1 - This Week)
1. ✅ Create this roadmap document
2. [ ] Verify Meta Business Manager setup (use checklist above)
3. [ ] Create database models (5 files)
4. [ ] Create Meta API test script
5. [ ] Refactor WhatsApp service to multi-tenant
6. [ ] Test with 2 WhatsApp accounts

### Documentation Needed
- [ ] Meta API setup guide (screenshots)
- [ ] Environment variables setup guide
- [ ] Database schema documentation
- [ ] API endpoint documentation (Swagger/OpenAPI)
- [ ] Deployment guide

---

## Questions / Blockers

### Meta API Clarifications Needed
- [ ] Do we have a verified Meta Business Manager account?
- [ ] What's our System User token and its permissions?
- [ ] Do we have Embedded Signup configuration ID?
- [ ] Is our app approved for `whatsapp_business_messaging`?
- [ ] What's our current message tier (free/core/business)?

### Technical Decisions
- [ ] Which AI service for message parsing? (OpenAI, Claude, local model)
- [ ] Payment gateway integration? (Stripe, local providers)
- [ ] Real-time updates: WebSockets or polling?
- [ ] Multi-language support priority? (Hebrew + English first)

---

**Last Updated**: 2025-10-21
**Document Version**: 1.0
**Next Review**: After Sprint 1 completion
