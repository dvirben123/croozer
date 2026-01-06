"use client";

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Pizza, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CategorySelectionStep() {
  const t = useTranslations('onboarding.category');
  const locale = useLocale();
  const { data, updateData, nextStep, previousStep, saveProgress, isLoading } = useOnboarding();
  const [selectedCategory, setSelectedCategory] = useState<'restaurant' | 'fast_food' | undefined>(
    data.category
  );

  const categories = [
    {
      value: 'restaurant' as const,
      title: t('restaurant.title'),
      description: t('restaurant.description'),
      icon: UtensilsCrossed,
      features: [
        t('restaurant.features.menu'),
        t('restaurant.features.tables'),
        t('restaurant.features.orders'),
      ],
    },
    {
      value: 'fast_food' as const,
      title: t('fastFood.title'),
      description: t('fastFood.description'),
      icon: Pizza,
      features: [
        t('fastFood.features.menu'),
        t('fastFood.features.orders'),
        t('fastFood.features.delivery'),
      ],
    },
  ];

  const handleNext = async () => {
    if (!selectedCategory) return;

    updateData({ category: selectedCategory });

    try {
      await saveProgress();
      nextStep();
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.value;

              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    'relative p-6 rounded-lg border-2 transition-all text-right',
                    'hover:border-primary hover:shadow-md',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border bg-background'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'p-3 rounded-lg',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{category.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>

                      <ul className="space-y-1">
                        {category.features.map((feature, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-4 left-4">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-primary-foreground"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className={`flex justify-between pt-4 ${locale === 'he' ? '' : 'flex-row-reverse'}`}>
            <Button variant="outline" onClick={previousStep} disabled={isLoading}>
              {locale === 'he' ? (
                <>
                  <ArrowRight className="w-4 h-4 ml-2" />
                  {t('back')}
                </>
              ) : (
                <>
                  {t('back')}
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
            <Button onClick={handleNext} disabled={!selectedCategory || isLoading}>
              {isLoading ? t('saving') : t('continue')}
              {locale === 'he' ? (
                <ArrowLeft className="w-4 h-4 mr-2" />
              ) : (
                <ArrowRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

