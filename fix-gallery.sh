#!/bin/bash
cat << 'INNER_EOF' > src/components/GalleryView.tsx
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Search, Play, ArrowRight, Quote, Sparkles
} from 'lucide-react';

interface GalleryViewProps {
  assets: any[];
  onBack: () => void;
  isDark: boolean;
}

export function GalleryView({ assets, onBack, isDark }: GalleryViewProps) {
  const displayAssets = useMemo(() => {
    const combined = [...assets];
    for (let i = 0; i < 7; i++) {
      if (!combined[i]) {
        combined[i] = { id: `default-${i}`, url: '', type: 'placeholder', title: 'GigSpace Asset' };
      }
    }
    return combined.slice(0, 7);
  }, [assets]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-black'}`}>
      
      {/* Background Neon Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#FF5E00]/10 blur-[120px] mix-blend-overlay"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[#219EBC]/10 blur-[100px] mix-blend-overlay"></div>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-6">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-full px-6 py-2.5 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 hover:-translate-x-1 transition-transform text-[#FF5E00]" />
            <span className="text-lg font-black tracking-tight">GigSpace</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm tracking-wide">
            <button className="hover:text-[#FF5E00] transition-colors">Digital</button>
            <button className="hover:text-[#219EBC] transition-colors">Branding</button>
            <button className="hover:text-[#FF5E00] transition-colors">Video</button>
            <button className="hover:text-[#219EBC] transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-4">
             <button className="w-10 h-10 rounded-full bg-gradient-to-r from-[#FF5E00] to-[#219EBC] flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                <Search className="w-4 h-4" />
             </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-screen-2xl mx-auto px-6 md:px-12 pt-32 pb-24 relative z-10">
        
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            Elevate Your Brand With<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E00] to-[#219EBC]">Bold Digital Art</span>
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
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_12s_linear_infinite] text-[#FF5E00]">
                <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="transparent" />
                <text className="text-[11.5px] font-bold uppercase tracking-[0.2em]" fill="currentColor">
                  <textPath href="#circlePath">
                    Explore the digital universe • 
                  </textPath>
                </text>
              </svg>
              <button className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
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
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full aspect-[1/2] rounded-[32px] overflow-hidden relative group shadow-2xl">
              <MediaRenderer asset={displayAssets[2]} />
            </motion.div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-6 w-full lg:w-1/5 lg:pt-40 relative items-center">
            {/* Small abstract star */}
            <div className="absolute top-24 lg:top-28 text-[#219EBC] animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            
            <div className="relative w-full mt-8">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full aspect-[4/5] rounded-[32px] overflow-hidden relative group shadow-2xl">
                <MediaRenderer asset={displayAssets[3]} />
              </motion.div>
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-3 whitespace-nowrap shadow-xl z-20 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white hover:scale-105 transition-transform"
              >
                Explore Collections <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-6 w-full lg:w-1/5 lg:pt-20">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="w-full aspect-[1/2] rounded-[32px] overflow-hidden relative group shadow-2xl">
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
        <div className="mt-32 flex flex-col md:flex-row items-start justify-between gap-12 max-w-6xl mx-auto border-t border-gray-200 dark:border-white/10 pt-16 relative z-10">
           
           {/* Left Quote */}
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="flex-1 max-w-sm">
             <Quote className="w-10 h-10 text-[#FF5E00]/50 mb-6 rotate-180" />
             <p className="text-lg font-medium leading-relaxed mb-6">
               "GigSpace's digital experiences are fresh, bold, and exactly what we needed to upgrade our brand. Loved the quality and vibe!"
             </p>
             <div className="text-right">
               <span className="font-serif italic text-2xl text-[#219EBC]">Our Clients</span>
             </div>
           </motion.div>

           {/* Right Article */}
           <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 }} className="flex-1 max-w-md">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-end gap-3">
                  <span className="text-6xl font-light leading-none -mb-1 text-[#FF5E00]">01</span>
                  <span className="text-sm font-bold tracking-wider uppercase mb-1">Digital</span>
                </div>
                <ArrowRight className="w-6 h-6 text-[#219EBC]" />
             </div>
             <h3 className="text-3xl font-black leading-snug">
               Set Up Your Brand With The Latest Trends
             </h3>
           </motion.div>

        </div>

      </main>
    </div>
  );
}

function MediaRenderer({ asset }: { asset: any }) {
  if (!asset) return null;
  if (asset.type === 'video' && asset.url) {
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
  
  if (!asset.url) {
    // GigSpace Placeholder for empty CMS slots
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#FF5E00]/90 to-[#219EBC]/90 flex items-center justify-center p-4">
         <span className="text-white/30 font-black text-2xl tracking-[0.3em] uppercase rotate-[-45deg] whitespace-nowrap overflow-hidden text-center">
            GigSpace
         </span>
      </div>
    );
  }
  
  return (
    <img 
      src={asset.url} 
      alt={asset.title || 'GigSpace Asset'} 
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
    />
  );
}
INNER_EOF
