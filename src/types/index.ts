export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  shortDescription?: string;
  description: string;
  fabricDetails?: string;
  specifications?: Record<string, string>;
  tags?: string[];
  availableSizes: string[];
  availableColors: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive?: boolean;
  mrp: string;
  sellingPrice: string;
  salePrice?: string;
  discountPercent: string;
  primaryImage: string;
  ratingAvg?: string;
  reviewCount?: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  prices?: ProductPrice;
  reviews?: Review[];
  related?: Partial<Product>[];
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  size: string;
  color: string;
  stock: number;
  priceOverride?: string;
  isActive: boolean;
}

export interface ProductPrice {
  productId: number;
  mrp: string;
  sellingPrice: string;
  salePrice?: string;
  costPrice: string;
  wholesalePrice?: string;
  minSellingPrice?: string;
  maxSellingPrice?: string;
  discountPercent: string;
  profitAmount: string;
  profitMargin: string;
  saleStartAt?: string;
  saleEndAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  gender: 'men' | 'women' | 'unisex' | 'accessories';
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  parentId?: number | null;
}

export interface CartItem {
  id: string; // unique item key
  productId: number;
  variantId?: number | null;
  productName: string;
  sku: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  availableStock?: number;
}

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minCartValue: string;
  maxDiscount?: string;
  usageLimit?: number;
  customerLimit: number;
  timesUsed: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId?: number | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    recipientName: string;
    phone: string;
    streetAddress: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  trackingNumber?: string;
  courierName?: string;
  subtotal: string;
  discountAmount: string;
  shippingFee: string;
  taxAmount: string;
  totalAmount: string;
  couponCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  shipping?: ShippingInfo;
  payment?: PaymentRecord;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId?: number;
  productName: string;
  sku: string;
  size: string;
  color: string;
  imageUrl?: string;
  unitPrice: string;
  quantity: number;
  totalPrice: string;
}

export interface ShippingInfo {
  courierName: string;
  trackingNumber: string;
  estimatedDelivery: string;
  status: string;
  dispatchDate?: string;
  deliveryDate?: string;
}

export interface PaymentRecord {
  transactionId: string;
  paymentMethod: string;
  gateway: string;
  amount: string;
  currency: string;
  status: string;
}

export interface Review {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ReturnRequest {
  returnRecord: {
    id: number;
    orderId: number;
    customerId?: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ITEM_RECEIVED' | 'REFUNDED';
    notes?: string;
    adminResponse?: string;
    stockRestored: boolean;
    createdAt: string;
  };
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  displayOrder: number;
  isActive: boolean;
}

export interface StoreSettings {
  store_name?: string;
  tagline?: string;
  store_logo?: string;
  contact_email?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  store_address?: string;
  free_shipping_threshold?: number;
  standard_shipping_fee?: number;
  return_window_days?: number;
  return_policy?: string;
  terms_and_conditions?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_youtube?: string;
}

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface CustomerUser {
  id: number;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  isBlocked: boolean;
}
