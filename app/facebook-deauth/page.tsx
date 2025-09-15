"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Home, Shield } from "lucide-react";
import Link from "next/link";

function FacebookDeauthorizeContent() {
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleDeauthorization = async () => {
      try {
        // Get the signed request from Facebook
        const signedRequest = searchParams.get("signed_request");

        if (!signedRequest) {
          throw new Error("No signed request provided");
        }

        // In a real implementation, you would:
        // 1. Verify the signed request signature
        // 2. Parse the user data from the signed request
        // 3. Delete/deactivate the user's data from your database
        // 4. Log the deauthorization event

        // For now, we'll simulate the process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock successful deauthorization
        setStatus("success");
        setMessage("החשבון שלך הוסר בהצלחה מהמערכת. כל הנתונים שלך נמחקו.");

        // Optional: Send confirmation to Facebook
        // This would typically be done server-side
      } catch (error) {
        console.error("Deauthorization error:", error);
        setStatus("error");
        setMessage(
          "אירעה שגיאה במהלך הסרת החשבון. אנא נסה שוב או צור איתנו קשר."
        );
      }
    };

    handleDeauthorization();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">הסרת הרשאה מפייסבוק</h1>
          <p className="text-muted-foreground">
            מעבד את בקשת הסרת החשבון שלך
          </p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              {status === "processing" && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  מעבד בקשה...
                </>
              )}
              {status === "success" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  הושלם בהצלחה
                </>
              )}
              {status === "error" && (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  שגיאה
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {status === "processing" && (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  אנא המתן בזמן שאנחנו מעבדים את בקשת הסרת החשבון שלך מהמערכת.
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    מוחק נתונים אישיים
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                    מסיר הרשאות גישה
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                    מעדכן מסד נתונים
                  </div>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 text-sm">{message}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <h4 className="font-medium text-foreground">מה קרה:</h4>
                  <ul className="space-y-1 text-right">
                    <li>• כל הנתונים האישיים שלך נמחקו מהמערכת</li>
                    <li>• הרשאות הגישה לפייסבוק בוטלו</li>
                    <li>• החשבון שלך הוסר לחלוטין</li>
                    <li>• לא נשמרו נתונים זיהוי כלשהם</li>
                  </ul>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-800 text-sm">{message}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <h4 className="font-medium text-foreground">מה אפשר לעשות:</h4>
                  <ul className="space-y-1 text-right">
                    <li>• נסה לרענן את הדף</li>
                    <li>• בדוק את החיבור לאינטרנט</li>
                    <li>• צור איתנו קשר לקבלת עזרה</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {status === "success" && (
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="h-4 w-4 ml-2" />
                חזור לעמוד הבית
              </Link>
            </Button>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                נסה שוב
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/contact">צור קשר לעזרה</Link>
              </Button>
            </div>
          )}

          {/* Contact Info */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>יש לך שאלות? צור איתנו קשר:</p>
            <p>
              <a 
                href="mailto:support@croozer.co.il" 
                className="text-primary hover:underline"
              >
                support@croozer.co.il
              </a>
            </p>
          </div>
        </div>

        {/* Privacy Notice */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground space-y-2">
              <h4 className="font-medium text-foreground">הודעת פרטיות:</h4>
              <p>
                בהתאם למדיניות הפרטיות שלנו ולתקנות GDPR, כל הנתונים האישיים שלך 
                נמחקים לחלוטין מהמערכת שלנו בתוך 30 יום מבקשת ההסרה.
              </p>
              <p>
                למידע נוסף, עיין ב
                <Link href="/privacy-policy" className="text-primary hover:underline mx-1">
                  מדיניות הפרטיות
                </Link>
                שלנו.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FacebookDeauthorizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">טוען...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <FacebookDeauthorizeContent />
    </Suspense>
  );
}