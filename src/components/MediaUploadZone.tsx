import React, { useState, useRef } from 'react';
import { UploadCloud, X, File as FileIcon, Image as ImageIcon, Video, CheckCircle, Loader2, Sparkles, Film } from 'lucide-react';
import { motion } from 'motion/react';
import { uploadMediaToSupabase, PortfolioService, PortfolioAsset } from '../lib/supabase';

interface MediaUploadZoneProps {
  onUploadComplete: (asset: PortfolioAsset) => void;
  role: string;
}

export function MediaUploadZone({ onUploadComplete, role }: MediaUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Graphic Design');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Graphic Design',
    'Video & Editing',
    'Artwork Design',
    'Web Assets',
    'Motion Graphics',
    '3D Spatial'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    const isImage = selectedFile.type.startsWith('image/');
    const isVideo = selectedFile.type.startsWith('video/') || selectedFile.name.match(/\.(mp4|mov|webm|ogg)$/i);

    if (isImage || isVideo) {
      setFile(selectedFile);
      setTitle(selectedFile.name.split('.')[0].replace(/[-_]/g, ' '));
      if (isVideo) {
        setCategory('Video & Editing');
      }
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setSuccess(false);
    } else {
      alert("Invalid file format. Please upload images (PNG, JPG, WEBP) or videos (MP4, MOV, WEBM).");
    }
  };

  const onUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(15);
    
    const isVideo = file.type.startsWith('video/') || Boolean(file.name.match(/\.(mp4|mov|webm|ogg)$/i));

    try {
      const progressTimer = setInterval(() => {
        setProgress(p => (p < 85 ? p + 15 : p));
      }, 150);

      // 1. Upload file to Supabase Storage bucket (or local fallback)
      const { url: mediaUrl } = await uploadMediaToSupabase(file, 'portfolio');

      clearInterval(progressTimer);
      setProgress(95);

      // 2. Insert record into Supabase Database `portfolio` table
      const createdAsset = await PortfolioService.create({
        title: title.trim() || file.name.split('.')[0],
        url: mediaUrl,
        type: isVideo ? 'video' : 'image',
        category: category || (isVideo ? 'Video & Editing' : 'Graphic Design'),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        uploaded_by: role
      });

      setProgress(100);
      setSuccess(true);
      onUploadComplete(createdAsset);

      setTimeout(() => {
        setFile(null);
        setTitle('');
        setTags('');
        setPreviewUrl('');
        setSuccess(false);
        setProgress(0);
      }, 2000);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl shadow-black/40 relative overflow-hidden flex flex-col gap-6">
      <div className="flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF5E00]" />
          <h3 className="text-white/80 text-[13px] font-bold tracking-wide uppercase">Media Upload (Images & 4K Videos)</h3>
        </div>
        <span className="text-[10px] text-gray-400 font-mono bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
          Supabase Storage CDN
        </span>
      </div>
      
      {!file ? (
        <div 
          className={`flex-1 min-h-[220px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer ${
            dragActive 
              ? 'border-[#FF5E00] bg-[#FF5E00]/10 scale-[0.99]' 
              : 'border-white/20 hover:border-white/40 bg-white/[0.02]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input 
            ref={inputRef} 
            type="file" 
            className="hidden" 
            accept="image/*,video/*,.mp4,.mov,.webm,.webp,.jpg,.png" 
            onChange={handleChange} 
          />
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3 text-[#FF5E00]">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="text-white font-bold text-base mb-1">Drag & drop high-res image or video reel</p>
          <p className="text-xs text-white/50 mb-4">Supports 4K MP4, MOV, WEBM, PNG, JPG, WEBP</p>
          <div className="flex items-center gap-2">
            <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-colors flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-[#219EBC]" /> Browse Media
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 relative z-10">
          <div className="flex items-start justify-between p-4 bg-white/[0.05] border border-white/10 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                {file.type.startsWith('video') || file.name.match(/\.(mp4|mov|webm)$/i) ? (
                  <video src={previewUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    file.type.startsWith('video') ? 'bg-[#FF5E00]/20 text-[#FF5E00]' : 'bg-[#219EBC]/20 text-[#219EBC]'
                  }`}>
                    {file.type.startsWith('video') ? 'Video Reel' : 'Still Art'}
                  </span>
                  <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                </div>
                <p className="text-xs text-white/50 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            {!uploading && !success && (
              <button onClick={() => setFile(null)} className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Asset Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                disabled={uploading || success} 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00] transition-colors" 
                placeholder="e.g. Urban Flow 4K Motion" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                disabled={uploading || success} 
                className="w-full bg-[#121218] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00] transition-colors"
              >
                {categories.map(c => <option key={c} value={c} className="bg-[#121215]">{c}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Tags (comma separated)</label>
              <input 
                type="text" 
                value={tags} 
                onChange={e => setTags(e.target.value)} 
                disabled={uploading || success} 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00] transition-colors" 
                placeholder="e.g. 4k, octane, reel, branding" 
              />
            </div>
          </div>
          
          <div className="mt-2 relative">
            {uploading ? (
              <div className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl overflow-hidden relative flex items-center justify-center">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FF5E00] to-[#219EBC] transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
                <span className="relative z-10 text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Supabase {progress}%
                </span>
              </div>
            ) : success ? (
              <div className="w-full h-12 bg-green-500/20 border border-green-500/40 rounded-xl flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Saved to Portfolio</span>
              </div>
            ) : (
              <button 
                onClick={onUpload} 
                className="w-full h-12 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#FF5E00]/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" /> Publish to Portfolio
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
