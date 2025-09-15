"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { Card, CardContent } from "./ui/card";
import { Shield, Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function AuthGuard({
  children,
  redirectTo = "/login",
  fallback,
}: AuthGuardProps) {
  const { isLoading, isAuthenticated, user, loginStatus } =
    useAuthGuard(redirectTo);

  // Show loading state while checking authentication
  if (isLoading || loginStatus === "loading") {
    return (
      fallback || (
        <div
          className="min-h-screen bg-background flex items-center justify-center"
          dir="rtl"
        >
          <Card className="w-full max-w-md">
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Shield className="h-12 w-12 text-primary/30" />
                  <Loader2 className="h-6 w-6 text-primary animate-spin absolute top-3 left-3" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">בודק הרשאות גישה</h3>
                  <p className="text-sm text-muted-foreground">
                    אנא המתן בזמן שאנחנו מוודאים שאתה מחובר...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // If user is authenticated, render children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If not authenticated, the useAuthGuard hook will handle redirect
  // This fallback should not normally be reached
  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center"
      dir="rtl"
    >
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <Shield className="h-12 w-12 text-red-500" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-red-600">גישה נדחתה</h3>
              <p className="text-sm text-muted-foreground">
                נדרשת התחברות כדי לגשת לדף זה
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
