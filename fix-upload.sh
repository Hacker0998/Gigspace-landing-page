#!/bin/bash
cat << 'INNER_EOF' > /tmp/upload-patch
  app.post("/api/upload", upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    const newAsset = {
      id: Date.now().toString(),
      url: fileUrl,
      filename: req.file.originalname,
      size: (req.file.size / (1024 * 1024)).toFixed(1) + ' MB',
      mimetype: req.file.mimetype,
      type: req.file.mimetype.startsWith('image') ? 'image' : req.file.mimetype.startsWith('video') ? 'video' : 'archive',
      title: req.body.title || req.file.originalname,
      category: req.body.category || 'Uncategorized',
      tags: req.body.tags || '',
      uploadedBy: req.body.uploadedBy || 'Admin',
      timestamp: new Date().toISOString()
    };
    
    if (req.body.isSponsorLogo !== 'true') {
      const assets = getAssets();
      assets.unshift(newAsset);
      saveAssets(assets);
    }
    
    res.json({ success: true, asset: newAsset });
  });
INNER_EOF
awk '
BEGIN { in_upload = 0 }
/app\.post\("\/api\/upload"/ { in_upload = 1; system("cat /tmp/upload-patch"); next }
in_upload {
  if (match($0, /res\.json\(\{ success: true, asset: newAsset \}\);/)) {
    getline; # skip the closing });
    in_upload = 0
  }
  next
}
{ print }
' server.ts > server.ts.tmp
mv server.ts.tmp server.ts
