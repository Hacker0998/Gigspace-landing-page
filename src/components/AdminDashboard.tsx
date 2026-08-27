import React, { useState, useEffect, FormEvent } from 'react';
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
  Briefcase,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Layers,
  Inbox,
  Filter,
  Check,
  Film
} from 'lucide-react';
import { 
  PortfolioService, 
  CmsSettingsService, 
  TasksService, 
  TransactionsService, 
  LeadsService,
  AuthService,
  uploadMediaToSupabase,
  PortfolioAsset, 
  SiteSettings, 
  KanbanTask, 
  Transaction, 
  Lead,
  isSupabaseConfigured
} from '../lib/supabase';
import { MediaUploadZone } from './MediaUploadZone';
import { PartnerManager } from './PartnerManager';
import { SectionCmsEditor } from './SectionCmsEditor';

interface AdminDashboardProps {
  role: string;
  onLogout: () => void;
}

export function AdminDashboard({ role, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    heroTitle: 'Ideas that look alive.',
    heroSubtitle: 'Transforming high-growth tech brands with award-winning visual systems, 3D motion, and immersive digital craft.',
    heroBadge: 'Design Studio',
    heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41485-large.mp4',
    sponsors: []
  });
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms and Modals
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [heroVideoFile, setHeroVideoFile] = useState<File | null>(null);
  const [isUploadingHeroVideo, setIsUploadingHeroVideo] = useState(false);

  // New Task Form
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    stage: KanbanTask['stage'];
    category: string;
    priority: 'low' | 'medium' | 'high';
  }>({
    title: '',
    description: '',
    stage: 'Backlog',
    category: 'Branding',
    priority: 'medium'
  });

  // New Transaction Form
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [newTx, setNewTx] = useState<{
    client: string;
    amount: number;
    currency: string;
    type: 'income' | 'expense';
    description: string;
  }>({
    client: '',
    amount: 1500000,
    currency: 'UGX',
    type: 'income',
    description: ''
  });

  // Load all initial data from Supabase
  const refreshAllData = async () => {
    try {
      const [fetchedAssets, fetchedSettings, fetchedTasks, fetchedTxs, fetchedLeads] = await Promise.all([
        PortfolioService.getAll(),
        CmsSettingsService.getSettings(),
        TasksService.getAll(),
        TransactionsService.getAll(),
        LeadsService.getAll()
      ]);

      setAssets(fetchedAssets);
      setSettings(fetchedSettings);
      setTasks(fetchedTasks);
      setTransactions(fetchedTxs);
      setLeads(fetchedLeads);
    } catch (err) {
      console.error('Error fetching Supabase data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Update Settings (Live CMS)
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updated = await CmsSettingsService.updateSettings(settings);
      setSettings(updated);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update CMS settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Upload Hero Video Reel
  const handleUploadHeroVideo = async (e: FormEvent) => {
    e.preventDefault();
    if (!heroVideoFile) return;
    setIsUploadingHeroVideo(true);
    try {
      const { url } = await uploadMediaToSupabase(heroVideoFile, 'portfolio');
      const updated = await CmsSettingsService.updateSettings({ heroVideoUrl: url });
      setSettings(updated);
      setHeroVideoFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingHeroVideo(false);
    }
  };

  // Delete Portfolio Asset
  const handleDeleteAsset = async (id: string) => {
    await PortfolioService.delete(id);
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  // Create Task
  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    const created = await TasksService.create({
      title: newTask.title,
      description: newTask.description,
      stage: newTask.stage,
      category: newTask.category,
      priority: newTask.priority,
      assigned_to: role
    });
    setTasks(prev => [created, ...prev]);
    setShowNewTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      stage: 'Backlog',
      category: 'Branding',
      priority: 'medium'
    });
  };

  // Move Task Stage (Kanban Drag & Drop)
  const handleTaskStageChange = async (taskId: string, newStage: KanbanTask['stage']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stage: newStage } : t));
    await TasksService.updateStage(taskId, newStage);
  };

  // Create Transaction
  const handleCreateTx = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTx.client.trim() || !newTx.amount) return;
    const created = await TransactionsService.create({
      tx_ref: `GS-${Math.floor(1000 + Math.random() * 9000)}`,
      client: newTx.client,
      amount: Number(newTx.amount),
      currency: newTx.currency,
      status: 'completed',
      type: newTx.type,
      description: newTx.description
    });
    setTransactions(prev => [created, ...prev]);
    setShowNewTxModal(false);
    setNewTx({
      client: '',
      amount: 1500000,
      currency: 'UGX',
      type: 'income',
      description: ''
    });
  };

  // Financial Metrics
  const totalRevenueUGX = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + (t.currency === 'UGX' ? t.amount : t.amount * 3800), 0);

  const totalExpensesUGX = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + (t.currency === 'UGX' ? t.amount : t.amount * 3800), 0);

  const netBalanceUGX = totalRevenueUGX - totalExpensesUGX;

  // Nav Items
  const navItems = role === 'CEO' 
    ? [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'Finance Ledger', icon: DollarSign },
        { name: 'Live CMS', icon: Briefcase },
        { name: 'Client Inquiries', icon: Inbox },
        { name: 'Media Library', icon: ImageIcon },
        { name: 'Kanban Queue', icon: Layers }
      ]
    : [
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'Kanban Queue', icon: Layers },
        { name: 'Media Library', icon: ImageIcon },
        { name: 'Hero Video Reel', icon: Video },
        { name: 'Client Inquiries', icon: Inbox }
      ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex overflow-hidden font-sans select-none relative">
      {/* Background Neon Atmosphere */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-[#FF5E00]/10 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#219EBC]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#101017]/90 backdrop-blur-2xl border-r border-white/5 flex flex-col z-20">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5E00] to-[#219EBC] flex items-center justify-center p-[2px] shadow-lg shadow-[#FF5E00]/20">
            <div className="w-full h-full bg-[#101017] rounded-[14px] flex items-center justify-center">
              <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF5E00] to-[#219EBC]">G</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-widest text-white">GIGSPACE</span>
              <span className="text-[9px] bg-[#FF5E00]/20 text-[#FF5E00] font-bold px-1.5 py-0.2 rounded uppercase">CMS</span>
            </div>
            <span className="text-[10px] text-gray-400">
              {isSupabaseConfigured ? 'Supabase Sync Live' : 'Studio Engine Active'}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-xs font-bold tracking-wide ${
                activeTab === item.name 
                  ? 'bg-gradient-to-r from-[#FF5E00]/20 via-[#219EBC]/10 to-transparent text-white border-l-2 border-[#FF5E00]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeTab === item.name ? 'text-[#FF5E00]' : 'text-gray-500'}`} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-gray-300 font-medium">Supabase Realtime</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">v2.0</span>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto z-10">
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#0A0A0F]/60 backdrop-blur-xl sticky top-0 z-30">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">{activeTab}</h1>
              <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full font-mono">{role}</span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">GigSpace Studio Command & Cloud Sync</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={refreshAllData}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium text-gray-300 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF5E00]" /> Sync Database
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5E00] to-[#219EBC] p-[2px]">
                <div className="w-full h-full bg-[#121218] rounded-full overflow-hidden flex items-center justify-center text-xs font-bold">
                  {role[0]}
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold">{role}</p>
                <p className="text-[10px] text-gray-500 font-mono">Authenticated Session</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="p-8 flex-1 max-w-7xl">
          <AnimatePresence mode="wait">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Top Metrics Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <span>Total Portfolio Assets</span>
                      <ImageIcon className="w-4 h-4 text-[#FF5E00]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{assets.length}</span>
                      <span className="text-xs text-green-400 font-medium">+Images & 4K Reels</span>
                    </div>
                  </div>

                  <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <span>Active Kanban Tasks</span>
                      <Layers className="w-4 h-4 text-[#219EBC]" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{tasks.length}</span>
                      <span className="text-xs text-blue-400 font-medium">Pipeline synced</span>
                    </div>
                  </div>

                  <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <span>Client Inquiries</span>
                      <Inbox className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{leads.length}</span>
                      <span className="text-xs text-purple-400 font-medium">Leads Captured</span>
                    </div>
                  </div>

                  <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                    <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                      <span>Net Balance (UGX)</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {(netBalanceUGX / 1000000).toFixed(1)}M
                      </span>
                      <span className="text-xs text-gray-400">UGX Total</span>
                    </div>
                  </div>
                </div>

                {/* Quick Upload & Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-bold text-white">Live Landing Hero Preview</h3>
                          <p className="text-xs text-gray-400">Changes in the CMS tab sync directly here.</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('Live CMS')}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10"
                        >
                          Edit Headline
                        </button>
                      </div>

                      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#161622] to-[#0D0D14] border border-white/10 relative overflow-hidden">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#FF5E00]/20 text-[#FF5E00] text-xs font-bold uppercase tracking-wider mb-3 border border-[#FF5E00]/30">
                          {settings.heroBadge || 'Design Studio'}
                        </span>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                          {settings.heroTitle || 'Ideas that look alive.'}
                        </h2>
                        <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
                          {settings.heroSubtitle}
                        </p>
                      </div>
                    </div>

                    {/* Quick Media Upload Zone */}
                    <MediaUploadZone 
                      role={role} 
                      onUploadComplete={(asset) => setAssets(prev => [asset, ...prev])} 
                    />
                  </div>

                  {/* Right Column: Inquiries & Team */}
                  <div className="space-y-6">
                    <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Inquiries</h3>
                        <span className="text-xs text-[#FF5E00] font-mono">{leads.length} total</span>
                      </div>
                      
                      <div className="space-y-3 max-h-[280px] overflow-y-auto">
                        {leads.length > 0 ? leads.slice(0, 4).map((l, i) => (
                          <div key={l.id || i} className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white">{l.name}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{new Date(l.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">{l.email}</p>
                            {l.asset_title && (
                              <p className="text-[10px] text-[#219EBC] mt-1 font-mono">Item: {l.asset_title}</p>
                            )}
                          </div>
                        )) : (
                          <p className="text-xs text-gray-500 text-center py-6">No recent leads yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sponsors & Partners</h3>
                        <span className="text-[10px] text-gray-500 font-mono">{settings.sponsors?.length || 0} active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {settings.sponsors?.map(s => (
                          <div key={s.id} className="p-2.5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-2.5">
                            <div className="w-8 h-8 aspect-square rounded-xl bg-[#1A1A24] border border-white/10 flex items-center justify-center p-1 flex-shrink-0 overflow-hidden">
                              {s.logoUrl ? (
                                <img src={s.logoUrl} alt={s.name} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: s.color }}>
                                  {s.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{s.name}</p>
                              <span className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                Active
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* LIVE CMS TAB */}
            {activeTab === 'Live CMS' && (
              <motion.div 
                key="cms"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 max-w-5xl"
              >
                <SectionCmsEditor 
                  settings={settings} 
                  onSettingsChange={(newSettings) => setSettings(newSettings)} 
                />
              </motion.div>
            )}

            {/* FINANCE LEDGER TAB */}
            {activeTab === 'Finance Ledger' && (
              <motion.div 
                key="finance"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Financial Summary Bento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Total Gross Revenue</p>
                    <p className="text-3xl font-black text-emerald-400 font-mono">
                      {totalRevenueUGX.toLocaleString()} <span className="text-xs text-gray-400">UGX</span>
                    </p>
                    <p className="text-xs text-green-400/80 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Direct Mobile Money & Cards
                    </p>
                  </div>

                  <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Operational Expenses</p>
                    <p className="text-3xl font-black text-rose-400 font-mono">
                      {totalExpensesUGX.toLocaleString()} <span className="text-xs text-gray-400">UGX</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Cloud GPUs, Render Farms & Software</p>
                  </div>

                  <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Net Cash Balance</p>
                    <p className="text-3xl font-black text-white font-mono">
                      {netBalanceUGX.toLocaleString()} <span className="text-xs text-gray-400">UGX</span>
                    </p>
                    <p className="text-xs text-emerald-400 mt-2 font-semibold">Positive Runway</p>
                  </div>
                </div>

                {/* Transactions Table & Add Button */}
                <div className="bg-[#12121A] rounded-3xl p-8 border border-white/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">CEO Financial Transaction Ledger</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Synced with Supabase database `transactions` table.</p>
                    </div>
                    <button 
                      onClick={() => setShowNewTxModal(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer self-start"
                    >
                      <Plus className="w-4 h-4" /> Add Transaction
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          <th className="pb-3 px-3">Ref ID</th>
                          <th className="pb-3 px-3">Client / Vendor</th>
                          <th className="pb-3 px-3">Description</th>
                          <th className="pb-3 px-3">Type</th>
                          <th className="pb-3 px-3">Amount</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs font-medium">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-3 font-mono text-gray-400">{tx.tx_ref}</td>
                            <td className="py-3.5 px-3 font-bold text-white">{tx.client}</td>
                            <td className="py-3.5 px-3 text-gray-300 max-w-[200px] truncate">{tx.description || 'Creative Design Package'}</td>
                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-white">
                              {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.currency}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                                <CheckCircle2 className="w-3 h-3" /> {tx.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-gray-500 text-[11px]">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KANBAN QUEUE TAB */}
            {activeTab === 'Kanban Queue' && (
              <motion.div 
                key="kanban"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white">Design & Motion Pipeline</h3>
                    <p className="text-xs text-gray-400">Drag or move tasks to synchronize statuses in the Supabase database.</p>
                  </div>
                  <button 
                    onClick={() => setShowNewTaskModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> New Task
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 overflow-x-auto pb-4">
                  {(['Backlog', 'In Progress', 'Review', 'Completed'] as KanbanTask['stage'][]).map((stage) => {
                    const stageTasks = tasks.filter(t => t.stage === stage);
                    return (
                      <div 
                        key={stage} 
                        className="bg-[#12121A] rounded-3xl p-5 border border-white/5 flex flex-col min-w-[270px]"
                      >
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                          <h4 className="font-bold text-xs text-gray-300 uppercase tracking-widest">{stage}</h4>
                          <span className="bg-white/10 text-xs font-mono px-2 py-0.5 rounded-full text-white font-bold">
                            {stageTasks.length}
                          </span>
                        </div>

                        <div className="space-y-3 flex-1 min-h-[300px]">
                          {stageTasks.map((task) => (
                            <div 
                              key={task.id}
                              className="bg-[#181824] p-4 rounded-2xl border border-white/5 hover:border-[#FF5E00]/40 transition-all space-y-2 group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF5E00] bg-[#FF5E00]/10 px-2 py-0.5 rounded">
                                  {task.category || 'Creative'}
                                </span>
                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                  task.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>

                              <h5 className="font-bold text-xs text-white leading-snug">{task.title}</h5>
                              {task.description && (
                                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{task.description}</p>
                              )}

                              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                <select 
                                  value={task.stage} 
                                  onChange={(e) => handleTaskStageChange(task.id, e.target.value as KanbanTask['stage'])}
                                  className="bg-[#101017] text-[10px] text-gray-300 border border-white/10 rounded-lg px-2 py-1 outline-none"
                                >
                                  <option value="Backlog">Backlog</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Review">Review</option>
                                  <option value="Completed">Completed</option>
                                </select>

                                <button 
                                  onClick={() => TasksService.delete(task.id).then(() => setTasks(prev => prev.filter(t => t.id !== task.id)))}
                                  className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}

                          {stageTasks.length === 0 && (
                            <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-xs text-gray-600">
                              No tasks in {stage}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* MEDIA LIBRARY TAB (Images and Video Reels) */}
            {activeTab === 'Media Library' && (
              <motion.div 
                key="media"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <MediaUploadZone 
                      role={role} 
                      onUploadComplete={(asset) => setAssets(prev => [asset, ...prev])} 
                    />
                  </div>

                  <div className="lg:col-span-2 bg-[#12121A] rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-base font-bold text-white">Live Portfolio Asset Gallery</h3>
                        <p className="text-xs text-gray-400">All uploaded images and video reels stored in Supabase.</p>
                      </div>
                      <span className="text-xs font-mono text-gray-400 bg-white/5 px-3 py-1 rounded-full">
                        {assets.length} items
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {assets.map((asset) => (
                        <div 
                          key={asset.id} 
                          className="relative aspect-square rounded-2xl overflow-hidden group bg-[#181824] border border-white/5"
                        >
                          {asset.type === 'video' ? (
                            <video 
                              src={asset.url} 
                              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" 
                              muted 
                              loop 
                              playsInline 
                              autoPlay 
                            />
                          ) : (
                            <img 
                              src={asset.url} 
                              alt={asset.title} 
                              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" 
                            />
                          )}

                          <div className="absolute top-2 left-2 z-10">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              asset.type === 'video' ? 'bg-[#FF5E00] text-white' : 'bg-black/60 text-white backdrop-blur-md'
                            }`}>
                              {asset.type === 'video' ? '4K Video' : 'Image'}
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 z-20">
                            <p className="text-xs font-bold text-white truncate mb-1">{asset.title}</p>
                            <p className="text-[10px] text-gray-400 font-mono mb-2">{asset.category}</p>
                            <button 
                              onClick={() => handleDeleteAsset(asset.id)} 
                              className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors self-end"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {assets.length === 0 && (
                        <div className="col-span-full py-16 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                          No media assets found. Use the uploader on the left to add images or videos.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* HERO VIDEO REEL TAB */}
            {activeTab === 'Hero Video Reel' && (
              <motion.div 
                key="hero-video"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8 max-w-4xl"
              >
                <div className="bg-[#12121A] rounded-3xl p-8 border border-white/5">
                  <h3 className="text-xl font-black text-white mb-2">Main Landing Hero Video Reel</h3>
                  <p className="text-xs text-gray-400 mb-6">Upload a 4K motion loop or video reel that displays automatically on the landing hero.</p>

                  <form onSubmit={handleUploadHeroVideo} className="space-y-6">
                    <label className="relative group w-full cursor-pointer h-40 bg-white/[0.02] rounded-3xl border-2 border-dashed border-white/10 hover:border-[#FF5E00]/50 transition-colors flex flex-col items-center justify-center p-6 text-center">
                      <input 
                        type="file" 
                        accept="video/*,.mp4,.mov,.webm" 
                        onChange={e => setHeroVideoFile(e.target.files?.[0] || null)} 
                        className="hidden" 
                      />
                      <Film className={`w-8 h-8 mb-2 ${heroVideoFile ? 'text-[#FF5E00]' : 'text-gray-500'}`} />
                      <span className="text-sm font-bold text-white">
                        {heroVideoFile ? heroVideoFile.name : 'Select or drop a new video reel'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">Supports MP4, MOV, WebM</span>
                    </label>

                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        disabled={!heroVideoFile || isUploadingHeroVideo}
                        className="px-8 py-3.5 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-[#FF5E00]/20 cursor-pointer"
                      >
                        {isUploadingHeroVideo ? 'Uploading to Supabase Storage...' : 'Set Active Hero Video'}
                      </button>
                    </div>
                  </form>

                  {settings.heroVideoUrl && (
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Current Active Hero Reel</h4>
                      <div className="w-full aspect-video max-w-xl rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
                        <video 
                          src={settings.heroVideoUrl} 
                          className="w-full h-full object-cover" 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CLIENT INQUIRIES TAB */}
            {activeTab === 'Client Inquiries' && (
              <motion.div 
                key="inquiries"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-[#12121A] rounded-3xl p-8 border border-white/5">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black text-white">Client Inquiries & Project Leads</h3>
                      <p className="text-xs text-gray-400 mt-1">Direct inquiries submitted via the public gallery modal and contact forms.</p>
                    </div>
                    <span className="text-xs text-[#FF5E00] font-mono font-bold bg-[#FF5E00]/10 px-3 py-1 rounded-full">
                      {leads.length} Leads Total
                    </span>
                  </div>

                  <div className="space-y-4">
                    {leads.map((lead) => (
                      <div key={lead.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{lead.name}</span>
                            <span className="text-xs text-gray-400 font-mono">({lead.email})</span>
                          </div>
                          {lead.message && (
                            <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">{lead.message}</p>
                          )}
                          {lead.asset_title && (
                            <span className="inline-block text-[11px] text-[#219EBC] font-mono bg-[#219EBC]/10 px-2 py-0.5 rounded">
                              Inquired Item: {lead.asset_title}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] text-gray-500 font-mono">{new Date(lead.created_at).toLocaleDateString()}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            lead.status === 'contacted' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                      </div>
                    ))}

                    {leads.length === 0 && (
                      <div className="py-16 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                        No client inquiries submitted yet.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* NEW TASK MODAL */}
      <AnimatePresence>
        {showNewTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#14151B] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-base font-bold text-white">Create Kanban Task</h3>
                <button onClick={() => setShowNewTaskModal(false)} className="text-gray-400 hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-[11px] text-gray-400 uppercase font-bold">Task Title</label>
                  <input 
                    type="text" 
                    required 
                    value={newTask.title} 
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })} 
                    className="w-full bg-[#101017] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1" 
                    placeholder="e.g. Master DaVinci Video Reel"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 uppercase font-bold">Description</label>
                  <textarea 
                    value={newTask.description} 
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })} 
                    className="w-full bg-[#101017] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 h-20 resize-none" 
                    placeholder="Details for the creative sprint..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 uppercase font-bold">Initial Stage</label>
                    <select 
                      value={newTask.stage} 
                      onChange={e => setNewTask({ ...newTask, stage: e.target.value as KanbanTask['stage'] })}
                      className="w-full bg-[#101017] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1"
                    >
                      <option value="Backlog">Backlog</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 uppercase font-bold">Priority</label>
                    <select 
                      value={newTask.priority} 
                      onChange={e => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full bg-[#101017] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowNewTaskModal(false)} className="px-4 py-2 bg-white/5 rounded-xl text-xs text-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#FF5E00] text-white rounded-xl text-xs font-bold">
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW TRANSACTION MODAL */}
      <AnimatePresence>
        {showNewTxModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#14151B] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-base font-bold text-white">Record Transaction</h3>
                <button onClick={() => setShowNewTxModal(false)} className="text-gray-400 hover:text-white">&times;</button>
              </div>

              <form onSubmit={handleCreateTx} className="space-y-4">
                <div>
                  <label className="text-[11px] text-gray-400 uppercase font-bold">Client / Entity</label>
                  <input 
                    type="text" 
                    required 
                    value={newTx.client} 
                    onChange={e => setNewTx({ ...newTx, client: e.target.value })} 
                    className="w-full bg-[#101017] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1" 
                    placeholder="e.g. Fintech Safari Kampala"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-gray-400 uppercase font-bold">Amount (UGX)</label>
                    <input 
                      type="number" 
                      required 
                      value={newTx.amount} 
                      onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })} 
                      className="w-full bg-[#101017] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1" 
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 uppercase font-bold">Transaction Type</label>
                    <select 
                      value={newTx.type} 
                      onChange={e => setNewTx({ ...newTx, type: e.target.value as 'income' | 'expense' })}
                      className="w-full bg-[#101017] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1"
                    >
                      <option value="income">Income (+)</option>
                      <option value="expense">Expense (-)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 uppercase font-bold">Description</label>
                  <input 
                    type="text" 
                    value={newTx.description} 
                    onChange={e => setNewTx({ ...newTx, description: e.target.value })} 
                    className="w-full bg-[#101017] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1" 
                    placeholder="e.g. 4K Commercial Reel Retainer"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowNewTxModal(false)} className="px-4 py-2 bg-white/5 rounded-xl text-xs text-gray-300">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#219EBC] text-white rounded-xl text-xs font-bold">
                    Save to Ledger
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
