"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";
import type { FacebookLoginStatusResponse, FacebookUser } from "@/types/facebook";

interface FacebookHtmlLoginButtonProps {
  size?: "small" | "medium" | "large";
  buttonType?: "continue_with" | "login_with";
  layout?: "default" | "rounded";
  onStatusChange?: (
    status: "connected" | "not_authorized" | "unknown",
    user?: FacebookUser
  ) => void;
}

export default function FacebookHtmlLoginButton({
  size = "large",
  buttonType = "continue_with",
  layout = "rounded",
  onStatusChange,
}: FacebookHtmlLoginButtonProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [loginStatus, setLoginStatus] = useState<
    "loading" | "connected" | "not_authorized" | "unknown"
  >("loading");
  const [user, setUser] = useState<FacebookUser | null>(null);

  // Get user info from Facebook API
  const getUserInfo = useCallback(() => {
    if (!window.FB) return;

    window.FB.api(
      "/me",
      { fields: "name,email,picture" },
      (response: FacebookUser) => {
        if (response && !response.error) {
          setUser(response);
          onStatusChange?.("connected", response);
        } else {
          console.error("Error fetching user info:", response);
        }
      }
    );
  }, [onStatusChange]);

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
        onStatusChange?.("not_authorized");
      } else {
        // User is not logged into Facebook
        setLoginStatus("unknown");
        setUser(null);
        onStatusChange?.("unknown");
      }
    },
    [getUserInfo, onStatusChange]
  );

  // Check login state function - called by Facebook's onlogin
  const checkLoginState = useCallback(() => {
    if (!window.FB) return;

    window.FB.getLoginStatus((response: FacebookLoginStatusResponse) => {
      statusChangeCallback(response);
    });
  }, [statusChangeCallback]);

  // Setup global functions for Facebook's HTML button
  useEffect(() => {
    // Make functions available globally for Facebook's onlogin callback
    window.checkLoginState = checkLoginState;
    window.statusChangeCallback = statusChangeCallback;

    return () => {
      // Cleanup
      delete window.checkLoginState;
      delete window.statusChangeCallback;
    };
  }, [checkLoginState, statusChangeCallback]);

  // Check if Facebook SDK is loaded and get initial login status
  useEffect(() => {
    const checkFacebookSDK = () => {
      if (window.FB && typeof window.FB.getLoginStatus === "function") {
        setIsSDKLoaded(true);

        // Check initial login status
        window.FB.getLoginStatus((response) => {
          statusChangeCallback(response);
        });

        // Parse XFBML elements (important for fb:login-button)
        if (window.FB.XFBML && window.FB.XFBML.parse) {
          setTimeout(() => {
            window.FB.XFBML.parse();
          }, 100);
        }
      } else {
        // SDK not ready yet, check again
        setTimeout(checkFacebookSDK, 100);
      }
    };

    checkFacebookSDK();
  }, [statusChangeCallback]);

  // Handle logout
  const handleLogout = () => {
    if (!window.FB) return;

    window.FB.logout(() => {
      setLoginStatus("unknown");
      setUser(null);
      onStatusChange?.("unknown");
      console.log("User logged out");
    });
  };

  // Loading state while SDK initializes
  if (!isSDKLoaded || loginStatus === "loading") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1877F2]"></div>
        <span className="mr-2 text-sm">טוען Facebook SDK...</span>
      </div>
    );
  }

  // User is connected and authorized
  if (loginStatus === "connected" && user) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
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
                <p className="text-xs text-green-600">מחובר בהצלחה</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-3 w-3" />
              התנתק
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render Facebook's HTML login button
  return (
    <div className="space-y-3">
      {/* Status message for not_authorized */}
      {loginStatus === "not_authorized" && (
        <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg text-center">
          אתה מחובר לפייסבוק אבל צריך לאשר גישה לאפליקציה
        </div>
      )}

      {/* Facebook's official HTML login button */}
      <div
        className="text-center"
        dangerouslySetInnerHTML={{
          __html: `<fb:login-button 
                     size="${size}"
                     button_type="${buttonType}"
                     layout="${layout}"
                     scope="email,public_profile"
                     onlogin="checkLoginState();">
                   </fb:login-button>`,
        }}
      />

      {/* Fallback message */}
      <p className="text-xs text-muted-foreground text-center">
        {loginStatus === "not_authorized"
          ? "אשר את הגישה לאפליקציה כדי להמשיך"
          : "התחבר באמצעות חשבון הפייסבוק שלך"}
      </p>
    </div>
  );
}
