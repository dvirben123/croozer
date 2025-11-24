# Development Scripts

## dev-tunnel.js

Automated development script that:
1. Starts a tunnel (Cloudflare or ngrok)
2. Detects the tunnel URL
3. Updates `.env.local` with the tunnel URL
4. Starts Next.js development server

### Usage

#### Using Cloudflare Tunnel (Default)
```bash
pnpm dev:tunnel
# or
pnpm dev:tunnel:cloudflare
```

#### Using ngrok
```bash
pnpm dev:tunnel:ngrok
```

### What it does

1. **Starts the tunnel**: Launches Cloudflare Tunnel or ngrok
2. **Extracts tunnel URL**: Monitors the tunnel output to detect the public URL
3. **Updates environment**: Automatically updates `.env.local` with:
   - `BETTER_AUTH_URL=<tunnel-url>`
   - `NEXT_PUBLIC_BASE_URL=<tunnel-url>`
4. **Starts Next.js**: Launches the development server with the updated environment
5. **Shows next steps**: Displays the tunnel URL and instructions for Facebook App setup

### Requirements

- **Cloudflare Tunnel**: `cloudflared` must be installed
  ```bash
  brew install cloudflared
  ```

- **ngrok**: `ngrok` must be installed (optional)
  ```bash
  brew install ngrok
  ```

### Environment Variables

The script updates `.env.local` (creates it if it doesn't exist) with:
- `BETTER_AUTH_URL`: The tunnel URL for Better Auth callbacks
- `NEXT_PUBLIC_BASE_URL`: The public base URL for the application
- `FACEBOOK_VALID_REDIRECT_TO_UPDATE`: The complete redirect URI to add to Facebook App settings

### Notes

- Press `Ctrl+C` to stop both the tunnel and Next.js dev server
- The tunnel URL changes each time you restart (for free Cloudflare tunnels)
- Remember to update your Facebook App settings with the new tunnel URL

### Troubleshooting

**Tunnel doesn't start:**
- Make sure `cloudflared` or `ngrok` is installed
- Check that port 3000 is available

**Tunnel URL not detected:**
- The script has a 30-second timeout
- Check the console output for errors
- Try running manually: `cloudflared tunnel --url http://localhost:3000`

**Next.js doesn't pick up new environment:**
- The script updates `.env.local` before starting Next.js
- If you need to change the URL mid-development, restart the script
