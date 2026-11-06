import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Banner } from '../types/index.ts';

interface HeroBannerProps {
  banner?: Banner;
  onShopMen: () => void;
  onShopWomen: () => void;
  onExplore: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  banner,
  onShopMen,
  onShopWomen,
  onExplore,
}) => {
  const imageUrl = banner?.imageUrl || '/src/assets/images/aura_hero_campaign_1793941395011.jpg';
  const title = banner?.title || 'DEFINE YOUR STYLE. OWN YOUR AURA.';
  const subtitle = banner?.subtitle || 'AUTUMN / WINTER 2026 LUXURY STREETWEAR COLLECTION';

  return (
    <section className="relative w-full min-h-[550px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Background Image with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={imageUrl}
          alt="AURA FIT Campaign"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center brightness-[0.75] contrast-[1.05]"
          onError={(e) => {
            // Elegant fallback container
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d0f] via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        {/* Kicker */}
        <p className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-[#d1d5db] uppercase mb-4">
          {subtitle}
        </p>

        {/* Display Headline with balanced proportions */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white uppercase mb-8 font-display leading-[1.08] text-balance">
          {title}
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-neutral-300 font-light tracking-wide mb-10 leading-relaxed">
          Heavyweight French Terry hoodies, drop-shoulder 280GSM tees, and architectural utility outerwear designed with surgical precision and raw minimalist luxury.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onShopMen}
            className="group px-8 py-3.5 bg-white text-black text-xs font-bold tracking-[0.15em] uppercase rounded-md hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl"
          >
            <span>SHOP MEN</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={onShopWomen}
            className="group px-8 py-3.5 bg-transparent border border-white/60 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-md hover:bg-white/10 hover:border-white transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
          >
            <span>SHOP WOMEN</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={onExplore}
            className="px-6 py-3.5 text-neutral-400 hover:text-white text-xs font-medium tracking-[0.15em] uppercase transition-colors cursor-pointer"
          >
            DISCOVER ALL
          </button>
        </div>

        {/* Quick Value Metrics strip below hero */}
        <div className="mt-16 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div>
            <span className="block text-white text-sm font-bold font-display">450 GSM</span>
            <span className="text-xs text-neutral-400">Loopback Organic Fleece</span>
          </div>
          <div>
            <span className="block text-white text-sm font-bold font-display">PRECISION CUT</span>
            <span className="text-xs text-neutral-400">Architectural Streetwear</span>
          </div>
          <div>
            <span className="block text-white text-sm font-bold font-display">COMPLIMENTARY</span>
            <span className="text-xs text-neutral-400">Express Delivery &gt; ₹1,999</span>
          </div>
          <div>
            <span className="block text-white text-sm font-bold font-display">14-DAY RETURNS</span>
            <span className="text-xs text-neutral-400">Hassle-Free Exchange</span>
          </div>
        </div>
      </div>
    </section>
  );
};
