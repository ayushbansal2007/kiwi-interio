import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, PlayCircle, Sparkles } from "lucide-react";
import { useRef } from "react";
import type { ReactElement } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import interiorVideo from "../assets/3967-175963622_medium.mp4";

function Hero(): ReactElement {
  useDocumentTitle("Kiwi Interio | Premium Interior Commerce");
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="overflow-hidden bg-[#fffcf8] px-4 pt-4 sm:px-6 lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-8 rounded-[36px] border border-white/70 bg-white/75 px-5 py-6 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.35)] backdrop-blur sm:px-7 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-max items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
            <Sparkles size={12} />
            Curated for modern homes
          </span>

          <h1 className="mt-5 text-4xl font-black leading-[0.9] tracking-[-0.08em] text-neutral-950 sm:text-5xl lg:text-7xl">
            Shop interior-ready
            <span className="block text-red-600">spaces, not just ideas.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-500 sm:text-base">
            Kiwi Interio now feels like a premium design commerce brand—discover curated spaces, save them to cart, chat with AI, and move straight to secure booking.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/interiors" className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-600">
              Explore collections
              <ArrowRight size={16} />
            </Link>
            <Link to="/ai-assistant" className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-sm font-bold text-neutral-800 transition hover:border-red-200 hover:text-red-600">
              Design with Kiwi AI
              <PlayCircle size={16} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["250+", "Live design options"],
              ["24 hrs", "Average query callback"],
              ["Razorpay", "Secure online checkout"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-neutral-100 bg-[#fffaf6] p-4">
                <p className="text-2xl font-black tracking-[-0.06em] text-neutral-950">{value}</p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-neutral-500">
            {["Interior e-commerce flow", "Cart + order history", "AI product discovery"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-neutral-100">
                <BadgeCheck size={14} className="text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-rows-[1.35fr_0.75fr]">
          <article className="relative overflow-hidden rounded-[32px] bg-neutral-950 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
              alt="Premium living room"
              className="h-full min-h-[340px] w-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-300">Featured concept</p>
              <h2 className="mt-2 max-w-sm text-2xl font-black tracking-[-0.05em] sm:text-3xl">Luxury living room blueprint for modern family homes.</h2>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[30px] border border-neutral-200 bg-neutral-950 shadow-xl">
            <video
              ref={videoRef}
              className="h-full min-h-[220px] w-full object-cover opacity-80"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              <source src={interiorVideo} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/30 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">Walkthrough reel</p>
                <p className="mt-2 text-lg font-black tracking-[-0.04em]">Experience how Kiwi spaces feel before you book.</p>
              </div>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
                Always on
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Hero;
