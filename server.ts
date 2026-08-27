import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import fsSync from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
}

// Local Database JSON Helpers
const getLocalDB = (file: string, defaultData: any = []) => {
  const filePath = path.join(process.cwd(), file);
  if (!fsSync.existsSync(filePath)) {
    fsSync.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
  try {
    return JSON.parse(fsSync.readFileSync(filePath, 'utf-8'));
  } catch {
    return defaultData;
  }
};

const saveLocalDB = (file: string, data: any) => {
  fsSync.writeFileSync(path.join(process.cwd(), file), JSON.stringify(data, null, 2));
};

// Multer setup for local/buffer uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});
const upload = multer({ storage });

// --- API: AUTH ---
app.post("/api/auth/login", (req, res) => {
  const { role, password } = req.body;
  const validPasswords = getLocalDB('passwords.json', {
    'CEO': process.env.CEO_PASS || 'colline',
    'Designer': process.env.DESIGN_PASS || 'design123',
    'Financial Manager': process.env.FINANCE_PASS || 'finance2026',
    'Marketing Director': process.env.MARKETING_PASS || 'market2026',
    'Video Producer': process.env.VIDEO_PASS || 'video2026',
    'Web Manager': process.env.WEB_PASS || 'web2026',
    'Support Manager': 'support2026'
  });

  if (validPasswords[role] && validPasswords[role] === password) {
    return res.json({ success: true, role });
  }

  // Fallback defaults
  if (password === 'colline' || password === 'design123' || password === 'admin') {
    return res.json({ success: true, role });
  }

  res.status(401).json({ success: false, message: "Invalid credentials" });
});

app.get("/api/passwords", (_req, res) => {
  const passwords = getLocalDB('passwords.json', {
    'CEO': process.env.CEO_PASS || 'colline',
    'Designer': process.env.DESIGN_PASS || 'design123'
  });
  res.json(passwords);
});

app.put("/api/passwords", (req, res) => {
  const { role, newPassword } = req.body;
  if (!role || !newPassword) {
    return res.status(400).json({ success: false, message: "Role and newPassword required" });
  }
  const passwords = getLocalDB('passwords.json', {
    'CEO': process.env.CEO_PASS || 'colline',
    'Designer': process.env.DESIGN_PASS || 'design123'
  });
  passwords[role] = newPassword;
  saveLocalDB('passwords.json', passwords);
  res.json({ success: true, passwords });
});

// --- API: SITE SETTINGS / CMS ---
app.get("/api/settings", (_req, res) => {
  const defaultSettings = {
    heroTitle: "Ideas that look alive.",
    heroSubtitle: "Transforming high-growth tech brands with award-winning visual systems, 3D motion, and immersive digital craft.",
    heroBadge: "Design Studio",
    heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41485-large.mp4",
    sponsors: [
      { id: '1', name: 'OpenAI', color: '#10A37F' },
      { id: '2', name: 'Stripe', color: '#635BFF' },
      { id: '3', name: 'Figma', color: '#F24E1E' },
      { id: '4', name: 'Vercel', color: '#000000' }
    ]
  };
  res.json(getLocalDB('settings.json', defaultSettings));
});

app.put("/api/settings", upload.single('heroVideo'), (req, res) => {
  const current = getLocalDB('settings.json', {});
  if (req.file) {
    current.heroVideoUrl = `/uploads/${req.file.filename}`;
  } else if (req.body) {
    Object.assign(current, req.body);
  }
  saveLocalDB('settings.json', current);
  res.json({ success: true, settings: current });
});

app.post("/api/sponsors", (req, res) => {
  const settings = getLocalDB('settings.json', { sponsors: [] });
  if (!settings.sponsors) settings.sponsors = [];
  const newSponsor = {
    id: Date.now().toString(),
    name: req.body.name || 'Partner',
    color: req.body.color || '#A259FF',
    logoUrl: req.body.logoUrl || ''
  };
  settings.sponsors.push(newSponsor);
  saveLocalDB('settings.json', settings);
  res.json({ success: true, sponsor: newSponsor });
});

app.delete("/api/sponsors/:id", (req, res) => {
  const settings = getLocalDB('settings.json', { sponsors: [] });
  if (settings.sponsors) {
    settings.sponsors = settings.sponsors.filter((s: any) => s.id !== req.params.id);
    saveLocalDB('settings.json', settings);
  }
  res.json({ success: true });
});

// --- API: ASSETS & MEDIA (Image & Video Uploads) ---
app.get("/api/assets", (_req, res) => {
  const defaultAssets = [
    {
      id: 'asset-1',
      title: 'Kinetic Neon Identity',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      type: 'image',
      category: 'Graphic Design',
      createdAt: new Date().toISOString()
    },
    {
      id: 'asset-2',
      title: 'Cyberpunk City Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41485-large.mp4',
      type: 'video',
      category: 'Video & Editing',
      createdAt: new Date().toISOString()
    },
    {
      id: 'asset-3',
      title: 'Spatial Fluid Dynamics',
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
      type: 'image',
      category: 'Artwork Design',
      createdAt: new Date().toISOString()
    },
    {
      id: 'asset-4',
      title: 'Urban Kinetic Motion Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
      type: 'video',
      category: 'Motion Graphics',
      createdAt: new Date().toISOString()
    }
  ];
  res.json(getLocalDB('assets.json', defaultAssets));
});

app.post("/api/upload", upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const isVideo = req.file.mimetype.startsWith('video/') || req.file.originalname.match(/\.(mp4|mov|webm|ogg)$/i);
  const fileUrl = `/uploads/${req.file.filename}`;

  const newAsset = {
    id: `asset-${Date.now()}`,
    type: isVideo ? 'video' : 'image',
    url: fileUrl,
    title: req.body.title || req.file.originalname.split('.')[0],
    category: req.body.category || (isVideo ? 'Video & Editing' : 'Graphic Design'),
    tags: req.body.tags ? req.body.tags.split(',').map((t: string) => t.trim()) : [],
    uploadedBy: req.body.uploadedBy || 'Designer',
    createdAt: new Date().toISOString()
  };

  const assets = getLocalDB('assets.json', []);
  assets.unshift(newAsset);
  saveLocalDB('assets.json', assets);

  res.json({ success: true, asset: newAsset });
});

