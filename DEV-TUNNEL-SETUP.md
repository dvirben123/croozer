# Automated Development Tunnel Setup

## Overview

An automated script that sets up your development environment with a public tunnel for testing Facebook OAuth and other features that require a public HTTPS URL.

## Quick Start

Just run:
```bash
pnpm dev:tunnel
```

The script will automatically:
1. Start Cloudflare Tunnel
2. Detect the public URL
3. Update `.env.local` with the URL
4. Start Next.js development server
5. Display the tunnel URL and setup instructions

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js only (localhost) |
| `pnpm dev:tunnel` | Start with Cloudflare Tunnel (automated) |
| `pnpm dev:tunnel:cloudflare` | Same as above (explicit) |
| `pnpm dev:tunnel:ngrok` | Start with ngrok (automated) |

## How It Works

### 1. Tunnel Detection
The script monitors the tunnel process output and extracts the public URL:
- **Cloudflare**: Looks for `https://*.trycloudflare.com`
- **ngrok**: Looks for `https://*.ngrok*.io`

### 2. Environment Update
Automatically updates `.env.local` with:
```env
BETTER_AUTH_URL=https://your-tunnel-url.trycloudflare.com
NEXT_PUBLIC_BASE_URL=https://your-tunnel-url.trycloudflare.com
FACEBOOK_VALID_REDIRECT_TO_UPDATE=https://your-tunnel-url.trycloudflare.com/api/auth/callback/facebook
```

### 3. Development Server
Starts Next.js with the updated environment, so Better Auth callbacks work immediately.

### 4. Facebook App Setup
After the script starts, you'll see instructions to update Facebook App settings:
- Valid OAuth Redirect URI: `https://your-tunnel-url/api/auth/callback/facebook`
- App Domain: `your-tunnel-url.trycloudflare.com`

## Installation Requirements

### Cloudflare Tunnel (Default)
```bash
brew install cloudflared
```

### ngrok (Optional)
```bash
brew install ngrok
```

## Environment Variables

The script manages these variables in `.env.local`:

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_URL` | Base URL for Better Auth OAuth callbacks |
| `NEXT_PUBLIC_BASE_URL` | Public base URL for the application |
| `FACEBOOK_VALID_REDIRECT_TO_UPDATE` | Complete Facebook OAuth redirect URI (for easy copy-paste) |

## Benefits

✅ **No Manual Steps**: No need to copy URLs or edit `.env.local` manually
✅ **Automatic Updates**: Environment is always in sync with the tunnel URL
✅ **Clean Shutdown**: Press Ctrl+C to stop both tunnel and Next.js
✅ **Clear Instructions**: Shows exactly what to update in Facebook App settings
✅ **Flexible**: Choose between Cloudflare or ngrok

## Workflow

### Development Session
1. Run `pnpm dev:tunnel`
2. Wait for tunnel URL to appear
3. Update Facebook App settings (one-time per session)
4. Start developing
5. Press Ctrl+C when done

### URL Changes
The Cloudflare tunnel URL changes on each restart. The script handles this automatically:
- Detects new URL
- Updates `.env.local`
- Starts Next.js with correct environment

You just need to update the Facebook App settings with the new URL.

## Troubleshooting

### Tunnel doesn't start
**Problem**: `cloudflared: command not found`

**Solution**: Install cloudflared
```bash
brew install cloudflared
```

### Port already in use
**Problem**: Port 3000 is already in use

**Solution**: Kill the process using port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

### Tunnel URL not detected
**Problem**: Script times out after 30 seconds

**Solution**:
1. Check internet connection
2. Try running manually: `cloudflared tunnel --url http://localhost:3000`
3. Check firewall settings

### Next.js doesn't see new URL
**Problem**: Environment variables not updating

**Solution**: The script updates `.env.local` before starting Next.js, so this shouldn't happen. If it does, restart the script.

## Manual Alternative

If you prefer manual control, see [CLOUDFLARE-TUNNEL-GUIDE.md](./CLOUDFLARE-TUNNEL-GUIDE.md) for step-by-step instructions.

## Files

- `scripts/dev-tunnel.js` - Main automation script
- `scripts/README.md` - Detailed script documentation
- `.env.local` - Environment variables (auto-generated/updated)

## Next Steps

After running `pnpm dev:tunnel`:

1. **Copy the tunnel URL** from the console output
2. **Update Facebook App** ([Dashboard](https://developers.facebook.com/apps/1284378939762336/fb-login/settings/)):
   - Add Valid OAuth Redirect URI: `<tunnel-url>/api/auth/callback/facebook`
   - Add App Domain: `<tunnel-url-domain>`
   - Click "Save Changes"
3. **Test Facebook Login** at `<tunnel-url>/login`

## Notes

- Cloudflare free tunnels generate random URLs each time
- The script handles this automatically
- You only need to update Facebook App settings (takes 30 seconds)
- Consider a named tunnel for a permanent URL (requires domain)
