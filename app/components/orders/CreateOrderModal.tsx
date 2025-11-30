"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, CheckCircle, Package } from "lucide-react";

interface CreateOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface OrderForm {
  customerPhone: string;
  customerName: string;
  customerEmail?: string;
  items: OrderItem[];
  deliveryType: "pickup" | "delivery";
  deliveryStreet?: string;
  deliveryCity?: string;
  deliveryBuilding?: string;
  deliveryFloor?: string;
  deliveryApartment?: string;
  paymentMethod: "cash" | "card" | "online" | "other";
  notes?: string;
  specialInstructions?: string;
}

export default function CreateOrderModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
    setValue,
  } = useForm<OrderForm>({
    defaultValues: {
      deliveryType: "pickup",
      paymentMethod: "cash",
      items: [{ name: "", quantity: 1, price: 0, notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const deliveryType = watch("deliveryType");
  const items = watch("items");

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return sum + quantity * price;
    }, 0);
  };

  const onSubmit = async (data: OrderForm) => {
    setIsLoading(true);
    setError("");

    try {
      // Validate items
      if (data.items.length === 0 || !data.items[0].name) {
        throw new Error("At least one item is required");
      }

      // Build delivery address if delivery type
      const deliveryAddress =
        data.deliveryType === "delivery"
          ? {
              street: data.deliveryStreet || "",
              city: data.deliveryCity || "",
              building: data.deliveryBuilding,
              floor: data.deliveryFloor,
              apartment: data.deliveryApartment,
            }
          : undefined;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: data.customerPhone,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          items: data.items.map((item) => ({
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
            notes: item.notes,
          })),
          deliveryType: data.deliveryType,
          deliveryAddress,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          specialInstructions: data.specialInstructions,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create order");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        reset();
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order");
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
            <DialogTitle className="text-2xl">Order Created!</DialogTitle>
            <DialogDescription className="text-center">
              The order has been successfully created and is now visible in the
              orders dashboard.
            </DialogDescription>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create New Order
          </DialogTitle>
          <DialogDescription>
            Create a manual order for a customer. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2">Customer Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  {...register("customerPhone", {
                    required: "Phone is required",
                  })}
                  placeholder="+972-50-1234567"
                  className={errors.customerPhone ? "border-red-500" : ""}
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-500">
                    {errors.customerPhone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Name *</Label>
                <Input
                  id="customerName"
                  {...register("customerName", {
                    required: "Name is required",
                  })}
                  placeholder="Customer name"
                  className={errors.customerName ? "border-red-500" : ""}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">
                    {errors.customerName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                {...register("customerEmail")}
                placeholder="customer@example.com"
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold">Order Items</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({ name: "", quantity: 1, price: 0, notes: "" })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Item {index + 1}</Label>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor={`items.${index}.name`}>Item Name *</Label>
                    <Input
                      {...register(`items.${index}.name`, {
                        required: "Item name is required",
                      })}
                      placeholder="e.g., Pizza Margherita"
                      className={
                        errors.items?.[index]?.name ? "border-red-500" : ""
                      }
                    />
                    {errors.items?.[index]?.name && (
                      <p className="text-sm text-red-500">
                        {errors.items[index]?.name?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`, {
                        required: "Quantity is required",
                        min: { value: 1, message: "Minimum quantity is 1" },
                      })}
                      className={
                        errors.items?.[index]?.quantity ? "border-red-500" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`items.${index}.price`}>Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register(`items.${index}.price`, {
                        required: "Price is required",
                        min: { value: 0, message: "Price cannot be negative" },
                      })}
                      className={
                        errors.items?.[index]?.price ? "border-red-500" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Subtotal</Label>
                    <div className="h-10 px-3 flex items-center bg-muted rounded-md font-medium">
                      {((items[index]?.quantity || 0) *
                        (items[index]?.price || 0)).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.notes`}>
                    Item Notes (Optional)
                  </Label>
                  <Input
                    {...register(`items.${index}.notes`)}
                    placeholder="e.g., Extra cheese, no onions"
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-end border-t pt-3">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-2xl font-bold">
                  ₪{calculateTotal().toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2">Delivery Information</h3>

            <div className="space-y-2">
              <Label htmlFor="deliveryType">Delivery Type *</Label>
              <Select
                value={deliveryType}
                onValueChange={(value: "pickup" | "delivery") =>
                  setValue("deliveryType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {deliveryType === "delivery" && (
              <div className="space-y-3 border rounded-lg p-4 bg-muted/50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="deliveryStreet">Street Address</Label>
                    <Input
                      {...register("deliveryStreet")}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryCity">City</Label>
                    <Input {...register("deliveryCity")} placeholder="Tel Aviv" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryBuilding">Building</Label>
                    <Input {...register("deliveryBuilding")} placeholder="5" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryFloor">Floor</Label>
                    <Input {...register("deliveryFloor")} placeholder="3" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryApartment">Apartment</Label>
                    <Input {...register("deliveryApartment")} placeholder="12" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment & Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-2">Payment & Notes</h3>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={watch("paymentMethod")}
                onValueChange={(value: any) => setValue("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Staff Notes (Optional)</Label>
              <Textarea
                {...register("notes")}
                placeholder="Internal notes about this order..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">
                Customer Instructions (Optional)
              </Label>
              <Textarea
                {...register("specialInstructions")}
                placeholder="Special requests from the customer..."
                rows={2}
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
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
