/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderTrackingModal } from './components/OrderTrackingModal.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { CustomerAccountModal } from './components/CustomerAccountModal.tsx';
import { SizeGuideModal } from './components/SizeGuideModal.tsx';
import { Footer } from './components/Footer.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { apiClient } from './services/apiClient.ts';
import { Product, Category, StoreSettings, Banner, Order } from './types/index.ts';
import { SlidersHorizontal, Sparkles, Flame, Shield, ArrowUpRight } from 'lucide-react';

function Storefront() {
  const { viewMode } = useAuth();
  const { setIsOpen: setCartOpen } = useCart();

  // App data state
  const [settings, setSettings] = useState<StoreSettings>({});
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Active filter & sorting state
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('featured');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    loadStoreInitialData();
  }, []);

  useEffect(() => {
    loadFilteredProducts();
  }, [selectedFilter, selectedSort]);

  const loadStoreInitialData = async () => {
    try {
      const [st, bans, cats] = await Promise.all([
        apiClient.getSettings().catch(() => ({})),
        apiClient.getBanners().catch(() => []),
        apiClient.getCategories().catch(() => []),
      ]);
      setSettings(st);
      setBanners(bans);
      setCategories(cats);
    } catch (e) {
      console.error('Initial data load error:', e);
    }
  };

  const loadFilteredProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const params: any = { sort: selectedSort };

      if (selectedFilter === 'men') {
        params.gender = 'men';
      } else if (selectedFilter === 'women') {
        params.gender = 'women';
      } else if (selectedFilter === 'new') {
        params.isNew = true;
      } else if (selectedFilter === 'best') {
        params.isBestSeller = true;
      } else if (selectedFilter === 'sale') {
        params.sort = 'discount';
      } else if (selectedFilter !== 'all') {
        params.category = selectedFilter;
      }

      const data = await apiClient.getProducts(params);
      setProducts(data);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  if (viewMode === 'admin') {
    return <AdminDashboard />;
  }

  const primaryBanner = banners[0];
  const editorialBanner = banners[1];

  return (
    <div className="min-h-screen bg-[#0c0d0f] text-neutral-100 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        settings={settings}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenTracking={() => setTrackingOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        onSelectCategory={(cat) => setSelectedFilter(cat)}
      />

      {/* Main Hero Banner */}
      <HeroBanner
        banner={primaryBanner}
        onShopMen={() => {
          setSelectedFilter('men');
          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onShopWomen={() => {
          setSelectedFilter('women');
          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onExplore={() => {
          setSelectedFilter('all');
          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Catalog Viewport */}
      <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        {/* Section Header & Interactive Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#21232c] mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
              <span>Autumn / Winter 2026 Collection</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-display">
              Curated Atelier Catalog
            </h2>
          </div>

          {/* Interactive filter tabs (functional buttons with active states) */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Garments' },
              { id: 'men', label: 'Men' },
              { id: 'women', label: 'Women' },
              { id: 'new', label: 'New Arrivals' },
              { id: 'best', label: 'Best Sellers' },
              { id: 'sale', label: 'Offers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? 'bg-white text-black shadow-md'
                    : 'bg-[#14151b] text-neutral-400 hover:text-white hover:bg-neutral-800 border border-[#232530]'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto sm:ml-4 bg-[#14151b] border border-[#232530] px-3 py-1.5 rounded-md text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer uppercase text-xs"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest Releases</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid (3-column desktop layout with generous whitespace) */}
        {isLoadingProducts ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs text-neutral-400 tracking-widest uppercase">Loading garments from Cloud SQL...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center border border-[#232530] rounded-xl bg-[#121317]">
            <p className="text-sm text-neutral-400 mb-4">No garments match the selected criteria.</p>
            <button
              onClick={() => setSelectedFilter('all')}
              className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase rounded cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Brand Editorial Craftsmanship Story Section */}
        <section className="mt-24 pt-16 border-t border-[#1f2026]">
          <div className="relative rounded-2xl overflow-hidden border border-[#262832] bg-[#14151a]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Image side */}
              <div className="lg:col-span-7 relative min-h-[360px] lg:min-h-[500px]">
                <img
                  src={editorialBanner?.imageUrl || '/src/assets/images/aura_editorial_story_1793941397255.jpg'}
                  alt="AURA Craftsmanship"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:hidden"></div>
              </div>

              {/* Text narrative */}
              <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-[#111216]">
                <div>
                  <span className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-400 block mb-3 font-display">
                    ATELIER PHILOSOPHY
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase mb-6 font-display leading-tight">
                    Architectural Proportions &amp; Unyielding Weight
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light mb-6">
                    We reject disposable synthetic fast fashion. Every AURA FIT silhouette is precision-engineered from 450 GSM French Terry loopback cotton, Japanese selvedge denim, and Italian virgin wool twill.
                  </p>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">
                    Heavy-gauge drop shoulders, reinforced double-needle seams, and silicone bio-washes guarantee that each piece maintains its sculptural presence through hundreds of wears.
                  </p>
                </div>

                <div className="pt-8 border-t border-[#232530] mt-8 flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block text-sm font-display">HANDCRAFTED LUXURY</span>
                    <span className="text-[11px] text-neutral-500">Bengaluru Design Atelier</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFilter('men-hoodies');
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Shop Hoodies</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onSelectCategory={(cat) => {
          setSelectedFilter(cat);
          document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenTracking={() => setTrackingOpen(true)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer onProceedCheckout={() => setCheckoutOpen(true)} />

      {/* Multi-step Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={(ord: Order) => {
          // Success feedback
        }}
      />

      {/* PDP Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onBuyNow={() => setCheckoutOpen(true)}
      />

      {/* Live Order Tracker Modal */}
      <OrderTrackingModal
        isOpen={trackingOpen}
        onClose={() => setTrackingOpen(false)}
        onRequestReturn={() => {
          setTrackingOpen(false);
          setAccountOpen(true);
        }}
      />

      {/* Live Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* VIP Customer Account Modal */}
      <CustomerAccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </AuthProvider>
  );
}
