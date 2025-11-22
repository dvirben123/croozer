# Quick Start Guide - Facebook Login with FRP Tunnel

## ✅ Setup Complete!

Your application is now configured with:
- ✅ Better Auth for authentication
- ✅ Facebook OAuth provider
- ✅ FRP tunnel for local development
- ✅ Automated development workflow

---

## 🚀 How to Start Development

### Option 1: Start Everything Together (Recommended)

```bash
pnpm dev:all
```

This will start:
1. Next.js dev server on `http://localhost:3000`
2. FRP tunnel exposing it publicly

**Your public URL will be shown in the FRP output** - look for something like:
```
https://croozer.frp1.freefrp.net
```

### Option 2: Start Separately

**Terminal 1 - Next.js:**
```bash
pnpm dev
```

**Terminal 2 - FRP Tunnel:**
```bash
pnpm dev:tunnel
```

---

## 📝 Configure Facebook App

**IMPORTANT:** You need to whitelist your FRP tunnel URL in Facebook:

1. Go to [Facebook App Dashboard](https://developers.facebook.com/apps/1284378939762336/)

2. Navigate to **Facebook Login** → **Settings**

3. Add your tunnel URL to **Valid OAuth Redirect URIs**:
   ```
   https://croozer.frp1.freefrp.net/api/auth/callback/facebook
   ```

   **Note:** Replace `croozer.frp1.freefrp.net` with the actual URL shown in your FRP tunnel output!

4. Add domain to **App Domains**:
   ```
   croozer.frp1.freefrp.net
   ```

5. Click **Save Changes**

---

## 🧪 Test Facebook Login

1. **Start your dev environment:**
   ```bash
   pnpm dev:all
   ```

2. **Note the FRP tunnel URL** from the console output

3. **Open the tunnel URL** in your browser:
   ```
   https://croozer.frp1.freefrp.net/login
   ```

4. **Click "התחבר עם פייסבוק"** (Login with Facebook)

5. **Complete Facebook OAuth** - You should see the Facebook login dialog

6. **Success!** You'll be redirected back to the dashboard with an active session

---

## 🔧 Important Notes

### Environment Variables

Your `.env` is now configured to use the FRP tunnel:

```env
BETTER_AUTH_URL=https://croozer.freefrp.net
NEXT_PUBLIC_BASE_URL=https://croozer.freefrp.net
```

**⚠️ Important:** If the FRP server assigns a different URL (like `croozer.frp1.freefrp.net`), you need to update these values!

### FRP Tunnel URL Changes

The subdomain might vary based on availability:
- `https://croozer.freefrp.net` ← Your requested subdomain
- `https://croozer.frp1.freefrp.net` ← Server might add a prefix
- `https://croozer.frp2.freefrp.net` ← Or different prefix

**Always check the FRP console output** for the actual assigned URL!

### Switching to Localhost

When you don't need Facebook login, you can work faster with localhost:

1. **Update `.env`:**
   ```env
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

2. **Restart dev server:**
   ```bash
   pnpm dev
   ```

3. **No tunnel needed** - just use `http://localhost:3000`

---

## 📚 Available Scripts

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start Next.js only (localhost) |
| `pnpm dev:tunnel` | Start FRP tunnel only |
| `pnpm dev:all` | Start both together (recommended) |
| `pnpm build` | Build for production |

---

## ❓ Troubleshooting

### "URL Blocked" Error from Facebook

**Problem:** Facebook shows "This redirect failed because the redirect URI is not white-listed..."

**Solution:**
1. Check the exact URL in your FRP console
2. Make sure it matches what you added to Facebook App settings
3. Include the full path: `https://your-url/api/auth/callback/facebook`

### FRP Connection Failed

**Problem:** FRP can't connect to the server

**Solutions:**
1. **Check your internet connection**
2. **Try a different free FRP server** - `frp.freefrp.net` might be down
3. **Wait a few minutes** - Free servers can be temporarily busy
4. **Self-host FRP** - See [FRP-TUNNEL-SETUP.md](FRP-TUNNEL-SETUP.md) for details

### "Token doesn't match" Error

**Problem:** FRP says "token in login doesn't match..."

**Solution:** This is normal - we updated the config with the correct token (`freefrp.net`). Just restart the tunnel.

### Changes Not Reflecting

**Problem:** Code changes not showing up

**Solution:**
1. **Restart dev server** after `.env` changes
2. **Clear browser cache** for the tunnel URL
3. **Check you're using the tunnel URL**, not localhost

---

## 🎯 What's Next?

1. **Test the login flow end-to-end**
2. **Check that sessions persist after page refresh**
3. **Verify user data is saved to MongoDB**
4. **Test the onboarding flow with a real Facebook account**

---

## 📖 Documentation

- **[FRP-TUNNEL-SETUP.md](FRP-TUNNEL-SETUP.md)** - Detailed FRP setup guide
- **[Better Auth Docs](https://better-auth.com)** - Authentication library docs
- **[FRP GitHub](https://github.com/fatedier/frp)** - FRP proxy documentation

---

## 🆘 Need Help?

If you encounter issues:

1. Check the FRP console output for the actual tunnel URL
2. Verify Facebook App settings match your tunnel URL exactly
3. Restart both dev server and tunnel
4. Check the browser console for errors

**Common mistake:** Using `croozer.freefrp.net` in Facebook settings when FRP actually assigned `croozer.frp1.freefrp.net`!

---

**Happy coding! 🚀**
