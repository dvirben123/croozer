# Cloudflare Tunnel Setup Guide

## ✅ Why Cloudflare Tunnel?

- 🆓 **Completely FREE** forever
- ✅ **HTTPS included** automatically
- ✅ **Fast & Reliable** - Cloudflare's global network
- ✅ **No account required** for quick tunnels
- ⚡ **Instant setup** - Just one command!

---

## 🚀 Quick Start

### 1. Start Development with Tunnel:

```bash
pnpm dev:all
```

This starts:
- **Next.js** on `http://localhost:3000`
- **Cloudflare Tunnel** exposing it publicly

### 2. Copy Your Tunnel URL:

Look for output like this in your terminal:

```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
|  https://random-words-1234.trycloudflare.com                                               |
+--------------------------------------------------------------------------------------------+
```

**Copy that URL!** (e.g., `https://random-words-1234.trycloudflare.com`)

### 3. Update `.env` File:

Replace the placeholder with your actual tunnel URL:

```env
BETTER_AUTH_URL=https://random-words-1234.trycloudflare.com
NEXT_PUBLIC_BASE_URL=https://random-words-1234.trycloudflare.com
```

### 4. Restart Next.js:

Stop and restart your dev server to pick up the new URL:

```bash
# Press Ctrl+C to stop
# Then run again:
pnpm dev:all
```

### 5. Configure Facebook App:

Go to [Facebook App Dashboard](https://developers.facebook.com/apps/1284378939762336/fb-login/settings/)

Add to **Valid OAuth Redirect URIs**:
```
https://random-words-1234.trycloudflare.com/api/auth/callback/facebook
```

Add to **App Domains**:
```
random-words-1234.trycloudflare.com
```

Click **Save Changes**

### 6. Test Facebook Login:

1. Open your tunnel URL: `https://random-words-1234.trycloudflare.com/login`
2. Click "התחבר עם פייסבוק"
3. Complete Facebook OAuth
4. Success! 🎉

---

## 📝 Important Notes

### URL Changes Each Time

⚠️ **The Cloudflare Tunnel URL changes every time you restart the tunnel.**

When you get a new URL, you must:
1. Update `.env` with the new URL
2. Restart Next.js dev server
3. Update Facebook App settings with the new URL

### Persistent Tunnels (Optional - Requires Domain)

If you want a **permanent URL** that doesn't change:

**Requirements:**
- Free Cloudflare account
- Your own domain (any registrar: GoDaddy, Namecheap, etc.)
- Either:
  - Switch nameservers to Cloudflare (easiest), OR
  - Manually copy DNS records to your registrar

**Setup:**
```bash
cloudflared tunnel login
cloudflared tunnel create croozer
cloudflared tunnel route dns croozer croozer.yourdomain.com
```

**Recommendation:** For development, stick with quick tunnels. Permanent URLs are better for production deployments.

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js only (localhost) |
| `pnpm dev:tunnel` | Start Cloudflare Tunnel only |
| `pnpm dev:all` | Start both Next.js + Tunnel together |

---

## 🆚 Comparison: Free Tunnel Options

| Feature | Cloudflare | ngrok Free | FRP Free |
|---------|-----------|------------|----------|
| **Cost** | Free | Free | Free |
| **HTTPS** | ✅ Auto | ✅ Auto | ❌ Manual |
| **Persistent URL** | ❌ Random* | ❌ Random | ❌ Limited |
| **Speed** | ⚡ Fast | ⚡ Fast | 🐌 Varies |
| **Reliability** | ✅ High | ✅ High | ⚠️ Low |
| **Setup** | Easy | Easy | Complex |

*Can be permanent with free Cloudflare account + domain

---

## ❓ Troubleshooting

### Tunnel URL Not Working

**Problem:** Can't access the Cloudflare tunnel URL

**Solutions:**
1. Wait 10-30 seconds after tunnel starts
2. Check if Next.js dev server is running
3. Verify the URL copied correctly (include `https://`)
4. Try refreshing the page

### Facebook "URL Blocked" Error

**Problem:** Facebook rejects the redirect

**Solution:**
1. Copy the **exact** tunnel URL from console
2. Make sure it includes the full callback path: `/api/auth/callback/facebook`
3. Verify it's added to Facebook App settings
4. Click "Save Changes" in Facebook App Dashboard

### Tunnel Keeps Disconnecting

**Problem:** Tunnel stops working after a while

**Solution:**
1. Cloudflare free tunnels may timeout
2. Just restart: `pnpm dev:all`
3. Update `.env` with new URL
4. Update Facebook App settings

### Changes Not Reflecting

**Problem:** Code changes not showing

**Solution:**
1. Restart dev server after changing `.env`
2. Clear browser cache for tunnel URL
3. Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

---

## 🔒 Security Note

⚠️ The tunnel exposes your localhost to the internet:
- Only use during development
- Don't commit sensitive data while tunnel is active
- Stop the tunnel when done: `Ctrl + C`

---

## 🎯 Quick Workflow

**Daily Development Workflow (30 seconds):**

1. **Start everything:**
   ```bash
   pnpm dev:all
   ```

2. **Copy the tunnel URL** from the Cloudflare output:
   ```
   https://some-random-words.trycloudflare.com
   ```

3. **Update `.env`** (replace both URLs):
   ```env
   BETTER_AUTH_URL=https://some-random-words.trycloudflare.com
   NEXT_PUBLIC_BASE_URL=https://some-random-words.trycloudflare.com
   ```

4. **Restart dev server** (Ctrl+C, then `pnpm dev:all`)

5. **Update Facebook App** ([Login Settings](https://developers.facebook.com/apps/1284378939762336/fb-login/settings/)):
   - Valid OAuth Redirect URIs: `https://some-random-words.trycloudflare.com/api/auth/callback/facebook`
   - App Domains: `some-random-words.trycloudflare.com`
   - Click "Save Changes"

6. **Test Facebook login** at `https://some-random-words.trycloudflare.com/login`

7. **Develop normally** - code changes reflect immediately

8. **Stop when done:** `Ctrl + C`

**Note:** URL only changes when you completely restart the tunnel, not on code changes!

---

## 📚 Additional Resources

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Better Auth Docs](https://better-auth.com)
- [Facebook Login Setup](https://developers.facebook.com/docs/facebook-login/web)

---

**Happy Coding! 🚀**
