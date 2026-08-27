import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase credentials from Vite environment variables
const env = (import.meta as any).env || {};
const rawSupabaseUrl = typeof env.VITE_SUPABASE_URL === 'string' ? env.VITE_SUPABASE_URL.trim() : '';
const rawSupabaseAnonKey = typeof env.VITE_SUPABASE_ANON_KEY === 'string' ? env.VITE_SUPABASE_ANON_KEY.trim() : '';

// Strictly validate that the URL is a valid HTTP or HTTPS URL
const isValidHttpUrl = (urlStr: string): boolean => {
  if (!urlStr) return false;
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) return false;
  if (urlStr === 'https://your-project.supabase.co' || urlStr.includes('placeholder')) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  isValidHttpUrl(rawSupabaseUrl) && 
  rawSupabaseAnonKey && 
  rawSupabaseAnonKey !== 'your-anon-key-here' &&
  !rawSupabaseAnonKey.includes('placeholder')
);

// Safely initialize Supabase Client with try/catch to guard against any runtime URL formatting exceptions
const initSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (err) {
    console.warn('Supabase initialization failed, falling back to local storage engine:', err);
    return null;
  }
};

export const supabase: SupabaseClient | null = initSupabase();

// ==========================================
// TYPES
// ==========================================

export interface Lead {
  id: string;
  name: string;
  email: string;
  message?: string;
  service?: string;
  asset_id?: string;
  asset_title?: string;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
}

export interface PortfolioAsset {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  tags?: string[];
  uploaded_by?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  tx_ref: string;
  client: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'income' | 'expense';
  description?: string;
  created_at: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  stage: 'Backlog' | 'In Progress' | 'Review' | 'Completed';
  category: string;
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  created_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  color: string;
  logoUrl?: string;
}

export interface CmsServiceItem {
  id: string;
  title: string;
  text: string;
  color?: string;
  imageUrl?: string;
}

export interface CmsCareerItem {
  id: string;
  roleTitle: string;
  department: string;
  type: string;
  location: string;
  summary: string;
  skills: string[];
  accentColor?: string;
  pillStyle?: string;
}

export interface CmsTeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  cartoon: string;
  neon: string;
}

export interface CmsProcessStep {
  num: string;
  title: string;
  desc: string;
  image: string;
  neonNumber?: string;
  glowGradient?: string;
  neonRing?: string;
}

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroVideoUrl: string;
  brandStatement?: string;
  sponsors: Sponsor[];
  // Dynamic Page & Section Data
  servicesList?: CmsServiceItem[];
  careersList?: CmsCareerItem[];
  teamMembers?: CmsTeamMember[];
  processSteps?: CmsProcessStep[];
  contactEmail?: string;
  contactPhone?: string;
  contactLocation?: string;
  officeHours?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialBehance?: string;
  socialTiktok?: string;
}

// ==========================================
// DEFAULT LOCAL SEED / CACHE FALLBACKS
// ==========================================

