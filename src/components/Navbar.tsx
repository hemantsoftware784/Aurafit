import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Shield,
  Menu,
  X,
  Package,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { StoreSettings } from '../types/index.ts';

interface NavbarProps {
  settings?: StoreSettings;
  onOpenSearch: () => void;
  onOpenTracking: () => void;
  onOpenAccount: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenSearch,
  onOpenTracking,
  onOpenAccount,
  onSelectCategory,
}) => {
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const {
    viewMode,
    setViewMode,
    customer,
    admin,
    isAdminLoggedIn,
    logoutAdmin,
    wishlistIds,
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const storeName = settings?.store_name || 'AURA FIT';

  const navLinks = [
    { label: 'HOME', action: () => onSelectCategory('all') },
    { label: 'MEN', action: () => onSelectCategory('men') },
    { label: 'WOMEN', action: () => onSelectCategory('women') },
    { label: 'NEW ARRIVALS', action: () => onSelectCategory('new') },
    { label: 'BEST SELLERS', action: () => onSelectCategory('best') },
    { label: 'SALE', action: () => onSelectCategory('sale') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090a0c]/90 backdrop-blur-md border-b border-[#1f2026]">
      {/* Announcement bar */}
      <div className="bg-[#121318] text-[#a1a1aa] text-[11px] font-medium tracking-widest text-center py-2 px-4 border-b border-[#1c1d24] flex items-center justify-between">
        <span className="hidden sm:inline-block text-neutral-500">AUTUMN / WINTER 2026 ATELIER</span>
        <div className="mx-auto flex items-center gap-2">
          <span className="text-[#e4e4e7] uppercase font-semibold">COMPLIMENTARY SHIPPING</span>
          <span>ON ORDERS ABOVE ₹1,999</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="text-neutral-400">USE CODE <strong className="text-white">AURA10</strong> FOR 10% OFF</span>
        </div>
        <button
          onClick={onOpenTracking}
          className="hidden sm:flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs uppercase"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Track Order</span>
        </button>
      </div>

      {/* Main Top Bar (Strict 3-zone contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <button
            onClick={onOpenSearch}
            className="p-2 text-neutral-300 hover:text-white"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('all');
          }}
          className="text-2xl sm:text-3xl font-extrabold tracking-[0.25em] text-white uppercase whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity font-display"
        >
          {storeName}
        </a>

        {/* Zone 2: Navigation Links (Clean single-line prose) */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold tracking-wider text-neutral-400">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={link.action}
              className="hover:text-white transition-colors uppercase whitespace-nowrap shrink-0 cursor-pointer relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white hover:after:w-full after:transition-all"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions (Search, Wishlist, Account, Cart, Admin toggle) */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* Desktop Search Button */}
          <button
            onClick={onOpenSearch}
            className="hidden lg:flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-md hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={onOpenAccount}
            className="relative p-2 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Wishlist"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="p-2 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>

            {userDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-[#14151a] border border-[#2b2d38] rounded-lg shadow-2xl py-2 z-50 text-xs"
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                {customer ? (
                  <div className="px-4 py-2 border-b border-neutral-800">
                    <p className="text-white font-semibold truncate">{customer.name}</p>
                    <p className="text-neutral-400 truncate">{customer.email}</p>
                  </div>
                ) : (
                  <div className="px-4 py-2 border-b border-neutral-800">
                    <p className="text-white font-medium">Welcome to AURA FIT</p>
                    <p className="text-neutral-400 text-[11px]">Sign in to access VIP orders & rewards</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenAccount();
                  }}
                  className="w-full text-left px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Account & Orders</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenTracking();
                  }}
                  className="w-full text-left px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Track Package</span>
                </button>

                <div className="border-t border-neutral-800 my-1"></div>

                {/* Admin Mode Switcher */}
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setViewMode('admin');
                  }}
                  className="w-full text-left px-4 py-2 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Admin Dashboard</span>
                  </div>
                  {isAdminLoggedIn && (
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">Active</span>
                  )}
                </button>

                {isAdminLoggedIn && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logoutAdmin();
                    }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout Admin</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Cart Bag Action Button */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2.5 bg-white text-black px-4 py-2 rounded-md hover:bg-neutral-200 transition-colors cursor-pointer text-xs font-bold tracking-wider uppercase whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">BAG</span>
            <span className="font-mono tabular-nums bg-black text-white px-1.5 py-0.5 rounded text-[10px]">
              {itemCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e0f13] border-b border-[#22242c] px-4 pt-2 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  link.action();
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-neutral-900 rounded"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTracking();
              }}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>Track Order</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setViewMode('admin');
              }}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
