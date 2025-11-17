import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductVariant {
  name: string;
  nameHe?: string;
  required: boolean;
  options: Array<{
    label: string;
    labelHe?: string;
    priceModifier: number;
  }>;
}

export interface IProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

export interface IProduct extends Document {
  businessId: mongoose.Types.ObjectId;

  // Basic details
  name: string;
  nameHe?: string;
  description?: string;
  descriptionHe?: string;
  sku?: string;

  // Categorization
  category: string;
  categoryHe?: string;
  subcategory?: string;
  tags: string[];

  // Pricing
  price: number;
  currency: string;
  compareAtPrice?: number;
  costPrice?: number;

  // Variants
  hasVariants: boolean;
  variants?: IProductVariant[];

  // Inventory
  trackInventory: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  allowBackorder: boolean;

  // Availability
  available: boolean;
  availableFrom?: string;
  availableUntil?: string;
  availableDays?: string[];

  // Media
  images: IProductImage[];

  // Additional info
  preparationTime?: number;
  calories?: number;
  allergens?: string[];
  ingredients?: string[];

  // SEO & Display
  displayOrder: number;
  featured: boolean;

  // Analytics
  viewCount: number;
  orderCount: number;
  revenue: number;

  createdAt: Date;
  updatedAt: Date;

  // Virtual methods
  isAvailable(): boolean;
  isInStock(): boolean;
  isLowStock(): boolean;
  getPriceWithVariants(selectedVariants: string[]): number;
}

const ProductSchema = new Schema<IProduct>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
      index: true,
    },

    // Basic details
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    nameHe: {
      type: String,
      trim: true,
      maxlength: [200, 'Hebrew name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    descriptionHe: {
      type: String,
      trim: true,
      maxlength: [1000, 'Hebrew description cannot exceed 1000 characters'],
    },
    sku: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },

    // Categorization
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    categoryHe: {
      type: String,
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      required: true,
      default: 'ILS',
      enum: ['ILS', 'USD', 'EUR'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare at price cannot be negative'],
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative'],
    },

    // Variants
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: [
      {
        name: {
          type: String,
          required: true,
        },
        nameHe: String,
        required: {
          type: Boolean,
          default: false,
        },
        options: [
          {
            label: {
              type: String,
              required: true,
            },
            labelHe: String,
            priceModifier: {
              type: Number,
              default: 0,
            },
          },
        ],
      },
    ],

    // Inventory
    trackInventory: {
      type: Boolean,
      default: false,
    },
    stockQuantity: {
      type: Number,
      min: [0, 'Stock quantity cannot be negative'],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Low stock threshold cannot be negative'],
    },
    allowBackorder: {
      type: Boolean,
      default: false,
    },

    // Availability
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    availableFrom: {
      type: String, // HH:MM format
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'],
    },
    availableUntil: {
      type: String, // HH:MM format
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'],
    },
    availableDays: {
      type: [String],
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    },

    // Media
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Additional info
    preparationTime: {
      type: Number, // in minutes
      min: [0, 'Preparation time cannot be negative'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
    },
    allergens: [String],
    ingredients: [String],

    // SEO & Display
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative'],
    },
    orderCount: {
      type: Number,
      default: 0,
      min: [0, 'Order count cannot be negative'],
    },
    revenue: {
      type: Number,
      default: 0,
      min: [0, 'Revenue cannot be negative'],
    },
  },
  {
    timestamps: true,
    collection: 'products',
  }
);

// Compound indexes
ProductSchema.index({ businessId: 1, displayOrder: 1 });
ProductSchema.index({ businessId: 1, category: 1 });
ProductSchema.index({ businessId: 1, available: 1 });
ProductSchema.index({ businessId: 1, featured: 1 });
ProductSchema.index({ businessId: 1, orderCount: -1 });

// Instance methods
ProductSchema.methods.isAvailable = function (): boolean {
  if (!this.available) return false;

  // Check time availability
  if (this.availableFrom && this.availableUntil) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (currentTime < this.availableFrom || currentTime > this.availableUntil) {
      return false;
    }
  }

  // Check day availability
  if (this.availableDays && this.availableDays.length > 0) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    if (!this.availableDays.includes(today)) {
      return false;
    }
  }

  // Check inventory
  if (this.trackInventory && !this.allowBackorder) {
    return this.isInStock();
  }

  return true;
};

ProductSchema.methods.isInStock = function (): boolean {
  if (!this.trackInventory) return true;
  return (this.stockQuantity || 0) > 0;
};

ProductSchema.methods.isLowStock = function (): boolean {
  if (!this.trackInventory) return false;
  return (this.stockQuantity || 0) <= (this.lowStockThreshold || 0);
};

ProductSchema.methods.getPriceWithVariants = function (selectedVariants: string[]): number {
  let totalPrice = this.price;

  if (this.hasVariants && this.variants && selectedVariants.length > 0) {
    this.variants.forEach((variant) => {
      variant.options.forEach((option) => {
        if (selectedVariants.includes(option.label)) {
          totalPrice += option.priceModifier;
        }
      });
    });
  }

  return totalPrice;
};

// Static methods
ProductSchema.statics.findByBusinessId = function (businessId: mongoose.Types.ObjectId, filters = {}) {
  return this.find({ businessId, ...filters }).sort({ displayOrder: 1, name: 1 });
};

ProductSchema.statics.findAvailableProducts = function (businessId: mongoose.Types.ObjectId) {
  return this.find({ businessId, available: true }).sort({ displayOrder: 1 });
};

ProductSchema.statics.findByCategory = function (businessId: mongoose.Types.ObjectId, category: string) {
  return this.find({ businessId, category, available: true }).sort({ displayOrder: 1 });
};

ProductSchema.statics.findFeaturedProducts = function (businessId: mongoose.Types.ObjectId) {
  return this.find({ businessId, featured: true, available: true }).sort({ orderCount: -1 }).limit(10);
};

ProductSchema.statics.incrementViewCount = async function (productId: mongoose.Types.ObjectId) {
  return this.findByIdAndUpdate(productId, { $inc: { viewCount: 1 } }, { new: true });
};

ProductSchema.statics.incrementOrderCount = async function (productId: mongoose.Types.ObjectId, amount: number) {
  return this.findByIdAndUpdate(
    productId,
    {
      $inc: {
        orderCount: 1,
        revenue: amount,
      },
    },
    { new: true }
  );
};

ProductSchema.statics.decrementStock = async function (productId: mongoose.Types.ObjectId, quantity: number) {
  const product = await this.findById(productId);
  if (!product || !product.trackInventory) return product;

  product.stockQuantity = Math.max(0, (product.stockQuantity || 0) - quantity);
  return product.save();
};

// Prevent model overwrite
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