const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: "Ideas that look alive.",
  heroSubtitle: "Transforming high-growth tech brands with award-winning visual systems, 3D motion, and immersive digital craft.",
  heroBadge: "Design Studio",
  heroVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41485-large.mp4",
  brandStatement: "A creative space for design, video and visual ideas.",
  sponsors: [
    { id: '1', name: 'OpenAI', color: '#10A37F', logoUrl: 'https://cdn.simpleicons.org/openai/ffffff' },
    { id: '2', name: 'Stripe', color: '#635BFF', logoUrl: 'https://cdn.simpleicons.org/stripe/ffffff' },
    { id: '3', name: 'Figma', color: '#F24E1E', logoUrl: 'https://cdn.simpleicons.org/figma/ffffff' },
    { id: '4', name: 'Vercel', color: '#00F5D4', logoUrl: 'https://cdn.simpleicons.org/vercel/ffffff' }
  ],
  servicesList: [
    {
      id: 'svc-1',
      title: 'Visual Identity & Branding',
      text: 'Custom logomarks, comprehensive brand guidelines, color palettes, and typographic hierarchies designed to make tech products stand out.',
      color: 'from-[#FF5E00] to-[#FFB703]',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'svc-2',
      title: '3D Motion & Video Reels',
      text: 'Cinematic commercial product trailers, procedural 3D octane motion loops, dynamic kinetic typography, and DaVinci color grading.',
      color: 'from-[#219EBC] to-[#00F5D4]',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'svc-3',
      title: 'Physical & Digital Artwork',
      text: 'Bespoke canvas prints, architectural neon installations, holographic textures, and immersive spatial exhibition visuals.',
      color: 'from-[#F72585] to-[#7209B7]',
      imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'svc-4',
      title: 'Interactive Web & App Design',
      text: 'Fluid WebGL shaders, responsive high-conversion UI/UX, interaction prototypes, and mobile money payment integrations.',
      color: 'from-[#10A37F] to-[#219EBC]',
      imageUrl: 'https://images.unsplash.com/photo-1633493763181-eef13ff03ff8?auto=format&fit=crop&w=1200&q=80'
    }
  ],
  careersList: [
    {
      id: '3d-spatial',
      roleTitle: '3D Spatial & Motion Artist',
      department: 'Spatial & CGI',
      type: 'Full-time / Contract',
      location: 'Remote (Worldwide)',
      summary: 'Lead high-impact 3D product visualizations, procedural materials, kinetic typography, and octane motion loops.',
      skills: ['3d motion', 'octane', 'c4d'],
      accentColor: '#3B82F6',
      pillStyle: 'bg-gradient-to-r from-[#3B82F6] via-[#93C5FD] to-[#FDE047] shadow-[0_10px_35px_rgba(59,130,246,0.35)]'
    },
    {
      id: 'video-colorist',
      roleTitle: 'Senior Video Editor & Colorist',
      department: 'Video Production',
      type: 'Full-time / Hybrid',
      location: 'Remote / Studio',
      summary: 'Craft commercial trailer cuts, dynamic pacing, cinematic DaVinci color grading, and broadcast sound mixing.',
      skills: ['davinci', 'premiere', 'color grading'],
      accentColor: '#F72585',
      pillStyle: 'bg-[#111118]/90 border border-transparent shadow-[0_10px_35px_rgba(244,63,94,0.25)] ring-1 ring-gradient-to-r from-[#00F5D4] via-[#F72585] to-[#FFBE0B]'
    },
    {
      id: 'brand-identity',
      roleTitle: 'Brand Identity & Visual Designer',
      department: 'Graphic Design',
      type: 'Full-time / Remote',
      location: 'Remote',
      summary: 'Architect comprehensive visual systems, custom typography hierarchies, design tokens, and physical packaging.',
      skills: ['figma', 'branding', 'typography'],
      accentColor: '#FF5E00',
      pillStyle: 'bg-gradient-to-r from-[#242A2E]/90 via-[#3A2F3D]/80 to-[#4A2835]/80 border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)]'
    },
    {
      id: 'creative-tech',
      roleTitle: 'Creative Technologist & UI Engineer',
      department: 'Web & Digital',
      type: 'Full-time / Contract',
      location: 'Remote',
      summary: 'Bridge aesthetics and web engineering, building interactive 3D WebGL canvases, generative visual shaders, and UI motion.',
      skills: ['three.js', 'react', 'webgl'],
      accentColor: '#00F5D4',
      pillStyle: 'bg-gradient-to-r from-[#99F6E4] via-[#E0E7FF] to-[#FBCFE8] shadow-[0_10px_35px_rgba(153,246,228,0.35)]'
    }
  ],
  teamMembers: [
    {
      id: 'tm-1',
      name: "Collinewayero",
      role: "Creative Director & CEO",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      cartoon: "https://api.dicebear.com/7.x/adventurer/svg?seed=colline&backgroundColor=ffdfbf",
      neon: "from-[#FF5E00] to-[#FFB703]"
    },
    {
      id: 'tm-2',
      name: "Marcus Vance",
      role: "Lead 3D & Motion Artist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      cartoon: "https://api.dicebear.com/7.x/adventurer/svg?seed=marcus&backgroundColor=b6e3f4",
      neon: "from-[#219EBC] to-[#00F5D4]"
    },
    {
      id: 'tm-3',
      name: "Elena Rostova",
      role: "Senior Video Colorist",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      cartoon: "https://api.dicebear.com/7.x/adventurer/svg?seed=elena&backgroundColor=ffd5dc",
      neon: "from-[#F72585] to-[#7209B7]"
    },
    {
      id: 'tm-4',
      name: "Darius Thorne",
      role: "Brand Identity Lead",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      cartoon: "https://api.dicebear.com/7.x/adventurer/svg?seed=darius&backgroundColor=c0aede",
      neon: "from-[#00F5D4] to-[#FF5E00]"
    }
  ],
  processSteps: [
    {
      num: "01",
      title: "Discover & Align",
      desc: "Deep-dive inquiry into brand identity, design tokens, and technical requirements.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
      neonNumber: "text-transparent bg-clip-text bg-gradient-to-br from-[#FF5E00] to-[#FFB703] drop-shadow-[0_0_20px_rgba(255,94,0,0.5)]",
      glowGradient: "from-[#FF5E00] to-[#FFB703]",
      neonRing: "ring-2 ring-[#FF5E00]/60 shadow-[0_0_15px_rgba(255,94,0,0.4)]"
    },
    {
      num: "02",
      title: "Concept & Prototyping",
      desc: "Rapid exploration through 3D spatial renders, motion animatics, and moodboards.",
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=300&q=80",
      neonNumber: "text-transparent bg-clip-text bg-gradient-to-br from-[#00F5D4] to-[#219EBC] drop-shadow-[0_0_20px_rgba(0,245,212,0.5)]",
      glowGradient: "from-[#00F5D4] to-[#219EBC]",
      neonRing: "ring-2 ring-[#00F5D4]/60 shadow-[0_0_15px_rgba(0,245,212,0.4)]"
    },
    {
      num: "03",
      title: "Production & Polish",
      desc: "Full-scale Octane CGI simulation, DaVinci 4K mastering, and fluid WebGL code.",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80",
      neonNumber: "text-transparent bg-clip-text bg-gradient-to-br from-[#F72585] to-[#7209B7] drop-shadow-[0_0_20px_rgba(247,37,133,0.5)]",
      glowGradient: "from-[#F72585] to-[#7209B7]",
      neonRing: "ring-2 ring-[#F72585]/60 shadow-[0_0_15px_rgba(247,37,133,0.4)]"
    },
    {
      num: "04",
      title: "Launch & Delivery",
      desc: "Flawless packaging of high-res exports, vector source files, and live deployment.",
      image: "https://images.unsplash.com/photo-1633493763181-eef13ff03ff8?auto=format&fit=crop&w=300&q=80",
      neonNumber: "text-transparent bg-clip-text bg-gradient-to-br from-[#FFBE0B] to-[#FF006E] drop-shadow-[0_0_20px_rgba(255,190,11,0.5)]",
      glowGradient: "from-[#FFBE0B] to-[#FF006E]",
      neonRing: "ring-2 ring-[#FFBE0B]/60 shadow-[0_0_15px_rgba(255,190,11,0.4)]"
    }
  ],
  contactEmail: "colline@gigspace.agency",
  contactPhone: "+256 700 000 000",
  contactLocation: "Kampala, Uganda & Worldwide Remote",
  officeHours: "Monday - Saturday: 8:00 AM - 8:00 PM EAT",
  socialInstagram: "@gigspace.studio",
  socialTwitter: "@gigspace_live",
  socialBehance: "gigspace-design",
  socialTiktok: "@gigspace_motion"
};

