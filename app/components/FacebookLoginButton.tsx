"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut, User } from "lucide-react";
import type {
  FacebookLoginStatusResponse,
  FacebookUser,
} from "@/types/facebook";

export default function FacebookLoginButton() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [loginStatus, setLoginStatus] = useState<
    "loading" | "connected" | "not_authorized" | "unknown"
  >("loading");
  const [user, setUser] = useState<FacebookUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Status change callback as per Facebook documentation
  const statusChangeCallback = useCallback(
    (response: FacebookLoginStatusResponse) => {
      console.log("Facebook Login Status:", response);

      if (response.status === "connected") {
        // User is logged into Facebook and has authorized your app
        setLoginStatus("connected");
        getUserInfo();
      } else if (response.status === "not_authorized") {
        // User is logged into Facebook but has not authorized your app
        setLoginStatus("not_authorized");
        setUser(null);
      } else {
        // User is not logged into Facebook
        setLoginStatus("unknown");
        setUser(null);
      }
    },
    []
  );

  // Get user info from Facebook API
  const getUserInfo = useCallback(() => {
    if (!window.FB) return;

    window.FB.api(
      "/me",
      { fields: "name,email,picture" },
      (response: FacebookUser) => {
        if (response && !response.error) {
          setUser(response);
        } else {
          console.error("Error fetching user info:", response);
        }
      }
    );
  }, []);

  // Check if Facebook SDK is loaded and get login status
  useEffect(() => {
    const checkFacebookSDK = () => {
      if (window.FB && typeof window.FB.getLoginStatus === "function") {
        setIsSDKLoaded(true);

        // Check login status as per Facebook documentation
        window.FB.getLoginStatus((response) => {
          statusChangeCallback(response);
        });
      } else {
        // SDK not ready yet, check again
        setTimeout(checkFacebookSDK, 100);
      }
    };

    checkFacebookSDK();
  }, [statusChangeCallback]);

  // Handle Facebook login
  const handleLogin = async () => {
    if (!window.FB) {
      console.error("Facebook SDK not loaded");
      return;
    }

    // Check if FB is properly initialized before calling login
    if (!window.FB.getLoginStatus || !isSDKLoaded) {
      console.error("Facebook SDK not fully initialized");
      return;
    }

    setIsLoading(true);

    // First check current status, then login if needed
    window.FB.getLoginStatus(async (currentStatus) => {
      if (currentStatus.status === "connected") {
        // Already logged in, create backend session
        await createBackendSession(currentStatus);
      } else {
        // Need to login
        window.FB.login(
          async (response) => {
            if (response.status === "connected") {
              await createBackendSession(response);
            } else {
              console.log("User cancelled login or did not fully authorize.");
              setIsLoading(false);
            }
          },
          {
            scope: "email,public_profile", // Request specific permissions
          }
        );
      }
    });
  };

  // Create backend session after Facebook login
  const createBackendSession = async (response: FacebookLoginStatusResponse) => {
    try {
      if (!response.authResponse) {
        throw new Error("No auth response from Facebook");
      }

      // Send Facebook token to backend to create session
      const backendResponse = await fetch("/api/auth/facebook/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: response.authResponse.accessToken,
          userID: response.authResponse.userID,
        }),
      });

      const result = await backendResponse.json();

      if (result.success) {
        console.log("✅ Backend session created successfully");
        statusChangeCallback(response);

        // Check if we're on the onboarding page - if so, just refresh
        // Otherwise redirect to dashboard
        const currentPath = window.location.pathname;
        if (currentPath === "/onboarding") {
          window.location.reload();
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        console.error("Failed to create backend session:", result.error);
        alert("שגיאה בהתחברות. אנא נסה שוב.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating backend session:", error);
      alert("שגיאה בהתחברות. אנא נסה שוב.");
      setIsLoading(false);
    }
  };

  // Handle Facebook logout
  const handleLogout = async () => {
    if (!window.FB) return;

    setIsLoading(true);

    try {
      // First logout from Facebook
      window.FB.logout(async () => {
        // Then clear backend session
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          setLoginStatus("unknown");
          setUser(null);
          console.log("✅ User logged out from Facebook and backend");

          // Redirect to login page
          window.location.href = "/login";
        } else {
          console.error("Failed to clear backend session");
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  // Loading state while SDK initializes
  if (!isSDKLoaded || loginStatus === "loading") {
    return (
      <Button disabled variant="outline" className="gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        טוען Facebook SDK...
      </Button>
    );
  }

  // User is connected and authorized
  if (loginStatus === "connected" && user) {
    return (
      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.picture?.data?.url} alt={user.name} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="font-medium text-sm">שלום, {user.name}!</p>
            {user.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
          ) : (
            <LogOut className="h-3 w-3" />
          )}
          התנתק
        </Button>
      </div>
    );
  }

  // User needs to login or authorize
  const buttonText =
    loginStatus === "not_authorized" ? "אשר גישה לפייסבוק" : "התחבר עם פייסבוק";

  return (
    <div className="space-y-3">
      {loginStatus === "not_authorized" && (
        <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg text-center border border-orange-200">
          <p className="font-medium">נדרש אישור נוסף</p>
          <p className="text-xs mt-1">
            אתה מחובר לפייסבוק אבל צריך לאשר גישה לאפליקציה
          </p>
        </div>
      )}

      <Button
        onClick={handleLogin}
        disabled={isLoading || !isSDKLoaded}
        className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white gap-2 h-12 shadow-lg disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            מתחבר...
          </>
        ) : !isSDKLoaded ? (
          <>
            <div className="animate-pulse w-4 h-4 bg-white/30 rounded"></div>
            טוען פייסבוק...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {buttonText}
          </>
        )}
      </Button>
    </div>
  );
}
