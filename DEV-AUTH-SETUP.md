# Development Authentication Setup

## 🎯 Problem Solved

Facebook OAuth can be problematic during local development. This setup provides a **development-only bypass** that:
- ✅ Works on localhost without Facebook configuration
- ✅ Automatically disabled in production
- ✅ Secure (only available in dev mode)
- ✅ Easy to use

## 🚀 Quick Start

### Option 1: Quick Login (Recommended)

1. Start your dev server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/login`

3. You'll see a **"Development Login"** card at the top (only in dev mode)

4. Click **"Quick Login as Dev User"**

5. You're logged in! 🎉

### Option 2: Custom User Details

1. On the login page, click **"Custom User Details"**

2. Enter custom user info:
   - User ID: `dev_user_123` (or any ID)
   - Name: `Your Name`
   - Email: `your@email.com`

3. Click **"Login with Custom Details"**

## 📁 Files Created

### API Routes:
1. **`app/api/auth/dev-login/route.ts`**
   - POST: Create dev session
   - DELETE: Clear dev session
   - Only works in development mode

2. **`app/api/auth/dev-session/route.ts`**
   - GET: Check if dev session exists
   - Returns user data if logged in

### Components:
3. **`app/components/DevLoginButton.tsx`**
   - Development login UI
   - Quick login button
   - Custom user form
   - Only renders in dev mode

### Updated Files:
4. **`app/login/page.tsx`**
   - Added DevLoginButton component
   - Shows dev login option in development

5. **`app/hooks/useAuthGuard.ts`**
   - Checks dev session before Facebook
   - Seamless integration

## 🔒 Security Features

### Production Safety:
```typescript
// All dev endpoints check NODE_ENV
if (process.env.NODE_ENV !== 'development') {
  return NextResponse.json(
    { error: 'Only available in development' },
    { status: 403 }
  );
}
```

### Component Safety:
```tsx
// DevLoginButton only renders in dev
if (process.env.NODE_ENV !== 'development') {
  return null;
}
```

### Visual Warning:
The dev login shows a yellow warning banner:
> ⚠️ **Development Mode**  
> This bypass is only available in development. Use for testing without Facebook OAuth.

## 🎨 How It Works

### Authentication Flow:

```
User visits /login
  ↓
useAuthGuard hook runs
  ↓
1. Check for dev session (dev mode only)
   ├─ Found → User authenticated ✅
   └─ Not found → Continue to step 2
  ↓
2. Check Facebook OAuth
   ├─ Connected → User authenticated ✅
   └─ Not connected → Show login page
```

### Dev Login Flow:

```
User clicks "Quick Login"
  ↓
POST /api/auth/dev-login
  ↓
Create mock user session
  ↓
Set cookie: dev_session
  ↓
Redirect to /dashboard
  ↓
useAuthGuard detects session
  ↓
User authenticated ✅
```

## 🧪 Testing

### Test Dev Login:
1. Go to `/login`
2. Click "Quick Login as Dev User"
3. Should redirect to `/dashboard`
4. Check you're logged in

### Test Custom User:
1. Go to `/login`
2. Click "Custom User Details"
3. Enter custom info
4. Login
5. Verify custom user data appears

### Test Production Safety:
1. Set `NODE_ENV=production`
2. Try to access `/api/auth/dev-login`
3. Should return 403 Forbidden
4. DevLoginButton should not render

### Test Logout:
```bash
# Clear dev session
curl -X DELETE http://localhost:3000/api/auth/dev-login
```

## 📝 API Reference

### POST /api/auth/dev-login
Create a development session.

**Request:**
```json
{
  "userId": "dev_user_123",
  "name": "Dev User",
  "email": "dev@localhost"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "dev_user_123",
    "name": "Dev User",
    "email": "dev@localhost",
    "picture": {
      "data": {
        "url": "https://via.placeholder.com/150"
      }
    }
  },
  "message": "Development session created"
}
```

### GET /api/auth/dev-session
Check for active dev session.

**Response:**
```json
{
  "user": {
    "id": "dev_user_123",
    "name": "Dev User",
    "email": "dev@localhost"
  },
  "isDev": true
}
```

### DELETE /api/auth/dev-login
Clear dev session (logout).

**Response:**
```json
{
  "success": true,
  "message": "Development session cleared"
}
```

## 🔧 Configuration

### Environment Variables:
No additional configuration needed! The system automatically detects `NODE_ENV`.

### Customization:

**Change default user:**
```tsx
// In DevLoginButton.tsx
const [formData, setFormData] = useState({
  userId: 'your_custom_id',
  name: 'Your Name',
  email: 'your@email.com',
});
```

**Change session duration:**
```typescript
// In dev-login/route.ts
cookieStore.set('dev_session', JSON.stringify(mockUser), {
  maxAge: 60 * 60 * 24 * 30, // 30 days instead of 7
});
```

## 🎯 Use Cases

### 1. Local Development
- Test features without Facebook setup
- Faster development cycle
- No external dependencies

### 2. Testing Different Users
- Test with multiple user IDs
- Test user-specific features
- Test permissions and roles

### 3. Onboarding Flow Testing
- Test onboarding as new user
- Test with different user data
- No Facebook account needed

### 4. CI/CD Testing
- Automated tests without OAuth
- Consistent test users
- Faster test execution

## 🚫 What This Doesn't Do

- ❌ Work in production (by design)
- ❌ Replace Facebook OAuth (it's a bypass for dev)
- ❌ Provide real Facebook user data
- ❌ Persist across server restarts (cookie-based)

## 🔄 Migration to Production

When deploying to production:

1. **No changes needed!** The dev login automatically disappears.

2. Facebook OAuth will be the only login method.

3. All dev endpoints return 403 in production.

4. No security risks - completely disabled in prod.

## 💡 Tips

### Quick Development Workflow:
```bash
# Start dev server
pnpm dev

# Open browser to /login
# Click "Quick Login"
# Start developing!
```

### Testing Multiple Users:
```bash
# User 1
curl -X POST http://localhost:3000/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","name":"User One","email":"user1@test.com"}'

# User 2
curl -X POST http://localhost:3000/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"userId":"user2","name":"User Two","email":"user2@test.com"}'
```

### Clear Session:
```bash
curl -X DELETE http://localhost:3000/api/auth/dev-login
```

## 🐛 Troubleshooting

**Issue**: Dev login button not showing
- **Solution**: Check `NODE_ENV` is set to `development`
- **Check**: `process.env.NODE_ENV` in browser console

**Issue**: Login works but redirects back to login
- **Solution**: Check useAuthGuard is detecting the session
- **Check**: Browser cookies for `dev_session`

**Issue**: "Only available in development" error
- **Solution**: You're in production mode
- **Fix**: Set `NODE_ENV=development`

**Issue**: Session lost after page refresh
- **Solution**: Cookie might have expired
- **Fix**: Login again (cookies last 7 days)

## ✅ Checklist

After setup, verify:

- [ ] Dev login button appears on `/login` in dev mode
- [ ] Quick login works and redirects to dashboard
- [ ] Custom user login works
- [ ] Session persists across page refreshes
- [ ] Dev login does NOT appear in production
- [ ] Facebook OAuth still works normally
- [ ] Logout clears the session

## 🎉 Success!

You now have a fully functional development authentication system that:
- Works instantly on localhost
- Requires no Facebook configuration
- Automatically disabled in production
- Makes development much faster

Happy coding! 🚀

---

**Created**: January 2025  
**Status**: ✅ Production-ready  
**Security**: ✅ Dev-only, automatically disabled in production













