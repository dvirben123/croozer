"use client";

import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import WhatsAppConnectButton from './WhatsAppConnectButton';

export default function WhatsAppSetupStep() {
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

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            חיבור וואטסאפ
          </CardTitle>
          <CardDescription>
            חבר את חשבון הוואטסאפ עסקי שלך כדי להתחיל לקבל הזמנות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.whatsappConnected ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">וואטסאפ מחובר בהצלחה!</h3>
                <p className="text-muted-foreground">
                  חשבון הוואטסאפ העסקי שלך מחובר ומוכן לשימוש
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted p-6 rounded-lg space-y-4">
                <h3 className="font-semibold">מה תצטרך:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm">מספר טלפון שאינו רשום בוואטסאפ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm">חשבון פייסבוק עסקי (או אישי)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm">גישה למספר הטלפון לאימות</span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-900 font-medium">שגיאה בחיבור</p>
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
                      <strong>שים לב:</strong> חסר מזהה עסק. אנא שמור את הפרטים בשלב הראשון.
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  תועבר לעמוד האימות של מטא
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>טיפ:</strong> אם אין לך מספר טלפון זמין, תוכל לדלג על שלב זה ולחבר אותו מאוחר יותר
                  מהגדרות המערכת.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={previousStep} disabled={isLoading}>
              <ArrowRight className="w-4 h-4 ml-2" />
              חזור
            </Button>
            <div className="flex gap-2">
              {!data.whatsappConnected && (
                <Button variant="ghost" onClick={handleSkip} disabled={isLoading}>
                  דלג לעכשיו
                </Button>
              )}
              <Button onClick={handleNext} disabled={isLoading}>
                {isLoading ? 'שומר...' : 'המשך'}
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

