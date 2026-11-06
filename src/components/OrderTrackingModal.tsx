import React, { useState } from 'react';
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { Order } from '../types/index.ts';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestReturn?: (orderId: number) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  onRequestReturn,
}) => {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.getOrder(query.trim());
      setOrder(res);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please verify the order number (e.g. AF-XXXX-XXX).');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Atelier Processing' },
    { key: 'SHIPPED', label: 'Shipped & In Transit' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 1;
    }
  };

  const currentIndex = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#121317] border border-[#262832] rounded-xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#21232c]">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-neutral-300" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
              Track AURA FIT Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <form onSubmit={handleTrack} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="Enter Order # (e.g. AF-123456-789)"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              className="w-full bg-[#181920] border border-[#2b2d38] pl-10 pr-4 py-2.5 rounded text-xs text-white uppercase font-mono focus:outline-none focus:border-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-900/60 rounded text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details Result */}
        {order && (
          <div className="mt-8 space-y-6">
            {/* Status Timeline */}
            <div className="p-4 bg-[#16171d] border border-[#262832] rounded-lg">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-400">Status: </span>
                  <span className="font-bold text-white uppercase tracking-wider font-mono">
                    {order.orderStatus}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400">Carrier: </span>
                  <span className="text-neutral-200 font-semibold">{order.courierName || 'BlueDart Logistics'}</span>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="grid grid-cols-5 gap-2 relative">
                {steps.map((st, i) => (
                  <div key={st.key} className="flex flex-col items-center text-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        i <= currentIndex
                          ? 'bg-white text-black'
                          : 'bg-[#22242e] text-neutral-500'
                      }`}
                    >
                      {i < currentIndex ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span className="text-[10px] mt-2 font-medium text-neutral-300 line-clamp-1">
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>

              {order.trackingNumber && (
                <div className="mt-6 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                  <span>Waybill / Tracking:</span>
                  <span className="font-mono text-white font-semibold">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            {/* Destination & Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#14151a] border border-[#262832] rounded-lg">
                <span className="flex items-center gap-1.5 text-neutral-400 font-semibold uppercase tracking-wider mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Delivery Destination</span>
                </span>
                <p className="text-white font-medium">{order.shippingAddress?.recipientName}</p>
                <p className="text-neutral-300">{order.shippingAddress?.streetAddress}</p>
                <p className="text-neutral-300 font-mono">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                </p>
              </div>

              <div className="p-4 bg-[#14151a] border border-[#262832] rounded-lg">
                <span className="flex items-center gap-1.5 text-neutral-400 font-semibold uppercase tracking-wider mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Payment &amp; Value</span>
                </span>
                <p className="text-white font-medium">Method: {order.paymentMethod}</p>
                <p className="text-emerald-400">Payment: {order.paymentStatus}</p>
                <p className="text-white font-bold font-mono text-sm mt-1">
                  Total: ₹{parseFloat(order.totalAmount).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Garments in Package ({order.items.length})
                </h4>
                <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden">
                  {order.items.map((it) => (
                    <div key={it.id} className="p-3 bg-[#14151a] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white font-semibold block">{it.productName}</span>
                        <span className="text-neutral-400 text-[11px]">
                          Size: {it.size} · Color: {it.color} · Qty: {it.quantity}
                        </span>
                      </div>
                      <span className="font-mono text-white tabular-nums">
                        ₹{parseFloat(it.totalPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Return Request button if delivered */}
            {order.orderStatus === 'DELIVERED' && onRequestReturn && (
              <div className="pt-2">
                <button
                  onClick={() => onRequestReturn(order.id)}
                  className="w-full py-2.5 border border-neutral-700 text-neutral-300 hover:text-white hover:border-white text-xs font-semibold uppercase rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Request 14-Day Return / Exchange</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
