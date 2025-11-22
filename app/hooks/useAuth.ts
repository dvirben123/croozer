"use client";

import { authClient } from "@/lib/auth-client";

export const useAuth = () => {
    const { data: session, isPending } = authClient.useSession();

    const logout = async () => {
        await authClient.signOut();
        window.location.href = "/login";
    };

    return {
        isLoading: isPending,
        isAuthenticated: !!session,
        user: session?.user || null,
        logout,
    };
};
