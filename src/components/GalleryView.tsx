import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Search, Play, ArrowRight, Sparkles, Wand2, Video, Film, Eye, Send, Check
} from 'lucide-react';
import { LeadsService, PortfolioAsset } from '../lib/supabase';

interface GalleryViewProps {
  assets: PortfolioAsset[];
  onBack: () => void;
  isDark: boolean;
}

export function GalleryView({ assets, onBack, isDark }: GalleryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Images' | 'Videos'>('All');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [requestAssetId, setRequestAssetId] = useState<string | null>(null);
  const [selectedVideoModal, setSelectedVideoModal] = useState<PortfolioAsset | null>(null);
  const [requestForm, setRequestForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const asset = displayAssets.find(a => a.id === requestAssetId);
      await LeadsService.create({
        name: requestForm.name,
        email: requestForm.email,
        message: requestForm.message,
        asset_id: requestAssetId || undefined,
        asset_title: asset?.title || 'Unknown Piece',
        service: asset?.category || 'Creative Asset Inquiry'
      });
      setSubmitSuccess(true);
      setTimeout(() => {
        setRequestAssetId(null);
        setSubmitSuccess(false);
        setRequestForm({ name: '', email: '', message: '' });
      }, 2200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayAssets = useMemo(() => {
    let combined = [...assets];
    
    // Always pad to at least 10 items for a good masonry effect if there are too few
    const MIN_ASSETS = 10;
    if (combined.length < MIN_ASSETS) {
      for (let i = combined.length; i < MIN_ASSETS; i++) {
        combined.push({
          id: `default-${i}`,
          url: '',
          type: (i % 3 === 0 ? 'video' : 'image') as 'image' | 'video',
          title: `GigSpace Kinetic Asset #${i + 1}`,
          category: 'Motion & 3D',
          created_at: new Date().toISOString()
        });
      }
    }
    
    // Filter by type
    if (selectedFilter === 'Images') {
      combined = combined.filter(a => a.type !== 'video');
    } else if (selectedFilter === 'Videos') {
      combined = combined.filter(a => a.type === 'video');
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(a => 
        (a.title || '').toLowerCase().includes(q) || 
        (a.category || '').toLowerCase().includes(q) ||
        (a.type || '').toLowerCase().includes(q)
      );
    }

    return combined;
  }, [assets, searchQuery, selectedFilter]);

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
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDark ? 'bg-[#0A0A0F] text-white' : 'bg-[#FAFAFA] text-black'}`}>
      
      {/* Background Neon Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] rounded-full bg-[#FF5E00]/10 blur-[140px] mix-blend-overlay" />
        <div className="absolute bottom-1/4 right-1/4 w-[45vw] h-[45vw] rounded-full bg-[#219EBC]/10 blur-[130px] mix-blend-overlay" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-6">
        <div className="bg-[#101017]/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 hover:-translate-x-1 transition-transform text-[#FF5E00]" />
            <span className="text-base font-black tracking-widest text-white hidden sm:block">GIGSPACE</span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-full p-1 border border-white/5">
            {(['All', 'Images', 'Videos'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedFilter === tab 
                    ? 'bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white shadow-md' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'Videos' ? '🎬 4K Videos' : tab}
              </button>
            ))}
          </div>
          
          {/* SEARCH BAR */}
          <div className="flex items-center gap-2 relative flex-1 md:flex-none md:w-64 ml-4">
             <div className={`flex items-center w-full transition-all duration-300 rounded-full bg-white/5 border border-white/10 px-4 py-2 ${isSearchActive ? 'ring-2 ring-[#FF5E00]/50' : ''}`}>
               <Search className="w-4 h-4 text-gray-400 min-w-[16px]" />
               <input 
                 type="text" 
                 placeholder="Search assets & videos..." 
                 className="bg-transparent border-none outline-none w-full ml-2 text-xs font-medium text-white placeholder:text-gray-500"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => setIsSearchActive(true)}
                 onBlur={() => setIsSearchActive(false)}
               />
             </div>
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5E00]/10 border border-[#FF5E00]/20 text-[#FF5E00] text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Supabase CDN & 4K Video Gallery
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.08] text-white">
            Elevate Your Brand With<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E00] via-[#F72585] to-[#219EBC]">
              Bold Digital Art & Reels
            </span>
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto mt-4">
            Curated archive of 3D spatial renders, identity systems, and high-fps video reels crafted for category-defining products.
          </p>
        </motion.div>

        {/* DYNAMIC MASONRY GRID */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {displayAssets.map((asset, i) => (
            <motion.div 
              key={asset.id}
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ delay: (i % 4) * 0.08 }}
              className={`w-full ${getAspectClass(i)} rounded-3xl overflow-hidden relative group shadow-xl hover:shadow-2xl transition-all duration-500 break-inside-avoid bg-[#12121A] border border-white/5`}
              onMouseEnter={() => setAnalyzingId(asset.id)}
              onMouseLeave={() => setAnalyzingId(null)}
            >
              <MediaRenderer 
                asset={asset} 
                onOpenVideo={() => setSelectedVideoModal(asset)} 
              />

              {/* Type Badge */}
              <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  asset.type === 'video' ? 'bg-[#FF5E00] text-white shadow-lg shadow-[#FF5E00]/40' : 'bg-black/60 text-white backdrop-blur-md'
                }`}>
                  {asset.type === 'video' ? '4K Video' : 'Visual'}
                </span>
              </div>
              
              {/* Image AI Analysis Overlay */}
              <AnimatePresence>
                {analyzingId === asset.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white z-20"
                  >
                    <Wand2 className="w-8 h-8 text-[#219EBC] mb-3 animate-bounce" />
                    <h3 className="font-bold text-base mb-1 text-center truncate max-w-xs">{asset.title}</h3>
                    <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-4">
                      {asset.category || 'Visual Asset'}
                    </p>

                    <div className="flex gap-2">
                      {asset.type === 'video' && asset.url && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedVideoModal(asset); }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Watch Reel
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setRequestAssetId(asset.id); }}
                        className="px-5 py-2 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white font-bold text-xs uppercase tracking-wider rounded-full hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-[#FF5E00]/20"
                      >
                        Inquire Piece
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        {/* Empty State */}
        {displayAssets.length === 0 && (
           <div className="py-32 text-center">
             <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6 text-gray-500">
               <Search className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-bold text-white mb-2">No matching assets found</h3>
             <p className="text-gray-500 text-sm">Try adjusting your category filter or search query.</p>
           </div>
        )}

      </main>

      {/* Video Fullscreen Modal */}
      <AnimatePresence>
        {selectedVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedVideoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-4xl bg-[#12121A] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-4 bg-[#181824] flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#FF5E00]" />
                  <h4 className="text-sm font-bold text-white">{selectedVideoModal.title}</h4>
                </div>
                <button 
                  onClick={() => setSelectedVideoModal(null)} 
                  className="p-1 rounded-full text-gray-400 hover:text-white font-bold"
                >
                  &times;
                </button>
              </div>
              <div className="aspect-video w-full bg-black">
                <video 
                  src={selectedVideoModal.url} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Modal */}
      <AnimatePresence>
        {requestAssetId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => !isSubmitting && !submitSuccess && setRequestAssetId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-[#14151B] rounded-3xl p-8 shadow-2xl border border-white/10 text-white"
            >
              {submitSuccess ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-[#FF5E00]/20 flex items-center justify-center mx-auto mb-4 border border-[#FF5E00]/40 text-[#FF5E00]">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>
                  <h3 className="text-xl font-black mb-1">Inquiry Dispatched!</h3>
                  <p className="text-xs text-gray-400">Our studio team will review your brief and reply within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <h3 className="text-xl font-black">Commission / Inquire</h3>
                      <p className="text-xs text-gray-400">Direct brief sent to GigSpace studio roster.</p>
                    </div>
                    <button type="button" onClick={() => setRequestAssetId(null)} className="text-gray-400 hover:text-white font-bold">&times;</button>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Your Name</label>
                    <input 
                      required 
                      type="text" 
                      value={requestForm.name} 
                      onChange={e => setRequestForm({...requestForm, name: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-[#FF5E00]" 
                      placeholder="e.g. Maya Chen" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Work Email</label>
                    <input 
                      required 
                      type="email" 
                      value={requestForm.email} 
                      onChange={e => setRequestForm({...requestForm, email: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-[#FF5E00]" 
                      placeholder="maya@company.com" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Project Brief / Question</label>
                    <textarea 
                      required 
                      value={requestForm.message} 
                      onChange={e => setRequestForm({...requestForm, message: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-[#FF5E00] h-24 resize-none" 
                      placeholder="I'm interested in commissioning a similar piece or video reel..."
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="mt-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white font-bold text-xs uppercase tracking-widest shadow-xl hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Syncing to Studio...' : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRAPHIC FOOTER */}
      <footer className="relative bg-[#07070A] text-white pt-24 pb-12 overflow-hidden border-t-2 border-[#FF5E00]/30">
         <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-md">
              <h2 className="text-3xl font-black tracking-tighter mb-3 text-white">GIGSPACE</h2>
              <p className="text-gray-400 text-xs font-medium leading-relaxed mb-6">
                Pushing digital craft beyond the default. Visual systems, DaVinci color grading, and generative WebGL experiences.
              </p>
              <button onClick={onBack} className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white font-bold text-xs tracking-wider shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                Return to Studio <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-12 text-xs font-bold text-gray-400">
               <div>
                 <h4 className="uppercase tracking-widest text-[10px] text-gray-500 mb-4">Disciplines</h4>
                 <ul className="space-y-3">
                   <li><span className="text-gray-300">3D Spatial Motion</span></li>
                   <li><span className="text-gray-300">Brand Hierarchy</span></li>
                   <li><span className="text-gray-300">4K Commercial Reels</span></li>
                 </ul>
               </div>
               <div>
                 <h4 className="uppercase tracking-widest text-[10px] text-gray-500 mb-4">Region</h4>
                 <ul className="space-y-3">
                   <li><span className="text-gray-300">Kampala, UG</span></li>
                   <li><span className="text-gray-300">London, UK</span></li>
                   <li><span className="text-gray-300">Remote Worldwide</span></li>
                 </ul>
               </div>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 relative z-10 mt-16 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-bold text-gray-600 uppercase tracking-widest">
            <p>&copy; 2026 GigSpace Collective</p>
            <p>Powered by Supabase & Netlify Architecture</p>
         </div>
      </footer>
    </div>
  );
}

function MediaRenderer({ asset, onOpenVideo }: { asset: PortfolioAsset; onOpenVideo?: () => void }) {
  if (!asset) return null;
  
  if (asset.type === 'video' && asset.url) {
    return (
      <div className="w-full h-full relative cursor-pointer group" onClick={onOpenVideo}>
        <video 
          src={asset.url} 
          className="w-full h-full object-cover" 
          autoPlay 
          loop 
          muted 
          playsInline 
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!asset.url) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#1A1A24] to-[#121218] flex flex-col items-center justify-center p-4 border border-white/5">
         <span className="text-white/10 font-black text-2xl tracking-[0.3em] uppercase rotate-[-45deg] whitespace-nowrap overflow-hidden text-center mb-4">
            GIGSPACE
         </span>
         <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-white/30 font-bold bg-white/5 px-2 py-1 rounded">
           {asset.type === 'video' ? '4K Video Slot' : 'Art Slot'}
         </span>
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
