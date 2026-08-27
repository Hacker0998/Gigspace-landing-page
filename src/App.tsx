import { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Video, 
  Image as ImageIcon, 
  Menu, 
  X, 
  ArrowRight, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  Sun, 
  Moon, 
  CheckCircle,
  Compass,
  Wand2,
  Sliders,
  Rocket,
  Sparkles,
  Layers,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { GalleryView } from './components/GalleryView';
import { JoinUsSection } from './components/JoinUsSection';
import { LogoTicker } from './components/LogoTicker';
import { 
  PortfolioService, 
  CmsSettingsService, 
  AuthService, 
  LeadsService,
  PortfolioAsset, 
  SiteSettings 
} from './lib/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'gallery'>('home');
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(() => AuthService.getSession());
  const [secretSequence, setSecretSequence] = useState('');

  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [activeGalleryFilter, setActiveGalleryFilter] = useState('All');
  const [services, setServices] = useState<any[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    heroTitle: 'Ideas that look alive.',
    heroSubtitle: 'Your complete studio for digital media, high-end video editing, and custom physical artwork designed for the next generation.',
    heroBadge: 'The Creative Standard',
    heroVideoUrl: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedAssets, fetchedSettings] = await Promise.all([
          PortfolioService.getAll(),
          CmsSettingsService.getSettings()
        ]);
        if (fetchedAssets && fetchedAssets.length > 0) {
          setAssets(fetchedAssets);
        }
        if (fetchedSettings) {
          setSettings(fetchedSettings);
        }
      } catch (e) {
        console.error("Failed to sync from Supabase services", e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  const fastLoginActive = useRef(false);
  const fastPassword = useRef('');

  const TARGET_SEQUENCE = 'gigse';

  useEffect(() => {
    // Process code injection from Web Manager Dashboard
    const applyInjection = () => {
      const injectedCode = localStorage.getItem('gigspace_injected_code');
      if (injectedCode) {
        try {
          let styleEl = document.getElementById('gigspace-injected-style');
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'gigspace-injected-style';
            document.head.appendChild(styleEl);
          }
          
          const styleMatch = injectedCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
          if (styleMatch && styleMatch[1]) {
            styleEl.textContent = styleMatch[1];
          }
        } catch (err) {
          console.error("Failed to inject code snippet", err);
        }
      }
    };
    
    applyInjection();
    window.addEventListener('storage', applyInjection);
    return () => window.removeEventListener('storage', applyInjection);
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore if login is already showing or user is logged in
      if (showLogin || adminRole) return;
      
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
         fastLoginActive.current = false;
         fastPassword.current = '';
         return;
      }

      if (e.key === 'Enter' && fastLoginActive.current) {
         try {
           const res = await fetch('/api/auth/fast-login', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ password: fastPassword.current })
           });
           if (res.ok) {
             const data = await res.json();
             if (data.success) {
               setAdminRole(data.role);
             }
           }
         } catch(err) {
           console.error(err);
         }
         fastLoginActive.current = false;
         fastPassword.current = '';
         return;
      }

      if (e.key.toLowerCase() === 'g' && !fastLoginActive.current) {
        fastLoginActive.current = true;
        fastPassword.current = '';
      } else if (fastLoginActive.current) {
        if (e.key === 'Backspace') {
          fastPassword.current = fastPassword.current.slice(0, -1);
        } else if (e.key.length === 1) {
          fastPassword.current += e.key;
        }
      }

      const key = (e.key || '').toLowerCase();
      // Only track alphabet keys to avoid long random strings
      if (!/^[a-z]$/.test(key)) return;

      setSecretSequence(prev => {
        const next = (prev + key).slice(-TARGET_SEQUENCE.length);
        if (next === TARGET_SEQUENCE) {
          setShowLogin(true);
          return ''; // Reset after triggering
        }
        return next;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogin, adminRole]);

  const handleLetterClick = (letter: string) => {
    if (showLogin || adminRole) return;
    
    setSecretSequence(prev => {
      const next = (prev + (letter || '').toLowerCase()).slice(-TARGET_SEQUENCE.length);
      if (next === TARGET_SEQUENCE) {
        setShowLogin(true);
        return ''; // Reset after triggering
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['home', 'services', 'work', 'contact'];
      let current = 'home';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= (element.offsetTop - 300)) {
          current = section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const capabilities = [
    "Posters", "Logos", "Branding", "Social content", "T-shirt designs", "Video content", "Artwork", "Web Assets", "Motion Graphics"
  ];

  // Default fallback services
  const defaultServices = [
    {
      id: 'svc-1',
      title: "Design & Identity",
      text: "Comprehensive visual systems, brand guidelines, typography, and custom identity kits engineered for digital and physical impact.",
      color: "from-[#FF5E00] to-[#FFB703]",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 'svc-2',
      title: "Motion & 3D Video",
      text: "Cinematic trailer cuts, procedural Octane motion loops, 3D CGI product simulations, and DaVinci color grading.",
      color: "from-[#219EBC] to-[#00F5D4]",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 'svc-3',
      title: "Physical Artwork",
      text: "Bespoke framed prints, neon fixtures, architectural art installations, and limited-edition merchandise drops.",
      color: "from-[#F72585] to-[#7209B7]",
      imageUrl: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 'svc-4',
      title: "Interactive Web & 3D",
      text: "Modern WebGL shaders, responsive high-conversion UI/UX, interaction prototypes, and mobile money payment integrations.",
      color: "from-[#10A37F] to-[#219EBC]",
      imageUrl: "https://images.unsplash.com/photo-1633493763181-eef13ff03ff8?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  const effectiveServices = (settings.servicesList && settings.servicesList.length > 0)
    ? settings.servicesList
    : defaultServices;

  const defaultSteps = [
    { 
      num: "01", 
      title: "Discover", 
      desc: "We dive deep into your brand identity, vision, and audience to architect an unmistakable creative roadmap.",
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
      icon: Compass,
      neonNumber: "text-[#FF5E00] drop-shadow-[0_0_20px_rgba(255,94,0,0.85)]",
      neonRing: "border-[#FF5E00] shadow-[0_0_30px_rgba(255,94,0,0.6)]",
      glowGradient: "from-[#FF5E00] to-[#FF9E00]"
    },
    { 
      num: "02", 
      title: "Create", 
      desc: "Our studio sculpts initial concepts, high-impact 3D spatial models, and cinematic motion graphics.",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      icon: Wand2,
      neonNumber: "text-[#FFB703] drop-shadow-[0_0_20px_rgba(255,183,3,0.85)]",
      neonRing: "border-[#FFB703] shadow-[0_0_30px_rgba(255,183,3,0.6)]",
      glowGradient: "from-[#FFB703] to-[#FF5E00]"
    },
    { 
      num: "03", 
      title: "Refine", 
      desc: "We iterate seamlessly alongside you, fine-tuning color grades, lighting, audio waveforms, and typography.",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80",
      icon: Sliders,
      neonNumber: "text-[#219EBC] drop-shadow-[0_0_20px_rgba(33,158,188,0.85)]",
      neonRing: "border-[#219EBC] shadow-[0_0_30px_rgba(33,158,188,0.6)]",
      glowGradient: "from-[#219EBC] to-[#023047]"
    },
    { 
      num: "04", 
      title: "Deliver", 
      desc: "You receive high-resolution DRM-secured deliverables and master source files prepared for global deployment.",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
      icon: Rocket,
      neonNumber: "text-[#00F5D4] drop-shadow-[0_0_20px_rgba(0,245,212,0.85)]",
      neonRing: "border-[#00F5D4] shadow-[0_0_30px_rgba(0,245,212,0.6)]",
      glowGradient: "from-[#00F5D4] to-[#219EBC]"
    }
  ];

  const effectiveSteps = (settings.processSteps && settings.processSteps.length > 0)
    ? settings.processSteps.map((step, idx) => {
        const icons = [Compass, Wand2, Sliders, Rocket, Sparkles, Layers];
        const IconComponent = icons[idx % icons.length];
        return {
          num: step.num || `0${idx + 1}`,
          title: step.title,
          desc: step.desc,
          image: step.image || defaultSteps[idx % defaultSteps.length].image,
          icon: IconComponent,
          neonNumber: step.neonNumber || defaultSteps[idx % defaultSteps.length].neonNumber,
          neonRing: step.neonRing || defaultSteps[idx % defaultSteps.length].neonRing,
          glowGradient: step.glowGradient || defaultSteps[idx % defaultSteps.length].glowGradient
        };
      })
    : defaultSteps;

  const defaultTeam = [
    { 
      role: "Financial Manager", 
      name: "Elena Vance",
      initials: "FM", 
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      cartoon: "https://api.dicebear.com/7.x/bottts/svg?seed=elena",
      neon: "from-[#FF5E00] via-[#FFB703] to-[#F72585]" 
    },
    { 
      role: "Marketing Director", 
      name: "Marcus Sterling",
      initials: "MD", 
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      cartoon: "https://api.dicebear.com/7.x/bottts/svg?seed=marcus",
      neon: "from-[#00F5D4] via-[#38BDF8] to-[#219EBC]" 
    },
    { 
      role: "Lead Designer", 
      name: "Aria Chen",
      initials: "DS", 
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      cartoon: "https://api.dicebear.com/7.x/bottts/svg?seed=aria",
      neon: "from-[#F72585] via-[#7209B7] to-[#3B82F6]" 
    },
    { 
      role: "Web Manager", 
      name: "Leo Kaelen",
      initials: "WM", 
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      cartoon: "https://api.dicebear.com/7.x/bottts/svg?seed=leo",
      neon: "from-[#38BDF8] via-[#818CF8] to-[#00F5D4]" 
    }
  ];

  const effectiveTeam = (settings.teamMembers && settings.teamMembers.length > 0)
    ? settings.teamMembers.map((tm, idx) => ({
        role: tm.role,
        name: tm.name,
        initials: tm.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        avatar: tm.avatar || defaultTeam[idx % defaultTeam.length].avatar,
        cartoon: tm.cartoon || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(tm.name)}`,
        neon: tm.neon || defaultTeam[idx % defaultTeam.length].neon
      }))
    : defaultTeam;

  const whyUs = [
    "Creative", "Flexible", "Personal", "Multi-disciplinary", "Professional"
  ];

  if (adminRole) {
    return <AdminDashboard role={adminRole} onLogout={() => setAdminRole(null)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#121215] text-gray-900 dark:text-gray-300 font-sans transition-colors duration-300 selection:bg-[#FF5E00]/30">
      
      {showLogin && (
        <AdminLogin 
          onClose={() => setShowLogin(false)} 
          onSuccess={(role) => {
            setShowLogin(false);
            setAdminRole(role);
          }} 
        />
      )}

      {/* Navigation */}
      {currentView !== 'gallery' && (
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b ${
        isScrolled ? 'py-4 bg-white/80 dark:bg-white/5 border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none' : 'py-6 bg-transparent border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="text-2xl font-heading font-black tracking-tighter text-gray-900 dark:text-white cursor-pointer uppercase" onClick={() => scrollTo('home')}>
            GigSpace
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-9">
            <button onClick={() => scrollTo('work')} className={`text-sm font-medium tracking-wide transition-colors uppercase relative ${activeSection === 'work' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
              Work
              {activeSection === 'work' && <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] rounded-full"></motion.div>}
            </button>
            <button onClick={() => scrollTo('services')} className={`text-sm font-medium tracking-wide transition-colors uppercase relative ${activeSection === 'services' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
              Services
              {activeSection === 'services' && <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] rounded-full"></motion.div>}
            </button>
            <button onClick={() => scrollTo('careers')} className="text-sm font-medium tracking-wide text-[#FF5E00] hover:text-[#FFB703] transition-colors uppercase font-bold flex items-center gap-1.5 relative">
              <span>Careers</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-[#FF5E00]/15 border border-[#FF5E00]/30 text-[#FF5E00]">Hiring</span>
            </button>
            <button onClick={() => scrollTo('contact')} className={`text-sm font-medium tracking-wide transition-colors uppercase relative ${activeSection === 'contact' ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}>
              Contact
              {activeSection === 'contact' && <motion.div layoutId="nav-indicator" className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] rounded-full"></motion.div>}
            </button>
            
            <div className="flex items-center gap-4 border-l border-gray-300 dark:border-white/10 pl-6">
              <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => scrollTo('contact')} className="bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-orange-600/20">
                Start a Project
              </button>
            </div>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full text-gray-600 dark:text-gray-300">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="text-gray-900 dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>
      )}

      {/* Mobile Menu */}
      {currentView !== 'gallery' && mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-[#121215] pt-24 px-6 flex flex-col gap-6 lg:hidden">
          <button onClick={() => scrollTo('work')} className="text-2xl font-heading font-bold text-gray-900 dark:text-white text-left">Work</button>
          <button onClick={() => scrollTo('services')} className="text-2xl font-heading font-bold text-gray-900 dark:text-white text-left">Services</button>
          <button onClick={() => scrollTo('careers')} className="text-2xl font-heading font-bold text-[#FF5E00] text-left flex items-center justify-between" onClickCapture={() => setMobileMenuOpen(false)}>
            <span>Careers</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#FF5E00]/15 border border-[#FF5E00]/30">Hiring</span>
          </button>
          <button onClick={() => scrollTo('contact')} className="text-2xl font-heading font-bold text-gray-900 dark:text-white text-left">Contact</button>
          <button onClick={() => scrollTo('contact')} className="bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white px-6 py-4 rounded-xl font-bold text-lg mt-4 w-full uppercase">
            Start a Project
          </button>
        </div>
      )}

      {currentView === 'gallery' ? (
        <GalleryView 
          assets={assets} 
          onBack={() => { setCurrentView('home'); window.scrollTo(0,0); }} 
          isDark={isDark} 
        />
      ) : (
      <>
      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 space-y-8 z-10">
          <motion.div {...fadeUp} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-[2px] w-12 bg-gradient-to-r from-[#FF5E00] to-[#219EBC]"></div>
              <span className="text-[10px] tracking-[0.4em] text-gray-500 dark:text-gray-400 uppercase font-bold">{settings.heroBadge || 'The Creative Standard'}</span>
            </div>
            <h1 className="text-6xl md:text-[84px] font-black leading-[0.9] tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-[#FF5E00] via-[#FFB703] to-[#219EBC]" dangerouslySetInnerHTML={{ __html: (settings.heroTitle || 'Ideas that <br/>look alive.').replace('\n', '<br/>') }}>
            </h1>
          </motion.div>
          
          <motion.p {...fadeUp} transition={{ delay: 0.1, duration: 0.6 }} className="text-xl text-gray-600 dark:text-gray-400 max-w-lg font-light leading-relaxed">
            {settings.heroSubtitle || 'Your complete studio for digital media, high-end video editing, and custom physical artwork designed for the next generation.'}
          </motion.p>
          
          <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={() => scrollTo('contact')} className="px-8 py-4 bg-gradient-to-r from-[#FF5E00] to-[#FFB703] text-black font-bold rounded-lg shadow-xl shadow-orange-500/20 hover:opacity-90 transition-opacity uppercase text-sm tracking-wider flex items-center justify-center gap-2 group">
              Start a Project
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => scrollTo('work')} className="px-8 py-4 border-2 border-[#219EBC] text-[#219EBC] font-bold rounded-lg hover:bg-[#219EBC]/10 transition-colors uppercase text-sm tracking-wider flex items-center justify-center">
              View Our Work
            </button>
          </motion.div>
        </div>
        
        <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.8 }} className="flex-1 relative w-full aspect-video max-w-md mx-auto flex items-center justify-center mt-12 lg:mt-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF5E00]/20 to-[#219EBC]/20 rounded-3xl blur-3xl opacity-50 dark:opacity-30 animate-pulse"></div>
          <div className="relative w-full aspect-video bg-white/50 dark:bg-gradient-to-tr dark:from-white/10 dark:to-white/5 border border-white/40 dark:border-white/10 rounded-3xl backdrop-blur-xl flex items-center justify-center shadow-2xl overflow-hidden group">
            {settings.heroVideoUrl ? (
              <video src={settings.heroVideoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,94,0,0.15)_0%,_transparent_70%)]"></div>
                <div className="text-[100px] md:text-[140px] font-black text-gray-900/10 dark:text-white/10 select-none">GS</div>
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] tracking-widest text-gray-900 dark:text-gray-400 font-bold uppercase">Latest Reel 2024</span>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-4 rounded-full bg-[#FF5E00]"></div>
                    <div className="w-1.5 h-4 rounded-full bg-[#FFB703]"></div>
                    <div className="w-1.5 h-4 rounded-full bg-[#219EBC]"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Infinite Logo Ticker */}
      <LogoTicker sponsors={settings.sponsors || []} />

      {/* Brand Statement */}
      <section className="py-24 px-6 md:px-12 bg-white dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/5">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
            {settings.brandStatement || "A creative space for design, video and visual ideas."}
          </h2>
        </motion.div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeUp} className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Our Services</h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] rounded-full"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {effectiveServices.map((svc, i) => (
              <motion.div 
                key={svc.id || svc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-3xl p-[2px] overflow-hidden"
              >
                {/* Neon moving border (only visible on hover) */}
                <div className="absolute inset-[-100%] z-0 origin-center rotate-0 group-hover:animate-[spin_4s_linear_infinite] transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ backgroundImage: 'conic-gradient(from 90deg, transparent 0%, transparent 60%, #FF5E00 100%)' }}></div>
                <div className="absolute inset-[-100%] z-0 origin-center rotate-180 group-hover:animate-[spin_4s_linear_infinite] transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ backgroundImage: 'conic-gradient(from 90deg, transparent 0%, transparent 60%, #219EBC 100%)' }}></div>
                
                {/* Card inner content */}
                <div className="relative z-10 bg-white dark:bg-[#121215] rounded-[22px] overflow-hidden flex flex-col xl:flex-row h-full min-h-[280px]">
                  {/* Image section */}
                  <div className="w-full xl:w-5/12 h-48 xl:h-auto relative overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0">
                    {svc.imageUrl ? (
                      <img src={svc.imageUrl} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${svc.color || 'from-[#FF5E00] to-[#219EBC]'} opacity-20`}></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 xl:opacity-100 xl:bg-gradient-to-r pointer-events-none"></div>
                  </div>
                  
                  {/* Text section */}
                  <div className="w-full xl:w-7/12 p-8 flex flex-col justify-center bg-white/50 dark:bg-transparent backdrop-blur-sm">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">{svc.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                      {svc.text}
                    </p>
                    <div className="mt-8">
                      <button onClick={() => { setCurrentView('gallery'); window.scrollTo(0, 0); }} className="text-[#FF5E00] font-bold text-sm uppercase tracking-widest group-hover:tracking-[0.2em] transition-all duration-300 flex items-center gap-2">
                        Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex justify-center"
          >
            <button 
              onClick={() => { setCurrentView('gallery'); window.scrollTo(0, 0); }}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-widest overflow-hidden transition-transform hover:scale-105 shadow-xl shadow-black/20 dark:shadow-white/10"
            >
              <span className="relative z-10 flex items-center gap-2">Enter The Gallery <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
              <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 z-10 font-bold uppercase tracking-widest transition-opacity duration-300 pointer-events-none flex gap-2">Enter The Gallery <ArrowRight className="w-5 h-5" /></span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Work */}
      {/* Featured Work */}
      <section id="work" className="py-24 bg-white dark:bg-[#16161A] border-t border-gray-200 dark:border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">
          <motion.div {...fadeUp} className="mb-12 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Featured Work</h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] rounded-full mb-8"></div>
            
            {/* Pinterest-style Pill Nav for Gallery */}
            <div className="inline-flex items-center gap-1 p-1.5 bg-[#1F1F24] rounded-[32px] shadow-2xl relative shadow-black/50 border border-white/5">
              {['All', 'Images', 'Video'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveGalleryFilter(filter)}
                  className={`relative px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-colors z-10 ${
                    activeGalleryFilter === filter 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {activeGalleryFilter === filter && (
                    <motion.div
                      layoutId="gallery-filter-pill"
                      className="absolute inset-0 bg-[#E60023] rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{
                        boxShadow: '0px 4px 10px rgba(230,0,35,0.4)',
                      }}
                    />
                  )}
                  {filter}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {assets.filter(asset => activeGalleryFilter === 'All' ? true : activeGalleryFilter === 'Images' ? asset.type === 'image' : asset.type === 'video').length > 0 ? (
              assets.filter(asset => activeGalleryFilter === 'All' ? true : activeGalleryFilter === 'Images' ? asset.type === 'image' : asset.type === 'video').map((item, i) => (
              <motion.div 
                key={item.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (i % 6) * 0.1 }}
                className={`group relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] backdrop-blur-sm cursor-pointer aspect-square ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                onClick={() => setCurrentView('gallery')}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 z-10 pointer-events-none"></div>
                
                {/* Visual */}
                {item.type === 'video' ? (
                  <video src={item.url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" muted loop playsInline autoPlay={false} onMouseOver={e => (e.target as HTMLVideoElement).play()} onMouseOut={e => (e.target as HTMLVideoElement).pause()} />
                ) : item.type === 'image' ? (
                  <img src={item.url} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                   <div className="absolute inset-0 opacity-20 group-hover:scale-105 transition-transform duration-700 ease-out flex items-center justify-center bg-gray-900 dark:bg-transparent"
                     style={{
                       backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                       backgroundSize: '24px 24px'
                     }}>
                   </div>
                )}
                
                <div className="absolute bottom-0 left-0 p-8 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 w-full pointer-events-none">
                  <p className="text-brand-gradient font-bold text-sm mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 uppercase tracking-wider text-[#FF5E00]">{item.category}</p>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  {item.tags && (
                    <span className="text-sm font-medium text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {(Array.isArray(item.tags) ? item.tags : typeof item.tags === 'string' ? item.tags.split(',') : [])
                        .map((t: string) => `#${t.trim()}`)
                        .join(' ')}
                    </span>
                  )}
                </div>
              </motion.div>
            ))) : (
              <div className="col-span-full py-24 text-center">
                <p className="text-gray-500 font-medium">No featured work available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Capabilities & How It Works */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        
        {/* Subtle Ambient Background Neon Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#FF5E00]/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#219EBC]/10 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Capabilities */}
          <motion.div {...fadeUp} className="mb-20 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">What we can create</h3>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {capabilities.map((cap, i) => (
                <span key={i} className="px-5 py-2.5 rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white font-bold text-xs sm:text-sm shadow-sm hover:border-[#FF5E00] dark:hover:border-[#FF5E00] hover:text-[#FF5E00] transition-all cursor-default">
                  {cap}
                </span>
              ))}
            </div>
          </motion.div>

          {/* How It Works Container with Continuous Glowing Flowing Neon Boundary */}
          <div className="relative group">
            {/* Ambient Flowing Neon Glow Blur behind container */}
            <div className="absolute -inset-1 rounded-[36px] neon-flow-border blur-xl opacity-40 dark:opacity-60 transition-opacity duration-700 pointer-events-none" />

            {/* Glowing Flowing Neon Border Wrapper */}
            <div className="relative p-[2px] rounded-[36px] neon-flow-border shadow-2xl shadow-orange-500/10">
              
              {/* Inner Dark / Light Box */}
              <div className="bg-gray-50/95 dark:bg-[#0E0E14] rounded-[34px] p-6 sm:p-10 md:p-14 relative overflow-hidden backdrop-blur-xl">
                
                {/* Subtle Inner Glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5E00]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00F5D4]/5 rounded-full blur-3xl pointer-events-none" />

                <motion.div {...fadeUp}>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5E00]/10 border border-[#FF5E00]/30 text-[#FF5E00] text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(255,94,0,0.15)]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Execution Pipeline</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        How it works.
                      </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md font-medium text-sm sm:text-base leading-relaxed">
                      A streamlined creative pipeline built for velocity, craftsmanship, and production-grade deliverables.
                    </p>
                  </div>
                  
                  {/* 4 Clean Process Steps Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                    {effectiveSteps.map((step, i) => {
                      const IconComponent = step.icon;
                      return (
                        <motion.div 
                          key={step.num || i}
                          initial={{ opacity: 0, y: 25 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          className="relative group/card rounded-2xl p-6 bg-white dark:bg-[#16161D] border border-gray-200 dark:border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl overflow-hidden"
                        >
                          {/* Corner Ambient Glow on Card Hover */}
                          <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover/card:opacity-25 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${step.glowGradient}`} />

                          <div>
                            {/* Top Row: Neon Bright Number + Circular Process Graphic surrounded by Neon Ring */}
                            <div className="flex items-center justify-between gap-4 mb-6">
                              {/* Neon Bright Number */}
                              <span className={`text-5xl font-black font-mono tracking-tighter leading-none transition-transform duration-300 group-hover/card:scale-105 ${step.neonNumber}`}>
                                {step.num}
                              </span>

                              {/* Circular Graphical Image with Neon Surround */}
                              <div className="relative shrink-0">
                                {/* Ambient Glow */}
                                <div className={`absolute -inset-1 rounded-full blur-md opacity-60 group-hover/card:opacity-100 transition-opacity duration-300 bg-gradient-to-tr ${step.glowGradient}`} />
                                
                                {/* Neon Ring */}
                                <div className={`relative p-[2px] rounded-full bg-gradient-to-tr ${step.glowGradient} ${step.neonRing} transition-all duration-300 group-hover/card:scale-105`}>
                                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-black relative">
                                    <img 
                                      src={step.image} 
                                      alt={step.title}
                                      className="w-full h-full object-cover grayscale-[15%] group-hover/card:grayscale-0 group-hover/card:scale-110 transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover/card:bg-transparent transition-colors duration-300" />
                                  </div>

                                  {/* Floating Neon Icon Badge */}
                                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#16161D] border border-white/20 text-white flex items-center justify-center shadow-md">
                                    <IconComponent className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Step Details - Clean and Uncluttered */}
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover/card:text-[#FF5E00] transition-colors">
                              {step.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed font-normal">
                              {step.desc}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Join Us / Careers Section (For talent who want jobs & gigs) */}
      <JoinUsSection careers={settings.careersList} />

      {/* About & Team */}
      <section id="about" className="py-24 bg-white dark:bg-white/[0.02] border-y border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp} className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">About GIGSPACE</h2>
              <div className="w-20 h-1.5 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] rounded-full"></div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              We are a multi-disciplinary creative studio bridging the gap between bold imagination and pristine execution.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Our philosophy is simple: Design with purpose. Whether operating from our core office or collaborating seamlessly online with global partners, we treat every project as a unique canvas to tell your story.
            </p>
            
            <div className="pt-4 space-y-3">
              {whyUs.map((trait, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#219EBC]" />
                  <span className="font-bold text-gray-900 dark:text-white">{trait}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4">
            {effectiveTeam.map((member, i) => (
              <div key={i} className="group relative rounded-3xl p-[2px] transition-all duration-300 hover:scale-[1.03]">
                {/* Sharp Neon Flowing Strip Border (No Blur) */}
                <div className={`absolute -inset-[1.5px] rounded-[26px] bg-gradient-to-r ${member.neon} opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div className="relative p-6 bg-[#12131A] dark:bg-[#12131A] rounded-[24px] flex flex-col items-center text-center shadow-xl overflow-hidden">
                  
                  {/* Circular Frame for PPF / Cartoon Fallback */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] bg-gradient-to-tr from-white/20 to-white/5 mb-4 shadow-inner">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#1a1b22] relative flex items-center justify-center">
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = member.cartoon;
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-sm tracking-tight">{member.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5 font-medium">{member.role}</p>

                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social / Creative Presence */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeUp} className="mb-12 text-center">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Creative Presence</h2>
            <p className="text-gray-600 dark:text-gray-400">See what we're sharing on the timelines.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                platform: 'Instagram',
                handle: settings.socialInstagram || '@gigspace.studio',
                tagline: 'Visual Reels & Stories',
                cartoon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=instagram-artist&backgroundColor=ffdfbf',
                gradient: 'from-[#FF5E00] via-[#F72585] to-[#7209B7]',
                badgeColor: 'bg-pink-500/15 text-pink-400 border-pink-500/40'
              },
              {
                platform: 'X (Twitter)',
                handle: settings.socialTwitter || '@gigspace_live',
                tagline: 'Design Drops & Threads',
                cartoon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=twitter-coder&backgroundColor=c0ebff',
                gradient: 'from-[#38BDF8] via-[#818CF8] to-[#2563EB]',
                badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40'
              },
              {
                platform: 'Behance',
                handle: settings.socialBehance || 'gigspace-design',
                tagline: 'Case Studies & Craft',
                cartoon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=behance-designer&backgroundColor=d1d5db',
                gradient: 'from-[#2563EB] via-[#93C5FD] to-[#3B82F6]',
                badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/40'
              },
              {
                platform: 'TikTok',
                handle: settings.socialTiktok || '@gigspace_motion',
                tagline: 'Short-Form Motion',
                cartoon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=dribbble-shot&backgroundColor=ffd1dc',
                gradient: 'from-[#EA4C89] via-[#F43F5E] to-[#FFBE0B]',
                badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/40'
              }
            ].map((social, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative rounded-3xl p-[2px] transition-all duration-300 hover:scale-[1.03] cursor-pointer"
              >
                {/* Sharp Neon Flowing Strip Border (No Blur) */}
                <div className={`absolute -inset-[1.5px] rounded-[26px] bg-gradient-to-r ${social.gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div className="relative aspect-square bg-[#12131A] rounded-[24px] p-5 flex flex-col justify-between overflow-hidden shadow-xl">
                  
                  {/* Cartoon Character Holding/Interacting with Platform Logo */}
                  <div className="absolute inset-0 z-0 flex items-center justify-center pt-8">
                    <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 p-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <img 
                        src={social.cartoon} 
                        alt={social.platform} 
                        className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12131A] via-[#12131A]/40 to-transparent" />
                  </div>

                  {/* Top Bar: Social Badge & Real Logo SVG */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide border backdrop-blur-md uppercase ${social.badgeColor}`}>
                      {social.platform}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-inner border border-white/20">
                      {social.platform.includes('Instagram') && (
                        <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      )}
                      {social.platform.includes('Twitter') && (
                        <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      )}
                      {social.platform.includes('Behance') && (
                        <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-4.726 3-3.294 0-5.5-2.5-5.5-5.5s2.206-5.5 5.5-5.5c2.697 0 4.284 1.703 4.726 3h-2.316c-.309-.641-1.119-1.3-2.41-1.3-1.95 0-3.25 1.35-3.25 3.3s1.3 3.3 3.25 3.3c1.291 0 2.101-.659 2.41-1.3h2.316zm-11.726-7.5h-5.5v7h5.5c2.091 0 3.5-1.409 3.5-3.5s-1.409-3.5-3.5-3.5zm0 5.5h-3v-3.5h3c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5zm-5.5-9.5h-5.5v2h5.5v-2z"/>
                        </svg>
                      )}
                      {social.platform.includes('TikTok') && (
                        <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43c.534-.53.943-1.168 1.2-1.87.16-.48.24-1 .24-1.53V8.8a8.28 8.28 0 0 0 4.29 1.19v-3.3z"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: Handle & Corresponding Typography Tagline */}
                  <div className="relative z-10 pt-4 bg-[#12131A]/80 backdrop-blur-md p-3 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{social.tagline}</p>
                    <h4 className="text-xs font-black text-white tracking-tight mt-0.5 group-hover:text-[#FF5E00] transition-colors">
                      {social.handle}
                    </h4>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA & Contact Section */}
      <section id="contact" className="py-24 bg-white dark:bg-[#16161A] border-t border-gray-200 dark:border-white/5 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#FF5E00]/5 to-transparent blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div {...fadeUp} className="space-y-8 z-10">
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tighter">
                Have an idea? <br/>
                <span className="text-brand-gradient">Let's create it.</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
                Reach out to us for project inquiries, collaborations, or just to say hello. We are ready to build the next big thing with you.
              </p>
              
              <div className="space-y-6 pt-4">
                <a href={`tel:${settings.contactPhone || '+256700000000'}`} className="flex items-center gap-4 text-gray-900 dark:text-white hover:text-[#FF5E00] dark:hover:text-[#FF5E00] transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:border-[#FF5E00]/30">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">Call / WhatsApp</div>
                    <div className="font-medium text-lg">{settings.contactPhone || "+256 700 000 000"}</div>
                  </div>
                </a>
                
                <a href={`mailto:${settings.contactEmail || 'colline@gigspace.agency'}`} className="flex items-center gap-4 text-gray-900 dark:text-white hover:text-[#219EBC] dark:hover:text-[#219EBC] transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:border-[#219EBC]/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">Email Us</div>
                    <div className="font-medium text-lg">{settings.contactEmail || "colline@gigspace.agency"}</div>
                  </div>
                </a>
              </div>
            </motion.div>
            
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="z-10">
              <form 
                onSubmit={async (e) => {
                   e.preventDefault();
                   const target = e.target as typeof e.target & {
                     name: { value: string };
                     email: { value: string };
                     contact: { value: string };
                     details: { value: string };
                   };
                   
                   try {
                     await LeadsService.create({
                       name: target.name.value,
                       email: target.email.value,
                       message: `${target.details.value}${target.contact.value ? ` | Contact: ${target.contact.value}` : ''}`,
                       service: 'General Creative Inquiry'
                     });
                     
                     target.name.value = '';
                     target.email.value = '';
                     target.contact.value = '';
                     target.details.value = '';
                     alert('Thank you! Your inquiry has been submitted to the studio.');
                   } catch (err) {
                     console.error("Failed to submit lead", err);
                     alert('There was an issue submitting. Please try again.');
                   }
                 }}
                className="bg-gray-50 dark:bg-[#1E1E24] p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl shadow-gray-200/50 dark:shadow-none space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Your Name</label>
                  <input name="name" required type="text" placeholder="John Doe" className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5E00] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Email Address</label>
                  <input name="email" required type="email" placeholder="john@example.com" className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5E00] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Phone / Social Handle</label>
                  <input name="contact" type="text" placeholder="@username or +1 234..." className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5E00] transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Project Details</label>
                  <textarea name="details" required rows={4} placeholder="Tell us about your idea..." className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5E00] transition-colors resize-none"></textarea>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-[#FF5E00]/20 flex justify-center items-center gap-2">
                  Send Enquiry <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-black/60 border-t border-gray-200 dark:border-white/5 mt-auto pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-12 border-b border-gray-200 dark:border-white/5 pb-12 text-center lg:text-left">
            <div>
              <div className="text-3xl font-heading font-black tracking-tighter text-gray-900 dark:text-white uppercase mb-2 flex justify-center lg:justify-start">
                {['G','i','g','S','p','a','c','e'].map((letter, i) => (
                  <span 
                    key={i} 
                    onClick={() => handleLetterClick(letter)} 
                    className="cursor-pointer select-none"
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <div className="text-[10px] tracking-widest font-black text-gray-500 uppercase">Create • Design • Inspire</div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              <button onClick={() => scrollTo('services')} className="hover:text-[#FF5E00] transition-colors">Services</button>
              <button onClick={() => scrollTo('work')} className="hover:text-[#219EBC] transition-colors">Work</button>
              <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#FF9E00] transition-colors">Process</button>
              <button onClick={() => scrollTo('careers')} className="hover:text-[#FF5E00] text-[#FF5E00] transition-colors">Careers</button>
              <button onClick={() => scrollTo('about')} className="hover:text-[#FFB703] transition-colors">About</button>
              <button onClick={() => scrollTo('contact')} className="hover:text-[#FF5E00] transition-colors">Contact</button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] tracking-widest font-medium text-gray-500 uppercase">
            <p>© {new Date().getFullYear()} GigSpace. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
      </>
      )}
    </div>
  );
}
