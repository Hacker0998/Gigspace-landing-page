#!/bin/bash
cat << 'INNER_EOF' > src/components/GalleryView.tsx
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Search, Play, ArrowRight, Quote, Sparkles, Wand2
} from 'lucide-react';

interface GalleryViewProps {
  assets: any[];
  onBack: () => void;
  isDark: boolean;
}

export function GalleryView({ assets, onBack, isDark }: GalleryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const displayAssets = useMemo(() => {
    let combined = [...assets];
    
    // Always pad to at least 10 items for a good masonry effect if there are too few
    const MIN_ASSETS = 12;
    if (combined.length < MIN_ASSETS) {
      for (let i = combined.length; i < MIN_ASSETS; i++) {
        combined.push({ id: `default-${i}`, url: '', type: 'placeholder', title: `GigSpace Asset ${i}` });
      }
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(a => (a.title || '').toLowerCase().includes(q) || (a.type || '').toLowerCase().includes(q));
    }

    return combined;
  }, [assets, searchQuery]);

  const getAspectClass = (index: number) => {
    const patterns = [
      'aspect-[3/4]', 
      'aspect-[16/9]', 
      'aspect-[4/5]', 
      'aspect-square', 
      'aspect-[9/16]',
      'aspect-[4/3]'
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#FAFAFA] text-black'}`}>
      
      {/* Background Neon Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#FF5E00]/10 blur-[120px] mix-blend-overlay"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] rounded-full bg-[#219EBC]/10 blur-[100px] mix-blend-overlay"></div>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-6">
        <div className="bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-full px-6 py-2.5 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 hover:-translate-x-1 transition-transform text-[#FF5E00]" />
            <span className="text-lg font-black tracking-tight hidden sm:block">GigSpace</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold text-sm tracking-wide">
            <button className="hover:text-[#FF5E00] transition-colors">Digital</button>
            <button className="hover:text-[#219EBC] transition-colors">Branding</button>
            <button className="hover:text-[#FF5E00] transition-colors">Video</button>
          </div>
          
          {/* SEARCH BAR */}
          <div className="flex items-center gap-2 relative flex-1 md:flex-none md:w-64 ml-4">
             <div className={`flex items-center w-full transition-all duration-300 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-2 ${isSearchActive ? 'ring-2 ring-[#FF5E00]/50' : ''}`}>
               <Search className="w-4 h-4 text-gray-500 dark:text-gray-400 min-w-[16px]" />
               <input 
                 type="text" 
                 placeholder="Search assets..." 
                 className="bg-transparent border-none outline-none w-full ml-2 text-sm font-medium text-black dark:text-white placeholder:text-gray-500"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => setIsSearchActive(true)}
                 onBlur={() => setIsSearchActive(false)}
               />
             </div>
             
             {/* Live Search Suggestions Dropdown */}
             <AnimatePresence>
               {isSearchActive && searchQuery.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1A1A24] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                 >
                   <div className="text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wider">Suggestions</div>
                   {displayAssets.slice(0, 3).map(asset => (
                     <div key={`sugg-${asset.id}`} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl cursor-pointer" onMouseDown={() => setSearchQuery(asset.title || '')}>
                       <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 dark:bg-white/10 shrink-0">
                         {asset.url ? (
                           asset.type === 'video' ? <video src={asset.url} className="w-full h-full object-cover" /> : <img src={asset.url} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full bg-gradient-to-br from-[#FF5E00]/50 to-[#219EBC]/50" />
                         )}
                       </div>
                       <span className="text-sm font-bold truncate">{asset.title || 'Untitled Asset'}</span>
                     </div>
                   ))}
                   {displayAssets.length === 0 && (
                     <div className="px-3 py-4 text-center text-sm text-gray-500 font-medium">No matches found.</div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
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
          
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF5E00] text-sm font-bold tracking-wide">
              <Sparkles className="w-4 h-4" /> AI Analysis Enabled
            </div>
          </div>
        </motion.div>

        {/* DYNAMIC MASONRY GRID */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {displayAssets.map((asset, i) => (
            <motion.div 
              key={asset.id}
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ delay: (i % 4) * 0.1 }}
              className={`w-full ${getAspectClass(i)} rounded-3xl overflow-hidden relative group shadow-xl hover:shadow-2xl transition-all duration-500 break-inside-avoid`}
              onMouseEnter={() => setAnalyzingId(asset.id)}
              onMouseLeave={() => setAnalyzingId(null)}
            >
              <MediaRenderer asset={asset} />
              
              {/* Image AI Analysis Overlay */}
              <AnimatePresence>
                {analyzingId === asset.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white z-20"
                  >
                    <Wand2 className="w-10 h-10 text-[#219EBC] mb-4 animate-bounce" />
                    <h3 className="font-bold text-lg mb-2 text-center">Analyzing Composition</h3>
                    <div className="w-full max-w-[200px] h-1 bg-white/20 rounded-full overflow-hidden mb-4">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: "100%" }}
                         transition={{ duration: 1.5, ease: "easeInOut" }}
                         className="h-full bg-gradient-to-r from-[#FF5E00] to-[#219EBC]"
                       />
                    </div>
                    <p className="text-xs text-white/70 text-center font-mono uppercase tracking-widest">
                      Color Match: {Math.floor(Math.random() * 20 + 80)}%<br/>
                      Vibe: {['Cyberpunk', 'Minimalist', 'Corporate', 'Abstract'][i % 4]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        {/* Empty State */}
        {displayAssets.length === 0 && (
           <div className="py-32 text-center">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-200 dark:bg-white/5 mb-6">
               <Search className="w-8 h-8 text-gray-400" />
             </div>
             <h3 className="text-2xl font-bold mb-2">No results found</h3>
             <p className="text-gray-500">Try adjusting your search query.</p>
           </div>
        )}

      </main>
      
      {/* GRAPHIC FOOTER */}
      <footer className="relative bg-black text-white pt-32 pb-12 overflow-hidden border-t-4 border-[#FF5E00]">
         {/* Footer Graphics */}
         <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none">
           <svg className="w-full h-auto text-[#111] opacity-50 translate-y-[-50%]" viewBox="0 0 1440 320">
             <path fill="currentColor" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,192C960,203,1056,181,1152,149.3C1248,117,1344,75,1392,53.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
           </svg>
         </div>
         <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#219EBC]/20 blur-[100px]"></div>
         <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-[#FF5E00]/20 blur-[100px]"></div>
         
         <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-md">
              <h2 className="text-4xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">GigSpace</h2>
              <p className="text-gray-400 font-medium leading-relaxed mb-8">
                Building the digital standard. We transform brands with immersive media, high-end motion graphics, and bold identity design.
              </p>
              <button className="px-8 py-4 rounded-full bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white font-bold tracking-wide shadow-xl hover:shadow-[#FF5E00]/20 hover:scale-105 transition-all flex items-center gap-2">
                Start A Project <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
               <div>
                 <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-6">Explore</h4>
                 <ul className="space-y-4 font-bold text-gray-300">
                   <li><a href="#" className="hover:text-[#FF5E00] transition-colors">Work</a></li>
                   <li><a href="#" className="hover:text-[#FF5E00] transition-colors">Services</a></li>
                   <li><a href="#" className="hover:text-[#FF5E00] transition-colors">About Us</a></li>
                   <li><a href="#" className="hover:text-[#FF5E00] transition-colors">Careers</a></li>
                 </ul>
               </div>
               <div>
                 <h4 className="font-bold uppercase tracking-widest text-xs text-gray-500 mb-6">Social</h4>
                 <ul className="space-y-4 font-bold text-gray-300">
                   <li><a href="#" className="hover:text-[#219EBC] transition-colors">Instagram</a></li>
                   <li><a href="#" className="hover:text-[#219EBC] transition-colors">Twitter</a></li>
                   <li><a href="#" className="hover:text-[#219EBC] transition-colors">LinkedIn</a></li>
                   <li><a href="#" className="hover:text-[#219EBC] transition-colors">Dribbble</a></li>
                 </ul>
               </div>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 relative z-10 mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
            <p>&copy; 2026 GigSpace Agency</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
         </div>
      </footer>
    </div>
  );
}

function MediaRenderer({ asset }: { asset: any }) {
  if (!asset) return null;
  if (asset.type === 'video' && asset.url) {
    return (
      <video 
        src={asset.url} 
        className="w-full h-full object-cover" 
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
      <div className="w-full h-full bg-gradient-to-br from-[#1A1A24] to-[#121218] flex flex-col items-center justify-center p-4 border border-white/5">
         <span className="text-white/10 font-black text-2xl tracking-[0.3em] uppercase rotate-[-45deg] whitespace-nowrap overflow-hidden text-center mb-4">
            GigSpace
         </span>
         <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-white/30 font-bold bg-white/5 px-2 py-1 rounded">Placeholder</span>
      </div>
    );
  }
  
  return (
    <img 
      src={asset.url} 
      alt={asset.title || 'GigSpace Asset'} 
      className="w-full h-full object-cover" 
    />
  );
}
INNER_EOF
