#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TUNNEL_TYPE = process.env.TUNNEL_TYPE || 'cloudflare'; // 'cloudflare' or 'ngrok'
const ENV_FILE = path.join(__dirname, '..', '.env.local');
const PORT = 3000;

console.log('🚀 Starting development with tunnel...\n');

// Parse .env.local file
function parseEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    return {};
  }
  const content = fs.readFileSync(ENV_FILE, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  return env;
}

// Update .env.local with new tunnel URL
function updateEnvFile(tunnelUrl) {
  const env = parseEnvFile();

  // Update the relevant environment variables
  env.BETTER_AUTH_URL = tunnelUrl;
  env.NEXT_PUBLIC_BASE_URL = tunnelUrl;
  env.FACEBOOK_VALID_REDIRECT_TO_UPDATE = `${tunnelUrl}/api/auth/callback/facebook`;

  // Write back to .env.local
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  fs.writeFileSync(ENV_FILE, lines.join('\n') + '\n');

  console.log(`✅ Updated .env.local with tunnel URL: ${tunnelUrl}\n`);
  console.log(`📋 Facebook Redirect URI: ${env.FACEBOOK_VALID_REDIRECT_TO_UPDATE}\n`);
}

// Start Cloudflare tunnel
function startCloudfareTunnel() {
  return new Promise((resolve, reject) => {
    console.log('🌐 Starting Cloudflare Tunnel...\n');

    const tunnel = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${PORT}`]);

    let tunnelUrl = null;

    tunnel.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);

      // Look for the tunnel URL in the output
      const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match && !tunnelUrl) {
        tunnelUrl = match[0];
        console.log(`\n✨ Tunnel URL detected: ${tunnelUrl}\n`);
        updateEnvFile(tunnelUrl);
        resolve({ process: tunnel, url: tunnelUrl });
      }
    });

    tunnel.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    tunnel.on('error', (error) => {
      console.error('❌ Failed to start Cloudflare tunnel:', error.message);
      reject(error);
    });

    tunnel.on('close', (code) => {
      if (code !== 0 && !tunnelUrl) {
        reject(new Error(`Tunnel exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds if no URL is detected
    setTimeout(() => {
      if (!tunnelUrl) {
        tunnel.kill();
        reject(new Error('Timeout: Could not detect tunnel URL'));
      }
    }, 30000);
  });
}

// Start ngrok tunnel
function startNgrokTunnel() {
  return new Promise((resolve, reject) => {
    console.log('🌐 Starting ngrok tunnel...\n');

    const tunnel = spawn('ngrok', ['http', PORT.toString()]);

    let tunnelUrl = null;
    let resolved = false;

    // ngrok v3 exposes API at http://127.0.0.1:4040/api/tunnels
    // Poll the API to get the tunnel URL
    const pollInterval = setInterval(async () => {
      if (resolved) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const http = require('http');
        const response = await new Promise((resolve, reject) => {
          const req = http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
          });
          req.on('error', reject);
          req.setTimeout(1000, () => req.destroy());
        });

        const tunnels = JSON.parse(response);
        if (tunnels.tunnels && tunnels.tunnels.length > 0) {
          const httpsTunnel = tunnels.tunnels.find(t => t.proto === 'https');
          if (httpsTunnel && httpsTunnel.public_url) {
            tunnelUrl = httpsTunnel.public_url;
            resolved = true;
            clearInterval(pollInterval);
            console.log(`\n✨ Tunnel URL detected: ${tunnelUrl}\n`);
            updateEnvFile(tunnelUrl);
            resolve({ process: tunnel, url: tunnelUrl });
          }
        }
      } catch (error) {
        // API not ready yet, continue polling
      }
    }, 500);

    tunnel.stdout.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    tunnel.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    tunnel.on('error', (error) => {
      clearInterval(pollInterval);
      console.error('❌ Failed to start ngrok:', error.message);
      reject(error);
    });

    tunnel.on('close', (code) => {
      clearInterval(pollInterval);
      if (code !== 0 && !resolved) {
        reject(new Error(`ngrok exited with code ${code}`));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!resolved) {
        clearInterval(pollInterval);
        tunnel.kill();
        reject(new Error('Timeout: Could not detect ngrok URL'));
      }
    }, 30000);
  });
}

// Start Next.js development server
function startNextDev() {
  return new Promise((resolve, reject) => {
    console.log('⚡ Starting Next.js development server...\n');

    const nextDev = spawn('pnpm', ['dev'], {
      stdio: 'inherit',
      shell: true
    });

    nextDev.on('error', (error) => {
      console.error('❌ Failed to start Next.js:', error.message);
      reject(error);
    });

    resolve(nextDev);
  });
}

// Main function
async function main() {
  let tunnelProcess = null;
  let nextProcess = null;

  try {
    // Start tunnel based on type
    let tunnelInfo;
    if (TUNNEL_TYPE === 'ngrok') {
      tunnelInfo = await startNgrokTunnel();
    } else {
      tunnelInfo = await startCloudfareTunnel();
    }

    tunnelProcess = tunnelInfo.process;

    // Wait a bit for tunnel to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start Next.js dev server
    nextProcess = await startNextDev();

    // Get the environment values
    const env = parseEnvFile();

    console.log('\n✅ Development environment ready!');
    console.log(`📱 Tunnel URL: ${tunnelInfo.url}`);
    console.log(`💻 Local URL: http://localhost:${PORT}`);
    console.log('\n📋 Environment Variables Updated:');
    console.log(`   • BETTER_AUTH_URL=${env.BETTER_AUTH_URL}`);
    console.log(`   • NEXT_PUBLIC_BASE_URL=${env.NEXT_PUBLIC_BASE_URL}`);
    console.log(`   • FACEBOOK_VALID_REDIRECT_TO_UPDATE=${env.FACEBOOK_VALID_REDIRECT_TO_UPDATE}`);
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Facebook App Dashboard: https://developers.facebook.com/apps/1284378939762336/fb-login/settings/');
    console.log('   2. Update "Valid OAuth Redirect URIs" with:');
    console.log(`      ${env.FACEBOOK_VALID_REDIRECT_TO_UPDATE}`);
    console.log('   3. Update "App Domains" with:');
    console.log(`      ${tunnelInfo.url.replace('https://', '')}`);
    console.log('   4. Click "Save Changes"');
    console.log('\n⚠️  Press Ctrl+C to stop all processes\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (tunnelProcess) tunnelProcess.kill();
    if (nextProcess) nextProcess.kill();
    process.exit(1);
  }

  // Handle cleanup on exit
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    if (tunnelProcess) {
      tunnelProcess.kill();
      console.log('✅ Tunnel stopped');
    }
    if (nextProcess) {
      nextProcess.kill();
      console.log('✅ Next.js stopped');
    }
    process.exit(0);
  });
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
