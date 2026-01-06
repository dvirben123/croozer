"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ArrowRight, ArrowLeft, Utensils } from 'lucide-react';

export default function MenuBuilderStep() {
  const t = useTranslations('onboarding.menu');
  const locale = useLocale();
  const { data, updateData, nextStep, previousStep, saveProgress, isLoading } = useOnboarding();
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (data.businessId) {
      fetchProducts();
    }
  }, [data.businessId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?businessId=${data.businessId}`);
      const result = await response.json();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleNext = async () => {
    updateData({ productsCount: products.length });

    try {
      await saveProgress();
      nextStep();
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleSkip = async () => {
    // Allow skipping if user wants to add products later
    updateData({ productsCount: 0 });
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
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-6 h-6" />
            {t('title')}
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadingProducts ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('loading')}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Utensils className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('empty.title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('empty.description')}
                </p>
                <Button>
                  {locale === 'he' ? (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('empty.addFirst')}
                    </>
                  ) : (
                    <>
                      {t('empty.addFirst')}
                      <Plus className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t('productsCount', { count: products.length })}
                </p>
                <Button variant="outline" size="sm">
                  {locale === 'he' ? (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      {t('addProduct')}
                    </>
                  ) : (
                    <>
                      {t('addProduct')}
                      <Plus className="w-4 h-4 mr-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <h4 className="font-semibold">{product.nameHe || product.name}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.descriptionHe || product.description}
                    </p>
                    <p className="text-lg font-bold mt-2">
                      ₪{product.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={`flex justify-between pt-4 border-t ${locale === 'he' ? '' : 'flex-row-reverse'}`}>
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
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip} disabled={isLoading}>
                {t('skipForNow')}
              </Button>
              <Button onClick={handleNext} disabled={isLoading}>
                {isLoading ? t('saving') : t('continue')}
                {locale === 'he' ? (
                  <ArrowLeft className="w-4 h-4 mr-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

