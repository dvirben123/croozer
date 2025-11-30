"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RefreshCw,
  Plus,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Receipt,
} from "lucide-react";
import CreateOrderModal from "@/components/orders/CreateOrderModal";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variants?: string[];
  notes?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  customerPhone: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee?: number;
  total: number;
  currency: string;
  deliveryType?: string;
  deliveryAddress?: {
    street: string;
    city: string;
    building?: string;
    floor?: string;
    apartment?: string;
  };
  notes?: string;
  specialInstructions?: string;
  createdAt: string;
  orderedAt: string;
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("in_progress");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const fetchOrders = async (status: string = "in_progress") => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("status", status);
      if (search) params.append("search", search);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());

      const response = await fetch(`/api/orders?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch orders");
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchOrders(activeTab);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedOrder(null);
    setFilters({ ...filters, page: 1 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Refresh orders
      fetchOrders(activeTab);

      // Update selected order if it's the one being updated
      if (selectedOrder?._id === orderId) {
        const data = await response.json();
        setSelectedOrder(data.order);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status");
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card
      className={`hover:shadow-lg transition-shadow cursor-pointer ${
        selectedOrder?._id === order._id ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => setSelectedOrder(order)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              {order.orderNumber}
            </CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace("_", " ")}
              </Badge>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">
              {order.currency} {order.total.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              {order.items.length} items
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{order.customerName || "Unknown"}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a
            href={`tel:${order.customerPhone}`}
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {order.customerPhone}
          </a>
        </div>

        {order.deliveryType && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{order.deliveryType}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>

        {activeTab === "in_progress" && (
          <div className="flex gap-2 pt-2 border-t mt-3">
            {order.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(order._id, "confirmed");
                }}
                className="flex-1"
              >
                Confirm
              </Button>
            )}
            {order.status === "confirmed" && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(order._id, "preparing");
                }}
                className="flex-1"
              >
                Preparing
              </Button>
            )}
            {order.status === "preparing" && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(order._id, "ready");
                }}
                className="flex-1"
              >
                Ready
              </Button>
            )}
            {order.status === "ready" && order.deliveryType === "delivery" && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(order._id, "out_for_delivery");
                }}
                className="flex-1"
              >
                Out for Delivery
              </Button>
            )}
            {(order.status === "ready" || order.status === "out_for_delivery") && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpdateStatus(order._id, "delivered");
                }}
                className="flex-1"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const OrderDetails = ({ order }: { order: Order }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace("_", " ")}
              </Badge>
              <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                {order.paymentStatus}
              </Badge>
              {order.paymentMethod && (
                <Badge variant="outline">{order.paymentMethod}</Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedOrder(null)}
          >
            Close
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </h3>
          <div className="space-y-2 pl-7">
            <div className="flex items-center gap-2">
              <span className="font-medium">Name:</span>
              <span>{order.customerName || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Phone:</span>
              <a
                href={`tel:${order.customerPhone}`}
                className="text-primary hover:underline"
              >
                {order.customerPhone}
              </a>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        {order.deliveryAddress && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Address
            </h3>
            <div className="space-y-1 pl-7 text-sm">
              <div>{order.deliveryAddress.street}</div>
              {order.deliveryAddress.building && (
                <div>Building: {order.deliveryAddress.building}</div>
              )}
              {order.deliveryAddress.floor && (
                <div>Floor: {order.deliveryAddress.floor}</div>
              )}
              {order.deliveryAddress.apartment && (
                <div>Apartment: {order.deliveryAddress.apartment}</div>
              )}
              <div>{order.deliveryAddress.city}</div>
            </div>
          </div>
        )}

        {/* Items */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Order Items
          </h3>
          <div className="space-y-3 pl-7">
            {order.items.map((item, index) => (
              <div key={index} className="border-b pb-2 last:border-0">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.variants && item.variants.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {item.variants.join(", ")}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-xs text-muted-foreground italic">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {order.currency} {item.subtotal.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.quantity} × {order.currency} {item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>
                {order.currency} {order.subtotal.toFixed(2)}
              </span>
            </div>
            {order.deliveryFee && order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>
                  {order.currency} {order.deliveryFee.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>
                {order.currency} {order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {(order.notes || order.specialInstructions) && (
          <div>
            <h3 className="font-semibold mb-3">Notes</h3>
            {order.notes && (
              <div className="text-sm mb-2">
                <span className="font-medium">Staff Notes:</span> {order.notes}
              </div>
            )}
            {order.specialInstructions && (
              <div className="text-sm">
                <span className="font-medium">Customer Instructions:</span>{" "}
                {order.specialInstructions}
              </div>
            )}
          </div>
        )}

        {/* Order Times */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline
          </h3>
          <div className="space-y-2 pl-7 text-sm">
            <div>
              <span className="font-medium">Ordered:</span>{" "}
              {new Date(order.orderedAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Created:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        {activeTab === "in_progress" && (
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this order?")) {
                    handleUpdateStatus(order._id, "cancelled");
                  }
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Orders</h1>
          <p className="text-muted-foreground">
            Total: {pagination.total} orders
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          fetchOrders(activeTab);
        }}
      />

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search by order number, customer name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading} variant="outline">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Previous Orders</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedOrder}>
            Order Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in_progress">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No orders in progress
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Create a new order to get started
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>

          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No completed orders yet
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedOrder ? (
            <OrderDetails order={selectedOrder} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Select an order to view details
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={filters.page <= 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground px-4">
            Page {pagination.page} of {pagination.pages}
          </span>

          <Button
            variant="outline"
            disabled={filters.page >= pagination.pages}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
