"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, ArrowRight, ArrowLeft, Plus } from 'lucide-react';

export default function PaymentSetupStep() {
  const t = useTranslations('onboarding.payment');
  const locale = useLocale();
  const { data, updateData, nextStep, previousStep, saveProgress, isLoading } = useOnboarding();
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    if (data.businessId) {
      fetchProviders();
    }
  }, [data.businessId]);

  const fetchProviders = async () => {
    try {
      const response = await fetch(`/api/payments/providers?businessId=${data.businessId}`);
      const result = await response.json();
      if (result.success) {
        setProviders(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleNext = async () => {
    updateData({ paymentProviders: providers.map(p => p._id) });

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

  const paymentProviders = [
    { name: 'Stripe', description: t('providers.stripe.description') },
    { name: 'PayPal', description: t('providers.paypal.description') },
    { name: 'Tranzila', description: t('providers.tranzila.description') },
    { name: 'Meshulam', description: t('providers.meshulam.description') },
  ];

  return (
    <div className="max-w-2xl mx-auto" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingProviders ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : providers.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('empty.description')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentProviders.map((provider) => (
                  <button
                    key={provider.name}
                    className={`p-4 border rounded-lg hover:border-primary transition-colors ${locale === 'he' ? 'text-right' : 'text-left'}`}
                  >
                    <h4 className="font-semibold">{provider.name}</h4>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </button>
                ))}
              </div>

              <div className="text-center">
                <Button>
                  {locale === 'he' ? (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('addProvider')}
                    </>
                  ) : (
                    <>
                      {t('addProvider')}
                      <Plus className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('connected', { count: providers.length })}
                </p>
                <Button variant="outline" size="sm">
                  {locale === 'he' ? (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('addMore')}
                    </>
                  ) : (
                    <>
                      {t('addMore')}
                      <Plus className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {providers.map((provider) => (
                  <div
                    key={provider._id}
                    className="p-4 border rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold">{provider.providerName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {provider.testMode ? t('testMode') : t('active')}
                        {provider.isPrimary && ` • ${t('default')}`}
                      </p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> {t('tip')}
            </p>
          </div>

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
              <Button variant="ghost" onClick={handleSkip} disabled={isLoading}>
                {t('skipForNow')}
              </Button>
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

