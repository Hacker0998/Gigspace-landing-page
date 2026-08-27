#!/bin/bash
cat << 'INNER_EOF' > /tmp/gallery-logic.patch
  // Categories list
  const categories = useMemo(() => {
    return ['All', 'Images', 'Video'];
  }, []);

  // Filtered and Sorted Assets
  const filteredAssets = useMemo(() => {
    return allAvailableAssets.filter(asset => {
      const matchesCategory = activeCategory === 'All' 
        ? true 
        : activeCategory === 'Images' 
          ? asset.type === 'image'
          : activeCategory === 'Video'
            ? asset.type === 'video'
            : true;
INNER_EOF

awk '
BEGIN { in_cat = 0; replaced = 0 }
/^\s*\/\/ Categories list/ {
  if (!replaced) {
    in_cat = 1
    system("cat /tmp/gallery-logic.patch")
    replaced = 1
  } else {
    print
  }
  next
}
in_cat {
  if (match($0, /const matchesCategory = activeCategory === .All./)) {
    in_cat = 0
  }
  next
}
{ print }
' src/components/GalleryView.tsx > src/components/GalleryView.tsx.tmp
mv src/components/GalleryView.tsx.tmp src/components/GalleryView.tsx
