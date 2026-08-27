import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Plus, Trash2, Check, Sparkles, RefreshCw, Palette, ExternalLink, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadMediaToSupabase, CmsSettingsService, Sponsor, SiteSettings } from '../lib/supabase';

interface PartnerManagerProps {
  settings: SiteSettings;
  onSettingsChange: (newSettings: SiteSettings) => void;
}

const PRESET_COLORS = [
  '#FF5E00', // Brand Orange
  '#219EBC', // Cyan Blue
  '#10A37F', // OpenAI Green
  '#635BFF', // Stripe Violet
  '#F24E1E', // Figma Coral
  '#00F5D4', // Neon Mint
  '#FFB703', // Yellow Amber
  '#F72585', // Electric Pink
  '#7209B7', // Deep Violet
  '#FFFFFF'  // Monochrome White
];

const POPULAR_PRESETS = [
  { name: 'OpenAI', color: '#10A37F', logoUrl: 'https://cdn.simpleicons.org/openai/ffffff' },
  { name: 'Figma', color: '#F24E1E', logoUrl: 'https://cdn.simpleicons.org/figma/ffffff' },
  { name: 'Stripe', color: '#635BFF', logoUrl: 'https://cdn.simpleicons.org/stripe/ffffff' },
  { name: 'Vercel', color: '#FFFFFF', logoUrl: 'https://cdn.simpleicons.org/vercel/ffffff' },
  { name: 'Supabase', color: '#3ECF8E', logoUrl: 'https://cdn.simpleicons.org/supabase/ffffff' },
  { name: 'Nike', color: '#FF5E00', logoUrl: 'https://cdn.simpleicons.org/nike/ffffff' },
  { name: 'Apple', color: '#FFFFFF', logoUrl: 'https://cdn.simpleicons.org/apple/ffffff' },
  { name: 'Airtel', color: '#E40000', logoUrl: 'https://cdn.simpleicons.org/airtel/ffffff' }
];

