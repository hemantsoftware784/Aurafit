import React, { useState } from 'react';
import { ArrowRight, MessageSquare, Check, Shield, Truck, RotateCcw } from 'lucide-react';
import { StoreSettings } from '../types/index.ts';

interface FooterProps {
  settings?: StoreSettings;
  onSelectCategory: (cat: string) => void;
  onOpenTracking: () => void;
  onOpenSizeGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onSelectCategory,
  onOpenTracking,
  onOpenSizeGuide,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const storeName = settings?.store_name || 'AURA FIT';
  const whatsapp = settings?.whatsapp_number || '+91 98765 43210';
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20AURA%20FIT%20Concierge`;

  return (
    <footer className="bg-[#08090b] border-t border-[#1f2026] text-neutral-400 text-xs">
      {/* Brand Value Props Banner */}
      <div className="border-b border-[#1b1c23] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#14151b] border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white font-bold block uppercase text-[11px] tracking-wider">Premium Heavyweight</span>
              <span className="text-neutral-500 text-[11px]">450 GSM Loopback organic cotton</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#14151b] border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white font-bold block uppercase text-[11px] tracking-wider">Express Dispatch</span>
              <span className="text-neutral-500 text-[11px]">Free delivery on orders above ₹1,999</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#14151b] border border-neutral-800 flex items-center justify-center text-white shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-white font-bold block uppercase text-[11px] tracking-wider">14-Day Hassle-Free</span>
              <span className="text-neutral-500 text-[11px]">Seamless returns &amp; doorstep pickups</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-[#14151b] border border-emerald-900/60 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-white font-bold block uppercase text-[11px] tracking-wider">WhatsApp Concierge</span>
                <span className="text-neutral-500 text-[11px]">Instant sizing advice &amp; VIP support</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <span className="text-xl sm:text-2xl font-extrabold tracking-[0.2em] text-white uppercase font-display block">
            {storeName}
          </span>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
            {settings?.tagline || 'DEFINE YOUR STYLE. OWN YOUR AURA.'} An architectural luxury streetwear atelier creating heavy-gauge drop-shoulder apparel with uncompromising tactile integrity.
          </p>
          <div className="pt-2 text-[11px] text-neutral-500">
            <p>Atelier Headquarters: {settings?.store_address || 'Bengaluru, India'}</p>
            <p>Concierge: {settings?.contact_email || 'concierge@aurafit.store'}</p>
          </div>
        </div>

        {/* Collection Links */}
        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-widest block mb-4">
            Collections
          </span>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onSelectCategory('men')} className="hover:text-white transition-colors cursor-pointer">
                Men's Streetwear
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('women')} className="hover:text-white transition-colors cursor-pointer">
                Women's Atelier
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('men-hoodies')} className="hover:text-white transition-colors cursor-pointer">
                Oversized Hoodies
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('men-trousers-cargo')} className="hover:text-white transition-colors cursor-pointer">
                Brutalist Cargos
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('sale')} className="hover:text-white transition-colors cursor-pointer text-amber-400">
                Seasonal Offers
              </button>
            </li>
          </ul>
        </div>

        {/* Client Care */}
        <div className="md:col-span-2 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-widest block mb-4">
            Client Care
          </span>
          <ul className="space-y-2">
            <li>
              <button onClick={onOpenTracking} className="hover:text-white transition-colors cursor-pointer">
                Track Order
              </button>
            </li>
            <li>
              <button onClick={onOpenSizeGuide} className="hover:text-white transition-colors cursor-pointer">
                Size &amp; Measurement Guide
              </button>
            </li>
            <li>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                WhatsApp Support
              </a>
            </li>
            <li>
              <span className="text-neutral-500">14-Day Return Policy</span>
            </li>
            <li>
              <span className="text-neutral-500">Privacy &amp; Terms</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="md:col-span-4 space-y-4">
          <span className="text-xs font-bold text-white uppercase tracking-widest block">
            The AURA Private Lookbook
          </span>
          <p className="text-neutral-400 text-xs">
            Subscribe for private access to limited release capsules, secret promo codes, and runway editorial previews.
          </p>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your VIP email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-[#14151a] border border-[#262832] px-3.5 py-2.5 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>JOIN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {subscribed && (
              <p className="text-emerald-400 text-[11px] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Welcome to the AURA inner circle.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Sub-footer Copyright */}
      <div className="border-t border-[#181921] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} {storeName} APPAREL PVT. LTD. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4">
            <span>ISO 9001 QUALITY CERTIFIED</span>
            <span>·</span>
            <span>ENCRYPTED TRANSACTIONS</span>
            <span>·</span>
            <span>MADE IN BENGALURU</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
