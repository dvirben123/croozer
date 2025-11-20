"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface OnboardingData {
  businessId?: string;
  // Step 1: Business Details
  name?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  businessHours?: {
    [day: string]: { open: string; close: string };
  };
  
  // Step 2: Category Selection
  category?: 'restaurant' | 'fast_food';
  
  // Step 3: Menu Builder (products will be managed separately via API)
  productsCount?: number;
  
  // Step 4: WhatsApp Setup
  whatsappConnected?: boolean;
  whatsappAccountId?: string;
  
  // Step 5: Payment Setup
  paymentProviders?: string[];
  
  // Step 6: Conversation Flow
  welcomeMessage?: string;
  
  // Progress tracking
  currentStep: number;
  stepsCompleted: string[];
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  saveProgress: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({
    currentStep: 0,
    stepsCompleted: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const nextStep = useCallback(() => {
    setData(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 7),
    }));
  }, []);

  const previousStep = useCallback(() => {
    setData(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setData(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, 7)),
    }));
  }, []);

  const saveProgress = useCallback(async () => {
    if (!data.businessId) {
      setError('Business ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding/step', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: data.businessId,
          stepNumber: data.currentStep,
          stepName: `step_${data.currentStep}`,
          data: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            address: data.address,
            category: data.category,
            settings: {
              businessHours: data.businessHours,
            },
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save progress');
      }

      // Update local state with server response
      if (result.data) {
        updateData({
          businessId: result.data._id,
          currentStep: result.data.onboarding.currentStep,
          stepsCompleted: result.data.onboarding.stepsCompleted,
        });
      }
    } catch (err: any) {
      console.error('Error saving progress:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data, updateData]);

  const value: OnboardingContextType = {
    data,
    updateData,
    nextStep,
    previousStep,
    goToStep,
    saveProgress,
    isLoading,
    error,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

