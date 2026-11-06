import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  categoryName = 'Oversized Streetwear',
}) => {
  if (!isOpen) return null;

  const measurements = [
    { size: 'XS', chest: '42 in / 107 cm', length: '28 in / 71 cm', shoulder: '21 in / 53 cm', sleeve: '22 in / 56 cm' },
    { size: 'S', chest: '44 in / 112 cm', length: '29 in / 74 cm', shoulder: '22 in / 56 cm', sleeve: '23 in / 58 cm' },
    { size: 'M', chest: '46 in / 117 cm', length: '30 in / 76 cm', shoulder: '23 in / 58 cm', sleeve: '24 in / 61 cm' },
    { size: 'L', chest: '48 in / 122 cm', length: '31 in / 79 cm', shoulder: '24 in / 61 cm', sleeve: '24.5 in / 62 cm' },
    { size: 'XL', chest: '50 in / 127 cm', length: '32 in / 81 cm', shoulder: '25 in / 64 cm', sleeve: '25 in / 64 cm' },
    { size: 'XXL', chest: '52 in / 132 cm', length: '33 in / 84 cm', shoulder: '26 in / 66 cm', sleeve: '25.5 in / 65 cm' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#14151a] border border-[#2b2d38] rounded-xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-neutral-300" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display">
              AURA FIT Size &amp; Measurement Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-400 mt-3 mb-6">
          Measurements represent garment dimensions for {categoryName}. AURA FIT garments feature a signature boxy, relaxed drop-shoulder streetwear silhouette. For a standard tailored fit, consider sizing down one size.
        </p>

        {/* Tabular Numerals Measurements Table */}
        <div className="overflow-x-auto border border-neutral-800 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#1b1d24] text-neutral-300 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Chest (Pit-to-Pit)</th>
                <th className="py-3 px-4">Garment Length</th>
                <th className="py-3 px-4">Shoulder Width</th>
                <th className="py-3 px-4">Sleeve Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono tabular-nums">
              {measurements.map((m) => (
                <tr key={m.size} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{m.size}</td>
                  <td className="py-3 px-4">{m.chest}</td>
                  <td className="py-3 px-4">{m.length}</td>
                  <td className="py-3 px-4">{m.shoulder}</td>
                  <td className="py-3 px-4">{m.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>Need custom sizing concierge advice?</span>
          <span className="text-white font-medium">WhatsApp: +91 98765 43210</span>
        </div>
      </div>
    </div>
  );
};
