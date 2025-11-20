# PR #1 Review Comments - Fixes Required

**PR**: Integrate next-intl for internationalization support and enhance layout with message handling  
**Status**: Open  
**Reviewer**: CodeRabbit AI

---

## Summary of Issues

### 🔴 Critical Issues (Must Fix Before Merge)
1. **Missing authentication in Meta exchange-token endpoint** - Allows anyone to bind WhatsApp accounts to arbitrary businesses
2. **Missing authentication in payment create-link endpoint** - Allows anyone to create payment links for any business
3. **No webhook signature verification** - Forged requests could mark orders as paid

### 🟠 Major Issues (Should Fix)
4. Unvalidated userId in onboarding/start (client can create businesses for anyone)
5. Unsafe Object.assign in onboarding/step (allows modifying sensitive fields)
6. Missing stepNumber validation
7. Full business object exposed in API responses
8. isPrimary field unintentionally cleared in payment provider PUT
9. Missing provider type validation
10. Payment provider created before business verification

### 🟡 Minor Issues
11. displayName fallback inconsistency in exchange-token response

---

## Detailed Fixes

### 1. ❌ CRITICAL: Add Authentication to Meta Exchange-Token
**File**: `app/api/meta/exchange-token/route.ts`  
**Lines**: 103-150  
**Issue**: Client-supplied businessId without ownership verification

**Fix Required**:
```typescript
// Before any DB changes
const session = await getServerSession(request);
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Verify business ownership
const business = await Business.findById(businessId);
if (!business || business.userId !== session.user.id) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

---

### 2. ✅ MINOR: Fix displayName Fallback
**File**: `app/api/meta/exchange-token/route.ts`  
**Lines**: 159-167 (also 101-107)  
**Issue**: Response uses `phoneNumber.verified_name` directly, can be undefined

**Fix Required**:
```typescript
displayName: phoneNumber.verified_name || business.name
```

---

### 3. ❌ CRITICAL: Add Authentication to Onboarding Start
**File**: `app/api/onboarding/start/route.ts`  
**Lines**: 11-51  
**Issue**: Client-supplied userId allows creating businesses for anyone

**Fix Required**:
```typescript
// Remove userId from request body
// Get from session instead
const session = await getServerSession(request);
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const userId = session.user.id; // Use session userId
```

---

### 4. 🟠 MAJOR: Whitelist Allowed Fields in Onboarding Step
**File**: `app/api/onboarding/step/route.ts`  
**Lines**: 28-31  
**Issue**: `Object.assign(business, data)` allows modifying sensitive fields

**Fix Required**:
```typescript
// Whitelist allowed fields per step
const allowedFields = ['name', 'phone', 'email', 'address', 'businessHours', 'category', 'description'];
allowedFields.forEach(field => {
  if (data[field] !== undefined) {
    business[field] = data[field];
  }
});
```

---

### 5. 🟠 MAJOR: Add stepNumber Validation
**File**: `app/api/onboarding/step/route.ts`  
**Lines**: 33-44  
**Issue**: No validation for stepNumber range

**Fix Required**:
```typescript
// Validate step number
if (typeof stepNumber !== 'number' || stepNumber < 0 || stepNumber > 7) {
  return NextResponse.json(
    { success: false, error: 'Invalid step number (must be 0-7)' },
    { status: 400 }
  );
}
```

---

### 6. 🟠 MAJOR: Return Only Safe Fields from API
**File**: `app/api/onboarding/step/route.ts`  
**Lines**: 48-52  
**Issue**: Returns full business object with sensitive data

**Fix Required**:
```typescript
return NextResponse.json({
  success: true,
  data: {
    businessId: business._id,
    onboarding: business.onboarding,
    status: business.status,
    name: business.name
  },
  message: 'Step progress saved successfully',
});
```

---

### 7. ❌ CRITICAL: Add Authentication to Payment Create-Link
**File**: `app/api/payments/create-link/route.ts`  
**Lines**: 17  
**Issue**: No authentication allows anyone to create payment links

**Fix Required**:
```typescript
const session = await getServerSession(request);
if (!session?.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Verify business ownership
const business = await Business.findById(businessId);
if (!business || business.userId !== session.user.id) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 });
}
```

---

### 8. 🟠 MAJOR: Add customerPhone Validation
**File**: `app/api/payments/create-link/route.ts`  
**Lines**: 10  
**Issue**: customerPhone is required by all providers but not validated

**Fix Required**:
```typescript
if (!customerPhone) {
  return NextResponse.json(
    { success: false, error: 'Customer phone is required' },
    { status: 400 }
  );
}
```

---

### 9. 🟠 MAJOR: Fix isPrimary Handling
**File**: `app/api/payments/providers/[id]/route.ts`  
**Lines**: 56-78  
**Issue**: isPrimary can be set to undefined when omitted from request

**Fix Required**:
```typescript
const update: Record<string, any> = { ...updateData };
if (typeof isPrimary === 'boolean') {
  update.isPrimary = isPrimary;
}

