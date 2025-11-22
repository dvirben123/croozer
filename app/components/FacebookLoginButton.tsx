"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function FacebookLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = authClient.useSession();

  // Handle Facebook login using Better Auth
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Save current URL to redirect back after login (unless it's the login page)
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && !sessionStorage.getItem("redirectAfterLogin")) {
        sessionStorage.setItem("redirectAfterLogin", currentPath);
      }

      // Use Better Auth to sign in with Facebook
      await authClient.signIn.social({
        provider: "facebook",
        callbackURL: sessionStorage.getItem("redirectAfterLogin") || "/dashboard",
      });
    } catch (error) {
      console.error("Error logging in with Facebook:", error);
      alert("שגיאה בהתחברות. אנא נסה שוב.");
      setIsLoading(false);
    }
  };

  // Handle logout using Better Auth
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoading(false);
    }
  };

  // User is logged in
  if (session?.user) {
    return (
      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="font-medium text-sm">שלום, {session.user.name}!</p>
            {session.user.email && (
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            )}
          </div>
        </div>
        <Button
          onClick={handleLogout}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
          ) : (
            <LogOut className="h-3 w-3" />
          )}
          התנתק
        </Button>
      </div>
    );
  }

  // User needs to login
  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white gap-2 h-12 shadow-lg disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          מתחבר...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          התחבר עם פייסבוק
        </>
      )}
    </Button>
  );
}
