import mongoose from 'mongoose';
import ConversationState, { ConversationStep } from '@/models/ConversationState';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import Order from '@/models/Order';
import MessageTemplate from '@/models/MessageTemplate';
import { MultiTenantWhatsAppService } from './MultiTenantWhatsAppService';
import { IOrderItem } from '@/models/Order';

export class ConversationFlowService {
  /**
   * Handle incoming message from customer
   */
  static async handleMessage(
    businessId: mongoose.Types.ObjectId,
    customerPhone: string,
    messageText: string,
    messageId: string
  ): Promise<void> {
    try {
      // Find or create customer
      const customer = await this.findOrCreateCustomer(businessId, customerPhone);

      // Find or create conversation state
      let conversation = await ConversationState.findOne({
        businessId,
        customerId: customer._id,
        phoneNumber: customerPhone,
      });

      if (!conversation) {
        conversation = await ConversationState.create({
          businessId,
          customerId: customer._id,
          phoneNumber: customerPhone,
          currentStep: 'welcome',
          cart: [],
          lastMessageAt: new Date(),
          context: {},
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
      }

      // Process message based on current step
      await this.processMessageByStep(
        conversation,
        businessId,
        customer._id as mongoose.Types.ObjectId,
        customerPhone,
        messageText,
        messageId
      );
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }

  /**
   * Find or create customer
   */
  private static async findOrCreateCustomer(
    businessId: mongoose.Types.ObjectId,
    phoneNumber: string
  ) {
    let customer = await Customer.findOne({ businessId, phone: phoneNumber });

    if (!customer) {
      customer = await Customer.create({
        businessId,
        phone: phoneNumber,
        source: 'whatsapp',
        status: 'active',
      });
    }

    return customer;
  }

  /**
   * Process message based on conversation step
   */
  private static async processMessageByStep(
    conversation: any,
    businessId: mongoose.Types.ObjectId,
    customerId: mongoose.Types.ObjectId,
    customerPhone: string,
    messageText: string,
    messageId: string
  ): Promise<void> {
    const step = conversation.currentStep;

    switch (step) {
      case 'welcome':
        await this.handleWelcomeStep(conversation, businessId, customerPhone);
        break;

      case 'category_selection':
        await this.handleCategorySelection(conversation, businessId, customerPhone, messageText);
        break;

      case 'product_selection':
        await this.handleProductSelection(conversation, businessId, customerPhone, messageText);
        break;

      case 'variant_selection':
        await this.handleVariantSelection(conversation, businessId, customerPhone, messageText);
        break;

      case 'cart':
        await this.handleCartActions(conversation, businessId, customerId, customerPhone, messageText);
        break;

      case 'checkout':
        await this.handleCheckout(conversation, businessId, customerId, customerPhone, messageText);
        break;

      default:
        // Default to welcome if step is unknown
        await this.handleWelcomeStep(conversation, businessId, customerPhone);
        break;
    }
  }

  /**
   * Handle welcome step - send greeting and show categories
   */
  private static async handleWelcomeStep(
    conversation: any,
    businessId: mongoose.Types.ObjectId,
    customerPhone: string
  ): Promise<void> {
    // Get welcome message template
    const template = await MessageTemplate.findOne({
      businessId,
      type: 'welcome',
      approved: true,
    });
    
    let welcomeMessage = 'שלום! ברוכים הבאים 👋\n\nאיך נוכל לעזור לך היום?';
    
    if (template) {
      welcomeMessage = template.contentHe || template.content;
    }

    // Send welcome message
    await MultiTenantWhatsAppService.sendTextMessage(businessId, {
      phoneNumber: customerPhone,
      message: welcomeMessage,
    });

    // Move to category selection
    await conversation.moveToStep('category_selection');

    // Show menu categories
    await this.showMenuCategories(businessId, customerPhone);
  }

  /**
   * Show menu categories as interactive list
   */
  private static async showMenuCategories(
    businessId: mongoose.Types.ObjectId,
    customerPhone: string
  ): Promise<void> {
    // Get unique categories from products
    const categories = await Product.distinct('category', {
      businessId,
      available: true,
    });

    if (categories.length === 0) {
      await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: customerPhone,
        message: 'מצטערים, התפריט שלנו ריק כרגע. אנא נסה שוב מאוחר יותר.',
      });
      return;
    }

    // Create interactive list message
    const sections = categories.map((category, index) => ({
      title: category,
      rows: [
        {
          id: `category_${index}`,
          title: category,
          description: `צפה במוצרים בקטגוריה ${category}`,
        },
      ],
    }));

    // Send interactive list (simplified - actual implementation would use WhatsApp interactive messages)
    let message = '📋 *בחר קטגוריה מהתפריט:*\n\n';
    categories.forEach((cat, index) => {
      message += `${index + 1}. ${cat}\n`;
    });
    message += '\nשלח את מספר הקטגוריה שתרצה לראות';

    await MultiTenantWhatsAppService.sendTextMessage(businessId, {
      phoneNumber: customerPhone,
      message,
    });
  }

  /**
   * Handle category selection
   */
  private static async handleCategorySelection(
    conversation: any,
    businessId: mongoose.Types.ObjectId,
    customerPhone: string,
    messageText: string
  ): Promise<void> {
    // Get categories
    const categories = await Product.distinct('category', {
      businessId,
      available: true,
    });

    // Try to match category by number or name
    let selectedCategory: string | null = null;

    const categoryNumber = parseInt(messageText.trim());
    if (!isNaN(categoryNumber) && categoryNumber > 0 && categoryNumber <= categories.length) {
      selectedCategory = categories[categoryNumber - 1];
    } else {
      // Try to match by name
      selectedCategory = categories.find(cat =>
        cat.toLowerCase().includes(messageText.toLowerCase())
      ) || null;
    }

    if (!selectedCategory) {
      await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: customerPhone,
        message: 'לא הבנתי את הבחירה. אנא בחר מספר מהרשימה.',
      });
      return;
    }

