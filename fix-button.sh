#!/bin/bash
cat << 'INNER_EOF' > /tmp/fix-button.patch
            <div className="relative w-full mt-8">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full aspect-[4/5] rounded-[32px] overflow-hidden relative group">
                <MediaRenderer asset={displayAssets[3]} />
              </motion.div>
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className={`absolute -bottom-5 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-full font-medium text-sm flex items-center gap-2 whitespace-nowrap shadow-xl z-20 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
              >
                Explore Collections <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
INNER_EOF

awk '
BEGIN { in_target = 0; replaced = 0 }
/<motion\.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}/ {
  if (!replaced) {
    in_target = 1
    system("cat /tmp/fix-button.patch")
    replaced = 1
  } else {
    print
  }
  next
}
in_target {
  if (match($0, /Explore Collections/)) {
    in_target = 2
  }
  if (in_target == 2 && match($0, /<\/motion\.button>/)) {
    in_target = 0
  }
  next
}
{ print }
' src/components/GalleryView.tsx > src/components/GalleryView.tsx.tmp
mv src/components/GalleryView.tsx.tmp src/components/GalleryView.tsx
