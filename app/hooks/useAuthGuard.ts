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

    // Check authentication status
    useEffect(() => {
        const checkAuthStatus = () => {
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
    }, [statusChangeCallback]);

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
