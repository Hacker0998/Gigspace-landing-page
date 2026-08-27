#!/bin/bash
cat << 'INNER_EOF' > src/components/GalleryView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Search, Plus, Image as ImageIcon, Video as VideoIcon, 
  Settings, PenTool, Layout, Download, Play, MousePointer2, Type, Star
} from 'lucide-react';

interface GalleryViewProps {
  assets: any[];
  onBack: () => void;
  isDark: boolean;
}

export function GalleryView({ assets, onBack, isDark }: GalleryViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Filter out sponsor logos (if any leaked) and apply category
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      if (activeCategory === 'All') return true;
      if (activeCategory === 'Images') return asset.type === 'image';
      if (activeCategory === 'Video') return asset.type === 'video';
      return true;
    });
  }, [assets, activeCategory]);

  const activeAsset = useMemo(() => {
    if (!selectedAssetId && filteredAssets.length > 0) return filteredAssets[0];
    return filteredAssets.find(a => a.id === selectedAssetId) || filteredAssets[0];
  }, [selectedAssetId, filteredAssets]);

  // Set first asset as selected initially
  useEffect(() => {
    if (!selectedAssetId && filteredAssets.length > 0) {
      setSelectedAssetId(filteredAssets[0].id);
    }
  }, [filteredAssets]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col font-sans transition-colors duration-500 ${isDark ? 'bg-[#B0B0B5]' : 'bg-[#E5E5E9]'}`}>
      
      {/* Dynamic Background Noise / Gradient */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-white/20 blur-[120px] mix-blend-overlay"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-black/5 blur-[100px] mix-blend-overlay"></div>
      </div>

      {/* TOP FLOATING NAV */}
      <div className="absolute top-6 left-0 right-0 z-40 flex justify-center px-8">
         <motion.div 
           initial={{ y: -50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="flex items-center justify-between w-full max-w-7xl"
         >
           {/* Left Controls */}
           <div className="flex items-center gap-4">
             <button 
               onClick={onBack}
               className="flex items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 transition-colors shadow-2xl"
             >
               <ArrowLeft className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
               <span className="font-bold tracking-widest uppercase text-xs">GigSpace</span>
             </div>
           </div>

           {/* Center Controls (Pill Nav) */}
           <div className="flex items-center p-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl">
              {['Project\nVisual Marketing', 'Create\nFramework', 'Insert\nGeneration', 'Templates\nBespoke'].map((label, i) => (
                <button key={i} className={`px-5 py-2 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors whitespace-pre-line text-center leading-tight ${i === 2 ? 'bg-white/10 text-white' : ''}`}>
                  {label}
                </button>
              ))}
           </div>

           {/* Right Controls */}
           <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/70 hover:text-white shadow-2xl">
                <Search className="w-4 h-4" />
              </button>
           </div>
         </motion.div>
      </div>

      {/* MAIN SPATIAL CANVAS AREA */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-8 overflow-hidden h-screen pt-24 pb-32">
        
        {/* LEFT THUMBNAIL PANEL (Floating) */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute left-8 lg:left-12 top-1/2 -translate-y-1/2 w-72 h-[65vh] flex flex-col gap-4 z-30"
        >
          {/* Add Image Button */}
          <button className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-black/30 backdrop-blur-2xl border border-white/20 text-white/90 hover:bg-black/50 hover:text-white shadow-2xl transition-all group">
            <span className="font-medium text-sm">Add media</span>
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          </button>

          {/* Thumbnail Grid */}
          <div className="flex-1 overflow-y-auto scrollbar-none rounded-3xl bg-black/20 backdrop-blur-2xl border border-white/10 p-3 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              {filteredAssets.map((asset) => (
                <button 
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`relative aspect-[4/5] rounded-xl overflow-hidden group border-2 transition-all ${selectedAssetId === asset.id ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'border-transparent'}`}
                >
                  {asset.type === 'video' ? (
                    <video src={asset.url} className="w-full h-full object-cover" muted loop playsInline onMouseOver={e => (e.target as HTMLVideoElement).play()} onMouseOut={e => (e.target as HTMLVideoElement).pause()} />
                  ) : (
                    <img src={asset.url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  )}
                  {asset.type === 'video' && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-md">
                      <Play className="w-2.5 h-2.5 text-white ml-0.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {filteredAssets.length === 0 && (
              <div className="h-full flex items-center justify-center text-white/50 text-sm font-medium">
                No assets found.
              </div>
            )}
          </div>
        </motion.div>

        {/* CENTRAL HERO CANVAS */}
        <div className="relative w-full max-w-4xl h-[70vh] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeAsset && (
              <motion.div 
                key={activeAsset.id}
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
                className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl bg-black border border-white/10 group"
              >
                {activeAsset.type === 'video' ? (
                  <video 
                    src={activeAsset.url} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease-out' }}
                  />
                ) : (
                  <img 
                    src={activeAsset.url} 
                    alt={activeAsset.title} 
                    className="w-full h-full object-cover"
                    style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease-out' }}
                  />
                )}
                
                {/* Embedded Typographic Overlay (Simulating the visionOS text editing) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <h1 className="text-4xl md:text-5xl font-serif text-white text-center leading-tight drop-shadow-2xl px-8">
                    {activeAsset.title || 'Engineered Comfort,\nMaximum Running Speed'}
                  </h1>
                </div>

                {/* Floating Toolbars inside Canvas */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center bg-black/60 backdrop-blur-xl border border-white/20 rounded-full p-1 shadow-2xl">
                    <button className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold flex items-center gap-2">
                      <Type className="w-3 h-3" /> Typography
                    </button>
                    <button className="px-4 py-1.5 rounded-full text-white/70 hover:text-white text-xs font-bold">
                       Color
                    </button>
                    <button className="px-4 py-1.5 rounded-full text-white/70 hover:text-white text-xs font-bold flex items-center gap-2">
                      <PenTool className="w-3 h-3" /> Pen Tool
                    </button>
                  </div>
                </div>

                {/* Floating Context Menu (Bottom right of canvas) */}
                <div className="absolute bottom-12 right-12 z-20">
                  <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl w-80">
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5E00] to-[#219EBC] flex items-center justify-center">
                         <Sparkles className="w-5 h-5 text-white" />
                       </div>
                       <div>
                         <h4 className="text-white font-bold text-sm">AI Assistant</h4>
                         <p className="text-white/50 text-[10px] uppercase tracking-wider">Style Suggestions</p>
                       </div>
                     </div>
                     <p className="text-white/80 text-xs leading-relaxed mb-4">
                       Replace the primary font with a more creative serif font to make it more elegant, expressive, and visually striking.
                     </p>
                     <div className="flex items-center gap-2">
                       <button className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors">Apply</button>
                       <button className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors">Dismiss</button>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* BOTTOM FLOATING DOCK */}
      <div className="absolute bottom-8 left-0 right-0 z-40 flex justify-center px-8 pointer-events-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-6 pointer-events-auto"
        >
          {/* Main Filter Dock */}
          <div className="flex items-center p-2 rounded-full bg-black/50 backdrop-blur-2xl border border-white/20 shadow-2xl">
            {['All', 'Images', 'Video'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveCategory(filter)}
                className={`relative px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all z-10 ${
                  activeCategory === filter 
                    ? 'text-white' 
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {activeCategory === filter && (
                  <motion.div
                    layoutId="gallery-dock-filter"
                    className="absolute inset-0 bg-white/20 rounded-full -z-10 backdrop-blur-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {filter}
              </button>
            ))}
          </div>

          {/* Action Dock */}
          <div className="flex items-center gap-2 p-2 rounded-full bg-black/50 backdrop-blur-2xl border border-white/20 shadow-2xl">
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" title="Zoom In" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
              <Plus className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" title="Download">
              <Download className="w-5 h-5" />
            </button>
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              Export Asset
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
INNER_EOF
