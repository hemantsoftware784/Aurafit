import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types/index.ts';
import { apiClient } from '../services/apiClient.ts';

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addToCart: (product: Product, size: string, color: string, quantity?: number, variantId?: number | null) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  appliedCoupon: string | null;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'aurafit_cart_items_v1';
const COUPON_STORAGE_KEY = 'aurafit_cart_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    try {
      return localStorage.getItem(COUPON_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const freeShippingThreshold = 1999;

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, appliedCoupon);
      // Re-verify coupon discount
      validateCurrentCoupon(appliedCoupon);
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
      setCouponDiscount(0);
    }
  }, [appliedCoupon, items]);

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const validateCurrentCoupon = async (code: string) => {
    if (subtotal === 0) {
      setCouponDiscount(0);
      return;
    }
    try {
      const res = await apiClient.validateCoupon(code, subtotal);
      if (res.valid) {
        setCouponDiscount(parseFloat(res.discountAmount));
        setCouponError(null);
      }
    } catch (err: any) {
      setCouponError(err.message);
      setCouponDiscount(0);
    }
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const res = await apiClient.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedCoupon(res.code);
        setCouponDiscount(parseFloat(res.discountAmount));
        return true;
      }
      return false;
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 149;
  const discountAmount = Math.min(couponDiscount, subtotal);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const addToCart = (
    product: Product,
    size: string,
    color: string,
    quantity = 1,
    variantId: number | null = null
  ) => {
    const itemKey = `${product.id}-${size}-${color}`;
    const unitPrice = parseFloat(product.sellingPrice);

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: itemKey,
          productId: product.id,
          variantId,
          productName: product.name,
          sku: product.sku,
          size,
          color,
          unitPrice,
          quantity,
          imageUrl: product.primaryImage,
        },
      ];
    });

    setIsOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(COUPON_STORAGE_KEY);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        freeShippingThreshold,
        amountNeededForFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
