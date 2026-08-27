import React, { useState } from 'react';

interface Sponsor {
  id: string;
  name: string;
  logoText?: string;
  color?: string;
  logoUrl?: string;
}

interface LogoTickerProps {
  sponsors: Sponsor[];
}

export function LogoTicker({ sponsors }: LogoTickerProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (!sponsors || sponsors.length === 0) return null;

  // Duplicate list to ensure seamless infinite looping
  const items = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="w-full py-10 bg-[#09090F] border-y border-white/10 relative overflow-hidden select-none">
      {/* Gradient fade masks on left and right */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-[#09090F] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-[#09090F] to-transparent z-10 pointer-events-none"></div>

      <div className="flex overflow-hidden relative w-full">
        <div className="flex animate-marquee items-center gap-8 sm:gap-12 whitespace-nowrap py-2">
          {items.map((sponsor, index) => {
            const hasValidImage = sponsor.logoUrl && !imageErrors[sponsor.id];
            const accentColor = sponsor.color || '#FF5E00';
            
            return (
              <div 
                key={`${sponsor.id}-${index}`}
                className="flex items-center gap-3 sm:gap-4 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/[0.06] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] group cursor-default"
              >
                {/* 1:1 SQUARE FORM LOGO CONTAINER */}
                <div 
                  className="w-11 h-11 sm:w-12 sm:h-12 aspect-square flex-shrink-0 bg-[#161622] rounded-xl overflow-hidden flex items-center justify-center p-2 border border-white/10 shadow-inner group-hover:border-white/20 transition-all"
                  style={{ boxShadow: `0 0 12px ${accentColor}15` }}
                >
                  {hasValidImage ? (
                    <img 
                      src={sponsor.logoUrl} 
                      className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105" 
                      alt={sponsor.name}
                      onError={() => handleImageError(sponsor.id)}
                    />
                  ) : (
                    <div 
                      className="w-full h-full rounded-lg flex items-center justify-center font-black text-white text-base shadow-sm"
                      style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}50` }}
                    >
                      {sponsor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <span 
                  className="text-base sm:text-lg font-black tracking-tight uppercase font-mono transition-colors text-white/90 group-hover:text-white"
                  style={{ color: sponsor.color || '#fff' }}
                >
                  {sponsor.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 32s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

