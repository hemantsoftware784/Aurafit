import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Package,
  Heart,
  LogOut,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { apiClient } from '../services/apiClient.ts';
import { Order, Product } from '../types/index.ts';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { customer, signInWithGoogle, customerSignOut, wishlistIds, toggleWishlist } = useAuth();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile' | 'returns'>('orders');
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Return request form state
  const [returnOrderId, setReturnOrderId] = useState<number | null>(null);
  const [returnReason, setReturnReason] = useState('Fit too large / oversized');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnSuccess, setReturnSuccess] = useState(false);

  useEffect(() => {
    if (customer?.email) {
      loadCustomerOrders(customer.email);
    }
  }, [customer]);

  useEffect(() => {
    if (wishlistIds.length > 0) {
      loadWishlistItems();
    } else {
      setWishlistProducts([]);
    }
  }, [wishlistIds]);

  if (!isOpen) return null;

  const loadCustomerOrders = async (email: string) => {
    setIsLoading(true);
    try {
      const orders = await apiClient.getCustomerOrders(email);
      setOrdersList(orders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWishlistItems = async () => {
    try {
      const all = await apiClient.getProducts();
      setWishlistProducts(all.filter((p) => wishlistIds.includes(p.id)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderId) return;
    try {
      await apiClient.submitReturnRequest({
        orderId: returnOrderId,
        customerId: customer?.id,
        reason: returnReason,
        notes: returnNotes,
      });
      setReturnSuccess(true);
      setTimeout(() => {
        setReturnSuccess(false);
        setReturnOrderId(null);
        setReturnNotes('');
      }, 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#121317] border border-[#262832] rounded-xl shadow-2xl my-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21232c] bg-[#0c0d10] shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-neutral-300" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
              AURA FIT VIP Customer Account
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {!customer ? (
            /* Sign in gate */
            <div className="max-w-md mx-auto text-center py-10 space-y-6">
              <User className="w-12 h-12 text-neutral-600 mx-auto stroke-1" />
              <div>
                <h3 className="text-xl font-bold text-white uppercase font-display">Sign In to Your AURA Account</h3>
                <p className="text-xs text-neutral-400 mt-2">
                  Access your bespoke order history, real-time shipment updates, and saved wishlist items.
                </p>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={signInWithGoogle}
                  className="w-full py-3 px-4 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged in portal */
            <div>
              {/* Profile Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#16171d] border border-[#262832] rounded-lg mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-white text-sm">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{customer.name}</h3>
                    <p className="text-xs text-neutral-400 font-mono">{customer.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-widest bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
                    VIP Member
                  </span>
                  <button
                    onClick={customerSignOut}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 border-b border-[#21232c] mb-6">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-3 px-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'orders'
                      ? 'text-white border-b-2 border-white'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  My Orders ({ordersList.length})
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`pb-3 px-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'wishlist'
                      ? 'text-white border-b-2 border-white'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Wishlist ({wishlistIds.length})
                </button>
                <button
                  onClick={() => setActiveTab('returns')}
                  className={`pb-3 px-3 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                    activeTab === 'returns'
                      ? 'text-white border-b-2 border-white'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Returns &amp; Exchanges
                </button>
              </div>

              {/* TAB 1: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="py-8 text-center text-xs text-neutral-400">Loading orders...</div>
                  ) : ordersList.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400 text-xs">
                      No orders placed yet. Explore the collection to place your first order.
                    </div>
                  ) : (
                    ordersList.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 bg-[#14151a] border border-[#262832] rounded-lg space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-800/80 text-xs">
                          <div>
                            <span className="text-neutral-400">Order: </span>
                            <span className="font-mono font-bold text-white">{ord.orderNumber}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1f2029] text-white">
                              {ord.orderStatus}
                            </span>
                            <span className="text-neutral-400 font-mono">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                          <div>
                            <span className="text-neutral-400 block">Delivery: {ord.deliveryMethod}</span>
                            <span className="text-neutral-400 font-mono text-[11px]">
                              Waybill: {ord.trackingNumber || 'Awaiting BlueDart Pickup'}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-neutral-400 block text-[11px]">Paid via {ord.paymentMethod}</span>
                            <span className="text-sm font-bold text-white font-mono">
                              ₹{parseFloat(ord.totalAmount).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {ord.orderStatus === 'DELIVERED' && (
                          <div className="pt-2 border-t border-neutral-800 flex justify-end">
                            <button
                              onClick={() => {
                                setReturnOrderId(ord.id);
                                setActiveTab('returns');
                              }}
                              className="text-xs text-neutral-300 hover:text-white flex items-center gap-1.5 underline"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Request Return</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistProducts.length === 0 ? (
                    <div className="col-span-3 py-12 text-center text-xs text-neutral-400">
                      No garments in your wishlist. Click the heart icon on any product to save it.
                    </div>
                  ) : (
                    wishlistProducts.map((p) => (
                      <div
                        key={p.id}
                        className="bg-[#14151a] border border-[#262832] rounded-lg p-3 flex flex-col justify-between"
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            onSelectProduct(p);
                            onClose();
                          }}
                        >
                          <img
                            src={p.primaryImage}
                            alt={p.name}
                            className="aspect-[3/4] w-full object-cover rounded mb-2"
                          />
                          <h4 className="text-xs font-semibold text-white line-clamp-1">{p.name}</h4>
                          <span className="text-xs font-mono font-bold text-white">
                            ₹{parseFloat(p.sellingPrice).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex gap-2 mt-3 pt-2 border-t border-neutral-800">
                          <button
                            onClick={() => {
                              addToCart(p, p.availableSizes[0] || 'M', p.availableColors[0] || 'Black', 1);
                            }}
                            className="flex-1 py-1.5 bg-white text-black hover:bg-neutral-200 text-[11px] font-bold uppercase rounded cursor-pointer"
                          >
                            Add to Bag
                          </button>
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="px-2 py-1.5 border border-neutral-700 text-neutral-400 hover:text-red-400 rounded cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: RETURNS */}
              {activeTab === 'returns' && (
                <div className="max-w-lg mx-auto">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-display">
                    14-Day Return &amp; Exchange Concierge
                  </h3>
                  <p className="text-xs text-neutral-400 mb-6">
                    AURA FIT guarantees complete satisfaction. Select an eligible delivered order below to initiate a return or exchange.
                  </p>

                  <form onSubmit={handleReturnSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                        Select Delivered Order *
                      </label>
                      <select
                        value={returnOrderId || ''}
                        onChange={(e) => setReturnOrderId(Number(e.target.value))}
                        required
                        className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                      >
                        <option value="">Choose an order...</option>
                        {ordersList.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.orderNumber} — ₹{parseFloat(o.totalAmount).toLocaleString('en-IN')} ({o.orderStatus})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                        Reason for Return / Exchange *
                      </label>
                      <select
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white"
                      >
                        <option value="Fit too large / oversized">Fit too large / oversized</option>
                        <option value="Fit too small">Fit too small</option>
                        <option value="Fabric color differs from expectations">Fabric color differs from expectations</option>
                        <option value="Change of mind">Change of mind</option>
                        <option value="Exchange for different colorway">Exchange for different colorway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Please describe any specifics for our concierge team..."
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        className="w-full bg-[#181920] border border-[#2b2d38] p-2.5 rounded text-xs text-white focus:outline-none focus:border-white"
                      />
                    </div>

                    {returnSuccess && (
                      <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Return request logged. Our concierge will schedule courier pickup within 24 hours.</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!returnOrderId}
                      className="w-full py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer disabled:opacity-50"
                    >
                      Submit Return Request
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
