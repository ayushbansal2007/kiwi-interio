import {
  Banknote,
  Bot,
  Compass,
  Headphones,
  Layers,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function WhyChooseUs(): ReactElement {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50/80 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-red-600">
              <Sparkles size={12} />
              The Kiwi Advantage
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.06em] text-neutral-950 sm:text-5xl">
              Why modern homes choose <span className="text-red-600">Kiwi Interio.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-neutral-500">
            We combined architectural design consultation, verified material catalog, and real-time commerce into one unified platform.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {/* Bento Card 1: Large Focal Card (Spans 2 cols) */}
          <motion.article
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="group relative overflow-hidden rounded-[36px] bg-neutral-950 p-8 text-white shadow-2xl md:col-span-2 flex flex-col justify-between"
          >
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-red-600/30 blur-3xl transition duration-500 group-hover:scale-125" />
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-red-400 backdrop-blur-md">
                <Compass size={24} />
              </span>
              <h3 className="mt-6 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                Bespoke 3D Architectural Blueprints
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-neutral-300">
                Every space in our catalog is engineered to fit standard and custom floor plans. Our certified architects optimize lighting, ventilation, and premium spatial ergonomics.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-neutral-200">
                ✓ 2D & 3D Renderings
              </span>
              <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-neutral-200">
                ✓ Material Warranty
              </span>
              <Link
                to="/contact"
                className="ml-auto inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-white"
              >
                Submit Floor Plan →
              </Link>
            </div>
          </motion.article>

          {/* Bento Card 2: AI Designer */}
          <motion.article
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="rounded-[36px] border border-neutral-200/80 bg-white p-7 shadow-[0_15px_40px_-25px_rgba(0,0,0,0.3)] flex flex-col justify-between"
          >
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100">
                <Bot size={22} />
              </span>
              <h3 className="mt-6 text-xl font-black tracking-[-0.03em] text-neutral-950">
                AI Architect Assistance
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Ask our AI assistant for color palettes, furniture layouts, and budget calculations with real-time inventory matching.
              </p>
            </div>
            <Link
              to="/ai-assistant"
              className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:underline"
            >
              <Zap size={13} /> Try AI Designer
            </Link>
          </motion.article>

          {/* Bento Card 3: Seamless Commerce */}
          <motion.article
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="rounded-[36px] border border-neutral-200/80 bg-[#fffaf6] p-7 shadow-[0_15px_40px_-25px_rgba(0,0,0,0.3)] flex flex-col justify-between"
          >
            <div>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-200">
                <Banknote size={22} />
              </span>
              <h3 className="mt-6 text-xl font-black tracking-[-0.03em] text-neutral-950">
                Transparent Commerce
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                Zero hidden fees. Add concepts to cart, select Razorpay or Pay Later, and track your order live from your dashboard.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              <ShieldCheck size={14} /> 100% Secure Checkout
            </div>
          </motion.article>

          {/* Bento Card 4: Dedicated Studio Support (Spans 3 cols on large or 1 col) */}
          <motion.article
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="rounded-[36px] border border-neutral-200/80 bg-white p-7 shadow-[0_15px_40px_-25px_rgba(0,0,0,0.3)] md:col-span-3 lg:col-span-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-neutral-950 text-white shadow-sm">
                <Headphones size={22} className="text-red-500" />
              </span>
              <div>
                <h3 className="text-xl font-black tracking-[-0.03em] text-neutral-950">
                  Direct 1-on-1 Studio Live Desk
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500 max-w-xl">
                  Message our team directly in real time via WebSockets. Discuss material samples, order cancellations, or schedule on-site measurements without email delays.
                </p>
              </div>
            </div>
            <Link
              to="/profile?tab=messages"
              className="shrink-0 rounded-full bg-neutral-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-600"
            >
              Open Studio Desk
            </Link>
          </motion.article>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