const DEFAULT_PORTFOLIO: PortfolioAsset[] = [
  {
    id: 'asset-1',
    title: 'Kinetic Neon Identity',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    category: 'Graphic Design',
    tags: ['branding', 'cyberpunk', 'neon'],
    created_at: new Date().toISOString()
  },
  {
    id: 'asset-2',
    title: 'Cyberpunk City Reel',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41485-large.mp4',
    type: 'video',
    category: 'Video & Editing',
    tags: ['motion', 'reel', '3d'],
    created_at: new Date().toISOString()
  },
  {
    id: 'asset-3',
    title: 'Spatial Fluid Dynamics',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    category: 'Artwork Design',
    tags: ['abstract', 'c4d', 'render'],
    created_at: new Date().toISOString()
  },
  {
    id: 'asset-4',
    title: 'Urban Kinetic Motion Reel',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
    type: 'video',
    category: 'Motion Graphics',
    tags: ['video', 'motion', 'loop'],
    created_at: new Date().toISOString()
  },
  {
    id: 'asset-5',
    title: 'Holographic Product Card',
    url: 'https://images.unsplash.com/photo-1633493763181-eef13ff03ff8?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    category: 'Web Assets',
    tags: ['ui', '3d', 'hologram'],
    created_at: new Date().toISOString()
  },
  {
    id: 'asset-6',
    title: 'Atmospheric Glass Grid',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    category: 'Graphic Design',
    tags: ['glass', 'grid', 'future'],
    created_at: new Date().toISOString()
  }
];

