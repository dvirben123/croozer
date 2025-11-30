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
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Package } from "lucide-react";

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ProductForm {
  name: string;
  nameHe: string;
  description?: string;
  descriptionHe?: string;
  price: number;
  category: string;
  categoryHe?: string;
  available: boolean;
}

export default function CreateProductModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductForm>({
    defaultValues: {
      available: true,
    },
  });

  const onSubmit = async (data: ProductForm) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create product");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        reset();
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
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
            <DialogTitle className="text-2xl">מוצר נוצר!</DialogTitle>
            <DialogDescription className="text-center">
              המוצר נוסף בהצלחה לתפריט
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
            <Package className="h-5 w-5" />
            הוספת מוצר חדש
          </DialogTitle>
          <DialogDescription>
            הוסף מוצר חדש לתפריט. שדות עם * הם שדות חובה.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2">מידע בסיסי</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameHe">שם בעברית *</Label>
                <Input
                  id="nameHe"
                  {...register("nameHe", {
                    required: "שם בעברית הוא שדה חובה",
                  })}
                  placeholder="פיצה מרגריטה"
                  className={errors.nameHe ? "border-red-500" : ""}
                />
                {errors.nameHe && (
                  <p className="text-sm text-red-500">{errors.nameHe.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">שם באנגלית *</Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "שם באנגלית הוא שדה חובה",
                  })}
                  placeholder="Pizza Margherita"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryHe">קטגוריה בעברית *</Label>
                <Input
                  id="categoryHe"
                  {...register("categoryHe")}
                  placeholder="פיצות"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">קטגוריה באנגלית *</Label>
                <Input
                  id="category"
                  {...register("category", {
                    required: "קטגוריה היא שדה חובה",
                  })}
                  placeholder="Pizzas"
                  className={errors.category ? "border-red-500" : ""}
                />
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">מחיר (₪) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", {
                  required: "מחיר הוא שדה חובה",
                  min: { value: 0, message: "המחיר לא יכול להיות שלילי" },
                })}
                placeholder="45.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2">תיאור</h3>

            <div className="space-y-2">
              <Label htmlFor="descriptionHe">תיאור בעברית</Label>
              <Textarea
                id="descriptionHe"
                {...register("descriptionHe")}
                placeholder="עגבניות, מוצרלה, בזיליקום טרי..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">תיאור באנגלית</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Tomatoes, mozzarella, fresh basil..."
                rows={3}
              />
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
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "יוצר..." : "צור מוצר"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
