"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { FacebookLoginStatusResponse, FacebookUser } from "@/types/facebook";

interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    user: FacebookUser | null;
    loginStatus: "loading" | "connected" | "not_authorized" | "unknown";
}

export const useAuthGuard = (redirectTo: string = "/login") => {
    const router = useRouter();

    const [authState, setAuthState] = useState<AuthState>({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        loginStatus: "loading",
    });

    // Get user info from Facebook API
    const getUserInfo = useCallback(() => {
        if (!window.FB) return;

        window.FB.api(
            "/me",
            { fields: "name,email,picture" },
            (response: FacebookUser) => {
                if (response && !response.error) {
                    setAuthState((prev) => ({
                        ...prev,
                        user: response,
                        isAuthenticated: true,
                        isLoading: false,
                    }));
                } else {
                    console.error("Error fetching user info:", response);
                    setAuthState((prev) => ({
                        ...prev,
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                    }));
                }
            }
        );
    }, []);

    // Status change callback
    const statusChangeCallback = useCallback(
        (response: FacebookLoginStatusResponse) => {
            console.log("Auth Guard - Facebook Login Status:", response);

            if (response.status === "connected") {
                // User is logged into Facebook and has authorized your app
                setAuthState((prev) => ({
                    ...prev,
                    loginStatus: "connected",
                    isAuthenticated: true,
                }));
                getUserInfo();
            } else if (response.status === "not_authorized") {
                // User is logged into Facebook but has not authorized your app
                setAuthState({
                    isLoading: false,
                    isAuthenticated: false,
                    user: null,
                    loginStatus: "not_authorized",
                });
                // Redirect to login page
                router.push(redirectTo);
            } else {
                // User is not logged into Facebook
                setAuthState({
                    isLoading: false,
                    isAuthenticated: false,
                    user: null,
                    loginStatus: "unknown",
                });
                // Redirect to login page
                router.push(redirectTo);
            }
        },
        [getUserInfo, router, redirectTo]
    );

    // Check for dev session first (development only)
    const checkDevSession = useCallback(async () => {
        if (process.env.NODE_ENV === 'development') {
            try {
                const response = await fetch('/api/auth/dev-session');
                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        setAuthState({
                            isLoading: false,
                            isAuthenticated: true,
                            user: data.user,
                            loginStatus: "connected",
                        });
                        return true;
                    }
                }
            } catch (error) {
                // No dev session, continue to Facebook check
            }
        }
        return false;
    }, []);

    // Check authentication status
    useEffect(() => {
        const checkAuthStatus = async () => {
            // Check dev session first (dev mode only)
            const hasDevSession = await checkDevSession();
            if (hasDevSession) return;

            // Check Facebook auth
            if (window.FB && typeof window.FB.getLoginStatus === "function") {
                // Check login status
                window.FB.getLoginStatus((response: FacebookLoginStatusResponse) => {
                    statusChangeCallback(response);
                });
            } else {
                // SDK not ready yet, check again
                setTimeout(checkAuthStatus, 100);
            }
        };

        checkAuthStatus();
    }, [statusChangeCallback, checkDevSession]);

    // Logout function
    const logout = useCallback(() => {
        if (!window.FB) return;

        window.FB.logout(() => {
            setAuthState({
                isLoading: false,
                isAuthenticated: false,
                user: null,
                loginStatus: "unknown",
            });
            router.push(redirectTo);
            console.log("User logged out");
        });
    }, [router, redirectTo]);

    return {
        ...authState,
        logout,
    };
};
