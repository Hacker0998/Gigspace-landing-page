#!/bin/bash
cat << 'INNER_EOF' > src/components/AdminDashboard.tsx
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Settings, 
  Users, 
  Bell, 
  Search,
  Upload,
  Trash2,
  Play,
  Video,
  LogOut,
  ChevronDown,
  Activity,
  Briefcase
} from 'lucide-react';

interface AdminDashboardProps {
  role: string;
  onLogout: () => void;
}

export function AdminDashboard({ role, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [assets, setAssets] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ heroTitle: '', heroSubtitle: '', heroBadge: '', heroVideoUrl: '', sponsors: [] });
  
  // Forms state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorColor, setNewSponsorColor] = useState('#A259FF');

  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [newPass, setNewPass] = useState('');

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data);
    } catch(e) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch(e) {}
  };

  const fetchPasswords = async () => {
    try {
      const res = await fetch('/api/passwords');
      if (res.ok) {
        const data = await res.json();
        setPasswords(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAssets();
    fetchSettings();
    if (role === 'CEO') fetchPasswords();
    
    const interval = setInterval(() => {
      fetchAssets();
      fetchSettings();
    }, 5000);
    return () => clearInterval(interval);
  }, [role]);

  // Actions
  const handleUploadAsset = async (e: FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle || uploadFile.name);
    try {
      const res = await fetch('/api/assets', { method: 'POST', body: formData });
      if (res.ok) {
        setUploadFile(null);
        setUploadTitle('');
        fetchAssets();
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      fetchAssets();
    } catch (e) {}
  };

  const handleUpdateSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) fetchSettings();
    } catch (e) {}
  };

  const handleUploadHeroVideo = async (e: FormEvent) => {
    e.preventDefault();
    if (!heroVideoFile) return;
    const formData = new FormData();
    formData.append('file', heroVideoFile);
    try {
      const res = await fetch('/api/assets', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        const updated = { ...settings, heroVideoUrl: data.asset.url };
        setSettings(updated);
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        setHeroVideoFile(null);
      }
    } catch(e) {}
  };

  const handleAddSponsor = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSponsorName) return;
    try {
      const res = await fetch('/api/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSponsorName, logoText: newSponsorName, color: newSponsorColor })
      });
      if (res.ok) {
        fetchSettings();
        setNewSponsorName('');
      }
    } catch(e) {}
  };

  const handleDeleteSponsor = async (id: string) => {
    try {
      const res = await fetch(`/api/sponsors/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSettings();
    } catch(e) {}
  };

  const handleUpdatePassword = async (roleToUpdate: string) => {
    if (!newPass) return;
    try {
      const res = await fetch('/api/passwords', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleToUpdate, newPassword: newPass })
      });
      if (res.ok) {
        fetchPasswords();
        setNewPass('');
      }
    } catch(e) {}
  };

  // Tabs
  const navItems = role === 'CEO' 
    ? [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'Branding', icon: Briefcase },
        { name: 'Settings', icon: Settings },
      ]
    : [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'Gallery', icon: ImageIcon },
        { name: 'Media', icon: Video },
      ];

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white flex overflow-hidden font-sans select-none relative">
      {/* Background glow effects matching the reference */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#A259FF]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#FF5E00]/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#121218]/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A259FF] to-[#FF5E00] flex items-center justify-center shadow-lg shadow-[#A259FF]/20">
            <span className="text-white font-black text-xs">GS</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Global Studio</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                activeTab === item.name 
                  ? 'bg-gradient-to-r from-[#A259FF]/20 to-transparent text-white border-l-2 border-[#A259FF]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.name ? 'text-[#A259FF]' : 'text-gray-500'}`} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all text-sm font-medium">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto z-10">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {role}</h1>
            <p className="text-gray-400 text-sm mt-1">Here's your global workspace overview</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-[#1A1A24] rounded-full px-4 py-2 border border-white/5">
              <Search className="w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Ask studio.ai anything" className="bg-transparent border-none focus:outline-none text-sm ml-2 w-48 placeholder-gray-500" />
            </div>
            
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-full bg-[#1A1A24] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors">
                <Bell className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#1A1A24] border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors">
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
              
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#A259FF] to-[#FF5E00] p-[2px]">
                  <div className="w-full h-full bg-[#121218] rounded-full overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia" alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-bold">{role}</p>
                  <p className="text-xs text-gray-500">{role.toLowerCase()}@globalstudio.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Views */}
        <div className="p-8 flex-1">
          <AnimatePresence mode="wait">
            
            {activeTab === 'Overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {/* Total Stats Bento */}
                <div className="col-span-1 md:col-span-1 xl:col-span-1 bg-[#1A1A24] rounded-3xl p-6 border border-white/5 flex flex-col justify-between relative overflow-hidden">
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium">Total Assets</h3>
                    <div className="mt-4 flex items-end gap-3">
                      <span className="text-4xl font-bold">{assets.length}</span>
                      <span className="text-sm text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full mb-1">+2 This Week</span>
                    </div>
                  </div>
                  <div className="mt-8">
                     <h3 className="text-gray-400 text-sm font-medium mb-3">Quick Actions</h3>
                     <div className="flex gap-2">
                       <button className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-2 text-sm transition-colors border border-white/5">Upload</button>
                       <button className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-xl py-2 text-sm transition-colors border border-white/5">Report</button>
                     </div>
                  </div>
                </div>

                {/* AI Insights Bento */}
                <div className="col-span-1 md:col-span-2 xl:col-span-1 bg-gradient-to-br from-[#1E182A] to-[#121218] rounded-3xl p-6 border border-[#A259FF]/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#A259FF] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <h3 className="text-lg font-bold mb-2 text-white">Decisions Powered by Data</h3>
                  <p className="text-sm text-gray-400 mb-8 max-w-[200px]">Move beyond guesswork with AI-driven creative insights tailored to your brand.</p>
                  <button className="mt-auto px-4 py-2 rounded-full bg-gradient-to-r from-[#A259FF] to-[#7B3FE4] text-white text-sm font-medium shadow-lg shadow-[#A259FF]/30 hover:opacity-90 transition-opacity">
                    Explore AI Insights
                  </button>
                </div>

                {/* Watchlist / Sponsors List */}
                <div className="col-span-1 md:col-span-3 xl:col-span-2 bg-[#1A1A24] rounded-3xl p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Active Sponsors</h3>
                    <div className="flex bg-white/5 rounded-full p-1">
                      <button className="px-3 py-1 rounded-full bg-white/10 text-xs font-medium">Most Viewed</button>
                      <button className="px-3 py-1 rounded-full text-gray-400 text-xs font-medium hover:text-white">Recent</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {settings.sponsors && settings.sponsors.length > 0 ? settings.sponsors.slice(0, 4).map((sponsor: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group cursor-default">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 border border-white/10" style={{ boxShadow: `0 0 10px ${sponsor.color}20` }}>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sponsor.color, boxShadow: `0 0 8px ${sponsor.color}` }}></div>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">{sponsor.name}</p>
                            <p className="text-xs text-gray-500 font-mono">PARTNER</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold font-mono">Active</p>
                          <p className="text-xs text-green-400">+12.4% reach</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-sm text-gray-500 py-4 text-center">No active sponsors</div>
                    )}
                  </div>
                </div>

                {/* Chart Area */}
                <div className="col-span-1 md:col-span-3 xl:col-span-4 bg-[#1A1A24] rounded-3xl p-6 border border-white/5 min-h-[300px] flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Audience Engagement</h3>
                    <div className="flex gap-2">
                      {['1D', '1W', '1M', '6M', '1Y'].map(t => (
                        <button key={t} className={`px-3 py-1 rounded-full text-xs font-medium border ${t === '1M' ? 'border-[#A259FF] text-white bg-[#A259FF]/10' : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/5'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 w-full relative flex items-end">
                    {/* Fake stylized area chart matching reference */}
                    <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="w-full h-full absolute inset-0 text-[#A259FF]">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,150 Q50,140 100,160 T200,120 T300,180 T400,130 T500,150 T600,80 T700,140 T800,110 T900,130 T1000,90 L1000,200 L0,200 Z" fill="url(#chartGradient)" />
                      <path d="M0,150 Q50,140 100,160 T200,120 T300,180 T400,130 T500,150 T600,80 T700,140 T800,110 T900,130 T1000,90" fill="none" stroke="currentColor" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(162,89,255,0.8)]" />
                      <circle cx="600" cy="80" r="6" fill="#fff" stroke="currentColor" strokeWidth="4" className="drop-shadow-[0_0_12px_rgba(162,89,255,1)]" />
                    </svg>
                    
                    <div className="absolute top-[30%] left-[55%] bg-[#252532] border border-white/10 p-3 rounded-xl shadow-2xl flex flex-col gap-1 items-center z-10 pointer-events-none">
                       <span className="text-xs text-gray-400">Peak Traffic</span>
                       <span className="text-sm font-bold text-white font-mono">16,500</span>
                       <span className="text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded uppercase font-bold">+35%</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* CEO BRANDING TAB */}
            {activeTab === 'Branding' && role === 'CEO' && (
              <motion.div key="branding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-4xl">
                
                {/* Text Settings */}
                <div className="bg-[#1A1A24] rounded-3xl p-6 border border-white/5">
                  <h3 className="text-lg font-bold mb-6">Hero Branding</h3>
                  <form onSubmit={handleUpdateSettings} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-400 font-medium">Hero Badge</label>
                      <input type="text" value={settings.heroBadge || ''} onChange={e => setSettings({...settings, heroBadge: e.target.value})} className="w-full bg-[#121218] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#A259FF] transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-400 font-medium">Hero Title</label>
                      <input type="text" value={settings.heroTitle || ''} onChange={e => setSettings({...settings, heroTitle: e.target.value})} className="w-full bg-[#121218] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#A259FF] transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-400 font-medium">Hero Subtitle</label>
                      <textarea value={settings.heroSubtitle || ''} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} className="w-full bg-[#121218] border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#A259FF] transition-colors h-24" />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-[#A259FF] hover:bg-[#8e45e6] text-white text-sm font-bold rounded-xl transition-colors mt-2">
                      Save Branding
                    </button>
                  </form>
                </div>

                {/* Logo Ticker */}
                <div className="bg-[#1A1A24] rounded-3xl p-6 border border-white/5">
                  <h3 className="text-lg font-bold mb-2">Live Logo Ticker</h3>
                  <p className="text-sm text-gray-400 mb-6">Manage partners that appear in the scrolling marquee.</p>
                  
                  <form onSubmit={handleAddSponsor} className="flex gap-4 mb-6 p-4 bg-[#121218] rounded-2xl border border-white/5">
                    <input type="text" placeholder="Partner Name" value={newSponsorName} onChange={e => setNewSponsorName(e.target.value)} required className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-white placeholder-gray-600" />
                    <input type="color" value={newSponsorColor} onChange={e => setNewSponsorColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0" />
                    <button type="submit" className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors">Add</button>
                  </form>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {settings.sponsors?.map((s: any) => (
                      <div key={s.id} className="p-3 bg-[#121218] border border-white/5 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}` }}></div>
                          <span className="text-sm font-bold text-white max-w-[100px] truncate">{s.name}</span>
                        </div>
                        <button onClick={() => handleDeleteSponsor(s.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* DESIGNER GALLERY TAB */}
            {activeTab === 'Gallery' && role === 'Designer' && (
               <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-5xl">
                 <div className="bg-[#1A1A24] rounded-3xl p-6 border border-white/5">
                    <h3 className="text-lg font-bold mb-2">Gallery Assets</h3>
                    <p className="text-sm text-gray-400 mb-6">Upload images or videos directly to the public gallery.</p>
                    
                    <form onSubmit={handleUploadAsset} className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-[#121218] rounded-2xl border border-white/5 items-center">
                       <label className="flex-1 relative group w-full cursor-pointer h-12 bg-white/5 rounded-xl border border-white/10 hover:border-[#A259FF]/50 transition-colors flex items-center justify-center">
                          <input type="file" accept="image/*,video/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="hidden" />
                          <span className="text-sm text-gray-300 flex items-center gap-2">
                             <Upload className="w-4 h-4" />
                             {uploadFile ? uploadFile.name : 'Choose File (Image/Video)'}
                          </span>
                       </label>
                       <input type="text" placeholder="Caption (optional)" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-[#A259FF] transition-colors" />
                       <button type="submit" disabled={!uploadFile} className="w-full md:w-auto px-8 h-12 bg-[#A259FF] hover:bg-[#8e45e6] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
                         Upload to Gallery
                       </button>
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {assets.map(asset => (
                        <div key={asset.id} className="relative aspect-square rounded-2xl overflow-hidden group bg-[#121218] border border-white/5">
                          {asset.type === 'video' ? (
                            <video src={asset.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop playsInline autoPlay />
                          ) : (
                            <img src={asset.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={asset.title} />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                            <p className="text-xs font-bold truncate text-white mb-2">{asset.title}</p>
                            <button onClick={() => handleDeleteAsset(asset.id)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {assets.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                          No assets in gallery. Start uploading.
                        </div>
                      )}
                    </div>
                 </div>
               </motion.div>
            )}

            {/* DESIGNER MEDIA TAB */}
            {activeTab === 'Media' && role === 'Designer' && (
               <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-4xl">
                 <div className="bg-[#1A1A24] rounded-3xl p-6 border border-white/5">
                    <h3 className="text-lg font-bold mb-2">Hero Video Loop</h3>
                    <p className="text-sm text-gray-400 mb-6">Update the primary video reel shown on the main landing page.</p>

                    <form onSubmit={handleUploadHeroVideo} className="flex flex-col gap-4">
                      <label className="relative group w-full cursor-pointer h-32 bg-[#121218] rounded-2xl border-2 border-dashed border-white/10 hover:border-[#A259FF]/50 transition-colors flex flex-col items-center justify-center">
                          <input type="file" accept="video/*" onChange={e => setHeroVideoFile(e.target.files?.[0] || null)} className="hidden" />
                          <Upload className={`w-6 h-6 mb-2 ${heroVideoFile ? 'text-[#A259FF]' : 'text-gray-500'}`} />
                          <span className="text-sm text-gray-300 text-center px-4">
                             {heroVideoFile ? heroVideoFile.name : 'Click to browse for a new hero video'}
                          </span>
                      </label>
                      <div className="flex justify-end">
                        <button type="submit" disabled={!heroVideoFile} className="px-6 py-3 bg-[#A259FF] hover:bg-[#8e45e6] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors">
                          Set Hero Video
                        </button>
                      </div>
                    </form>

                    {settings.heroVideoUrl && (
                      <div className="mt-8">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Current Active Hero</h4>
                        <div className="w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-white/10 relative shadow-2xl">
                          <video src={settings.heroVideoUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                        </div>
                      </div>
                    )}
                 </div>
               </motion.div>
            )}

            {/* CEO SETTINGS TAB */}
            {activeTab === 'Settings' && role === 'CEO' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 max-w-4xl">
                 <div className="bg-[#1A1A24] rounded-3xl p-6 border border-white/5">
                    <h3 className="text-lg font-bold mb-2">Access Control</h3>
                    <p className="text-sm text-gray-400 mb-6">Manage dashboard access passwords for the team.</p>

                    <div className="space-y-4">
                      {['CEO', 'Designer'].map(r => (
                        <div key={r} className="flex items-center justify-between p-4 bg-[#121218] rounded-2xl border border-white/5">
                          <div>
                            <p className="font-bold text-white text-sm">{r}</p>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                              Current Password: <span className="text-gray-300 bg-white/5 px-2 py-0.5 rounded">{passwords[r] || '******'}</span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                             <input type="text" placeholder="New pass" className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#A259FF]" onChange={e => setNewPass(e.target.value)} />
                             <button onClick={() => handleUpdatePassword(r)} className="px-3 py-1.5 bg-white/10 hover:bg-[#A259FF] text-white text-xs font-bold rounded-lg transition-colors">Update</button>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
INNER_EOF
