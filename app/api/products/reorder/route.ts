import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// POST /api/products/reorder - Update display order for multiple products
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { businessId, products } = await request.json();

    if (!businessId || !products || !Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: 'Business ID and products array are required' },
        { status: 400 }
      );
    }

    // Update display order for each product
    const updatePromises = products.map(({ id, displayOrder }: { id: string; displayOrder: number }) =>
      Product.findOneAndUpdate(
        { _id: id, businessId },
        { displayOrder },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Product order updated successfully',
    });
  } catch (error: any) {
    console.error('Error reordering products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reorder products' },
      { status: 500 }
    );
  }
}