export function PartnerManager({ settings, onSettingsChange }: PartnerManagerProps) {
  const [partnerName, setPartnerName] = useState('');
  const [accentColor, setAccentColor] = useState('#FF5E00');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg('');
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, SVG, WEBP, or JPG).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 8MB limit.');
      return;
    }

    setSelectedFile(file);

    // If partner name is empty, suggest from filename
    if (!partnerName) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\blogo\b/gi, '')
        .trim();
      if (cleanName) {
        setPartnerName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }

    // Generate local preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearSelected = () => {
    setSelectedFile(null);
    setPreviewDataUrl('');
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setPartnerName(preset.name);
    setAccentColor(preset.color);
    setImageUrl(preset.logoUrl);
    setPreviewDataUrl(preset.logoUrl);
    setSelectedFile(null);
    setInputMode('url');
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      setErrorMsg('Please enter a partner brand name.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    setUploadProgress(20);

    try {
      let finalLogoUrl = '';

      if (selectedFile) {
        setUploadProgress(45);
        const uploadRes = await uploadMediaToSupabase(selectedFile, 'portfolio');
        setUploadProgress(85);
        finalLogoUrl = uploadRes.url;
      } else if (imageUrl.trim()) {
        finalLogoUrl = imageUrl.trim();
      }

      const newPartner: Sponsor = {
        id: `sponsor-${Date.now()}`,
        name: partnerName.trim(),
        color: accentColor,
        logoUrl: finalLogoUrl || undefined
      };

      const existingSponsors = settings.sponsors || [];
      const updatedSponsors = [...existingSponsors, newPartner];

      setUploadProgress(95);
      const updatedSettings = await CmsSettingsService.updateSettings({
        sponsors: updatedSponsors
      });

      onSettingsChange(updatedSettings);

      // Reset form
      setPartnerName('');
      setAccentColor('#FF5E00');
      setImageUrl('');
      setSelectedFile(null);
      setPreviewDataUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 3000);
    } catch (err: any) {
      console.error('Failed to add partner:', err);
      setErrorMsg(err.message || 'Failed to save partner. Please check your connection.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeletePartner = async (id: string) => {
    const updatedSponsors = (settings.sponsors || []).filter(s => s.id !== id);
    const updatedSettings = await CmsSettingsService.updateSettings({ sponsors: updatedSponsors });
    onSettingsChange(updatedSettings);
  };

  const handleMovePartner = async (index: number, direction: 'up' | 'down') => {
    const list = [...(settings.sponsors || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);

    const updatedSettings = await CmsSettingsService.updateSettings({ sponsors: list });
    onSettingsChange(updatedSettings);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-400 text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Partner logo published live to Supabase & Marquee!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Square Drop & Add Form Box */}
      <div className="bg-[#12121A] rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF5E00]" />
              Partner Sponsors & Logo Marquee
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Drop square logos (1:1 aspect ratio) for brand partners to appear in the live infinite marquee.
            </p>
          </div>

          {/* Quick Presets Dropdown */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-gray-500 font-medium mr-1">Quick Add:</span>
            {POPULAR_PRESETS.slice(0, 4).map(preset => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-gray-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: preset.color }} />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddPartner} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 1:1 SQUARE IMAGE DROPZONE */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#219EBC]" />
                1:1 Square Logo Dropzone
              </label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !previewDataUrl && fileInputRef.current?.click()}
                className={`w-full aspect-square max-w-[240px] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer ${
                  dragActive 
                    ? 'border-[#FF5E00] bg-[#FF5E00]/10 scale-[1.02] shadow-[0_0_25px_rgba(255,94,0,0.3)]' 
                    : previewDataUrl 
                    ? 'border-white/20 bg-black/60' 
                    : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewDataUrl ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                    {/* Dark/Grid checkerboard background to see white SVG logos */}
                    <div className="w-full h-full rounded-2xl bg-[#1A1A24] border border-white/10 flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
                      <div 
                        className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)]"
                        style={{ backgroundSize: '12px 12px' }}
                      />
                      <img
                        src={previewDataUrl}
                        alt="Square Partner Preview"
                        className="w-full h-full object-contain filter drop-shadow-md z-10"
                      />
                    </div>

                    {/* Remove Overlay Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSelected();
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-500/80 text-white rounded-full transition-all border border-white/20 z-20 cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-2 inset-x-2 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] text-gray-300 text-center font-mono font-semibold truncate px-2">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB • Ready` : 'Direct Logo Linked'}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-[#FF5E00]/50 transition-all duration-300">
                      <UploadCloud className="w-7 h-7 text-[#FF5E00] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#FF5E00] transition-colors">
                        Drop Square Logo Here
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        PNG, SVG, WEBP (Square 1:1)
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-white/10 group-hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-colors">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>

              {/* Toggle Input Mode */}
              <div className="flex items-center gap-2 mt-3 text-[11px]">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    inputMode === 'upload' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  File Upload
                </button>
                <span className="text-gray-600">|</span>
                <button
                  type="button"
                  onClick={() => setInputMode('url')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    inputMode === 'url' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Direct URL
                </button>
              </div>

              {inputMode === 'url' && (
                <div className="w-full mt-2">
                  <div className="relative">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setPreviewDataUrl(e.target.value);
                        setSelectedFile(null);
                      }}
                      placeholder="https://.../logo.png"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF5E00] pr-8"
                    />
                    <Link2 className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-2.5" />
                  </div>
                </div>
              )}
            </div>

            {/* PARTNER METADATA FORM */}
            <div className="lg:col-span-7 space-y-4">
              {/* Partner Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  Partner Brand Name *
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g. OpenAI, Nike, Figma, MTN Uganda"
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5E00] transition-colors"
                />
              </div>

              {/* Accent Color Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#FFB703]" />
                    Brand Accent Glow
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-400">{accentColor}</span>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-6 h-6 rounded-md cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>

                {/* Preset color chips */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccentColor(c)}
                      className={`w-7 h-7 rounded-xl border transition-all duration-200 cursor-pointer ${
                        accentColor.toLowerCase() === c.toLowerCase()
                          ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                          : 'border-white/10 hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold block mb-2">
                  Ticker Preview Appearance:
                </span>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 max-w-sm">
                  {previewDataUrl ? (
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 p-1 flex items-center justify-center flex-shrink-0">
                      <img src={previewDataUrl} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm flex-shrink-0"
                      style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}50` }}
                    >
                      {(partnerName || 'P').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black tracking-tight uppercase font-mono text-white truncate" style={{ color: accentColor }}>
                      {partnerName || 'Partner Brand'}
                    </p>
                    <p className="text-[10px] text-gray-400">Marquee Sponsor</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                    <span>Uploading square logo to Supabase...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF5E00] to-[#219EBC] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-[#FF5E00]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to Supabase...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Partner to Live Marquee
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* CURRENT PARTNERS SQUARE GRID */}
      <div className="bg-[#12121A] rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-base font-bold text-white uppercase tracking-wider">
              Active Partners ({settings.sponsors?.length || 0})
            </h4>
            <p className="text-xs text-gray-400">
              Live in rotation on the infinite marquee ticker.
            </p>
          </div>
        </div>

        {settings.sponsors && settings.sponsors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {settings.sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all group relative flex flex-col items-center text-center justify-between"
              >
                {/* Delete button */}
                <button
                  onClick={() => handleDeletePartner(sponsor.id)}
                  className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Remove Partner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Reorder arrows */}
                <div className="absolute top-2 left-2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      onClick={() => handleMovePartner(index, 'up')}
                      className="p-1 text-gray-500 hover:text-white rounded bg-black/40 hover:bg-white/10 text-[9px]"
                      title="Move Left"
                    >
                      ▲
                    </button>
                  )}
                  {index < (settings.sponsors?.length || 0) - 1 && (
                    <button
                      onClick={() => handleMovePartner(index, 'down')}
                      className="p-1 text-gray-500 hover:text-white rounded bg-black/40 hover:bg-white/10 text-[9px]"
                      title="Move Right"
                    >
                      ▼
                    </button>
                  )}
                </div>

                {/* Square 1:1 Logo Box */}
                <div className="w-16 h-16 aspect-square rounded-2xl bg-[#1A1A24] border border-white/10 flex items-center justify-center p-2.5 my-2 shadow-inner group-hover:border-white/20 transition-all overflow-hidden">
                  {sponsor.logoUrl ? (
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="w-full h-full object-contain filter drop-shadow-sm"
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm"
                      style={{ backgroundColor: sponsor.color, boxShadow: `0 0 10px ${sponsor.color}40` }}
                    >
                      {sponsor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Partner Name & Color dot */}
                <div className="w-full mt-1">
                  <p className="text-xs font-bold text-white truncate px-1" title={sponsor.name}>
                    {sponsor.name}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span
                      className="w-2 h-2 rounded-full shadow-sm"
                      style={{ backgroundColor: sponsor.color, boxShadow: `0 0 6px ${sponsor.color}` }}
                    />
                    <span className="text-[10px] font-mono text-gray-400">
                      {sponsor.logoUrl ? 'Square Logo' : 'Color Tag'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
            <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-400">No partner logos configured yet.</p>
            <p className="text-xs text-gray-500 mt-1">Drop a square logo above to display it on the live marquee.</p>
          </div>
        )}
      </div>
    </div>
  );
}
