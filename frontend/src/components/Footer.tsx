import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white/90 backdrop-blur-md border-t border-gray-100 py-3 px-4 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] sm:text-xs text-gray-400 font-medium tracking-wide">
        
        {/* Left Side: Branding */}
        <div className="flex items-center gap-2">
          <span className="text-gray-300">Powered by</span>
          <span className="font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            Kiwi Interio Engine
          </span>
          <span className="text-[9px] bg-red-50 text-red-500 font-bold px-1.5 py-0.5 rounded-md">
            v2.1
          </span>
        </div>

        {/* Right Side: Security Badge & Copyright */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-gray-400">
            {/* Inline Lock SVG to prevent dependency breakage */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="w-3 h-3 text-emerald-500"
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Secure End-to-End Encryption</span>
          </div>
          
          <span className="text-gray-400/80">
            © {new Date().getFullYear()} Kiwi Clean. All rights reserved.
          </span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;