const DEFAULT_TASKS: KanbanTask[] = [
  {
    id: 'task-1',
    title: 'Create Cyberpunk 3D Brand Guide',
    description: 'Design comprehensive typography hierarchy and procedural glass materials.',
    stage: 'Backlog',
    category: 'Branding',
    priority: 'high',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Master Urban Flow 4K Video Reel',
    description: 'DaVinci color grade and spatial sound mixing for social drop.',
    stage: 'Backlog',
    category: 'Video',
    priority: 'medium',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Spatial Product WebGL Shader',
    description: 'Render interactive 3D refraction and normal displacement.',
    stage: 'In Progress',
    category: '3D',
    priority: 'high',
    created_at: new Date().toISOString()
  },
  {
    id: 'task-4',
    title: 'Fintech Mobile Money Checkout UX',
    description: 'Airtel & MTN UGX automated direct billing modal.',
    stage: 'Review',
    category: 'UI/UX',
    priority: 'medium',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    tx_ref: 'GS-UG-9981',
    client: 'Fintech Safari Ltd',
    amount: 4500000,
    currency: 'UGX',
    status: 'completed',
    type: 'income',
    description: 'Brand Identity & Web Assets Pack',
    created_at: new Date().toISOString()
  },
  {
    id: 'tx-102',
    tx_ref: 'GS-UG-9982',
    client: 'Nexus Media Kampala',
    amount: 2800000,
    currency: 'UGX',
    status: 'completed',
    type: 'income',
    description: '4K Commercial Video Motion Reel',
    created_at: new Date().toISOString()
  },
  {
    id: 'tx-103',
    tx_ref: 'GS-EXP-041',
    client: 'Render Farm Cloud',
    amount: 650000,
    currency: 'UGX',
    status: 'completed',
    type: 'expense',
    description: 'Octane GPU Cloud Compute',
    created_at: new Date().toISOString()
  }
];

// Helper to get cached localStorage item
function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(`gigspace_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`gigspace_${key}`, JSON.stringify(val));
  } catch (err) {
    console.warn('localStorage write failed:', err);
  }
}

// ==========================================
// 1. SUPABASE STORAGE HELPER (Images & Videos)
// ==========================================

export async function uploadMediaToSupabase(
  file: File,
  bucketName: string = 'portfolio'
): Promise<{ url: string; error?: string }> {
  try {
    if (supabase) {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `${Date.now()}_${sanitizedName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path);
        
        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl };
        }
      } else if (error) {
        console.warn('Supabase storage bucket upload error, trying local fallback:', error.message);
      }
    }
  } catch (e: any) {
    console.warn('Supabase upload exception:', e);
  }

  // Fallback: Use Object URL / Data URL for seamless client preview
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ url: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ url: URL.createObjectURL(file) });
    };
    reader.readAsDataURL(file);
  });
}

// ==========================================
// 2. PORTFOLIO SERVICE
// ==========================================

export const PortfolioService = {
  async getAll(): Promise<PortfolioAsset[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: PortfolioAsset[] = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            url: d.url,
            type: d.type || (d.url.match(/\.(mp4|mov|webm|ogg)$/i) ? 'video' : 'image'),
            category: d.category || 'Graphic Design',
            tags: Array.isArray(d.tags) ? d.tags : typeof d.tags === 'string' ? d.tags.split(',').map((t: string) => t.trim()) : [],
            uploaded_by: d.uploaded_by || 'Designer',
            created_at: d.created_at || new Date().toISOString()
          }));
          setLocalItem('portfolio', mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase portfolio fetch error:', err);
      }
    }

    return getLocalItem('portfolio', DEFAULT_PORTFOLIO);
  },

  async create(asset: Omit<PortfolioAsset, 'id' | 'created_at'>): Promise<PortfolioAsset> {
    const newAsset: PortfolioAsset = {
      ...asset,
      id: `asset-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('portfolio')
          .insert([{
            title: asset.title,
            url: asset.url,
            type: asset.type,
            category: asset.category,
            tags: asset.tags,
            uploaded_by: asset.uploaded_by
          }])
          .select()
          .single();

        if (!error && data) {
          newAsset.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase portfolio insert error:', err);
      }
    }

    const current = getLocalItem('portfolio', DEFAULT_PORTFOLIO);
    const updated = [newAsset, ...current];
    setLocalItem('portfolio', updated);
    return newAsset;
  },

  async delete(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('portfolio').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase portfolio delete error:', err);
      }
    }

    const current = getLocalItem('portfolio', DEFAULT_PORTFOLIO);
    const updated = current.filter(item => item.id !== id);
    setLocalItem('portfolio', updated);
    return true;
  }
};

// ==========================================
// 3. LEADS & INQUIRIES SERVICE
// ==========================================

export const LeadsService = {
  async getAll(): Promise<Lead[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setLocalItem('leads', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase leads fetch error:', err);
      }
    }
    return getLocalItem('leads', []);
  },

  async create(lead: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<Lead> {
    const newLead: Lead = {
      ...lead,
      id: `lead-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .insert([{
            name: lead.name,
            email: lead.email,
            message: lead.message,
            service: lead.service,
            asset_id: lead.asset_id,
            asset_title: lead.asset_title,
            status: 'pending'
          }])
          .select()
          .single();

        if (!error && data) {
          newLead.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase leads insert error:', err);
      }
    }

    const current = getLocalItem<Lead[]>('leads', []);
    setLocalItem('leads', [newLead, ...current]);
    return newLead;
  },

  async updateStatus(id: string, status: Lead['status']): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('leads').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Supabase lead update error:', err);
      }
    }

    const current = getLocalItem<Lead[]>('leads', []);
    const updated = current.map(l => l.id === id ? { ...l, status } : l);
    setLocalItem('leads', updated);
    return true;
  }
};

