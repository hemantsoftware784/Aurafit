import {
  Product,
  Category,
  Order,
  StoreSettings,
  Banner,
  Coupon,
  Review,
  AdminUser,
  CustomerUser,
  ReturnRequest,
} from '../types/index.ts';

const BASE_URL = '/api';

export const apiClient = {
  // Store Settings & Banners
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    return res.json();
  },

  async updateSettings(settings: Partial<StoreSettings>, adminToken: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken,
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async getBanners(): Promise<Banner[]> {
    const res = await fetch(`${BASE_URL}/banners`);
    if (!res.ok) throw new Error('Failed to load banners');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  // Products
  async getProducts(params?: {
    category?: string;
    gender?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    isFeatured?: boolean;
    isNew?: boolean;
    isBestSeller?: boolean;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.gender) query.append('gender', params.gender);
    if (params?.search) query.append('search', params.search);
    if (params?.minPrice) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
    if (params?.sort) query.append('sort', params.sort);
    if (params?.isFeatured) query.append('isFeatured', 'true');
    if (params?.isNew) query.append('isNew', 'true');
    if (params?.isBestSeller) query.append('isBestSeller', 'true');

    const res = await fetch(`${BASE_URL}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductDetails(slugOrId: string | number): Promise<Product> {
    const res = await fetch(`${BASE_URL}/products/${slugOrId}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  // Checkout calculation & order
  async calculateCheckout(items: any[], couponCode?: string): Promise<{
    items: any[];
    subtotal: string;
    discountAmount: string;
    shippingFee: string;
    totalAmount: string;
    freeShippingQualified: boolean;
    freeShippingThreshold: number;
  }> {
    const res = await fetch(`${BASE_URL}/checkout/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, couponCode }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to calculate checkout');
    }
    return res.json();
  },

  async createOrder(orderPayload: any): Promise<{
    success: boolean;
    order: Order;
    trackingNumber: string;
    transactionId: string;
  }> {
    const res = await fetch(`${BASE_URL}/checkout/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to complete order');
    }
    return res.json();
  },

  // Orders
  async getOrder(orderNumberOrId: string | number): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${orderNumberOrId}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async getCustomerOrders(email: string): Promise<Order[]> {
    const res = await fetch(`${BASE_URL}/orders?email=${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  // Coupons
  async validateCoupon(code: string, cartSubtotal: number, customerId?: number): Promise<{
    valid: boolean;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: string;
    discountAmount: string;
    description?: string;
  }> {
    const res = await fetch(`${BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, cartSubtotal, customerId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid coupon');
    }
    return res.json();
  },

  // Customer Account
  async syncCustomer(customerData: {
    firebaseUid?: string;
    email: string;
    name: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<CustomerUser> {
    const res = await fetch(`${BASE_URL}/auth/customer/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to sync customer account');
    }
    return res.json();
  },

  async submitReturnRequest(data: {
    orderId: number;
    customerId?: number;
    reason: string;
    notes?: string;
  }): Promise<any> {
    const res = await fetch(`${BASE_URL}/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit return request');
    return res.json();
  },

  async submitReview(data: {
    productId: number;
    customerId?: number;
    customerName: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  // Admin Auth
  async adminLogin(email: string, password: string): Promise<{ token: string; admin: AdminUser }> {
    const res = await fetch(`${BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid admin credentials');
    }
    return res.json();
  },

  // Admin API Endpoints
  async getAdminAnalytics(token: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: { 'x-admin-token': token },
    });
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  },

  async getAdminPrices(token: string): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/admin/prices`, {
      headers: { 'x-admin-token': token },
    });
    if (!res.ok) throw new Error('Failed to load price records');
    return res.json();
  },

  async updateAdminPrice(productId: number, data: any, token: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/prices/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update price');
    return res.json();
  },

  async bulkUpdatePrices(data: any, token: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/prices/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Bulk update failed');
    return res.json();
  },

  async getAdminInventory(token: string): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/admin/inventory`, {
      headers: { 'x-admin-token': token },
    });
    if (!res.ok) throw new Error('Failed to load inventory');
    return res.json();
  },

  async adjustInventory(data: any, token: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/inventory/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to adjust stock');
    return res.json();
  },

  async getAdminOrders(token: string, filter?: any): Promise<Order[]> {
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: { 'x-admin-token': token },
    });
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async updateOrderStatus(orderId: number, data: any, token: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  async getAdminCustomers(token: string): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/admin/customers`, {
      headers: { 'x-admin-token': token },
    });
    if (!res.ok) throw new Error('Failed to load customers');
    return res.json();
  },

  async toggleCustomerBlock(customerId: number, token: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/customers/${customerId}/toggle-block`, {
      method: 'PUT',
      headers: { 'x-admin-token': token },
    });
    if (!res.ok) throw new Error('Failed to toggle block status');
    return res.json();
  },

  async getAdminCoupons(token: string): Promise<Coupon[]> {
    const res = await fetch(`${BASE_URL}/admin/coupons`, {
      headers: { 'x-admin-token': token },
    });
    if (!res.ok) throw new Error('Failed to load coupons');
    return res.json();
  },

  async createAdminCoupon(data: any, token: string): Promise<Coupon> {
    const res = await fetch(`${BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create coupon');
    return res.json();
  },

  async getAdminReturns(token: string): Promise<ReturnRequest[]> {
    const res = await fetch(`${BASE_URL}/admin/returns`, {
      headers: { 'x-admin-token': token },
    });
    if (!res.ok) throw new Error('Failed to load returns');
    return res.json();
  },

  async updateReturnStatus(returnId: number, data: any, token: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/admin/returns/${returnId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update return');
    return res.json();
  },
};
