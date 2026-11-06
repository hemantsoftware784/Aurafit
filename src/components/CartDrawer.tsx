import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartDrawerProps {
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedCheckout }) => {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
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
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponInput.trim());
    setIsApplying(false);
    setCouponInput('');
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#111216] border-l border-[#242632] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-[#21232c] flex items-center justify-between bg-[#0b0c0f]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
                Shopping Bag ({items.length})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="p-4 bg-[#16171d] border-b border-[#21232c]">
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
              {amountNeededForFreeShipping === 0 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> You unlocked Complimentary Free Delivery!
                </span>
              ) : (
                <span>
                  Add <strong className="text-white font-mono">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> for Free Shipping
                </span>
              )}
              <span className="text-neutral-500 font-mono text-[11px]">{freeShippingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#252733] rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto mb-4 stroke-1" />
                <p className="text-sm text-neutral-400 mb-4 font-light">Your shopping bag is currently empty.</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-[#16171d] border border-[#21232c] rounded-lg relative"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-cover rounded bg-[#1e2028] shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-semibold text-white line-clamp-1">{item.productName}</h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-400 mt-0.5 space-x-2">
                        <span>Size: <strong className="text-white">{item.size}</strong></span>
                        <span>·</span>
                        <span>Color: <strong className="text-white">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#232530]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#2e303c] rounded bg-[#111216]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-bold text-white font-mono tabular-nums">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 bg-[#0d0e12] border-t border-[#21232c] space-y-4">
              {/* Coupon Form */}
              <form onSubmit={handleApply} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. AURA10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full bg-[#16171d] border border-[#282a36] text-xs text-white pl-8 pr-3 py-2 rounded focus:outline-none focus:border-white font-mono uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying || !couponInput.trim()}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold uppercase rounded transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 p-2 rounded">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Code <strong>{appliedCoupon}</strong> Applied (-₹{discountAmount.toLocaleString('en-IN')})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-neutral-400 hover:text-white text-[11px] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-400">{couponError}</p>
                )}
              </form>

              {/* Order Calculations */}
              <div className="space-y-2 text-xs pt-2 border-t border-[#1e2029]">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Savings</span>
                    <span className="font-mono tabular-nums">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-400">
                  <span>Estimated Shipping</span>
                  <span className="font-mono tabular-nums text-white">
                    {shippingFee === 0 ? <strong className="text-emerald-400 uppercase">FREE</strong> : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-[#232530]">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onProceedCheckout();
                }}
                className="w-full py-3.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-[0.15em] rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