// ==========================================
// 4. KANBAN TASKS SERVICE
// ==========================================

export const TasksService = {
  async getAll(): Promise<KanbanTask[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setLocalItem('tasks', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase tasks fetch error:', err);
      }
    }
    return getLocalItem('tasks', DEFAULT_TASKS);
  },

  async create(task: Omit<KanbanTask, 'id' | 'created_at'>): Promise<KanbanTask> {
    const newTask: KanbanTask = {
      ...task,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert([{
            title: task.title,
            description: task.description,
            stage: task.stage,
            category: task.category,
            priority: task.priority,
            assigned_to: task.assigned_to
          }])
          .select()
          .single();

        if (!error && data) {
          newTask.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase tasks insert error:', err);
      }
    }

    const current = getLocalItem('tasks', DEFAULT_TASKS);
    const updated = [newTask, ...current];
    setLocalItem('tasks', updated);
    return newTask;
  },

  async updateStage(id: string, stage: KanbanTask['stage']): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('tasks').update({ stage }).eq('id', id);
      } catch (err) {
        console.warn('Supabase task stage update error:', err);
      }
    }

    const current = getLocalItem('tasks', DEFAULT_TASKS);
    const updated = current.map(t => t.id === id ? { ...t, stage } : t);
    setLocalItem('tasks', updated);
    return true;
  },

  async delete(id: string): Promise<boolean> {
    if (supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase task delete error:', err);
      }
    }

    const current = getLocalItem('tasks', DEFAULT_TASKS);
    const updated = current.filter(t => t.id !== id);
    setLocalItem('tasks', updated);
    return true;
  }
};

// ==========================================
// 5. TRANSACTIONS & FINANCIAL LEDGER
// ==========================================

export const TransactionsService = {
  async getAll(): Promise<Transaction[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setLocalItem('transactions', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase transactions fetch error:', err);
      }
    }
    return getLocalItem('transactions', DEFAULT_TRANSACTIONS);
  },

  async create(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert([{
            tx_ref: tx.tx_ref,
            client: tx.client,
            amount: tx.amount,
            currency: tx.currency,
            status: tx.status,
            type: tx.type,
            description: tx.description
          }])
          .select()
          .single();

        if (!error && data) {
          newTx.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase transactions insert error:', err);
      }
    }

    const current = getLocalItem('transactions', DEFAULT_TRANSACTIONS);
    const updated = [newTx, ...current];
    setLocalItem('transactions', updated);
    return newTx;
  }
};

// ==========================================
// 6. LIVE CMS & SITE SETTINGS
// ==========================================

