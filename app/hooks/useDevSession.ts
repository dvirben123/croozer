"use client";

import { useState, useEffect } from "react";

interface DevUser {
  id: string;
  name: string;
  email: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface DevSession {
  user: DevUser | null;
  isDev: boolean;
  isLoading: boolean;
}

export function useDevSession(): DevSession {
  const [session, setSession] = useState<DevSession>({
    user: null,
    isDev: false,
    isLoading: true,
  });

  useEffect(() => {
    // Only check in development
    if (process.env.NODE_ENV !== "development") {
      setSession({ user: null, isDev: false, isLoading: false });
      return;
    }

    const checkDevSession = async () => {
      try {
        const response = await fetch("/api/auth/dev-session");
        const data = await response.json();

        setSession({
          user: data.user || null,
          isDev: data.isDev || false,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error checking dev session:", error);
        setSession({ user: null, isDev: false, isLoading: false });
      }
    };

    checkDevSession();
  }, []);

  return session;
}
