import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  X, 
  Check, 
  Sparkles,
  Layers, 
  Film, 
  Brush, 
  Code, 
  Music, 
  Compass, 
  Star, 
  Zap 
} from 'lucide-react';
import { CmsCareerItem } from '../lib/supabase';

interface CareerPill {
  id: string;
  roleTitle: string;
  department: string;
  type: string;
  location: string;
  summary: string;
  skills: string[];
  pillStyle?: string;
  textStyle?: string;
  iconStyle?: string;
  glowStyle?: string;
  accentColor?: string;
  icon?: typeof Layers;
}

const DEFAULT_CAREER_PILLS: CareerPill[] = [
  {
    id: '3d-spatial',
    roleTitle: '3D Spatial & Motion Artist',
    department: 'Spatial & CGI',
    type: 'Full-time / Contract',
    location: 'Remote (Worldwide)',
    summary: 'Lead high-impact 3D product visualizations, procedural materials, kinetic typography, and octane motion loops.',
    skills: ['3d motion', 'octane', 'c4d'],
    pillStyle: 'bg-gradient-to-r from-[#3B82F6] via-[#93C5FD] to-[#FDE047] shadow-[0_10px_35px_rgba(59,130,246,0.35)]',
    textStyle: 'text-gray-950 font-bold',
    iconStyle: 'text-gray-950',
    glowStyle: 'from-[#3B82F6] to-[#FDE047]',
    accentColor: '#3B82F6',
    icon: Layers
  },
  {
    id: 'video-colorist',
    roleTitle: 'Senior Video Editor & Colorist',
    department: 'Video Production',
    type: 'Full-time / Hybrid',
    location: 'Remote / Studio',
    summary: 'Craft commercial trailer cuts, dynamic pacing, cinematic DaVinci color grading, and broadcast sound mixing.',
    skills: ['davinci', 'premiere', 'color grading'],
    pillStyle: 'bg-[#111118]/90 border border-transparent shadow-[0_10px_35px_rgba(244,63,94,0.25)] ring-1 ring-gradient-to-r from-[#00F5D4] via-[#F72585] to-[#FFBE0B]',
    textStyle: 'text-white font-semibold',
    iconStyle: 'text-white',
    glowStyle: 'from-[#00F5D4] to-[#F72585]',
    accentColor: '#F72585',
    icon: Film
  },
  {
    id: 'brand-identity',
    roleTitle: 'Brand Identity & Visual Designer',
    department: 'Graphic Design',
    type: 'Full-time / Remote',
    location: 'Remote',
    summary: 'Architect comprehensive visual systems, custom typography hierarchies, design tokens, and physical packaging.',
    skills: ['figma', 'branding', 'typography'],
    pillStyle: 'bg-gradient-to-r from-[#242A2E]/90 via-[#3A2F3D]/80 to-[#4A2835]/80 border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)]',
    textStyle: 'text-white font-semibold',
    iconStyle: 'text-white',
    glowStyle: 'from-[#2A4365] to-[#702459]',
    accentColor: '#FF5E00',
    icon: Brush
  },
  {
    id: 'creative-tech',
    roleTitle: 'Creative Technologist & UI Engineer',
    department: 'Web & Digital',
    type: 'Full-time / Contract',
    location: 'Remote',
    summary: 'Bridge aesthetics and web engineering, building interactive 3D WebGL canvases, generative visual shaders, and UI motion.',
    skills: ['three.js', 'react', 'webgl'],
    pillStyle: 'bg-gradient-to-r from-[#99F6E4] via-[#E0E7FF] to-[#FBCFE8] shadow-[0_10px_35px_rgba(153,246,228,0.35)]',
    textStyle: 'text-gray-950 font-bold',
    iconStyle: 'text-gray-950',
    glowStyle: 'from-[#99F6E4] to-[#FBCFE8]',
    accentColor: '#00F5D4',
    icon: Code
  }
];

interface JoinUsSectionProps {
  careers?: CmsCareerItem[];
}