export const CmsSettingsService = {
  async getSettings(): Promise<SiteSettings> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .single();

        if (!error && data) {
          const settings: SiteSettings = {
            heroTitle: data.hero_title || data.heroTitle || DEFAULT_SETTINGS.heroTitle,
            heroSubtitle: data.hero_subtitle || data.heroSubtitle || DEFAULT_SETTINGS.heroSubtitle,
            heroBadge: data.hero_badge || data.heroBadge || DEFAULT_SETTINGS.heroBadge,
            heroVideoUrl: data.hero_video_url || data.heroVideoUrl || DEFAULT_SETTINGS.heroVideoUrl,
            brandStatement: data.brand_statement || data.brandStatement || DEFAULT_SETTINGS.brandStatement,
            sponsors: data.sponsors || DEFAULT_SETTINGS.sponsors,
            servicesList: data.services_list || data.servicesList || DEFAULT_SETTINGS.servicesList,
            careersList: data.careers_list || data.careersList || DEFAULT_SETTINGS.careersList,
            teamMembers: data.team_members || data.teamMembers || DEFAULT_SETTINGS.teamMembers,
            processSteps: data.process_steps || data.processSteps || DEFAULT_SETTINGS.processSteps,
            contactEmail: data.contact_email || data.contactEmail || DEFAULT_SETTINGS.contactEmail,
            contactPhone: data.contact_phone || data.contactPhone || DEFAULT_SETTINGS.contactPhone,
            contactLocation: data.contact_location || data.contactLocation || DEFAULT_SETTINGS.contactLocation,
            officeHours: data.office_hours || data.officeHours || DEFAULT_SETTINGS.officeHours,
            socialInstagram: data.social_instagram || data.socialInstagram || DEFAULT_SETTINGS.socialInstagram,
            socialTwitter: data.social_twitter || data.socialTwitter || DEFAULT_SETTINGS.socialTwitter,
            socialBehance: data.social_behance || data.socialBehance || DEFAULT_SETTINGS.socialBehance,
            socialTiktok: data.social_tiktok || data.socialTiktok || DEFAULT_SETTINGS.socialTiktok
          };
          setLocalItem('settings', settings);
          return settings;
        }
      } catch (err) {
        console.warn('Supabase settings fetch error:', err);
      }
    }
    return getLocalItem('settings', DEFAULT_SETTINGS);
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = getLocalItem('settings', DEFAULT_SETTINGS);
    const updated: SiteSettings = {
      ...current,
      ...settings
    };

    if (supabase) {
      try {
        await supabase
          .from('site_settings')
          .upsert({
            id: 1,
            hero_title: updated.heroTitle,
            hero_subtitle: updated.heroSubtitle,
            hero_badge: updated.heroBadge,
            hero_video_url: updated.heroVideoUrl,
            brand_statement: updated.brandStatement,
            sponsors: updated.sponsors,
            services_list: updated.servicesList,
            careers_list: updated.careersList,
            team_members: updated.teamMembers,
            process_steps: updated.processSteps,
            contact_email: updated.contactEmail,
            contact_phone: updated.contactPhone,
            contact_location: updated.contactLocation,
            office_hours: updated.officeHours,
            social_instagram: updated.socialInstagram,
            social_twitter: updated.socialTwitter,
            social_behance: updated.socialBehance,
            social_tiktok: updated.socialTiktok,
            updated_at: new Date().toISOString()
          });
      } catch (err) {
        console.warn('Supabase settings update error:', err);
      }
    }

    setLocalItem('settings', updated);
    return updated;
  }
};

// ==========================================
// 7. PERSISTENT AUTH (Supabase Auth + Role Engine)
// ==========================================

export const AuthService = {
  async login(role: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> {
    // 1. If Supabase is configured with email/password
    if (supabase) {
      try {
        const email = `${role.toLowerCase().replace(/\s+/g, '')}@gigspace.agency`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!error && data.user) {
          localStorage.setItem('gigspace_auth_role', role);
          return { success: true, role };
        }
      } catch (err) {
        console.warn('Supabase auth attempt error:', err);
      }
    }

    // 2. Role verification with studio passwords
    const studioPasswords: Record<string, string> = getLocalItem('passwords', {
      'CEO': 'colline',
      'Designer': 'design123',
      'Financial Manager': 'finance2026',
      'Marketing Director': 'market2026',
      'Video Producer': 'video2026',
      'Web Manager': 'web2026',
      'Support Manager': 'support2026'
    });

    if (studioPasswords[role] && studioPasswords[role] === password) {
      localStorage.setItem('gigspace_auth_role', role);
      return { success: true, role };
    }

    // Fallback default password matches
    if (password === 'colline' || password === 'design123' || password === 'admin') {
      localStorage.setItem('gigspace_auth_role', role);
      return { success: true, role };
    }

    return { success: false, error: 'Invalid credentials. Check role and password.' };
  },

  getSession(): string | null {
    return localStorage.getItem('gigspace_auth_role');
  },

  async getSessionRole(): Promise<string | null> {
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          return localStorage.getItem('gigspace_auth_role') || 'CEO';
        }
      } catch (err) {
        console.warn('Supabase session check error:', err);
      }
    }
    return localStorage.getItem('gigspace_auth_role');
  },

  async logout(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    localStorage.removeItem('gigspace_auth_role');
  }
};
