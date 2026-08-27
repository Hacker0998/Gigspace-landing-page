import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';

export function ServiceUploadZone({ onUploadComplete }: { onUploadComplete: (service: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
    } else {
      alert("Invalid file type. Please upload an image for the service.");
    }
  };

  const onUpload = async () => {
    if (!title || !text) {
      alert("Title and description are required");
      return;
    }
    setUploading(true);
    
    const formData = new FormData();
    if (file) formData.append('image', file);
    formData.append('title', title);
    formData.append('text', text);

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        onUploadComplete(data.service);
        setTimeout(() => {
          setFile(null);
          setTitle('');
          setText('');
          setSuccess(false);
        }, 2000);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      alert('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl shadow-black/40 relative overflow-hidden flex flex-col gap-6">
      <div className="flex justify-between items-center z-10 relative">
        <h3 className="text-white/60 text-[13px] font-semibold tracking-wide uppercase">Add New Service Card</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          className="min-h-[200px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center border-white/20 hover:border-white/40 bg-white/[0.02] cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { e.target.files && handleFile(e.target.files[0]) }} />
          {!file ? (
            <>
              <UploadCloud className="w-12 h-12 mb-4 text-white/40" />
              <p className="text-white font-bold mb-1">Service Cover Image</p>
              <p className="text-xs text-white/50">Auto-trims to fit the rectangular box</p>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-[#FF5E00]" />
              <div className="text-left">
                <p className="text-sm font-bold text-white truncate max-w-[150px]">{file.name}</p>
                <p className="text-xs text-white/50">Selected</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Service Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={uploading || success} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00] transition-colors" placeholder="e.g. 3D Animation" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/50">Description</label>
            <textarea value={text} onChange={e => setText(e.target.value)} disabled={uploading || success} className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF5E00] transition-colors resize-none h-24" placeholder="Brief description of this service..."></textarea>
          </div>
          
          <div className="mt-auto">
            {uploading ? (
              <div className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-center">
                <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Publishing...
                </span>
              </div>
            ) : success ? (
              <div className="w-full h-12 bg-green-500/20 border border-green-500/40 rounded-xl flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Added Successfully</span>
              </div>
            ) : (
              <button onClick={onUpload} className="w-full h-12 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <UploadCloud className="w-4 h-4" /> Add Service
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
