import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-transparent to-slate-900 text-slate-300 pt-10 mt-auto border-t border-slate-800/40 font-sans">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Main Grid Structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800/60">
          
          {/* Brand Vision Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-red-500 rounded-full animate-pulse" />
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                Kiwi Interio <span className="text-red-500">✨</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Aapke sapno ke ghar ko haqeeqat banane ke liye modern designs aur premium automated budget optimization ka perfect blend.
            </p>
          </div>

          {/* Quick Creative Tagline Section */}
          <div className="flex flex-col justify-center space-y-1 bg-slate-800/30 rounded-2xl p-4 border border-slate-700/20 backdrop-blur-sm">
            <span className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Design Philosophy</span>
            <p className="text-xs font-semibold text-slate-200 italic">
              "Your space should tell the story of who you are, and be a collection of what you love."
            </p>
          </div>

          {/* Core Feature Badges */}
          <div className="flex flex-col justify-center space-y-2.5 sm:pl-8">
            <div className="flex items-center gap-2 text-xs font-medium hover:text-white transition-colors duration-200 cursor-pointer">
              <span className="text-red-500 text-sm">✦</span> 100+ Premium Catalogs
            </div>
            <div className="flex items-center gap-2 text-xs font-medium hover:text-white transition-colors duration-200 cursor-pointer">
              <span className="text-red-500 text-sm">✦</span> Real-Time Smart RAG Engine
            </div>
            <div className="flex items-center gap-2 text-xs font-medium hover:text-white transition-colors duration-200 cursor-pointer">
              <span className="text-red-500 text-sm">✦</span> Secured Data Architecture
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Engine Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-3 text-[11px] text-slate-500 font-medium">
          
          {/* Left Block */}
          <div className="flex items-center gap-2.5">
            <span>Engine Status:</span>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Operational v2.1
            </div>
          </div>

          {/* Right Block */}
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()}</span>
            <span className="text-slate-400 font-bold hover:text-red-500 transition-colors duration-200 cursor-pointer">Kiwi Clean</span>
            <span>• All rights reserved.</span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;