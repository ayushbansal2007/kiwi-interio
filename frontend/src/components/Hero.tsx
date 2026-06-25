import {  useRef } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import interiorVideo from "../assets/3967-175963622_medium.mp4";
import type { ReactElement } from "react";

function Hero(): ReactElement {
  useDocumentTitle("Powered By Kiwi Interio | Premium Designs");
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    // 🟢 GLOBAL CONTAINER
    <div className="bg-white">
      
      {/* ─── SECTION 1: HERO TEXT & SHOWCASE ─── */}
      <section className="relative text-black pt-4 md:pt-10 pb-16 lg:pb-20 px-4 sm:px-6 lg:px-16 overflow-hidden">
        {/* Structural Thin Grid Line */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-stone-100 -z-10 hidden lg:block" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Side Content */}
          <div className="lg:col-span-6 space-y-6 md:space-y-10 order-2 lg:order-1">
            {/* Accent Tag */}
            <div className="inline-flex items-center gap-3 border-b-2 border-red-600 pb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <p className="text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase text-black">
                INTERIOR DESIGN IN BHIWANI
              </p>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.95] text-gray-900">
              Premium <br className="hidden sm:block" />
              Interiors, <br />
              <span className="text-red-600">Designed For</span> <br />
              Bhiwani Homes.
            </h1>

            {/* Description */}
            <p className="text-stone-500 text-sm md:text-lg leading-relaxed max-w-md font-light tracking-wide">
              Kiwi Interiors creates beautiful, modern, and comfortable spaces specially crafted for families and homes in Bhiwani. From boutique bedrooms to luxury living lounges, we scale ideas into built realities.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button className="w-full sm:w-auto bg-black hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-8 py-4 md:py-5 rounded-none transition-colors duration-300 shadow-xl">
                Explore Masterpieces
              </button>
              <button className="w-full sm:w-auto border-2 border-black hover:border-red-600 hover:text-red-600 text-black text-xs font-bold uppercase tracking-widest px-8 py-4 md:py-5 rounded-none transition-colors duration-300">
                Contact Us
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-stone-100 max-w-sm">
              <div>
                <p className="text-xl md:text-2xl font-black tracking-tight text-black">10X THIN</p>
                <p className="text-[9px] md:text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Performance Build</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black tracking-tight text-red-600">BESPOKE</p>
                <p className="text-[9px] md:text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Luxury Finish</p>
              </div>
            </div>
          </div>

          {/* Right Side Image */}
          <div className="lg:col-span-6 order-1 lg:order-2 relative group cursor-pointer overflow-hidden rounded-none border border-stone-100 shadow-xl lg:shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6"
              alt="Kiwi Interio Premium Design"
              className="w-full h-[320px] sm:h-[450px] lg:h-[650px] object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out group-hover:scale-103"
            />

            {/* Pop-up Overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
              <div className="bg-black border border-red-600 text-white pl-5 pr-4 py-3 md:pl-8 md:pr-6 md:py-5 rounded-none shadow-[0_25px_50px_-12px_rgba(220,38,38,0.25)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400 ease-out flex items-center gap-4 md:gap-8">
                <div className="text-left">
                  <p className="text-[9px] md:text-xs text-red-500 font-bold uppercase tracking-[0.2em] mb-0.5">DESIGN STUDIO</p>
                  <p className="text-sm md:text-xl font-black text-white uppercase tracking-tight">KIWI INTERIO</p>
                </div>
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white text-black flex items-center justify-center text-sm md:text-2xl font-light rounded-none transition-transform duration-300 group-hover:translate-x-1">
                  →
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-stone-200 px-3 py-1.5 text-black text-[9px] font-bold uppercase tracking-[0.15em] shadow-sm">
              Powered By Kiwi AI
            </div>
          </div>

        </div>
      </section>

      {/* ─── SECTION 2: CINEMATIC AUTOMATIC VIDEO SHOWCASE ─── */}
      <section className="relative w-full px-4 sm:px-6 lg:px-16 pb-24 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          
          <div className="relative w-full h-[250px] sm:h-[400px] md:h-[550px] lg:h-[600px] overflow-hidden border border-stone-200 bg-stone-900 shadow-2xl">
            
            {/* Auto-Playing Interior Loop Video */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-1000 ease-in-out"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source 
                src={interiorVideo}
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

            {/* Top-Left Tag */}
            <div className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 text-white">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase">
                REVEALING LUJO SPACES
              </p>
            </div>

            {/* Bottom-Left Branding */}
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white max-w-xs md:max-w-md drop-shadow-lg">
              <p className="text-[10px] text-red-500 font-black tracking-[0.25em] uppercase mb-1">
                CINEMATIC WALKTHROUGH
              </p>
              <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-none">
                Crafting Liveable <br />
                Art Pieces.
              </h3>
            </div>

            {/* Bottom-Right Progress Asset */}
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 hidden sm:flex items-center gap-4 text-white/50 text-[10px] font-bold tracking-widest uppercase">
              <span>01</span>
              <div className="w-16 h-px bg-white/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-1/2 bg-red-600" />
              </div>
              <span>LIVE TOUR</span>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

export default Hero;