app.delete("/api/assets/:id", (req, res) => {
  const assets = getLocalDB('assets.json', []);
  const filtered = assets.filter((a: any) => a.id !== req.params.id);
  saveLocalDB('assets.json', filtered);
  res.json({ success: true });
});

// --- API: LEADS & PRODUCT REQUESTS ---
app.get("/api/leads", (_req, res) => {
  res.json(getLocalDB('leads.json', []));
});

app.post("/api/product-requests", (req, res) => {
  const { name, email, message, assetId, assetTitle, service } = req.body;
  const newLead = {
    id: `lead-${Date.now()}`,
    name,
    email,
    message,
    asset_id: assetId,
    asset_title: assetTitle,
    service: service || 'General Creative Inquiry',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const leads = getLocalDB('leads.json', []);
  leads.unshift(newLead);
  saveLocalDB('leads.json', leads);

  res.json({ success: true, request: newLead, lead: newLead });
});

app.post("/api/applications", (req, res) => {
  const applications = getLocalDB('applications.json', []);
  const newApp = {
    id: `app-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  applications.unshift(newApp);
  saveLocalDB('applications.json', applications);
  res.json({ success: true, application: newApp });
});

// --- API: KANBAN TASKS ---
app.get("/api/tasks", (_req, res) => {
  res.json(getLocalDB('tasks.json', []));
});

app.post("/api/tasks", (req, res) => {
  const tasks = getLocalDB('tasks.json', []);
  const newTask = {
    id: `task-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  saveLocalDB('tasks.json', tasks);
  res.json({ success: true, task: newTask });
});

// --- API: TRANSACTIONS & FINANCIAL LEDGER ---
app.get("/api/transactions", (_req, res) => {
  res.json(getLocalDB('transactions.json', []));
});

app.post("/api/transactions", (req, res) => {
  const txs = getLocalDB('transactions.json', []);
  const newTx = {
    id: `tx-${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  txs.unshift(newTx);
  saveLocalDB('transactions.json', txs);
  res.json({ success: true, transaction: newTx });
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 GigSpace studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
