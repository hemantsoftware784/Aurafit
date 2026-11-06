import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Zap,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Product, Review } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { SizeGuideModal } from './SizeGuideModal.tsx';
import { apiClient } from '../services/apiClient.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onBuyNow: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProduct,
  onBuyNow,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, customer } = useAuth();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Review submission state
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.primaryImage);
      setSelectedSize(product.availableSizes[0] || 'M');
      setSelectedColor(product.availableColors[0] || 'Black');
      setQuantity(1);
      setPincodeStatus(null);
      setReviewsList(product.reviews || []);
    }
  }, [product]);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const mrpNum = parseFloat(product.mrp);
  const sellNum = parseFloat(product.sellingPrice);
  const discount = Math.round(parseFloat(product.discountPercent));

  // Determine variant stock
  const currentVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );
  const stockAvailable = currentVariant ? currentVariant.stock : 20;

  const handleAddToCart = (directBuy = false) => {
    addToCart(product, selectedSize, selectedColor, quantity, currentVariant?.id);
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1500);
    if (directBuy) {
      onClose();
      onBuyNow();
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setPincodeStatus('Express 3-4 day delivery serviceable in your area. Eligible for Free Shipping.');
    } else {
      setPincodeStatus('Please enter a valid 6-digit postal code.');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const added = await apiClient.submitReview({
        productId: product.id,
        customerId: customer?.id,
        customerName: reviewerName || customer?.name || 'Verified Buyer',
        rating: newRating,
        comment: newComment,
      });
      setReviewsList([added, ...reviewsList]);
      setNewComment('');
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-5xl bg-[#121317] border border-[#262832] rounded-xl shadow-2xl my-8 overflow-hidden max-h-[92vh] flex flex-col">
          {/* Header Close Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#21232c] bg-[#0d0e11] shrink-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400">
              <span>{product.categoryName}</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-white font-medium">{product.name}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body: 2-Column Split */}
          <div className="overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Visual Gallery (6 columns) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Main Showcase Image */}
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-[#181920] border border-[#252732]">
                <img
                  src={selectedImage || product.primaryImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                {discount > 0 && (
                  <span className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-2.5 py-1 uppercase tracking-wider rounded-sm">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.imageUrl)}
                      className={`relative w-20 h-24 rounded overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedImage === img.imageUrl
                          ? 'border-white opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt="Thumbnail"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Contiguous Purchase Module (6 columns) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                {/* Title and Rating */}
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-mono">
                    SKU: {product.sku}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-neutral-300 font-mono font-bold">5.0</span>
                    <span className="text-neutral-500">({reviewsList.length} reviews)</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase mb-3 font-display">
                  {product.name}
                </h1>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[#21232c]">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                    ₹{sellNum.toLocaleString('en-IN')}
                  </span>
                  {mrpNum > sellNum && (
                    <span className="text-base text-neutral-500 line-through font-mono tabular-nums">
                      MRP ₹{mrpNum.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-emerald-400 font-medium">
                    Inclusive of all taxes
                  </span>
                </div>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 font-light">
                  {product.shortDescription || product.description}
                </p>

                {/* Color Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                    <span>Color: <strong className="text-white">{selectedColor}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 text-xs font-medium rounded border transition-all cursor-pointer ${
                          selectedColor === color
                            ? 'bg-white text-black border-white'
                            : 'bg-[#18191f] text-neutral-300 border-[#2d2f3b] hover:border-neutral-500'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection & Size Guide */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                    <span>Select Size</span>
                    <button
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {product.availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 text-xs font-bold uppercase rounded border transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'bg-white text-black border-white'
                            : 'bg-[#18191f] text-neutral-300 border-[#2b2d38] hover:border-neutral-500'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {/* Stock Notice */}
                  <div className="mt-2 text-xs">
                    {stockAvailable > 0 ? (
                      stockAvailable <= 5 ? (
                        <span className="text-amber-400 font-medium">
                          Hurry! Only {stockAvailable} items left in stock.
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> In stock ready to dispatch
                        </span>
                      )
                    ) : (
                      <span className="text-red-400 font-medium">Currently out of stock</span>
                    )}
                  </div>
                </div>

                {/* Quantity and Actions */}
                <div className="flex items-center gap-3 mb-6">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-[#2b2d38] bg-[#18191f] rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2.5 text-neutral-400 hover:text-white text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-white tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                      className="px-3 py-2.5 text-neutral-400 hover:text-white text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(false)}
                    disabled={stockAvailable <= 0}
                    className={`flex-1 py-3 px-4 rounded text-xs font-bold tracking-[0.1em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isAdding
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-black hover:bg-neutral-200'
                    }`}
                  >
                    {isAdding ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>ADDED TO BAG</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>ADD TO SHOPPING BAG</span>
                      </>
                    )}
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3 rounded border border-[#2b2d38] transition-colors cursor-pointer ${
                      isFavorited
                        ? 'bg-white text-red-600 border-white'
                        : 'bg-[#18191f] text-neutral-300 hover:text-white'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Direct Buy Now */}
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={stockAvailable <= 0}
                  className="w-full mb-6 py-3 px-4 bg-transparent border border-white text-white hover:bg-white hover:text-black rounded text-xs font-bold tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>BUY NOW (EXPRESS CHECKOUT)</span>
                </button>

                {/* Pincode Serviceability */}
                <form onSubmit={handleCheckPincode} className="mb-6 p-4 bg-[#18191f] rounded-lg border border-[#262832]">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    <Truck className="w-4 h-4" />
                    <span>Check Delivery &amp; Pincode</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit Pincode (e.g. 560038)"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 bg-[#121317] border border-[#313342] text-xs text-white px-3 py-2 rounded focus:outline-none focus:border-white font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-neutral-800 text-white hover:bg-neutral-700 text-xs font-semibold uppercase rounded cursor-pointer"
                    >
                      Check
                    </button>
                  </div>
                  {pincodeStatus && (
                    <p className="mt-2 text-[11px] text-emerald-400 leading-snug">{pincodeStatus}</p>
                  )}
                </form>

                {/* Fabric & Specifications Accordion */}
                <div className="space-y-4 pt-4 border-t border-[#21232c] text-xs text-neutral-300">
                  <div>
                    <h4 className="font-semibold text-white uppercase tracking-wider mb-1">Fabric &amp; Craft</h4>
                    <p className="text-neutral-400 leading-relaxed">{product.fabricDetails}</p>
                  </div>

                  {product.specifications && (
                    <div>
                      <h4 className="font-semibold text-white uppercase tracking-wider mb-2">Technical Specifications</h4>
                      <div className="grid grid-cols-2 gap-2 text-neutral-400">
                        {Object.entries(product.specifications).map(([key, val]) => (
                          <div key={key} className="bg-[#18191f] p-2 rounded border border-[#262832]">
                            <span className="block text-white font-medium">{key}</span>
                            <span>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trust guarantees */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-neutral-300" />
                      <span>Authentic Materials</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-neutral-300" />
                      <span>Free Express &gt; ₹1999</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-neutral-300" />
                      <span>14-Day Returns</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="p-6 sm:p-8 bg-[#0e0f13] border-t border-[#21232c]">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display mb-4">
              Customer Reviews ({reviewsList.length})
            </h3>

            {/* Write a review form */}
            <form onSubmit={handleSubmitReview} className="mb-8 p-4 bg-[#14151a] rounded-lg border border-[#262832]">
              <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">
                Leave an Atelier Review
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Vikram S.)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="bg-[#1a1b22] border border-[#2e303c] text-xs text-white p-2.5 rounded focus:outline-none focus:border-white"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">Rating:</span>
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setNewRating(s)}
                        className="cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${s <= newRating ? 'fill-current' : 'text-neutral-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea
                placeholder="Share your feedback on the fabric weight, drape, stitching, and fit..."
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-[#1a1b22] border border-[#2e303c] text-xs text-white p-2.5 rounded focus:outline-none focus:border-white mb-3"
              />
              <div className="flex items-center justify-between">
                {reviewSubmitted && (
                  <span className="text-xs text-emerald-400 font-medium">Review submitted successfully!</span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase rounded cursor-pointer"
                >
                  Post Review
                </button>
              </div>
            </form>

            {/* Existing reviews */}
            <div className="space-y-4">
              {reviewsList.map((rev) => (
                <div key={rev.id || rev.comment} className="p-4 bg-[#14151a] rounded-lg border border-[#21232c]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">{rev.customerName}</span>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-neutral-700'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-light">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal Sub-view */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        categoryName={product.categoryName}
      />
    </>
  );
};
