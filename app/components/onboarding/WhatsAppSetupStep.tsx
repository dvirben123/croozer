"use client";

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import WhatsAppConnectButton from './WhatsAppConnectButton';

export default function WhatsAppSetupStep() {
  const t = useTranslations('onboarding.whatsapp');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { data, updateData, nextStep, previousStep, saveProgress, isLoading } = useOnboarding();
  const [error, setError] = useState<string | null>(null);

  const handleWhatsAppSuccess = (whatsappData: any) => {
    console.log('WhatsApp connected successfully:', whatsappData);
    updateData({
      whatsappConnected: true,
      whatsappAccountId: whatsappData.whatsappAccountId,
    });
    setError(null);
  };

  const handleWhatsAppError = (errorMessage: string) => {
    console.error('WhatsApp connection error:', errorMessage);
    setError(errorMessage);
  };

  const handleNext = async () => {
    try {
      await saveProgress();
      nextStep();
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await saveProgress();
      nextStep();
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const ArrowIcon = locale === 'he' ? ArrowRight : ArrowLeft;
  const ArrowIconReverse = locale === 'he' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-2xl mx-auto" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.whatsappConnected ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('connected.title')}</h3>
                <p className="text-muted-foreground">
                  {t('connected.description')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-primary/10 border-2 border-primary/20 p-6 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-primary">{t('criticalStep')}</h3>
                </div>
                <p className="text-sm">
                  {t('criticalDescription')}
                </p>
              </div>

              <div className="bg-muted p-6 rounded-lg space-y-4">
                <h3 className="font-semibold">{t('requirements.title')}</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm">{t('requirements.phoneNumber')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm">{t('requirements.facebookAccount')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm">{t('requirements.phoneAccess')}</span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-900 font-medium">{t('connectionError')}</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="text-center">
                {data.businessId ? (
                  <WhatsAppConnectButton
                    businessId={data.businessId}
                    onSuccess={handleWhatsAppSuccess}
                    onError={handleWhatsAppError}
                  />
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-sm text-yellow-900">
                      <strong>Note:</strong> Missing business ID. Please save the details in the first step.
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {t('redirectNote')}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>{t('important')}:</strong> {t('importantNote')}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={`flex justify-between pt-4 border-t ${locale === 'he' ? '' : 'flex-row-reverse'}`}>
            <Button variant="outline" onClick={previousStep} disabled={isLoading}>
              {locale === 'he' ? (
                <>
                  <ArrowRight className="w-4 h-4 ml-2" />
                  {t('back')}
                </>
              ) : (
                <>
                  {t('back')}
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
            <div className="flex gap-2">
              {!data.whatsappConnected && (
                <Button variant="ghost" onClick={handleSkip} disabled={isLoading}>
                  {t('skipForNow')}
                </Button>
              )}
              <Button onClick={handleNext} disabled={isLoading}>
                {isLoading ? t('saving') : t('continue')}
                {locale === 'he' ? (
                  <ArrowLeft className="w-4 h-4 mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

