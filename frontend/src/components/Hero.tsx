import useDocumentTitle from "../hooks/useDocumentTitle";

function Hero() {
  useDocumentTitle("Powered By Kiwi Interio | Premium Designs");

  return (
    // 🟢 TOP PADDING FIXED: pt-6 lg:pt-10 kar di hai taaki gap khatam ho jaye
    <section className="relative bg-white text-black pt-6 lg:pt-10 pb-24 lg:pb-36 px-6 lg:px-16 overflow-hidden">
      {/* Structural Thin Grid Line for Luxury Editorial Feel */}
      <div className="absolute top-0 left-1/2 w-px h-full bg-stone-100 -z-10 hidden lg:block" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side Content - 6 Columns Width */}
        <div className="lg:col-span-6 space-y-10">
          
          {/* Subtle Accent Tag */}
          <div className="inline-flex items-center gap-3 border-b-2 border-red-600 pb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-black" />
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-black">
              INTERIOR DESIGN IN BEWARI
            </p>
          </div>

          {/* Luxury High-Contrast Typography */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.95] text-black">
            Premium <br />
            Interiors, <br />
            <span className="text-red-600">Designed For</span> <br />
            Bewari Homes.
          </h1>

          {/* Clean Editorial Description */}
          <p className="text-stone-500 text-lg leading-relaxed max-w-md font-light tracking-wide">
            Kiwi Interiors creates beautiful, modern, and comfortable spaces specially crafted for families and homes in Bewari. From bedrooms to luxury living rooms, we turn ideas into elegant interiors.
          </p>

          {/* Premium Sharp Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="bg-black hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-10 py-5 rounded-none transition-colors duration-300 shadow-xl">
              Explore Masterpieces
            </button>
            <button className="border-2 border-black hover:border-red-600 hover:text-red-600 text-black text-xs font-bold uppercase tracking-widest px-10 py-5 rounded-none transition-colors duration-300">
              Contact Us
            </button>
          </div>

          {/* Architectural Luxury Metrics */}
          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-stone-100 max-w-sm">
            <div>
              <p className="text-2xl font-bold tracking-tight text-black">10X THIN</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Performance Build</p>
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-red-600">BESPOKE</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Luxury Finish</p>
            </div>
          </div>
        </div>

        {/* Right Side Image Layout with Custom Pop-Up Button */}
        <div className="lg:col-span-6 relative group cursor-pointer overflow-hidden rounded-none border border-stone-200 shadow-2xl">
          
          {/* Main Showcase Premium Image */}
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6"
            alt="Kiwi Interio Premium Design"
            className="w-full h-[550px] lg:h-[650px] object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-105"
          />

          {/* THE LUXURY KIWI-INTERIO BUTTON POP-UP OVERLAY */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center">
            
            {/* The 10x Thin Industrial Button Type Card */}
            <div className="bg-black border border-red-600 text-white pl-8 pr-6 py-5 rounded-none shadow-[0_25px_50px_-12px_rgba(220,38,38,0.25)] transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out flex items-center gap-8">
              <div className="text-left">
                <p className="text-xs text-red-500 font-bold uppercase tracking-[0.2em] m-0 p-0 mb-1">DESIGN STUDIO</p>
                <p className="text-xl font-black text-white uppercase tracking-tight m-0 p-0">KIWI INTERIO</p>
              </div>
              
              {/* Ultra Thin Minimalist White Arrow Element */}
              <div className="w-12 h-12 bg-white text-black flex items-center justify-center text-2xl font-light rounded-none transition-transform duration-300 group-hover:translate-x-1">
                →
              </div>
            </div>

          </div>

          {/* Minimal Brand Identity Label (Bottom Right) */}
          <div className="absolute bottom-6 right-6 bg-white border border-stone-200 px-4 py-2 text-black text-[10px] font-bold uppercase tracking-[0.2em] shadow-md">
            Powered By Kiwi AI
          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;