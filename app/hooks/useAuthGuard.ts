"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export const useAuthGuard = (redirectTo: string = "/login") => {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        // Only redirect if we're done loading and there's no session
        if (!isPending && !session) {
            router.push(redirectTo);
        }
    }, [session, isPending, router, redirectTo]);

    return {
        isLoading: isPending,
        isAuthenticated: !!session,
        user: session?.user || null,
        session,
    };
};
