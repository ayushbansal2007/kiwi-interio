import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Play,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { motion } from "framer-motion";
import useDocumentTitle from "../hooks/useDocumentTitle";
import interiorVideo from "../assets/3967-175963622_medium.mp4";

function Hero(): ReactElement {
  useDocumentTitle("Kiwi Interio | Luxury Architectural Interior Commerce");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#fffcf8] px-4 pt-4 sm:px-6 lg:px-8">
      {/* Background Neon Ambient Glows */}
      <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-orange-500/10 blur-[120px]" />

      <section className="relative mx-auto grid max-w-7xl gap-10 rounded-[38px] border border-white/80 bg-white/70 p-6 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
        {/* Left Content */}
        <div className="flex flex-col justify-center">
          {/* Top Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-red-600 shadow-xs">
              <Sparkles size={13} className="animate-spin text-red-500" style={{ animationDuration: "6s" }} />
              2026 Luxury Collection Live
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-black leading-[0.92] tracking-[-0.07em] text-neutral-950 sm:text-6xl lg:text-7xl"
          >
            Architectural spaces,
            <span className="mt-1 block luxury-red-text">curated to own.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base"
          >
            Transform your residence with bespoke interior concepts. Explore 3D-designed spaces, consult our AI architect, add directly to your cart, and secure your execution seamlessly.
          </motion.p>

          {/* CTA Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col gap-3.5 sm:flex-row"
          >
            <Link
              to="/interiors"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-neutral-950 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-neutral-950/25 transition hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-red-600/30"
            >
              Explore Catalog
              <ArrowRight size={15} className="transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-7 py-4 text-xs font-bold uppercase tracking-wider text-neutral-900 shadow-sm transition hover:border-red-300 hover:text-red-600"
            >
              <Bot size={16} className="text-red-600" />
              Design with AI Architect
            </Link>
          </motion.div>

          {/* Live Metric Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 grid grid-cols-3 gap-3 border-t border-neutral-200/70 pt-8"
          >
            {[
              { value: "500+", label: "Homes Styled" },
              { value: "4.9 ★", label: "Client Rating" },
              { value: "100%", label: "Custom 3D Blueprint" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-[#fffaf6] p-3 text-center sm:p-4">
                <p className="text-xl font-black tracking-[-0.05em] text-neutral-950 sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Trust Points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 flex flex-wrap gap-2 text-[11px] font-semibold text-neutral-600"
          >
            {["Real-time Stock Sync", "Instant Cart & Razorpay", "1-on-1 Studio Support"].map(
              (badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-xs ring-1 ring-neutral-200/60"
                >
                  <BadgeCheck size={14} className="text-emerald-500" />
                  {badge}
                </span>
              )
            )}
          </motion.div>
        </div>

        {/* Right Media Grid */}
        <div className="grid gap-4 lg:grid-rows-[1.3fr_0.8fr]">
          {/* Top Featured Luxury Visual */}
          <motion.article
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative overflow-hidden rounded-[32px] bg-neutral-950 shadow-2xl shadow-neutral-950/20"
          >
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
              alt="Luxury Living Room Blueprint"
              className="h-full min-h-[320px] w-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

            {/* Floating Top Pill */}
            <div className="absolute left-5 top-5 flex items-center gap-2">
              <span className="rounded-full bg-neutral-950/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                Featured Concept
              </span>
              <span className="flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                <Star size={11} fill="white" /> 4.9 Rating
              </span>
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                Architectural Living Space
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                Minimalist Scandinavian Villa Blueprint
              </h2>
            </div>
          </motion.article>

          {/* Bottom Interactive Video Walkthrough Reel */}
          <motion.article
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="group relative overflow-hidden rounded-[30px] border border-neutral-200 bg-neutral-950 shadow-xl"
          >
            <video
              ref={videoRef}
              className="h-full min-h-[200px] w-full object-cover opacity-80 transition duration-500 group-hover:opacity-90"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src={interiorVideo} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/40 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                  <Zap size={10} fill="white" /> Live 3D Reel
                </span>
                <p className="mt-1.5 text-base font-black tracking-[-0.03em] sm:text-lg">
                  Experience the textures before you order.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleVideo}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur-md text-white transition hover:bg-white hover:text-neutral-950"
                title={isPlaying ? "Pause reel" : "Play reel"}
              >
                <Play size={14} className={isPlaying ? "opacity-90" : "opacity-100"} fill="currentColor" />
              </button>
            </div>
          </motion.article>
        </div>
      </section>
    </div>
  );
}

export default Hero;
