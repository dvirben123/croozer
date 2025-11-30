"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Mail, Phone, User, CheckCircle } from "lucide-react";

interface CreateBusinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface BusinessForm {
  ownerEmail: string;
  name: string;
  type: string;
  category?: string;
  phone: string;
  email: string;
  street?: string;
  city?: string;
  country?: string;
}

export default function CreateBusinessModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateBusinessModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BusinessForm>({
    defaultValues: {
      type: "restaurant",
      country: "Israel",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: BusinessForm) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerEmail: data.ownerEmail,
          businessData: {
            name: data.name,
            type: data.type,
            category: data.category,
            phone: data.phone,
            email: data.email,
            address: {
              street: data.street,
              city: data.city,
              country: data.country,
            },
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create business");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        reset();
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setError("");
      setSuccess(false);
      onOpenChange(false);
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
            <DialogTitle className="text-2xl">Business Created!</DialogTitle>
            <DialogDescription className="text-center">
              The business has been successfully created and the owner will be notified.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create Business for User
          </DialogTitle>
          <DialogDescription>
            Create a new business account for another user. They will receive
            access to complete the onboarding process.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Owner Email */}
          <div className="space-y-2">
            <Label htmlFor="ownerEmail" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Owner Email *
            </Label>
            <Input
              id="ownerEmail"
              type="email"
              {...register("ownerEmail", {
                required: "Owner email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email format",
                },
              })}
              placeholder="owner@example.com"
              className={errors.ownerEmail ? "border-red-500" : ""}
            />
            {errors.ownerEmail && (
              <p className="text-sm text-red-500">{errors.ownerEmail.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              If the user doesn't exist, a new account will be created
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-4">Business Information</h3>

            {/* Business Name */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Business name is required",
                })}
                placeholder="My Restaurant"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="type">Business Type *</Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="pizzeria">Pizzeria</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedType === "restaurant" || selectedType === "pizzeria") && (
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="fast_food">Fast Food</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone", {
                    required: "Phone is required",
                  })}
                  placeholder="+972-50-1234567"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Business Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Business email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Invalid email format",
                    },
                  })}
                  placeholder="info@business.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Address (Optional) */}
            <div className="space-y-4">
              <Label className="text-base">Address (Optional)</Label>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register("street")}
                  placeholder="Street address"
                />
                <Input
                  {...register("city")}
                  placeholder="City"
                />
                <Input
                  {...register("country")}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
