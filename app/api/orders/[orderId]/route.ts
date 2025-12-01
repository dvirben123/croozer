import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Business from "@/models/Business";
import { ObjectId } from "mongodb";

/**
 * GET /api/orders/[orderId]
 * Get a single order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Get authenticated session (supports dev mode)
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: No session" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get user's business
    const business = await Business.findOne({ userId: session.user.id });
    if (!business) {
      return NextResponse.json(
        { error: "No business found for this user" },
        { status: 404 }
      );
    }

    const { orderId } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Find order and verify it belongs to this business
    const order = await Order.findOne({
      _id: new ObjectId(orderId),
      businessId: business._id,
    })
      .populate("customerId", "name phone email")
      .lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[orderId]
 * Update an order (status, items, delivery info, etc.)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Get authenticated session (supports dev mode)
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: No session" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get user's business
    const business = await Business.findOne({ userId: session.user.id });
    if (!business) {
      return NextResponse.json(
        { error: "No business found for this user" },
        { status: 404 }
      );
    }

    const { orderId } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Find order and verify it belongs to this business
    const order = await Order.findOne({
      _id: new ObjectId(orderId),
      businessId: business._id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      status,
      paymentStatus,
      paymentMethod,
      items,
      deliveryType,
      deliveryAddress,
      deliveryTime,
      notes,
      specialInstructions,
      timelineNote,
    } = body;

    // Update fields if provided
    if (status && status !== order.status) {
      order.status = status;
      order.timeline.push({
        status,
        timestamp: new Date(),
        updatedBy: session.user.email || session.user.id,
        notes: timelineNote || `Status updated to ${status}`,
      });

      // Update status-specific timestamps
      if (status === "confirmed" && !order.confirmedAt) {
        order.confirmedAt = new Date();
      }
      if (status === "delivered" && !order.completedAt) {
        order.completedAt = new Date();
      }
      if (status === "cancelled" && !order.cancelledAt) {
        order.cancelledAt = new Date();
      }
    }

    if (paymentStatus !== undefined) {
      order.paymentStatus = paymentStatus;
    }

    if (paymentMethod !== undefined) {
      order.paymentMethod = paymentMethod;
    }

    if (items) {
      order.items = items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        currency: business.settings.currency || "ILS",
        variants: item.variants,
        notes: item.notes,
        subtotal: item.price * item.quantity,
      }));

      // Recalculate totals
      order.subtotal = order.items.reduce(
        (sum: number, item: any) => sum + item.subtotal,
        0
      );
      order.total =
        order.subtotal +
        (order.tax || 0) +
        (order.deliveryFee || 0) -
        (order.discount || 0);
    }

    if (deliveryType !== undefined) {
      order.deliveryType = deliveryType;
    }

    if (deliveryAddress !== undefined) {
      order.deliveryAddress = deliveryAddress;
    }

    if (deliveryTime !== undefined) {
      order.deliveryTime = deliveryTime ? new Date(deliveryTime) : undefined;
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    if (specialInstructions !== undefined) {
      order.specialInstructions = specialInstructions;
    }

    await order.save();

    // Populate customer info
    await order.populate("customerId", "name phone email");

    return NextResponse.json({
      success: true,
      order,
      message: "Order updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[orderId]
 * Cancel/Delete an order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Get authenticated session (supports dev mode)
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized: No session" },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get user's business
    const business = await Business.findOne({ userId: session.user.id });
    if (!business) {
      return NextResponse.json(
        { error: "No business found for this user" },
        { status: 404 }
      );
    }

    const { orderId } = params;

    // Validate ObjectId
    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Find order and verify it belongs to this business
    const order = await Order.findOne({
      _id: new ObjectId(orderId),
      businessId: business._id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return NextResponse.json(
        { error: "Order cannot be cancelled in its current state" },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.timeline.push({
      status: "cancelled",
      timestamp: new Date(),
      updatedBy: session.user.email || session.user.id,
      notes: "Order cancelled by user",
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel order" },
      { status: 500 }
    );
  }
}
