"use client";

import { useState } from "react";
import { useFacebookSDK } from "../hooks/useFacebookSDK";
import { Button } from "./ui/button";

export default function FacebookLoginButton() {
  const { isLoaded, isLoggedIn, user, login, logout } = useFacebookSDK();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!isLoaded) return;

    setLoading(true);
    try {
      await login(["email", "public_profile"]);
    } catch (error) {
      console.error("Facebook login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (error) {
      console.error("Facebook logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <Button disabled variant="outline">
        Loading Facebook SDK...
      </Button>
    );
  }

  if (isLoggedIn && user) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <p>Welcome, {user.name}!</p>
          {user.email && <p className="text-muted-foreground">{user.email}</p>}
        </div>
        <Button onClick={handleLogout} disabled={loading} variant="outline">
          {loading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={loading}
      className="bg-[#1877F2] hover:bg-[#166FE5] text-white"
    >
      {loading ? "Connecting..." : "Continue with Facebook"}
    </Button>
  );
}