const provider = await PaymentProvider.findOneAndUpdate(
  { _id: params.id, businessId },
  update,
  { new: true, runValidators: true }
);
```

---

### 10. 🟠 MAJOR: Add Provider Type Validation
**File**: `app/api/payments/providers/route.ts`  
**Lines**: 51-62  
**Issue**: No validation for provider type or credentials structure

**Fix Required**:
```typescript
// Validate provider type
const allowedProviders = ['stripe', 'paypal', 'tranzila', 'meshulam', 'cardcom'];
if (!allowedProviders.includes(provider)) {
  return NextResponse.json(
    { success: false, error: `Invalid provider type. Allowed: ${allowedProviders.join(', ')}` },
    { status: 400 }
  );
}

// Validate credentials is an object
if (typeof credentials !== 'object' || credentials === null || Array.isArray(credentials)) {
  return NextResponse.json(
    { success: false, error: 'Credentials must be an object' },
    { status: 400 }
  );
}
```

---

### 11. 🟠 MAJOR: Verify Business Before Creating Provider
**File**: `app/api/payments/providers/route.ts`  
**Lines**: 73-88  
**Issue**: Payment provider created before verifying business exists

**Fix Required**:
```typescript
// Verify business exists first
const business = await Business.findById(businessId);
if (!business) {
  return NextResponse.json(
    { success: false, error: 'Business not found' },
    { status: 404 }
  );
}

// Then create payment provider
const paymentProvider = await PaymentProvider.create({...});

// Update business
business.paymentProviders.addToSet(paymentProvider._id);
await business.save();
```

---

### 12. ❌ CRITICAL: Add Webhook Signature Verification
**File**: `app/api/payments/webhook/[provider]/route.ts`  
**Lines**: 23-35  
**Issue**: No signature verification allows forged payment completion

**Fix Required**:
```typescript
// Get signature from headers
const signature = request.headers.get('stripe-signature') || 
                  request.headers.get('x-paypal-transmission-sig');

// Verify webhook signature
const isValid = await PaymentService.verifyWebhookSignature(
  provider,
  rawBody,
  signature,
  webhookSecret
);

if (!isValid) {
  return NextResponse.json(
    { error: 'Invalid webhook signature' },
    { status: 401 }
  );
}

// Only then process payment completion
if (status === 'completed') {
  await PaymentService.handlePaymentComplete(orderId, transactionId);
}
```

---

## Priority Order

### Phase 1: Critical Security (Do First)
1. Meta exchange-token authentication
2. Payment create-link authentication  
3. Webhook signature verification

### Phase 2: Major Security
4. Onboarding start userId from session
5. Onboarding step field whitelisting
6. Payment provider validation

### Phase 3: Data Integrity
7. stepNumber validation
8. API response sanitization
9. isPrimary handling
10. Business verification before provider creation

### Phase 4: Polish
11. displayName fallback fix

---

## Testing Checklist

After fixes:
- [ ] Test Meta WhatsApp connection with valid and invalid users
- [ ] Test onboarding flow with tampered requests
- [ ] Test payment link creation with unauthorized users
- [ ] Test webhook with forged signatures
- [ ] Test payment provider CRUD with edge cases
- [ ] Verify API responses don't leak sensitive data

---

**Status**: ✅ ALL FIXES COMPLETED
**Completion Date**: 2025-11-20
**Next Step**: Run tests and create commit for PR #1
