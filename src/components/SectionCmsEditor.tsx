import { useState, type FormEvent } from 'react';
import { 
  Sparkles, 
  Layers, 
  Briefcase, 
  Phone, 
  Users, 
  HelpCircle, 
  Check, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw,
  Image as ImageIcon,
  CheckCircle,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CmsSettingsService, SiteSettings } from '../lib/supabase';
import { PartnerManager } from './PartnerManager';

interface SectionCmsEditorProps {
  settings: SiteSettings;
  onSettingsChange: (newSettings: SiteSettings) => void;
}

export function SectionCmsEditor({ settings, onSettingsChange }: SectionCmsEditorProps) {
  const [activeSectionTab, setActiveSectionTab] = useState<
    'hero' | 'services' | 'careers' | 'contact' | 'about' | 'process' | 'socials' | 'partners'
  >('hero');

  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state if parent changes
  const handleFieldChange = (key: keyof SiteSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveAll = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');
    try {
      const updated = await CmsSettingsService.updateSettings(formData);
      onSettingsChange(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save CMS sections:', err);
      setErrorMsg(err.message || 'Failed to save section changes to Supabase');
    } finally {
      setIsSaving(false);
    }
  };

  // --- SUB-ITEM EDITORS ---

  // Services Editor
  const handleServiceChange = (index: number, field: string, val: any) => {
    const updated = [...(formData.servicesList || [])];
    updated[index] = { ...updated[index], [field]: val };
    handleFieldChange('servicesList', updated);
  };

  const handleAddService = () => {
    const newSvc = {
      id: `svc-${Date.now()}`,
      title: 'New Creative Service',
      text: 'Describe the deliverables, timeline, and value created for your clients.',
      color: 'from-[#FF5E00] to-[#219EBC]',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    };
    handleFieldChange('servicesList', [...(formData.servicesList || []), newSvc]);
  };

  const handleDeleteService = (index: number) => {
    const updated = (formData.servicesList || []).filter((_, i) => i !== index);
    handleFieldChange('servicesList', updated);
  };

  // Careers Editor
  const handleCareerChange = (index: number, field: string, val: any) => {
    const updated = [...(formData.careersList || [])];
    if (field === 'skills') {
      updated[index] = { 
        ...updated[index], 
        skills: typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val 
      };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    handleFieldChange('careersList', updated);
  };

  const handleAddCareer = () => {
    const newJob = {
      id: `job-${Date.now()}`,
      roleTitle: 'Motion & Visual Designer',
      department: 'Creative Studio',
      type: 'Full-time / Remote',
      location: 'Remote',
      summary: 'Design high-fidelity 3D assets, kinetic title sequences, and brand systems.',
      skills: ['c4d', 'after effects', 'figma'],
      accentColor: '#FF5E00'
    };
    handleFieldChange('careersList', [...(formData.careersList || []), newJob]);
  };

  const handleDeleteCareer = (index: number) => {
    const updated = (formData.careersList || []).filter((_, i) => i !== index);
    handleFieldChange('careersList', updated);
  };

  // Team Editor
  const handleTeamMemberChange = (index: number, field: string, val: any) => {
    const updated = [...(formData.teamMembers || [])];
    updated[index] = { ...updated[index], [field]: val };
    handleFieldChange('teamMembers', updated);
  };

  const handleAddTeamMember = () => {
    const newMember = {
      id: `member-${Date.now()}`,
      name: 'Creative Partner',
      role: 'Art Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      cartoon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=partner&backgroundColor=ffdfbf',
      neon: 'from-[#FF5E00] to-[#219EBC]'
    };
    handleFieldChange('teamMembers', [...(formData.teamMembers || []), newMember]);
  };

  const handleDeleteTeamMember = (index: number) => {
    const updated = (formData.teamMembers || []).filter((_, i) => i !== index);
    handleFieldChange('teamMembers', updated);
  };

  // Process Steps Editor
  const handleStepChange = (index: number, field: string, val: any) => {
    const updated = [...(formData.processSteps || [])];
    updated[index] = { ...updated[index], [field]: val };
    handleFieldChange('processSteps', updated);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Toast */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-400 text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>All section modifications saved & live on Supabase!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Section Switcher Pills */}
      <div className="bg-[#12121A] rounded-3xl p-6 border border-white/5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF5E00]" />
              Master Website Sections CMS
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Modify text, headlines, media, pricing, team, and contact info across all pages and sections.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#FF5E00]/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Syncing...' : 'Save All Changes'}
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          {[
            { id: 'hero', label: 'Hero & Statement', icon: Sparkles },
            { id: 'services', label: 'Services Page/Cards', icon: Layers },
            { id: 'careers', label: 'Careers & Join Us', icon: Briefcase },
            { id: 'contact', label: 'Contact & Location', icon: Phone },
            { id: 'about', label: 'About & Team', icon: Users },
            { id: 'process', label: 'How It Works (Steps)', icon: HelpCircle },
            { id: 'socials', label: 'Social Presence', icon: Share2 },
            { id: 'partners', label: 'Square Partners', icon: ImageIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSectionTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSectionTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white shadow-md' 
                    : 'bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION CONTENT EDITORS */}

      {/* 1. HERO & STATEMENT */}
      {activeSectionTab === 'hero' && (
        <div className="bg-[#12121A] rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
          <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF5E00]" />
            Hero Section & Brand Statement
          </h4>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Top Badge Tagline
              </label>
              <input
                type="text"
                value={formData.heroBadge}
                onChange={e => handleFieldChange('heroBadge', e.target.value)}
                placeholder="e.g. Design Studio"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Hero Headline (H1)
              </label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={e => handleFieldChange('heroTitle', e.target.value)}
                placeholder="Ideas that look alive."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Hero Subtitle / Description
              </label>
              <textarea
                rows={3}
                value={formData.heroSubtitle}
                onChange={e => handleFieldChange('heroSubtitle', e.target.value)}
                placeholder="Describe your studio value proposition..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00] resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Brand Statement Banner (Under Logo Marquee)
              </label>
              <input
                type="text"
                value={formData.brandStatement || 'A creative space for design, video and visual ideas.'}
                onChange={e => handleFieldChange('brandStatement', e.target.value)}
                placeholder="A creative space for design, video and visual ideas."
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. SERVICES SECTION */}
      {activeSectionTab === 'services' && (
        <div className="bg-[#12121A] rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#219EBC]" />
                Services Page & Section Content ({formData.servicesList?.length || 0})
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Customize titles, descriptions, and cover imagery for each service card.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddService}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>

          <div className="space-y-4">
            {formData.servicesList?.map((svc, i) => (
              <div key={svc.id || i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 relative group">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-mono text-[#FF5E00] font-bold">Service #{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(i)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-gray-400 font-bold uppercase block mb-1">Service Title</label>
                    <input
                      type="text"
                      value={svc.title}
                      onChange={e => handleServiceChange(i, 'title', e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 font-bold uppercase block mb-1">Card Image / Banner URL</label>
                    <input
                      type="url"
                      value={svc.imageUrl || ''}
                      onChange={e => handleServiceChange(i, 'imageUrl', e.target.value)}
                      placeholder="https://.../cover.jpg"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] text-gray-400 font-bold uppercase block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={svc.text}
                      onChange={e => handleServiceChange(i, 'text', e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00] resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CAREERS & JOIN US */}
      {activeSectionTab === 'careers' && (
        <div className="bg-[#12121A] rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#FFB703]" />
                Careers & Talent Positions ({formData.careersList?.length || 0})
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Manage open creative roles, freelance contracts, and skills requirements.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCareer}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Role
            </button>
          </div>

          <div className="space-y-4">
            {formData.careersList?.map((job, i) => (
              <div key={job.id || i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 relative">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-mono text-[#FFB703] font-bold">Position #{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCareer(i)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] text-gray-400 font-bold uppercase block mb-1">Role Title</label>
                    <input
                      type="text"
                      value={job.roleTitle}
                      onChange={e => handleCareerChange(i, 'roleTitle', e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 font-bold uppercase block mb-1">Department</label>
                    <input
                      type="text"
                      value={job.department}
                      onChange={e => handleCareerChange(i, 'department', e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 font-bold uppercase block mb-1">Type & Location</label>
                    <input
                      type="text"
                      value={job.type}
                      onChange={e => handleCareerChange(i, 'type', e.target.value)}
                      placeholder="Full-time / Remote"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-[11px] text-gray-400 font-bold uppercase block mb-1">Role Summary</label>
                    <textarea
                      rows={2}
                      value={job.summary}
                      onChange={e => handleCareerChange(i, 'summary', e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 font-bold uppercase block mb-1">Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(job.skills) ? job.skills.join(', ') : job.skills}
                      onChange={e => handleCareerChange(i, 'skills', e.target.value)}
                      placeholder="3d, motion, octane"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CONTACT & LOCATION */}
      {activeSectionTab === 'contact' && (
        <div className="bg-[#12121A] rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
          <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#00F5D4]" />
            Studio Contact Information & Channels
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Primary Studio Email
              </label>
              <input
                type="email"
                value={formData.contactEmail || 'colline@gigspace.agency'}
                onChange={e => handleFieldChange('contactEmail', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Studio Phone / WhatsApp Hotline
              </label>
              <input
                type="text"
                value={formData.contactPhone || '+256 700 000 000'}
                onChange={e => handleFieldChange('contactPhone', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Studio Physical Location / City
              </label>
              <input
                type="text"
                value={formData.contactLocation || 'Kampala, Uganda & Worldwide Remote'}
                onChange={e => handleFieldChange('contactLocation', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Office Hours
              </label>
              <input
                type="text"
                value={formData.officeHours || 'Monday - Saturday: 8:00 AM - 8:00 PM EAT'}
                onChange={e => handleFieldChange('officeHours', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. ABOUT & TEAM */}
      {activeSectionTab === 'about' && (
        <div className="bg-[#12121A] rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F72585]" />
                About Us & Studio Team ({formData.teamMembers?.length || 0})
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Edit member names, avatars, cartoon fallbacks, and roles.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddTeamMember}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.teamMembers?.map((m, i) => (
              <div key={m.id || i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 relative">
                <button
                  type="button"
                  onClick={() => handleDeleteTeamMember(i)}
                  className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-3">
                  <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={m.name}
                      onChange={e => handleTeamMemberChange(i, 'name', e.target.value)}
                      placeholder="Name"
                      className="w-full bg-transparent font-bold text-white text-xs border-b border-white/10 pb-1 mb-1 focus:outline-none focus:border-[#FF5E00]"
                    />
                    <input
                      type="text"
                      value={m.role}
                      onChange={e => handleTeamMemberChange(i, 'role', e.target.value)}
                      placeholder="Role (e.g. Lead Designer)"
                      className="w-full bg-transparent text-[11px] text-gray-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-500 font-mono block mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={m.avatar}
                    onChange={e => handleTeamMemberChange(i, 'avatar', e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PROCESS STEPS */}
      {activeSectionTab === 'process' && (
        <div className="bg-[#12121A] rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
          <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#FF5E00]" />
            Execution Pipeline (How It Works Steps)
          </h4>

          <div className="space-y-4">
            {formData.processSteps?.map((step, i) => (
              <div key={step.num || i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-mono text-[#FF5E00]">Step {step.num}</span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={e => handleStepChange(i, 'title', e.target.value)}
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#FF5E00]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[10px] text-gray-500 font-mono block mb-1">Step Description</label>
                    <textarea
                      rows={2}
                      value={step.desc}
                      onChange={e => handleStepChange(i, 'desc', e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF5E00] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-mono block mb-1">Step Illustration URL</label>
                    <input
                      type="url"
                      value={step.image}
                      onChange={e => handleStepChange(i, 'image', e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FF5E00]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. SOCIAL PRESENCE */}
      {activeSectionTab === 'socials' && (
        <div className="bg-[#12121A] rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
          <h4 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#38BDF8]" />
            Social & Creative Channels
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-1.5">Instagram Handle / URL</label>
              <input
                type="text"
                value={formData.socialInstagram || '@gigspace.studio'}
                onChange={e => handleFieldChange('socialInstagram', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-1.5">X (Twitter) Handle / URL</label>
              <input
                type="text"
                value={formData.socialTwitter || '@gigspace_live'}
                onChange={e => handleFieldChange('socialTwitter', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-1.5">Behance Profile</label>
              <input
                type="text"
                value={formData.socialBehance || 'gigspace-design'}
                onChange={e => handleFieldChange('socialBehance', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-bold uppercase block mb-1.5">TikTok Channel</label>
              <input
                type="text"
                value={formData.socialTiktok || '@gigspace_motion'}
                onChange={e => handleFieldChange('socialTiktok', e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. SQUARE PARTNERS */}
      {activeSectionTab === 'partners' && (
        <PartnerManager 
          settings={formData} 
          onSettingsChange={(newSettings) => {
            setFormData(newSettings);
            onSettingsChange(newSettings);
          }} 
        />
      )}

      {/* Bottom Master Save Bar */}
      <div className="p-4 bg-[#12121A] rounded-2xl border border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">
          All modifications synchronize across all views and Supabase storage tables.
        </span>
        <button
          type="button"
          onClick={() => handleSaveAll()}
          disabled={isSaving}
          className="px-6 py-2.5 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#FF5E00]/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save & Publish Live'}
        </button>
      </div>
    </div>
  );
}
