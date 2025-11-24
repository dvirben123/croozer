import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  // Always use the same origin as the client (no baseURL needed for same-origin requests)
  // This prevents CORS issues when using tunnels
})

export const { signIn, signOut, useSession } = authClient
