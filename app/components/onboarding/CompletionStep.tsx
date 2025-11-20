"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, Rocket } from 'lucide-react';

export default function CompletionStep() {
  const router = useRouter();
  const { data } = useOnboarding();

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <Card>
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl">כל הכבוד! ההגדרה הושלמה</CardTitle>
          <CardDescription>
            העסק שלך מוכן לקבל הזמנות דרך וואטסאפ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-6 rounded-lg space-y-4">
            <h3 className="font-semibold">סיכום ההגדרה:</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">שם העסק</span>
                <span className="font-semibold">{data.name}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">קטגוריה</span>
                <span className="font-semibold">
                  {data.category === 'restaurant' ? 'מסעדה' : 'מזון מהיר'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">מוצרים בתפריט</span>
                <span className="font-semibold">{data.productsCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">וואטסאפ</span>
                <span className={data.whatsappConnected ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                  {data.whatsappConnected ? 'מחובר ✓' : 'לא מחובר'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">אמצעי תשלום</span>
                <span className={data.paymentProviders && data.paymentProviders.length > 0 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}>
                  {data.paymentProviders && data.paymentProviders.length > 0 ? `${data.paymentProviders.length} מחוברים ✓` : 'לא הוגדרו'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">השלבים הבאים:</h3>
            
            <div className="space-y-3">
              {!data.whatsappConnected && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-sm">חבר חשבון וואטסאפ</p>
                    <p className="text-xs text-muted-foreground">
                      כדי לקבל הזמנות, תצטרך לחבר חשבון וואטסאפ עסקי
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
                    <p className="font-semibold text-sm">הוסף מוצרים לתפריט</p>
                    <p className="text-xs text-muted-foreground">
                      הוסף את המוצרים שלך כדי שלקוחות יוכלו להזמין
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  <Rocket className="w-3 h-3" />
                </div>
                <div>
                  <p className="font-semibold text-sm">התחל לקבל הזמנות!</p>
                  <p className="text-xs text-muted-foreground">
                    שתף את מספר הוואטסאפ שלך עם לקוחות והתחל לקבל הזמנות
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={handleGoToDashboard}>
              עבור ללוח הבקרה
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

