"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useDevSession } from "./useDevSession";

export const useAuthGuard = (redirectTo: string = "/login") => {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const devSession = useDevSession();

    const hasSession = session || devSession.user;
    const isStillLoading = isPending || devSession.isLoading;

    useEffect(() => {
        // Only redirect if we're done loading and there's no session
        if (!isStillLoading && !hasSession) {
            router.push(redirectTo);
        }
    }, [hasSession, isStillLoading, router, redirectTo]);

    return {
        isLoading: isStillLoading,
        isAuthenticated: !!hasSession,
        user: session?.user || devSession.user || null,
        session: session || (devSession.user ? { user: devSession.user, isDev: true } : null),
    };
};
