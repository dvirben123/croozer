"use client";

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ConversationFlowStep() {
  const t = useTranslations('onboarding.conversation');
  const locale = useLocale();
  const { data, updateData, nextStep, previousStep, saveProgress, isLoading } = useOnboarding();
  
  const defaultMessage = locale === 'he' 
    ? `שלום! ברוכים הבאים ל${data.name || 'העסק שלנו'} 👋\n\nאיך נוכל לעזור לך היום?`
    : `Hello! Welcome to ${data.name || 'our business'} 👋\n\nHow can we help you today?`;
  
  const [welcomeMessage, setWelcomeMessage] = useState(
    data.welcomeMessage || defaultMessage
  );

  const handleNext = async () => {
    updateData({ welcomeMessage });

    try {
      await saveProgress();
      nextStep();
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">{t('welcomeLabel')}</Label>
              <Textarea
                id="welcomeMessage"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={4}
                placeholder={t('welcomePlaceholder')}
              />
              <p className="text-xs text-muted-foreground">
                {t('welcomeHelp')}
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">{t('previewTitle')}</h4>
              <div className="bg-white p-3 rounded-lg shadow-sm border">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                    {data.name?.charAt(0) || 'E'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{data.name || (locale === 'he' ? 'העסק שלך' : 'Your Business')}</p>
                    <div className="mt-1 bg-green-50 p-2 rounded-lg text-sm whitespace-pre-wrap">
                      {welcomeMessage}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm text-blue-900">{t('flowTitle')}</h4>
              <ol className={`text-sm text-blue-900 space-y-1 ${locale === 'he' ? 'mr-4' : 'ml-4'}`}>
                <li>1. {t('flowSteps.1')}</li>
                <li>2. {t('flowSteps.2')}</li>
                <li>3. {t('flowSteps.3')}</li>
                <li>4. {t('flowSteps.4')}</li>
                <li>5. {t('flowSteps.5')}</li>
                <li>6. {t('flowSteps.6')}</li>
                <li>7. {t('flowSteps.7')}</li>
              </ol>
            </div>
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
            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading ? t('saving') : t('continue')}
              {locale === 'he' ? (
                <ArrowLeft className="w-4 h-4 mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

