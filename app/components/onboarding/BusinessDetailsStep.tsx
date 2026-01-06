"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Mail, Phone, MapPin } from "lucide-react";

interface BusinessDetailsForm {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export default function BusinessDetailsStep() {
  const t = useTranslations("onboarding.businessDetails");
  const locale = useLocale();
  const { data, updateData, nextStep, saveProgress, isLoading } =
    useOnboarding();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessDetailsForm>({
    defaultValues: {
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      street: data.address?.street || "",
      city: data.address?.city || "",
      country: data.address?.country || "Israel",
      postalCode: data.address?.postalCode || "",
    },
  });

  const onSubmit = async (formData: BusinessDetailsForm) => {
    // Update context with form data
    updateData({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: {
        street: formData.street,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode,
      },
    });

    try {
      await saveProgress();
      nextStep();
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto" dir={locale === 'he' ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t("nameLabel")} *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: t("nameRequired"),
                })}
                placeholder={t("namePlaceholder")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t("phoneLabel")} *
              </Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone", {
                  required: t("phoneRequired"),
                  pattern: {
                    value: /^[\d\s\-\+\(\)]+$/,
                    message: t("phoneInvalid"),
                  },
                })}
                placeholder={t("phonePlaceholder")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t("emailLabel")} *
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: t("emailRequired"),
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: t("emailInvalid"),
                  },
                })}
                placeholder={t("emailPlaceholder")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Address Section */}
            <div className="space-y-4 pt-4 border-t">
              <Label className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4" />
                {t("addressTitle")}
              </Label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">{t("streetLabel")}</Label>
                  <Input
                    id="street"
                    {...register("street")}
                    placeholder={t("streetPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">{t("cityLabel")}</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder={t("cityPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">{t("countryLabel")}</Label>
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder={t("countryPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">{t("postalCodeLabel")}</Label>
                  <Input
                    id="postalCode"
                    {...register("postalCode")}
                    placeholder={t("postalCodePlaceholder")}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("saving") : t("continue")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
