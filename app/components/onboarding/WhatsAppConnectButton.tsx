"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2 } from "lucide-react";

interface WhatsAppConnectButtonProps {
  businessId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function WhatsAppConnectButton({
  businessId,
  onSuccess,
  onError,
}: WhatsAppConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    // Check if Facebook SDK is already loaded
    if (window.FB) {
      setSdkLoaded(true);
      return;
    }

    // Wait for SDK to load
    const checkSDK = setInterval(() => {
      if (window.FB) {
        setSdkLoaded(true);
        clearInterval(checkSDK);
      }
    }, 100);

    return () => clearInterval(checkSDK);
  }, []);

  const launchWhatsAppSignup = () => {
    console.log("🚀 Launching WhatsApp Signup...");
    console.log("Business ID:", businessId);

    setIsLoading(true);

    const configId = process.env.NEXT_PUBLIC_META_CONFIGURATION_ID;
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "1284378939762336";

    console.log("📋 Configuration Check:");
    console.log("  - Config ID:", configId);
    console.log("  - App ID:", appId);
    console.log("  - Business ID:", businessId);
    console.log("  - FB SDK Loaded:", !!window.FB);

    if (!configId) {
      const error =
        "Configuration ID not found. Please restart dev server after setting NEXT_PUBLIC_META_CONFIGURATION_ID in .env";
      console.error("❌ META_CONFIGURATION_ID not configured");
      alert(error);
      onError?.(error);
      setIsLoading(false);
      return;
    }

    if (!window.FB) {
      console.error("❌ Facebook SDK not loaded");
      alert("Facebook SDK not loaded. Please refresh the page.");
      setIsLoading(false);
      onError?.("Facebook SDK not loaded");
      return;
    }

    // Store session info from postMessage
    let sessionInfo: { phone_number_id: string; waba_id: string } | null = null;

    // Set up postMessage listener (per Meta documentation)
    const messageHandler = (event: MessageEvent) => {
      // Only accept messages from Facebook
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

      console.log("📩 Received message from popup:", event.data);

      try {
        const data =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH" && data.data) {
            const { phone_number_id, waba_id } = data.data;
            console.log("✅ Session info received:", {
              phone_number_id,
              waba_id,
            });

            // Store session info to be used with the OAuth code
            sessionInfo = { phone_number_id, waba_id };
          } else if (data.event === "CANCEL") {
            const { current_step } = data.data;
            console.log("❌ User cancelled at step:", current_step);
            setIsLoading(false);
            onError?.("Signup cancelled by user");
          } else if (data.event === "ERROR") {
            const { error_message } = data.data;
            console.error("❌ Error during signup:", error_message);
            setIsLoading(false);
            onError?.(error_message || "Error during signup");
          }
        }
      } catch (error) {
        console.log("Non-JSON response:", event.data);
      }
    };

    window.addEventListener("message", messageHandler);

    // FB.login callback (per Meta documentation)
    const fbLoginCallback = (response: any) => {
      console.log("📥 FB.login response:", response);

      if (response.authResponse) {
        const code = response.authResponse.code;
        const facebookUserId = response.authResponse.userID;

        // Log all Meta support information in a clear format
        console.log("═══════════════════════════════════════════════════════");
        console.log("📋 META SUPPORT INFORMATION (for debugging):");
        console.log("═══════════════════════════════════════════════════════");
        console.log("1. App ID:", appId);
        console.log("2. Facebook User ID:", facebookUserId);
        console.log("3. Business ID (Croozer):", businessId);
        console.log("4. Auth Code:", code);
        console.log("═══════════════════════════════════════════════════════");

        console.log("✅ Got auth code:", code);
        console.log("✅ Got Facebook User ID:", facebookUserId);

        // Wait a bit for session info to arrive via postMessage
        setTimeout(() => {
          if (sessionInfo) {
            console.log(
              "🔄 Registering WhatsApp with code and session info..."
            );
            console.log("   - WABA ID:", sessionInfo.waba_id);
            console.log("   - Phone Number ID:", sessionInfo.phone_number_id);
            registerWhatsApp(
              code,
              sessionInfo.phone_number_id,
              sessionInfo.waba_id,
              facebookUserId
            );
          } else {
            console.warn(
              "⚠️ No session info received, registering with code only..."
            );
            // Fallback: try to register with just the code
            registerWhatsAppWithCode(code, facebookUserId);
          }
          window.removeEventListener("message", messageHandler);
        }, 1000);
      } else {
        console.error("❌ No auth response from FB.login");
        setIsLoading(false);
        onError?.("Facebook login failed");
        window.removeEventListener("message", messageHandler);
      }
    };

    // Launch Facebook login (per Meta documentation)
    if (!window.FB) {
      console.error("❌ Facebook SDK not loaded");
      setIsLoading(false);
      onError?.("Facebook SDK not loaded");
      return;
    }

    window.FB.login(fbLoginCallback, {
      config_id: configId,
      response_type: "code",
      override_default_response_type: true,
      extras: {
        setup: {
          business: {
            id: businessId,
          },
        },
        sessionInfoVersion: "3",
        version: "v3",
      },
    });
  };

  const registerWhatsApp = async (
    code: string,
    phoneNumberId: string,
    wabaId: string,
    facebookUserId?: string
  ) => {
    try {
      console.log("🔄 Registering WhatsApp with backend...");
      const response = await fetch("/api/meta/register-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          phoneNumberId,
          wabaId,
          businessId,
          facebookUserId,
        }),
      });

      const result = await response.json();
      console.log("📥 Registration result:", result);

      if (result.success) {
        console.log("✅ WhatsApp registered successfully:", result.data);

        // Check phone number status
        await checkPhoneStatus();

        onSuccess?.(result.data);
      } else {
        console.error("❌ Registration failed:", result.error);
        onError?.(result.error || "Failed to register WhatsApp");
      }
    } catch (error: any) {
      console.error("💥 Registration error:", error);
      onError?.(error.message || "Failed to register WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const registerWhatsAppWithCode = async (
    code: string,
    facebookUserId?: string
  ) => {
    try {
      console.log("🔄 Exchanging code for access token...");
      const response = await fetch("/api/meta/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, businessId, facebookUserId }),
      });

      const result = await response.json();
      console.log("📥 Exchange result:", result);

      if (result.success) {
        console.log("✅ WhatsApp connected successfully:", result.data);

        // Check phone number status
        await checkPhoneStatus();

        onSuccess?.(result.data);
      } else {
        console.error("❌ Connection failed:", result.error);
        onError?.(result.error || "Failed to connect WhatsApp");
      }
    } catch (error: any) {
      console.error("💥 Token exchange error:", error);
      onError?.(error.message || "Failed to connect WhatsApp");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPhoneStatus = async () => {
    try {
      const response = await fetch(
        `/api/whatsapp/phone-status?businessId=${businessId}`
      );
      const result = await response.json();

      if (result.success) {
        console.log("📱 Phone Status:", result.data);

        if (!result.data.isVerified) {
          console.warn("⚠️ Phone number not verified yet");
        }

        if (!result.data.isHealthy) {
          console.warn("⚠️ Phone number quality rating is low");
        }
      }
    } catch (error) {
      console.error("Failed to check phone status:", error);
      // Don't fail the whole flow
    }
  };

  return (
    <div className="space-y-4">
      <Button
        size="lg"
        onClick={launchWhatsAppSignup}
        disabled={isLoading || !sdkLoaded}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
            מתחבר...
          </>
        ) : (
          <>
            <MessageCircle className="w-5 h-5 ml-2" />
            חבר וואטסאפ עסקי
          </>
        )}
      </Button>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded space-y-1">
          <div className="font-mono">
            SDK: {sdkLoaded ? "✅ Loaded" : "❌ Not Loaded"}
          </div>
          <div className="font-mono">
            Config:{" "}
            {process.env.NEXT_PUBLIC_META_CONFIGURATION_ID
              ? "✅ Set"
              : "❌ Missing"}
          </div>
          <div className="font-mono">
            Business ID:{" "}
            {businessId
              ? "✅ " + businessId.substring(0, 8) + "..."
              : "❌ Missing"}
          </div>
          <div className="text-xs mt-2 text-yellow-600">
            💡 Open browser console (F12) for detailed logs
          </div>
        </div>
      )}
    </div>
  );
}
