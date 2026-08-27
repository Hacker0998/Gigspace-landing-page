#!/bin/bash
cat << 'INNER_EOF' > /tmp/dnd.patch
                       <label 
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if(e.dataTransfer.files && e.dataTransfer.files[0]) setUploadFile(e.dataTransfer.files[0]); }}
                          className={`flex-1 relative group w-full cursor-pointer h-12 rounded-xl border-2 border-dashed transition-colors flex items-center justify-center ${uploadFile ? 'bg-[#A259FF]/10 border-[#A259FF]/50' : 'bg-white/5 border-white/10 hover:border-[#A259FF]/50'}`}
                       >
                          <input type="file" accept="image/*,video/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="hidden" />
                          <span className="text-sm text-gray-300 flex items-center gap-2">
                             <Upload className="w-4 h-4" />
                             {uploadFile ? uploadFile.name : 'Drag & Drop or Click to Browse'}
                          </span>
                       </label>
INNER_EOF

awk '
BEGIN { in_label = 0; replaced = 0 }
/<label className="flex-1 relative group/ {
  if (!replaced) {
    in_label = 1
    system("cat /tmp/dnd.patch")
    replaced = 1
  } else {
    print
  }
  next
}
in_label {
  if (match($0, /<\/label>/)) {
    in_label = 0
  }
  next
}
{ print }
' src/components/AdminDashboard.tsx > src/components/AdminDashboard.tsx.tmp
mv src/components/AdminDashboard.tsx.tmp src/components/AdminDashboard.tsx
