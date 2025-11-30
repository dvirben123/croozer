"use client";

import { authClient } from "@/lib/auth-client";
import { useDevSession } from "./useDevSession";
import { isAdminEmail } from "@/lib/middleware/adminGuard";

/**
 * Client-side hook to check if current user is admin
 * Returns isAdmin flag and loading state
 * Supports both Better Auth and dev sessions
 */
export function useAdmin() {
  const { data: session, isPending } = authClient.useSession();
  const devSession = useDevSession();

  const user = session?.user || devSession.user;
  const isStillLoading = isPending || devSession.isLoading;

  const isAdmin = user?.email ? isAdminEmail(user.email) : false;

  return {
    isAdmin,
    isLoading: isStillLoading,
    user: user || null,
  };
}
