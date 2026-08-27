#!/bin/bash
cat << 'INNER_EOF' > /tmp/gallery-ui.patch
          {/* Category Filter Pills & Sort Bar */}
          <div className="flex items-center gap-4 pt-5 pb-6 overflow-x-auto scrollbar-none">
            <div className="inline-flex items-center gap-1 p-1.5 bg-[#1F1F24] rounded-[32px] shadow-2xl relative shadow-black/50 border border-white/5 shrink-0">
              {['All', 'Images', 'Video'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveCategory(filter);
                    playSpatialTone(440, 'sine', 0.1);
                  }}
                  className={`relative px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-colors z-10 ${
                    activeCategory === filter 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {activeCategory === filter && (
                    <motion.div
                      layoutId="gallery-view-filter"
                      className="absolute inset-0 bg-[#E60023] rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{ boxShadow: '0px 4px 10px rgba(230,0,35,0.4)' }}
                    />
                  )}
                  {filter}
                </button>
              ))}
            </div>
INNER_EOF

awk '
BEGIN { in_nav = 0; replaced = 0 }
/\s*\{\/\* Category Filter Pills & Sort Bar \*\/\}/ {
  if (!replaced) {
    in_nav = 1
    system("cat /tmp/gallery-ui.patch")
    replaced = 1
  } else {
    print
  }
  next
}
in_nav {
  if (match($0, /\{activeCategory !== .All. && \(/)) {
    in_nav = 2
  }
  if (in_nav == 2 && match($0, /<\/div>/)) {
    in_nav = 0
  }
  next
}
{ print }
' src/components/GalleryView.tsx > src/components/GalleryView.tsx.tmp
mv src/components/GalleryView.tsx.tmp src/components/GalleryView.tsx
