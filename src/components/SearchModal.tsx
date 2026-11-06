import React, { useState, useEffect } from 'react';
import { X, Search, ArrowRight } from 'lucide-react';
import { Product } from '../types/index.ts';
import { apiClient } from '../services/apiClient.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await apiClient.getProducts({ search: searchTerm.trim() });
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  const popularSearches = ['Heavyweight Hoodie', 'Oversized Tee', 'Cargo Trousers', 'Wool Overcoat', '450 GSM'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#121317] border border-[#262832] rounded-xl shadow-2xl p-6 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#21232c]">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-neutral-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search garments by name, SKU, or fabric (e.g. Hoodie, 450 GSM)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
            />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Tags */}
        {!searchTerm && (
          <div className="mt-6">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-3">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="px-3 py-1.5 text-xs bg-[#1a1b22] text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors border border-[#2b2d38] cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results List */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2">
          {isSearching ? (
            <div className="py-8 text-center text-xs text-neutral-400">Searching catalogue...</div>
          ) : results.length > 0 ? (
            results.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#1a1b22] transition-colors cursor-pointer border border-transparent hover:border-[#2b2d38]"
              >
                <img
                  src={prod.primaryImage}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-16 object-cover rounded bg-neutral-900 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase font-mono">
                    <span>{prod.categoryName}</span>
                    <span>·</span>
                    <span>{prod.sku}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{prod.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono font-bold text-white">
                      ₹{parseFloat(prod.sellingPrice).toLocaleString('en-IN')}
                    </span>
                    {parseFloat(prod.discountPercent) > 0 && (
                      <span className="text-[10px] text-neutral-400 line-through font-mono">
                        ₹{parseFloat(prod.mrp).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500" />
              </div>
            ))
          ) : searchTerm ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No garments matching "{searchTerm}" found in active catalogue.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