    // Save selected category in context
    conversation.context.selectedCategory = selectedCategory;
    await conversation.save();

    // Move to product selection
    await conversation.moveToStep('product_selection');

    // Show products in category
    await this.showProductsInCategory(businessId, customerPhone, selectedCategory);
  }

  /**
   * Show products in selected category
   */
  private static async showProductsInCategory(
    businessId: mongoose.Types.ObjectId,
    customerPhone: string,
    category: string
  ): Promise<void> {
    const products = await Product.find({
      businessId,
      category,
      available: true,
    }).limit(10);

    if (products.length === 0) {
      await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: customerPhone,
        message: 'אין מוצרים זמינים בקטגוריה זו כרגע.',
      });
      return;
    }

    let message = `🍽️ *${category}*\n\n`;
    products.forEach((product, index) => {
      const name = product.nameHe || product.name;
      const description = product.descriptionHe || product.description;
      message += `${index + 1}. *${name}* - ₪${product.price}\n`;
      if (description) {
        message += `   ${description}\n`;
      }
      message += '\n';
    });
    message += 'שלח את מספר המוצר שתרצה להזמין';

    await MultiTenantWhatsAppService.sendTextMessage(businessId, {
      phoneNumber: customerPhone,
      message,
    });
  }

  /**
   * Handle product selection
   */
  private static async handleProductSelection(
    conversation: any,
    businessId: mongoose.Types.ObjectId,
    customerPhone: string,
    messageText: string
  ): Promise<void> {
    const category = conversation.context.selectedCategory;
    
    const products = await Product.find({
      businessId,
      category,
      available: true,
    }).limit(10);

    const productNumber = parseInt(messageText.trim());
    
    if (isNaN(productNumber) || productNumber < 1 || productNumber > products.length) {
      await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: customerPhone,
        message: 'לא הבנתי את הבחירה. אנא בחר מספר מהרשימה.',
      });
      return;
    }

    const selectedProduct = products[productNumber - 1];

    // Check if product has variants
    if (selectedProduct.hasVariants && selectedProduct.variants && selectedProduct.variants.length > 0) {
      // Save product and move to variant selection
      conversation.context.selectedProduct = selectedProduct._id;
      conversation.context.currentVariantIndex = 0;
      await conversation.save();
      await conversation.moveToStep('variant_selection');

      await this.showProductVariants(businessId, customerPhone, selectedProduct, 0);
    } else {
      // No variants, add directly to cart
      await this.addToCart(conversation, selectedProduct, []);
      await this.showCartSummary(conversation, businessId, customerPhone);
    }
  }

  /**
   * Show product variants
   */
  private static async showProductVariants(
    businessId: mongoose.Types.ObjectId,
    customerPhone: string,
    product: any,
    variantIndex: number
  ): Promise<void> {
    const variant = product.variants[variantIndex];
    const variantName = variant.nameHe || variant.name;

    let message = `*${product.nameHe || product.name}*\n\n`;
    message += `בחר ${variantName}:\n\n`;

    variant.options.forEach((option: any, index: number) => {
      const optionLabel = option.labelHe || option.label;
      const priceModifier = option.priceModifier > 0 ? ` (+₪${option.priceModifier})` : '';
      message += `${index + 1}. ${optionLabel}${priceModifier}\n`;
    });

    await MultiTenantWhatsAppService.sendTextMessage(businessId, {
      phoneNumber: customerPhone,
      message,
    });
  }

  /**
   * Handle variant selection
   */
  private static async handleVariantSelection(
    conversation: any,
    businessId: mongoose.Types.ObjectId,
    customerPhone: string,
    messageText: string
  ): Promise<void> {
    const product = await Product.findById(conversation.context.selectedProduct);
    
    if (!product) {
      await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: customerPhone,
        message: 'מצטערים, המוצר לא נמצא.',
      });
      return;
    }

    const variantIndex = conversation.context.currentVariantIndex || 0;
    
    if (!product.variants || product.variants.length === 0) {
      // No variants, add directly to cart
      await this.addToCart(conversation, product, []);
      await this.showCartSummary(conversation, businessId, customerPhone);
      return;
    }
    
    const variant = product.variants[variantIndex];
    const optionNumber = parseInt(messageText.trim());

    if (isNaN(optionNumber) || optionNumber < 1 || optionNumber > variant.options.length) {
      await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: customerPhone,
        message: 'לא הבנתי את הבחירה. אנא בחר מספר מהרשימה.',
      });
      return;
    }

    const selectedOption = variant.options[optionNumber - 1];

    // Save selected variant option
    if (!conversation.context.selectedVariants) {
      conversation.context.selectedVariants = [];
    }
    conversation.context.selectedVariants.push(selectedOption.label);

    // Check if there are more variants
    if (variantIndex < product.variants.length - 1) {
      // Move to next variant
      conversation.context.currentVariantIndex = variantIndex + 1;
      await conversation.save();
      await this.showProductVariants(businessId, customerPhone, product, variantIndex + 1);
    } else {
      // All variants selected, add to cart
      await this.addToCart(conversation, product, conversation.context.selectedVariants);
      await this.showCartSummary(conversation, businessId, customerPhone);
    }
  }

  /**
   * Add product to cart
   */
  private static async addToCart(
    conversation: any,
    product: any,
    variants: string[]
  ): Promise<void> {
    // Calculate price with variants
    let totalPrice = product.price;
    
    if (variants.length > 0 && product.variants) {
      product.variants.forEach((variant: any) => {
        const selectedOption = variant.options.find((opt: any) =>
          variants.includes(opt.label)
        );
        if (selectedOption) {
          totalPrice += selectedOption.priceModifier;
        }
      });
    }

    const orderItem: IOrderItem = {
      productId: product._id,
      name: product.nameHe || product.name,
      quantity: 1,
      price: product.price,
      currency: product.currency || 'ILS',
      variants,
      subtotal: totalPrice,
    };

    conversation.addToCart(orderItem);
    await conversation.save();

    // Move to cart step
    await conversation.moveToStep('cart');
  }

  /**
   * Show cart summary
   */
  private static async showCartSummary(
    conversation: any,
    businessId: mongoose.Types.ObjectId,
    customerPhone: string
  ): Promise<void> {
    const total = conversation.calculateTotal();

    let message = '🛒 *העגלה שלך:*\n\n';
    
    conversation.cart.forEach((item: IOrderItem, index: number) => {
      message += `${index + 1}. ${item.name}`;
      if (item.variants && item.variants.length > 0) {
        message += ` (${item.variants.join(', ')})`;
      }
      message += ` - ₪${item.subtotal}\n`;
    });

    message += `\n*סה"כ: ₪${total}*\n\n`;
    message += 'מה תרצה לעשות?\n';
    message += '1. להוסיף עוד מוצרים\n';
    message += '2. לסיים ולהזמין\n';
    message += '3. לנקות את העגלה';

    await MultiTenantWhatsAppService.sendTextMessage(businessId, {
      phoneNumber: customerPhone,
      message,
    });
  }

  /**
   * Handle cart actions
   */
  private static async handleCartActions(
    conversation: any,
    businessId: mongoose.Types.ObjectId,
    customerId: mongoose.Types.ObjectId,
    customerPhone: string,
    messageText: string
  ): Promise<void> {
    const choice = messageText.trim();

    if (choice === '1') {
      // Add more products
      await conversation.moveToStep('category_selection');
      await this.showMenuCategories(businessId, customerPhone);
    } else if (choice === '2') {
      // Proceed to checkout
      await conversation.moveToStep('checkout');
      await this.initiateCheckout(conversation, businessId, customerId, customerPhone);
    } else if (choice === '3') {
      // Clear cart
      conversation.clearCart();
      await conversation.save();
      
      await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: customerPhone,
        message: 'העגלה נוקתה. תרצה להתחיל הזמנה חדשה?',
      });
      
      await conversation.moveToStep('welcome');
    } else {
      await MultiTenantWhatsAppService.sendTextMessage(businessId, {
        phoneNumber: customerPhone,
        message: 'לא הבנתי את הבחירה. אנא בחר 1, 2 או 3.',
      });
    }
  }

  /**
   * Initiate checkout process
   */
  private static async initiateCheckout(
    conversation: any,
    businessId: mongoose.Types.ObjectId,
    customerId: mongoose.Types.ObjectId,
    customerPhone: string
  ): Promise<void> {
    // Create order
    const orderNumber = `ORD-${Date.now()}`;
    const total = conversation.calculateTotal();

    const order = await Order.create({
      businessId,
      customerId,
      orderNumber,
      items: conversation.cart,
      subtotal: total,
      total,
      currency: 'ILS',
      status: 'pending',
      paymentStatus: 'pending',
      source: 'whatsapp',
      customerPhone,
    });

    // Generate payment link
    let paymentLink = `https://your-domain.com/pay/${order._id}`;
    
    try {
      // Import PaymentService dynamically to avoid circular dependencies
      const { PaymentService } = await import('./PaymentService');
      
      const paymentResult = await PaymentService.createPaymentLink(businessId, {
        orderId: (order._id as any).toString(),
        amount: total,
        currency: 'ILS',
        customerPhone,
        description: `הזמנה ${orderNumber}`,
      });

      if (paymentResult.success && paymentResult.paymentUrl) {
        paymentLink = paymentResult.paymentUrl;
      }
    } catch (paymentError) {
      console.error('Failed to create payment link:', paymentError);
      // Continue with fallback link
    }

    let message = '✅ *הזמנה התקבלה!*\n\n';
    message += `מספר הזמנה: ${orderNumber}\n`;
    message += `סה"כ לתשלום: ₪${total}\n\n`;
    message += `לתשלום, לחץ על הקישור:\n${paymentLink}\n\n`;
    message += 'תודה שהזמנת אצלנו! 🙏';

    await MultiTenantWhatsAppService.sendTextMessage(businessId, {
      phoneNumber: customerPhone,
      message,
    });

    // Clear cart and complete conversation
    conversation.clearCart();
    await conversation.moveToStep('completed');
  }

  /**
   * Handle checkout
   */
  private static async handleCheckout(
    conversation: any,
    businessId: mongoose.Types.ObjectId,
    customerId: mongoose.Types.ObjectId,
    customerPhone: string,
    messageText: string
  ): Promise<void> {
    // Checkout is already initiated, waiting for payment
    await MultiTenantWhatsAppService.sendTextMessage(businessId, {
      phoneNumber: customerPhone,
      message: 'ההזמנה שלך ממתינה לתשלום. אנא השלם את התשלום דרך הקישור ששלחנו.',
    });
  }
}

