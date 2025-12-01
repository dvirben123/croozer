import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Business from "@/models/Business";
import Customer from "@/models/Customer";

/**
 * GET /api/orders
 * List orders for the current business
 * Query params: status, page, limit, search, startDate, endDate
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { businessId: business._id };

    // Status filter
    if (status) {
      if (status === "in_progress") {
        // In progress = pending, confirmed, preparing, ready, out_for_delivery
        query.status = {
          $in: ["pending", "confirmed", "preparing", "ready", "out_for_delivery"],
        };
      } else if (status === "completed") {
        query.status = { $in: ["delivered", "cancelled"] };
      } else {
        query.status = status;
      }
    }

    // Search filter (order number, customer name, phone)
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("customerId", "name phone email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 * Create a new order (manual order creation)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      customerPhone,
      customerName,
      customerEmail,
      items,
      deliveryType,
      deliveryAddress,
      deliveryTime,
      paymentMethod,
      notes,
      specialInstructions,
    } = body;

    // Validate required fields
    if (!customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer phone and items are required" },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await Customer.findOne({
      businessId: business._id,
      whatsappPhone: customerPhone,
    });

    if (!customer) {
      customer = await Customer.create({
        businessId: business._id,
        whatsappPhone: customerPhone,
        name: customerName || "Unknown Customer",
        email: customerEmail,
      });
    } else if (customerName || customerEmail) {
      // Update customer info if provided
      if (customerName && !customer.name) {
        customer.name = customerName;
      }
      if (customerEmail && !customer.email) {
        customer.email = customerEmail;
      }
      await customer.save();
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const deliveryFee = deliveryType === "delivery" ? business.settings.deliveryFee || 0 : 0;
    const total = subtotal + deliveryFee;

    // Generate order number
    const orderNumber = await (Order as any).generateOrderNumber(business._id);

    // Create order
    const order = await Order.create({
      businessId: business._id,
      customerId: customer._id,
      orderNumber,
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        currency: business.settings.currency || "ILS",
        variants: item.variants,
        notes: item.notes,
        subtotal: item.price * item.quantity,
      })),
      subtotal,
      deliveryFee,
      total,
      currency: business.settings.currency || "ILS",
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "cash",
      source: "manual",
      customerPhone,
      customerName: customerName || customer.name,
      customerEmail: customerEmail || customer.email,
      deliveryType: deliveryType || "pickup",
      deliveryAddress,
      deliveryTime: deliveryTime ? new Date(deliveryTime) : undefined,
      notes,
      specialInstructions,
      timeline: [
        {
          status: "pending",
          timestamp: new Date(),
          updatedBy: session.user.email || session.user.id,
          notes: "Order created manually",
        },
      ],
    });

    // Populate customer info
    await order.populate("customerId", "name phone email");

    return NextResponse.json({
      success: true,
      order,
      message: "Order created successfully",
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
