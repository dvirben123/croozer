import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const { businessId, ...updateData } = body;

    // Find and update product
    const product = await Product.findOneAndUpdate(
      { _id: params.id, businessId }, // Ensure product belongs to this business
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const product = await Product.findOneAndDelete({
      _id: params.id,
      businessId, // Ensure product belongs to this business
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

