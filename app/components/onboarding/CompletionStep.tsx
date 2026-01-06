"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, ArrowRight, Rocket } from 'lucide-react';

export default function CompletionStep() {
  const t = useTranslations('onboarding.completion');
  const locale = useLocale();
  const router = useRouter();
  const { data } = useOnboarding();

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const categoryLabel = data.category === 'restaurant' 
    ? t('categoryRestaurant') 
    : data.category === 'fast_food' 
    ? t('categoryFastFood') 
    : '';

  return (
    <div className="max-w-2xl mx-auto" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg space-y-4">
            <h3 className="font-semibold">{t('summaryTitle')}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('businessName')}</span>
                <span className="font-semibold">{data.name}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('category')}</span>
                <span className="font-semibold">{categoryLabel}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('productsCount')}</span>
                <span className="font-semibold">{data.productsCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">{t('whatsapp')}</span>
                <span className={data.whatsappConnected ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                  {data.whatsappConnected ? `${t('connected')} ✓` : t('notConnected')}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">{t('paymentMethods')}</span>
                <span className={data.paymentProviders && data.paymentProviders.length > 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                  {data.paymentProviders && data.paymentProviders.length > 0 
                    ? `${data.paymentProviders.length} ${t('connected')} ✓` 
                    : t('notConfigured')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">{t('nextStepsTitle')}</h3>
            
            <div className="space-y-3">
              {!data.whatsappConnected && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t('nextSteps.connectWhatsApp.title')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('nextSteps.connectWhatsApp.description')}
                    </p>
                  </div>
                </div>
              )}
              
              {(!data.productsCount || data.productsCount === 0) && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {!data.whatsappConnected ? '2' : '1'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t('nextSteps.addProducts.title')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('nextSteps.addProducts.description')}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  <Rocket className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{t('nextSteps.startReceiving.title')}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('nextSteps.startReceiving.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={handleGoToDashboard}>
              {t('goToDashboard')}
              {locale === 'he' ? (
                <ArrowLeft className="w-5 h-5 mr-2" />
              ) : (
                <ArrowRight className="w-5 h-5 ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

