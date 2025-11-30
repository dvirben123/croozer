import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/adminGuard";
import dbConnect from "@/lib/mongodb";
import Business from "@/models/Business";
import User from "@/models/User";

/**
 * GET /api/admin/businesses
 * List all businesses (admin only)
 * Query params: search, status, page, limit
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin session
    await requireAdmin();

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    // Get businesses with pagination
    const [businesses, total] = await Promise.all([
      Business.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Business.countDocuments(query),
    ]);

    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch businesses" },
      { status: error.message?.includes("Forbidden") ? 403 : 500 }
    );
  }
}

/**
 * POST /api/admin/businesses
 * Create a new business for another user (admin only)
 * Body: { ownerEmail, businessData }
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin session
    const session = await requireAdmin();

    await dbConnect();

    const body = await request.json();
    const { ownerEmail, businessData } = body;

    if (!ownerEmail) {
      return NextResponse.json(
        { error: "Owner email is required" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await User.findOne({ email: ownerEmail.toLowerCase() });

    if (!user) {
      // Create new user
      user = await User.create({
        email: ownerEmail.toLowerCase(),
        name: businessData.name || "Business Owner",
        // User will need to complete onboarding on first login
      });
    }

    // Create business
    const business = await Business.create({
      ...businessData,
      userId: user._id,
      status: "pending_setup",
      "onboarding.currentStep": 1,
      "onboarding.completed": false,
    });

    return NextResponse.json({
      success: true,
      business,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      message: `Business created successfully for ${ownerEmail}`,
    });
  } catch (error: any) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create business" },
      { status: error.message?.includes("Forbidden") ? 403 : 500 }
    );
  }
}
