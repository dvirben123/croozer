"use client";

import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ConversationFlowStep() {
  const { data, updateData, nextStep, previousStep, saveProgress, isLoading } = useOnboarding();
  
  const [welcomeMessage, setWelcomeMessage] = useState(
    data.welcomeMessage || `שלום! ברוכים הבאים ל${data.name || 'העסק שלנו'} 👋\n\nאיך נוכל לעזור לך היום?`
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
    <div className="max-w-2xl mx-auto" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            הגדרת שיחה אוטומטית
          </CardTitle>
          <CardDescription>
            התאם את ההודעות שהלקוחות יקבלו בוואטסאפ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">הודעת ברוכים הבאים</Label>
              <Textarea
                id="welcomeMessage"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={4}
                placeholder="הקלד את ההודעה שהלקוחות יקבלו כשהם פונים אליך לראשונה..."
              />
              <p className="text-xs text-muted-foreground">
                הודעה זו תישלח ללקוחות כשהם יפנו אליך לראשונה בוואטסאפ
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">תצוגה מקדימה:</h4>
              <div className="bg-white p-3 rounded-lg shadow-sm border">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">
                    {data.name?.charAt(0) || 'E'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{data.name || 'העסק שלך'}</p>
                    <div className="mt-1 bg-green-50 p-2 rounded-lg text-sm whitespace-pre-wrap">
                      {welcomeMessage}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm text-blue-900">זרימת השיחה האוטומטית:</h4>
              <ol className="text-sm text-blue-900 space-y-1 mr-4">
                <li>1. הלקוח שולח הודעה ראשונה</li>
                <li>2. המערכת שולחת הודעת ברוכים הבאים</li>
                <li>3. הצגת קטגוריות התפריט</li>
                <li>4. הלקוח בוחר מוצרים</li>
                <li>5. הלקוח מאשר הזמנה</li>
                <li>6. שליחת קישור לתשלום</li>
                <li>7. אישור הזמנה לאחר תשלום</li>
              </ol>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={previousStep} disabled={isLoading}>
              <ArrowRight className="w-4 h-4 ml-2" />
              חזור
            </Button>
            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading ? 'שומר...' : 'המשך'}
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

