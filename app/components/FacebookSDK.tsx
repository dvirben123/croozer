"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

interface FacebookSDKProps {
  appId: string;
  version?: string;
}

export default function FacebookSDK({
  appId,
  version = "v18.0",
}: FacebookSDKProps) {
  useEffect(() => {
    // Only initialize if we have an appId
    if (!appId) {
      console.warn("Facebook App ID is required");
      return;
    }

    // Initialize Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true, // Enable cookies to allow the server to access the session
        xfbml: true, // Parse social plugins on this webpage
        version: version, // Use this Graph API version for this call
      });

      // Log page view for Facebook Analytics
      window.FB.AppEvents.logPageView();

      console.log("Facebook SDK initialized successfully");
    };

    // Load Facebook SDK script if not already loaded
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";

      // Add script to head for better loading
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Remove the script if component unmounts
      const script = document.getElementById("facebook-jssdk");
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [appId, version]);

  return null;
}
