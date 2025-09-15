"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import FacebookLoginButton from "@/components/FacebookLoginButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthGuard();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4"
        dir="rtl"
      >
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Shield className="h-12 w-12 text-primary/30" />
                <Loader2 className="h-6 w-6 text-primary animate-spin absolute top-3 left-3" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-white">בודק מצב התחברות</h3>
                <p className="text-sm text-slate-300">אנא המתן...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If already authenticated, this will redirect (handled by useEffect above)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">כניסה למערכת</h1>
            <p className="text-slate-300 mt-2">
              התחבר כדי לגשת לדשבורד הניהול העסקי שלך
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-center text-white">
              התחברות מהירה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FacebookLoginButton />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">או</span>
              </div>
            </div>

            {/* Back to Home */}
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-slate-600 rounded-lg text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              חזור לעמוד הבית
            </Link>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>גישה לדשבורד ניהול עסקי מתקדם</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>ניהול הודעות וואטסאפ אוטומטי</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>דוחות ומדדים עסקיים בזמן אמת</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>ניהול לקוחות ופרופילים</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400">
          <p>
            על ידי התחברות, אתה מסכים ל
            <Link
              href="/terms-of-service"
              className="text-primary hover:underline mx-1"
            >
              תנאי השימוש
            </Link>
            ול
            <Link
              href="/privacy-policy"
              className="text-primary hover:underline mx-1"
            >
              מדיניות הפרטיות
            </Link>
            שלנו.
          </p>
        </div>
      </div>
    </div>
  );
}
