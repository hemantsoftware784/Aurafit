import { pgTable, serial, text, integer, numeric, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Admins
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('superadmin'), // superadmin, manager, inventory_manager
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Customers
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  firebaseUid: text('firebase_uid').unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  passwordHash: text('password_hash'),
  isBlocked: boolean('is_blocked').notNull().default(false),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Customer Addresses
export const customerAddresses = pgTable('customer_addresses', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  label: text('label').notNull().default('Home'), // Home, Work, Other
  recipientName: text('recipient_name').notNull(),
  phone: text('phone').notNull(),
  streetAddress: text('street_address').notNull(),
  landmark: text('landmark'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull().default('India'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Categories
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  gender: text('gender').notNull().default('unisex'), // men, women, unisex, accessories
  description: text('description'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  parentId: integer('parent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Products
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  sku: text('sku').notNull().unique(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  subcategoryId: integer('subcategory_id'),
  shortDescription: text('short_description'),
  description: text('description').notNull(),
  fabricDetails: text('fabric_details'),
  specifications: jsonb('specifications'), // { fit: "Oversized", wash: "Machine Wash cold", weight: "280 GSM" }
  tags: jsonb('tags'), // ["streetwear", "heavyweight", "hoodie"]
  availableSizes: jsonb('available_sizes'), // ["S", "M", "L", "XL", "XXL"]
  availableColors: jsonb('available_colors'), // ["Black", "Charcoal", "Bone"]
  isFeatured: boolean('is_featured').notNull().default(false),
  isNewArrival: boolean('is_new_arrival').notNull().default(true),
  isBestSeller: boolean('is_best_seller').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Product Images
export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  altText: text('alt_text'),
  isPrimary: boolean('is_primary').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
});

// 7. Product Variants (Size x Color matrix)
export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sku: text('sku').notNull().unique(),
  size: text('size').notNull(),
  color: text('color').notNull(),
  priceOverride: numeric('price_override', { precision: 10, scale: 2 }),
  stock: integer('stock').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 8. Product Prices (Advanced Price Management)
export const productPrices = pgTable('product_prices', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull().unique(),
  mrp: numeric('mrp', { precision: 10, scale: 2 }).notNull(),
  sellingPrice: numeric('selling_price', { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric('sale_price', { precision: 10, scale: 2 }),
  costPrice: numeric('cost_price', { precision: 10, scale: 2 }).notNull().default('0'),
  wholesalePrice: numeric('wholesale_price', { precision: 10, scale: 2 }),
  minSellingPrice: numeric('min_selling_price', { precision: 10, scale: 2 }),
  maxSellingPrice: numeric('max_selling_price', { precision: 10, scale: 2 }),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).notNull().default('0'),
  profitAmount: numeric('profit_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  profitMargin: numeric('profit_margin', { precision: 5, scale: 2 }).notNull().default('0'),
  saleStartAt: timestamp('sale_start_at'),
  saleEndAt: timestamp('sale_end_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 9. Price History & Change Logs
export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  oldMrp: numeric('old_mrp', { precision: 10, scale: 2 }),
  newMrp: numeric('new_mrp', { precision: 10, scale: 2 }).notNull(),
  oldSellingPrice: numeric('old_selling_price', { precision: 10, scale: 2 }),
  newSellingPrice: numeric('new_selling_price', { precision: 10, scale: 2 }).notNull(),
  changedBy: text('changed_by').notNull().default('Admin'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Inventory
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  totalStock: integer('total_stock').notNull().default(0),
  availableStock: integer('available_stock').notNull().default(0),
  reservedStock: integer('reserved_stock').notNull().default(0),
  soldQuantity: integer('sold_quantity').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 11. Inventory History
export const inventoryHistory = pgTable('inventory_history', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  changeType: text('change_type').notNull(), // restock, order_placed, order_cancelled, return_restored, manual_adjustment
  quantity: integer('quantity').notNull(),
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 12. Carts
export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 13. Cart Items
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  cartId: integer('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  size: text('size').notNull(),
  color: text('color').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 14. Wishlists
export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 15. Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  shippingAddress: jsonb('shipping_address').notNull(),
  deliveryMethod: text('delivery_method').notNull().default('Standard Express'),
  paymentMethod: text('payment_method').notNull(), // COD, UPI, RAZORPAY
  paymentStatus: text('payment_status').notNull().default('PENDING'), // PENDING, PAID, FAILED, REFUNDED
  orderStatus: text('order_status').notNull().default('PENDING'), // PENDING, CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURNED, REFUNDED
  trackingNumber: text('tracking_number'),
  courierName: text('courier_name'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  shippingFee: numeric('shipping_fee', { precision: 10, scale: 2 }).notNull().default('0'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  couponCode: text('coupon_code'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 16. Order Items
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  variantId: integer('variant_id').references(() => productVariants.id),
  productName: text('product_name').notNull(),
  sku: text('sku').notNull(),
  size: text('size').notNull(),
  color: text('color').notNull(),
  imageUrl: text('image_url'),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
});

// 17. Payments
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  transactionId: text('transaction_id').notNull().unique(),
  paymentMethod: text('payment_method').notNull(),
  gateway: text('gateway').notNull(), // Razorpay, CashOnDelivery, UPI
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('INR'),
  status: text('status').notNull().default('PENDING'), // PENDING, SUCCESS, FAILED, REFUNDED
  signature: text('signature'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 18. Refunds
export const refunds = pgTable('refunds', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  returnId: integer('return_id'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, PROCESSED, REJECTED
  transactionReference: text('transaction_reference'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 19. Coupons
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  description: text('description'),
  discountType: text('discount_type').notNull(), // percentage, fixed
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  minCartValue: numeric('min_cart_value', { precision: 10, scale: 2 }).notNull().default('0'),
  maxDiscount: numeric('max_discount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  customerLimit: integer('customer_limit').notNull().default(1),
  timesUsed: integer('times_used').notNull().default(0),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  categoryRestriction: integer('category_restriction'),
  productRestriction: integer('product_restriction'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 20. Coupon Usage
export const couponUsage = pgTable('coupon_usage', {
  id: serial('id').primaryKey(),
  couponId: integer('coupon_id').references(() => coupons.id, { onDelete: 'cascade' }).notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  discountApplied: numeric('discount_applied', { precision: 10, scale: 2 }).notNull(),
  usedAt: timestamp('used_at').defaultNow().notNull(),
});

// 21. Reviews
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  isVerifiedPurchase: boolean('is_verified_purchase').notNull().default(true),
  isApproved: boolean('is_approved').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 22. Returns
export const returns = pgTable('returns', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, APPROVED, REJECTED, ITEM_RECEIVED, REFUNDED
  notes: text('notes'),
  adminResponse: text('admin_response'),
  stockRestored: boolean('stock_restored').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 23. Shipping
export const shipping = pgTable('shipping', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull().unique(),
  courierName: text('courier_name').notNull().default('BlueDart Logistics'),
  trackingNumber: text('tracking_number').notNull(),
  estimatedDelivery: text('estimated_delivery').notNull(),
  status: text('status').notNull().default('LABEL_CREATED'), // LABEL_CREATED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
  dispatchDate: timestamp('dispatch_date'),
  deliveryDate: timestamp('delivery_date'),
});

// 24. Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  recipientType: text('recipient_type').notNull(), // admin, customer
  recipientId: integer('recipient_id'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'), // order, inventory, alert, promo
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 25. Store Settings
export const storeSettings = pgTable('store_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 26. Banners
export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  imageUrl: text('image_url').notNull(),
  linkUrl: text('link_url').notNull().default('/collections'),
  buttonText: text('button_text').notNull().default('SHOP NOW'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  prices: one(productPrices, {
    fields: [products.id],
    references: [productPrices.productId],
  }),
  inventory: many(inventory),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
  payments: many(payments),
  shipping: one(shipping, {
    fields: [orders.id],
    references: [shipping.orderId],
  }),
  returns: many(returns),
}));
