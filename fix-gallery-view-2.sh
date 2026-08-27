#!/bin/bash
awk '
BEGIN { in_curated = 0 }
/const CURATED_DEFAULT_ASSETS = \[/ { in_curated = 1; next }
in_curated {
  if (match($0, /^\];/)) {
    in_curated = 0
  }
  next
}
{ print }
' src/components/GalleryView.tsx > src/components/GalleryView.tsx.tmp
mv src/components/GalleryView.tsx.tmp src/components/GalleryView.tsx

