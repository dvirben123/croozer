import { getServerSession } from "../auth";

/**
 * Admin email whitelist
 * Users with these emails will have admin privileges
 */
const ADMIN_EMAILS = [
  "croozer100@gmail.com",
  "admin@croozer.co.il",
  "dev@localhost", // Development mode admin
];

/**
 * Check if an email is in the admin whitelist
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Server-side admin guard - check if current session user is admin
 * Returns the session with isAdmin flag
 */
export async function getAdminSession() {

  const session = await getServerSession();

  if (!session?.user) {
    return null;
  }

  const isAdmin = isAdminEmail(session.user.email);

  return {
    ...session,
    user: {
      ...session.user,
      isAdmin,
    },
  };
}

/**
 * Require admin session or throw error
 * Use this in API routes that require admin access
 */
export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("Unauthorized: No session");
  }

  if (!session.user.isAdmin) {
    throw new Error("Forbidden: Admin access required");
  }

  return session;
}

/**
 * Get session with admin check (doesn't throw, returns null if not admin)
 * Use this in pages/components that conditionally show admin features
 */
export async function getSessionWithAdmin() {
  return await getAdminSession();
}
