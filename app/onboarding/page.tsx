"use client";

import { useEffect } from 'react';
import Script from 'next/script';
import { useTranslations, useLocale } from 'next-intl';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import WizardStepper from '@/components/onboarding/WizardStepper';
import BusinessDetailsStep from '@/components/onboarding/BusinessDetailsStep';
import CategorySelectionStep from '@/components/onboarding/CategorySelectionStep';
import MenuBuilderStep from '@/components/onboarding/MenuBuilderStep';
import WhatsAppSetupStep from '@/components/onboarding/WhatsAppSetupStep';
import PaymentSetupStep from '@/components/onboarding/PaymentSetupStep';
import ConversationFlowStep from '@/components/onboarding/ConversationFlowStep';
import CompletionStep from '@/components/onboarding/CompletionStep';

function OnboardingContent() {
  const { data, updateData } = useOnboarding();
  const t = useTranslations('onboarding');
  const locale = useLocale();
  
  const steps = [
    { number: 0, title: t('steps.businessDetails') },
    { number: 1, title: t('steps.category') },
    { number: 2, title: t('steps.whatsapp') },
    { number: 3, title: t('steps.menu') },
    { number: 4, title: t('steps.payment') },
    { number: 5, title: t('steps.messages') },
    { number: 6, title: t('steps.complete') },
  ];

  useEffect(() => {
    // Initialize business if not exists
    const initBusiness = async () => {
      if (!data.businessId) {
        try {
          // Call API without userId - backend will get it from session
          const response = await fetch('/api/onboarding/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          const result = await response.json();

          if (result.success && result.data) {
            updateData({ businessId: result.data._id });
          } else {
            // User is not authenticated, save current path and redirect to login
            console.error('Failed to initialize business:', result.error);
            if (result.error === 'Unauthorized') {
              // Only save redirect if not already set (prevent loops)
              if (!sessionStorage.getItem('redirectAfterLogin')) {
                sessionStorage.setItem('redirectAfterLogin', '/onboarding');
              }
              window.location.href = '/login';
            }
          }
        } catch (error) {
          console.error('Failed to initialize business:', error);
        }
      }
    };

    initBusiness();
  }, [data.businessId, updateData]);

  const renderStep = () => {
    switch (data.currentStep) {
      case 0:
        return <BusinessDetailsStep />;
      case 1:
        return <CategorySelectionStep />;
      case 2:
        return <WhatsAppSetupStep />;
      case 3:
        return <MenuBuilderStep />;
      case 4:
        return <PaymentSetupStep />;
      case 5:
        return <ConversationFlowStep />;
      case 6:
        return <CompletionStep />;
      default:
        return <BusinessDetailsStep />;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-8 ${locale === 'he' ? 'dir-rtl' : ''}`} dir={locale === 'he' ? 'rtl' : 'ltr'}>
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Stepper */}
        <WizardStepper
          steps={steps}
          currentStep={data.currentStep}
          completedSteps={data.stepsCompleted}
        />

        {/* Current Step Content */}
        <div className="mt-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <>
      {/* Facebook SDK for WhatsApp Embedded Signup */}
      <Script
        id="facebook-sdk-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.fbAsyncInit = function() {
              FB.init({
                appId: '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1284378939762336'}',
                autoLogAppEvents: true,
                cookie: true,
                xfbml: true,
                version: 'v22.0'
              });
              console.log('✅ Facebook SDK initialized for WhatsApp Embedded Signup');
            };
          `,
        }}
      />
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
      />

      <OnboardingProvider>
        <OnboardingContent />
      </OnboardingProvider>
    </>
  );
}

