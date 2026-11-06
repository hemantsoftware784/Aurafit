import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  CreditCard,
  QrCode,
  Banknote,
  Truck,
  ShieldCheck,
  Package,
  ArrowRight,
  ArrowLeft,
  Download,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiClient } from '../services/apiClient.ts';
import { Order } from '../types/index.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { items, subtotal, discountAmount, appliedCoupon, clearCart } = useCart();
  const { customer } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Step 1: Customer Information
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');

  // Step 2: Shipping Address
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560038');
  const [country] = useState('India');

  // Step 3: Delivery Method
  const [deliveryMethod, setDeliveryMethod] = useState<'Standard Express' | 'Same-Day Atelier Air'>('Standard Express');

  // Step 4: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'RAZORPAY'>('COD');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  if (!isOpen) return null;

  const baseShippingFee = subtotal >= 1999 ? 0 : 149;
  const deliveryExtra = deliveryMethod === 'Same-Day Atelier Air' ? 199 : 0;
  const finalShippingFee = baseShippingFee + deliveryExtra;
  const totalAmount = Math.max(0, subtotal - discountAmount + finalShippingFee);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (step === 1) {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        setErrorMessage('Please fill in your name, email, and phone number.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!streetAddress.trim() || !city.trim() || !state.trim() || postalCode.length < 6) {
        setErrorMessage('Please provide a complete shipping address and 6-digit postal code.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Validate payment specific inputs
      if (paymentMethod === 'UPI' && !upiId.includes('@')) {
        setErrorMessage('Please enter a valid UPI Virtual ID (e.g. name@okhdfcbank)');
        setIsSubmitting(false);
        return;
      }
      if (paymentMethod === 'RAZORPAY') {
        if (cardNumber.replace(/\s/g, '').length < 15 || !cardExpiry || !cardCvv) {
          setErrorMessage('Please enter valid credit/debit card details for secure Razorpay gateway processing.');
          setIsSubmitting(false);
          return;
        }
      }

      const orderPayload = {
        customerInfo: {
          id: customer?.id || null,
          name,
          email,
          phone,
        },
        shippingAddress: {
          recipientName: name,
          phone,
          streetAddress,
          landmark,
          city,
          state,
          postalCode,
          country,
        },
        deliveryMethod,
        paymentMethod,
        items,
        couponCode: appliedCoupon,
        notes: `Customer Order placed via ${paymentMethod}`,
      };

      const res = await apiClient.createOrder(orderPayload);

      if (res.success && res.order) {
        setCreatedOrder(res.order);
        setStep(5);
        clearCart();
        onOrderSuccess(res.order);

        // Fire festive luxury confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#d4d4d8', '#a1a1aa', '#71717a'],
          });
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setErrorMessage(err.message || 'Payment or order authorization failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTracking = () => {
    if (createdOrder?.trackingNumber) {
      navigator.clipboard.writeText(createdOrder.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#121317] border border-[#262832] rounded-xl shadow-2xl my-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#21232c] bg-[#0c0d10] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-white font-display">
              AURA FIT SECURE CHECKOUT
            </span>
          </div>
          {step !== 5 && (
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator Header (if not on confirmation) */}
        {step < 5 && (
          <div className="px-6 py-3 bg-[#16171d] border-b border-[#21232c] flex items-center justify-between text-xs text-neutral-400">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-white font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px]">1</span>
              <span>Contact</span>
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-white font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px]">2</span>
              <span>Address</span>
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-white font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px]">3</span>
              <span>Shipping</span>
            </div>
            <span>→</span>
            <div className={`flex items-center gap-1.5 ${step === 4 ? 'text-white font-bold' : ''}`}>
              <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px]">4</span>
              <span>Payment</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: CUSTOMER INFO */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4 max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display mb-1">
                Step 1: Contact Information
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Your order receipt, shipment notifications, and courier SMS alerts will be sent here.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Kapoor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#181920] border border-[#2b2d38] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="arjun@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#181920] border border-[#2b2d38] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#181920] border border-[#2b2d38] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Shipping Address</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SHIPPING ADDRESS */}
          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-4 max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display mb-1">
                Step 2: Shipping Destination
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Enter your street delivery address for secure BlueDart dispatch.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                  Street Address &amp; Apartment / Suite *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat 402, Skyline Residency, 12th Main Road"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-[#181920] border border-[#2b2d38] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Near Metro Station"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full bg-[#181920] border border-[#2b2d38] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    Postal Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="560038"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#181920] border border-[#2b2d38] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#181920] border border-[#2b2d38] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-300 mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#181920] border border-[#2b2d38] rounded-md px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold uppercase rounded transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Select Delivery Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: DELIVERY METHOD */}
          {step === 3 && (
            <div className="space-y-4 max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display mb-1">
                Step 3: Delivery Speed
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                All packages are shipped in AURA FIT signature black tamper-proof luxury packaging.
              </p>

              <div className="space-y-3">
                <label
                  onClick={() => setDeliveryMethod('Standard Express')}
                  className={`flex items-start justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    deliveryMethod === 'Standard Express'
                      ? 'border-white bg-[#191a22]'
                      : 'border-[#262832] bg-[#14151a] hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-neutral-300 mt-0.5" />
                    <div>
                      <span className="block text-sm font-bold text-white">Standard Express (BlueDart)</span>
                      <span className="text-xs text-neutral-400">Delivered within 3 to 4 business days</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">
                    {baseShippingFee === 0 ? 'FREE' : `₹${baseShippingFee}`}
                  </span>
                </label>

                <label
                  onClick={() => setDeliveryMethod('Same-Day Atelier Air')}
                  className={`flex items-start justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    deliveryMethod === 'Same-Day Atelier Air'
                      ? 'border-white bg-[#191a22]'
                      : 'border-[#262832] bg-[#14151a] hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-neutral-300 mt-0.5" />
                    <div>
                      <span className="block text-sm font-bold text-white">Priority Atelier Air Express</span>
                      <span className="text-xs text-neutral-400">Guaranteed 24-hour priority dispatch</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">
                    ₹{(baseShippingFee + 199).toString()}
                  </span>
                </label>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold uppercase rounded transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT SELECTION & VERIFICATION */}
          {step === 4 && (
            <div className="max-w-lg mx-auto">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display mb-1">
                Step 4: Secure Payment
              </h2>
              <p className="text-xs text-neutral-400 mb-6">
                Select your preferred payment gateway. All online payments are verified server-side.
              </p>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                    paymentMethod === 'COD'
                      ? 'border-white bg-[#1a1b24] text-white font-bold'
                      : 'border-[#262832] bg-[#14151a] text-neutral-400 hover:text-white'
                  }`}
                >
                  <Banknote className="w-5 h-5 mx-auto mb-1.5" />
                  <span className="text-[11px] block uppercase">Cash on Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-white bg-[#1a1b24] text-white font-bold'
                      : 'border-[#262832] bg-[#14151a] text-neutral-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1.5" />
                  <span className="text-[11px] block uppercase">Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('RAZORPAY')}
                  className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-white bg-[#1a1b24] text-white font-bold'
                      : 'border-[#262832] bg-[#14151a] text-neutral-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1.5" />
                  <span className="text-[11px] block uppercase">Cards / Razorpay</span>
                </button>
              </div>

              {/* Conditional Method Form */}
              <div className="p-4 bg-[#16171d] border border-[#262832] rounded-lg mb-6 text-xs text-neutral-300 space-y-3">
                {paymentMethod === 'COD' && (
                  <div>
                    <h4 className="font-semibold text-white uppercase tracking-wider mb-1">
                      Cash on Delivery (COD) Terms
                    </h4>
                    <p className="text-neutral-400 leading-relaxed">
                      You will pay <strong className="text-white font-mono">₹{totalAmount.toLocaleString('en-IN')}</strong> in cash or via mobile UPI to the BlueDart courier partner upon door delivery.
                    </p>
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div>
                    <h4 className="font-semibold text-white uppercase tracking-wider mb-1">
                      Unified Payments Interface (UPI)
                    </h4>
                    <p className="text-neutral-400 mb-3">
                      Enter your UPI ID (Google Pay, PhonePe, Paytm, BHIM):
                    </p>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-[#101115] border border-[#2b2d38] p-2.5 rounded text-xs text-white focus:outline-none focus:border-white font-mono"
                    />
                  </div>
                )}

                {paymentMethod === 'RAZORPAY' && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-white uppercase tracking-wider">
                      Razorpay Secure Card Gateway
                    </h4>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 ···· ···· 8920"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#101115] border border-[#2b2d38] p-2 rounded text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="08/29"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#101115] border border-[#2b2d38] p-2 rounded text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-neutral-400 mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-[#101115] border border-[#2b2d38] p-2 rounded text-xs text-white font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Final Summary */}
              <div className="p-4 bg-[#14151a] border border-[#21232c] rounded-lg mb-6 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Items Subtotal</span>
                  <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-400">
                  <span>Shipping Fee</span>
                  <span className="font-mono text-white">
                    {finalShippingFee === 0 ? 'FREE' : `₹${finalShippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Final Payable Amount</span>
                  <span className="font-mono text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-3 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold uppercase rounded transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="flex-1 py-3.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-[0.15em] rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>AUTHORIZING &amp; CREATING ORDER...</span>
                  ) : (
                    <span>CONFIRM &amp; AUTHORIZE ORDER (₹{totalAmount.toLocaleString('en-IN')})</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION & RECEIPT */}
          {step === 5 && createdOrder && (
            <div className="max-w-xl mx-auto text-center py-4 space-y-6">
              <div className="w-16 h-16 bg-emerald-950/60 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold tracking-[0.25em] text-neutral-400 uppercase">
                  ORDER CONFIRMED
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-display mt-1">
                  Thank You For Your Patronage
                </h2>
                <p className="text-xs text-neutral-400 mt-2">
                  A confirmation email with full receipt has been dispatched to{' '}
                  <strong className="text-white">{createdOrder.customerEmail}</strong>.
                </p>
              </div>

              {/* Order Key Badges */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-4 bg-[#16171d] border border-[#262832] rounded-lg">
                  <span className="block text-[11px] text-neutral-500 uppercase tracking-wider">Order Number</span>
                  <span className="text-sm font-bold text-white font-mono">{createdOrder.orderNumber}</span>
                </div>
                <div className="p-4 bg-[#16171d] border border-[#262832] rounded-lg relative">
                  <span className="block text-[11px] text-neutral-500 uppercase tracking-wider">Tracking Number</span>
                  <span className="text-sm font-bold text-white font-mono">{createdOrder.trackingNumber}</span>
                  <button
                    onClick={copyTracking}
                    className="absolute right-3 top-4 text-neutral-400 hover:text-white p-1"
                    title="Copy Tracking"
                  >
                    {copiedTracking ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Summary Details */}
              <div className="p-4 bg-[#14151a] border border-[#21232c] rounded-lg text-xs text-left space-y-2">
                <div className="flex justify-between text-neutral-300">
                  <span>Courier Partner:</span>
                  <span className="font-semibold text-white">{createdOrder.courierName || 'BlueDart Logistics'}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Payment Status:</span>
                  <span className="font-semibold text-emerald-400 uppercase">{createdOrder.paymentStatus}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono font-bold text-white text-sm">₹{parseFloat(createdOrder.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => {
                    onClose();
                    window.print();
                  }}
                  className="flex-1 py-3 border border-neutral-700 hover:border-white text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Print Receipt / Invoice</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
