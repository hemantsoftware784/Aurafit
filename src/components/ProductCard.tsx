import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useAuth();
  const [selectedSize, setSelectedSize] = useState<string>(product.availableSizes[0] || 'M');
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const mrpNum = parseFloat(product.mrp);
  const sellNum = parseFloat(product.sellingPrice);
  const discount = Math.round(parseFloat(product.discountPercent));

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = product.availableColors[0] || 'Black';
    addToCart(product, selectedSize, defaultColor, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div
      className="group relative flex flex-col bg-[#121316] border border-[#21232b] rounded-lg overflow-hidden transition-all duration-300 hover:border-[#383a48] hover:shadow-xl cursor-pointer"
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Stage (65-75% card visual weight) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#18191f]">
        <img
          src={product.primaryImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // High-fidelity fallback
            (e.target as HTMLImageElement).src = '/src/assets/images/aura_hero_campaign_1793941395011.jpg';
          }}
        />

        {/* Subtle Discount / Tag Kicker (Max 1 subtle tag, no pill cluster) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="text-[10px] font-bold tracking-widest uppercase bg-white text-black px-2 py-0.5 rounded-sm">
              {discount}% OFF
            </span>
          )}
          {product.isBestSeller && (
            <span className="text-[10px] font-semibold tracking-wider uppercase bg-[#272832] text-neutral-300 px-2 py-0.5 rounded-sm border border-neutral-700">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
            isFavorited
              ? 'bg-white text-red-600'
              : 'bg-black/40 text-neutral-300 hover:text-white hover:bg-black/70'
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Hover Strip */}
        <div
          className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-200 flex items-center justify-between gap-2 z-10 ${
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-200 bg-neutral-900/90 hover:bg-white hover:text-black rounded transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Content Metadata Area */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category kicker */}
          <div className="flex items-center justify-between text-[11px] font-medium tracking-wider text-neutral-400 uppercase mb-1">
            <span>{product.categoryName || 'Streetwear'}</span>
            <span className="font-mono text-neutral-500">{product.sku}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight line-clamp-1 mb-2 font-display">
            {product.name}
          </h3>

          {/* Size Quick Selection (Interactive controls with functional click handlers) */}
          <div
            className="flex items-center gap-1 mb-3 overflow-x-auto no-scrollbar py-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {product.availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors uppercase ${
                  selectedSize === size
                    ? 'bg-neutral-200 text-black'
                    : 'bg-[#1c1d24] text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-[#1f2026] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-white font-mono tabular-nums">
              ₹{sellNum.toLocaleString('en-IN')}
            </span>
            {mrpNum > sellNum && (
              <span className="text-xs text-neutral-500 line-through font-mono tabular-nums">
                ₹{mrpNum.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 cursor-pointer ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-black hover:bg-neutral-200'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="text-[11px]">ADDED</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="text-[11px]">ADD</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