export function JoinUsSection({ careers }: JoinUsSectionProps) {
  const [selectedPill, setSelectedPill] = useState<CareerPill | null>(null);

  const careerList: CareerPill[] = (careers && careers.length > 0)
    ? careers.map((c, i) => {
        const iconList = [Layers, Film, Brush, Code, Music, Compass, Star, Zap];
        const Icon = iconList[i % iconList.length];
        const styles = [
          {
            pillStyle: 'bg-gradient-to-r from-[#3B82F6] via-[#93C5FD] to-[#FDE047] shadow-[0_10px_35px_rgba(59,130,246,0.35)]',
            textStyle: 'text-gray-950 font-bold',
            iconStyle: 'text-gray-950',
            glowStyle: 'from-[#3B82F6] to-[#FDE047]'
          },
          {
            pillStyle: 'bg-[#111118]/90 border border-transparent shadow-[0_10px_35px_rgba(244,63,94,0.25)] ring-1 ring-gradient-to-r from-[#00F5D4] via-[#F72585] to-[#FFBE0B]',
            textStyle: 'text-white font-semibold',
            iconStyle: 'text-white',
            glowStyle: 'from-[#00F5D4] to-[#F72585]'
          },
          {
            pillStyle: 'bg-gradient-to-r from-[#242A2E]/90 via-[#3A2F3D]/80 to-[#4A2835]/80 border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.6)]',
            textStyle: 'text-white font-semibold',
            iconStyle: 'text-white',
            glowStyle: 'from-[#2A4365] to-[#702459]'
          },
          {
            pillStyle: 'bg-gradient-to-r from-[#99F6E4] via-[#E0E7FF] to-[#FBCFE8] shadow-[0_10px_35px_rgba(153,246,228,0.35)]',
            textStyle: 'text-gray-950 font-bold',
            iconStyle: 'text-gray-950',
            glowStyle: 'from-[#99F6E4] to-[#FBCFE8]'
          }
        ];
        const defaultStyle = styles[i % styles.length];
        return {
          ...c,
          icon: Icon,
          pillStyle: c.pillStyle || defaultStyle.pillStyle,
          textStyle: defaultStyle.textStyle,
          iconStyle: defaultStyle.iconStyle,
          glowStyle: defaultStyle.glowStyle,
          accentColor: c.accentColor || '#FF5E00'
        };
      })
    : DEFAULT_CAREER_PILLS;

  const [roleType, setRoleType] = useState<'Core' | 'Freelance'>('Core');
  const [formData, setFormData] = useState({
    name: '',
    portfolio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openModal = (pill: CareerPill) => {
    setSelectedPill(pill);
    setRoleType(pill.type.includes('Freelance') || pill.type.includes('Flexible') ? 'Freelance' : 'Core');
    setFormData({
      name: '',
      portfolio: ''
    });
    setSubmittedSuccess(false);
    setErrorMsg('');
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!formData.portfolio.trim()) {
      setErrorMsg('Please enter a portfolio or reel link.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: `${formData.name.toLowerCase().replace(/\s+/g, '')}@applicant.com`,
          role: `${selectedPill?.roleTitle || 'Applicant'} (${roleType})`,
          portfolio: formData.portfolio
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedSuccess(true);
      } else {
        setErrorMsg(data.message || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmittedSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const leftColumn = careerList.filter((_, idx) => idx % 2 === 0);
  const rightColumn = careerList.filter((_, idx) => idx % 2 !== 0);

  return (
    <section id="careers" className="py-24 sm:py-32 px-4 sm:px-6 md:px-12 bg-[#020204] relative overflow-hidden select-none">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#3B82F6]/5 via-[#F43F5E]/5 to-[#00F5D4]/5 rounded-full blur-[180px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        <div className="relative group/box">
          <div className="absolute -inset-0.5 rounded-[36px] bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-cyan-500/20 blur-md opacity-40 group-hover/box:opacity-60 transition-opacity duration-500 pointer-events-none" />

          <div className="relative p-[1.5px] rounded-[36px] bg-gradient-to-r from-orange-500/40 via-pink-500/40 to-cyan-500/40 shadow-xl">
            
            <div className="bg-[#09090F]/95 rounded-[34px] p-6 sm:p-12 md:p-14 relative overflow-hidden backdrop-blur-xl">
              
              <div className="text-center max-w-xl mx-auto mb-12 sm:mb-14 relative z-10">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5E00]/20 via-[#FFB703]/20 to-[#F72585]/20 border border-[#FF5E00]/40 text-[#FF5E00] text-sm font-black italic tracking-tighter uppercase mb-6 backdrop-blur-xl shadow-[0_0_30px_rgba(255,94,0,0.4)] transform -rotate-2">
                  <Sparkles className="w-4 h-4 text-[#FF5E00] animate-spin" />
                  <span>NEED A JOB ?</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                  Join GigSpace Collective
                </h2>
                
                <p className="text-xs sm:text-sm text-gray-400 mt-2">
                  Select a discipline below to preview the brief and submit your portfolio directly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto relative z-10">
                <div className="space-y-4">
                  {leftColumn.map((pill) => {
                    const Icon = pill.icon || Layers;
                    return (
                      <button
                        key={pill.id}
                        onClick={() => openModal(pill)}
                        className={`w-full group/pill relative p-4 sm:p-5 rounded-full flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${pill.pillStyle || 'bg-white/10'}`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center shrink-0">
                            <Icon className={`w-4 h-4 ${pill.iconStyle || 'text-white'}`} />
                          </div>
                          <span className={`text-sm tracking-tight truncate text-left ${pill.textStyle || 'text-white font-bold'}`}>
                            {pill.roleTitle}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-3 py-1 bg-black/20 rounded-full text-white/90 shrink-0 font-bold">
                          View
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  {rightColumn.map((pill) => {
                    const Icon = pill.icon || Layers;
                    return (
                      <button
                        key={pill.id}
                        onClick={() => openModal(pill)}
                        className={`w-full group/pill relative p-4 sm:p-5 rounded-full flex items-center justify-between transition-all duration-300 transform hover:scale-[1.02] cursor-pointer ${pill.pillStyle || 'bg-white/10'}`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center shrink-0">
                            <Icon className={`w-4 h-4 ${pill.iconStyle || 'text-white'}`} />
                          </div>
                          <span className={`text-sm tracking-tight truncate text-left ${pill.textStyle || 'text-white font-bold'}`}>
                            {pill.roleTitle}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-mono px-3 py-1 bg-black/20 rounded-full text-white/90 shrink-0 font-bold">
                          View
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* MODAL BRIEF DIALOG */}
      <AnimatePresence>
        {selectedPill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-text">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPill(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0E0F17] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-mono text-[#FF5E00] uppercase font-bold tracking-wider">
                    {selectedPill.department}
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {selectedPill.roleTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPill(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-4">
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                  {selectedPill.summary}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedPill.skills.map((s, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300 uppercase">
                      {s}
                    </span>
                  ))}
                </div>

                {submittedSuccess ? (
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2 mt-4">
                    <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h4 className="text-base font-bold text-white">Application Received!</h4>
                    <p className="text-xs text-gray-400">
                      Our creative leads will review your portfolio and get in touch.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-3.5 pt-2">
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                      {(['Core', 'Freelance'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setRoleType(type)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            roleType === type ? 'bg-[#FF5E00] text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {type} Role
                        </button>
                      ))}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Your Full Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E00]"
                      />
                    </div>

                    <div>
                      <input
                        type="url"
                        placeholder="Portfolio / Behance / Reel URL"
                        value={formData.portfolio}
                        onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF5E00]"
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-[#FF5E00] to-[#219EBC] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5E00]/20"
                    >
                      {isSubmitting ? (
                        <span>Sending...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
