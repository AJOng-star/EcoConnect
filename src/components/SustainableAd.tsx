import React from 'react';
import { ExternalLink, Leaf } from 'lucide-react';

export default function SustainableAd() {
  const ads = [
    {
      brand: "EarthShare",
      tagline: "Eco-friendly banking for a better tomorrow.",
      cta: "Switch Now",
      color: "bg-emerald-50 text-emerald-800 border-emerald-100"
    },
    {
      brand: "OceanClean",
      tagline: "Every bottle purchased removes 1lb of trash.",
      cta: "Shop Now",
      color: "bg-blue-50 text-blue-800 border-blue-100"
    },
    {
      brand: "SolarGrid",
      tagline: "Power your home with 100% clean energy.",
      cta: "Get Quote",
      color: "bg-amber-50 text-amber-800 border-amber-100"
    }
  ];

  const ad = ads[Math.floor(Math.random() * ads.length)];

  return (
    <div className={`p-6 rounded-3xl border-2 ${ad.color} relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
        <Leaf size={80} />
      </div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white/50 rounded-lg">Sponsored</span>
          <p className="font-black text-sm">{ad.brand}</p>
        </div>
        
        <h4 className="text-xl font-serif italic leading-tight max-w-[200px]">
          {ad.tagline}
        </h4>

        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
          {ad.cta} <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}
