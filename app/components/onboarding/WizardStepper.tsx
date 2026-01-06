"use client";

import React from 'react';
import { useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
  description?: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: string[];
}

export default function WizardStepper({ steps, currentStep, completedSteps }: WizardStepperProps) {
  const locale = useLocale();
  // Ensure completedSteps is always an array
  const safeCompletedSteps = completedSteps || [];

  return (
    <div className="w-full py-6" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = safeCompletedSteps.includes(`step_${step.number}`);
          const isCurrent = currentStep === step.number;
          const isUpcoming = step.number > currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    isCompleted && 'bg-green-500 text-white',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.number + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-green-600',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2 transition-all',
                    step.number < currentStep ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

