"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';

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
    console.log('🚀 Launching WhatsApp Signup...');
    console.log('SDK Loaded:', sdkLoaded);
    console.log('window.FB:', !!window.FB);
    console.log('Business ID:', businessId);

    if (!window.FB || !sdkLoaded) {
      const error = 'Facebook SDK not loaded. Please refresh the page.';
      console.error('❌', error);
      onError?.(error);
      return;
    }

    setIsLoading(true);

    const configId = process.env.NEXT_PUBLIC_META_CONFIGURATION_ID;
    console.log('Config ID:', configId ? '✅ Set' : '❌ Missing');
    
    if (!configId) {
      const error = 'WhatsApp configuration not found. Please contact support.';
      console.error('❌ META_CONFIGURATION_ID not configured');
      onError?.(error);
      setIsLoading(false);
      return;
    }

    console.log('📞 Calling FB.login with config:', {
      config_id: configId,
      businessId: businessId,
    });

    // Launch Meta's Embedded Signup dialog
    window.FB.login(
      (response: any) => {
        console.log('📥 FB.login response:', response);

        if (response.authResponse) {
          const code = response.authResponse.code;
          console.log('✅ Got auth code:', code);

          // Exchange code for access token via our backend
          exchangeCodeForToken(code);
        } else {
          console.log('❌ User cancelled login or did not fully authorize.');
          setIsLoading(false);
          onError?.('Authorization cancelled');
        }
      },
      {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        scope: 'whatsapp_business_management,whatsapp_business_messaging,business_management',
        extras: {
          setup: {
            business: {
              id: businessId,
            },
          },
        },
      } as any
    );
  };

  const exchangeCodeForToken = async (code: string) => {
    try {
      console.log('🔄 Exchanging code for access token...');
      const response = await fetch('/api/meta/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, businessId }),
      });

      const result = await response.json();
      console.log('📥 Exchange result:', result);

      if (result.success) {
        console.log('✅ WhatsApp connected successfully:', result.data);

        // Check phone number status
        await checkPhoneStatus();

        onSuccess?.(result.data);
      } else {
        console.error('❌ Connection failed:', result.error);
        onError?.(result.error || 'Failed to connect WhatsApp');
      }
    } catch (error: any) {
      console.error('💥 Token exchange error:', error);
      onError?.(error.message || 'Failed to connect WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  const checkPhoneStatus = async () => {
    try {
      const response = await fetch(`/api/whatsapp/phone-status?businessId=${businessId}`);
      const result = await response.json();

      if (result.success) {
        console.log('📱 Phone Status:', result.data);

        if (!result.data.isVerified) {
          console.warn('⚠️ Phone number not verified yet');
        }

        if (!result.data.isHealthy) {
          console.warn('⚠️ Phone number quality rating is low');
        }
      }
    } catch (error) {
      console.error('Failed to check phone status:', error);
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
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded space-y-1">
          <div className="font-mono">
            SDK: {sdkLoaded ? '✅ Loaded' : '❌ Not Loaded'}
          </div>
          <div className="font-mono">
            Config: {process.env.NEXT_PUBLIC_META_CONFIGURATION_ID ? '✅ Set' : '❌ Missing'}
          </div>
          <div className="font-mono">
            Business ID: {businessId ? '✅ ' + businessId.substring(0, 8) + '...' : '❌ Missing'}
          </div>
          <div className="text-xs mt-2 text-yellow-600">
            💡 Open browser console (F12) for detailed logs
          </div>
        </div>
      )}
    </div>
  );
}

