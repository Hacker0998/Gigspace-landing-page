#!/bin/bash
cat << 'INNER_EOF' > src/components/GalleryView.tsx
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Search, ShoppingBag, Play, ArrowRight, Quote
} from 'lucide-react';

interface GalleryViewProps {
  assets: any[];
  onBack: () => void;
  isDark: boolean;
}

const DEFAULT_ASSETS = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1550614000-4b95d466f363?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1574015974293-817f0ebebb74?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80"
];

export function GalleryView({ assets, onBack, isDark }: GalleryViewProps) {
  const displayAssets = useMemo(() => {
    const combined = [...assets];
    for (let i = 0; i < 7; i++) {
      if (!combined[i]) {
        combined[i] = { id: \`default-\${i}\`, url: DEFAULT_ASSETS[i], type: 'image', title: 'Curated Fashion' };
      }
    }
    return combined.slice(0, 7);
  }, [assets]);

  return (
    <div className={\`min-h-screen font-sans transition-colors duration-500 \${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-white text-black'}\`}>
      
      {/* NAVBAR */}
      <nav className="max-w-screen-2xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 hover:-translate-x-1 transition-transform" />
          <span className="text-xl font-black tracking-tight">GigSpace</span>
        </div>

        <div className="hidden lg:flex items-center gap-8 font-medium text-sm">
          <button className="hover:opacity-60 transition-opacity">Home</button>
          <button className="hover:opacity-60 transition-opacity">New Arrival</button>
          <button className="hover:opacity-60 transition-opacity">Shop</button>
          <button className="hover:opacity-60 transition-opacity">Contact</button>
          <button className="hover:opacity-60 transition-opacity">About Us</button>
        </div>

        <div className="flex items-center gap-6">
          <button className="hover:opacity-60 transition-opacity"><Search className="w-5 h-5" /></button>
          <button className="hover:opacity-60 transition-opacity"><ShoppingBag className="w-5 h-5" /></button>
          <button className={\`px-6 py-2.5 rounded-full border text-sm font-semibold transition-colors \${isDark ? 'border-white hover:bg-white hover:text-black' : 'border-black hover:bg-black hover:text-white'}\`}>
            Sign In
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-screen-2xl mx-auto px-6 md:px-12 pt-8 pb-24">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Elevate Your Style With<br/>Bold Fashion
          </h1>
        </motion.div>

        {/* BENTO MASONRY GRID */}
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-6 w-full lg:w-1/5 items-center lg:items-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative w-28 h-28 flex items-center justify-center mb-4 lg:mb-8"
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite]">
                <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
                <text className="text-[11.5px] font-semibold uppercase tracking-[0.2em]" fill="currentColor">
                  <textPath href="#circlePath">
                    Learn about us through video • 
                  </textPath>
                </text>
              </svg>
              <button className={\`w-12 h-12 rounded-full flex items-center justify-center z-10 \${isDark ? 'bg-white text-black' : 'bg-black text-white'}\`}>
                <Play className="w-5 h-5 ml-1" fill="currentColor" />
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full aspect-[3/4] rounded-3xl overflow-hidden relative group">
              <MediaRenderer asset={displayAssets[0]} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full aspect-square rounded-3xl overflow-hidden relative group">
              <MediaRenderer asset={displayAssets[1]} />
            </motion.div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-6 w-full lg:w-1/5 lg:pt-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full aspect-[1/2] rounded-[32px] overflow-hidden relative group">
              <MediaRenderer asset={displayAssets[2]} />
            </motion.div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-6 w-full lg:w-1/5 lg:pt-40 relative items-center">
            {/* Small abstract star/sun */}
            <div className="absolute top-24 lg:top-28 text-[#D4AF37]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
            </div>
            
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full aspect-[4/5] rounded-[32px] overflow-hidden relative group mt-8">
              <MediaRenderer asset={displayAssets[3]} />
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className={\`absolute bottom-[-20px] left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-full font-medium text-sm flex items-center gap-2 whitespace-nowrap shadow-xl \${isDark ? 'bg-white text-black' : 'bg-black text-white'}\`}
            >
              Explore Collections <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-6 w-full lg:w-1/5 lg:pt-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="w-full aspect-[1/2] rounded-[32px] overflow-hidden relative group">
              <MediaRenderer asset={displayAssets[4]} />
            </motion.div>
          </div>

          {/* Column 5 */}
          <div className="flex flex-col gap-6 w-full lg:w-1/5 relative">
            <div className="hidden lg:flex absolute -top-4 right-0 gap-1">
               <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200 z-20">
                  <img src="https://i.pravatar.cc/100?img=1" className="w-full h-full object-cover" />
               </div>
               <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200 -ml-4 z-10">
                  <img src="https://i.pravatar.cc/100?img=2" className="w-full h-full object-cover" />
               </div>
               <div className="w-10 h-10 rounded-full border-2 border-white bg-black text-white flex items-center justify-center text-xs -ml-4 z-0">
                  +
               </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="w-full aspect-[4/3] rounded-[32px] overflow-hidden relative group lg:mt-12">
              <MediaRenderer asset={displayAssets[5]} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="w-full aspect-[4/3] rounded-[32px] overflow-hidden relative group">
              <MediaRenderer asset={displayAssets[6]} />
            </motion.div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-32 flex flex-col md:flex-row items-start justify-between gap-12 max-w-6xl mx-auto border-t border-gray-200 dark:border-white/10 pt-16">
           
           {/* Left Quote */}
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="flex-1 max-w-sm">
             <Quote className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-6 rotate-180" />
             <p className="text-sm font-medium leading-relaxed mb-6">
               TrendZone's styles are fresh, bold, and exactly what I needed to upgrade my wardrobe. Loved the quality and vibe!
             </p>
             <div className="text-right">
               <span className="font-serif italic text-2xl text-[#D4AF37]">Rafi H.</span>
             </div>
           </motion.div>

           {/* Right Article */}
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 }} className="flex-1 max-w-md">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-light leading-none -mb-1">01</span>
                  <span className="text-sm font-semibold tracking-wider uppercase mb-1">Lifestyle</span>
                </div>
                <ArrowRight className="w-6 h-6" />
             </div>
             <h3 className="text-2xl font-bold leading-snug">
               Set Up Your Fashion With The Latest Trends
             </h3>
           </motion.div>

        </div>

      </main>
    </div>
  );
}

function MediaRenderer({ asset }: { asset: any }) {
  if (!asset) return null;
  if (asset.type === 'video') {
    return (
      <video 
        src={asset.url} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        autoPlay 
        loop 
        muted 
        playsInline 
      />
    );
  }
  return (
    <img 
      src={asset.url} 
      alt={asset.title || 'Gallery image'} 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
    />
  );
}
INNER_EOF
