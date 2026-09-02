import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Compass,
  Headphones,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 4000);
  };

  return (
    <footer className="mt-20 border-t border-neutral-800 bg-neutral-950 text-neutral-300">
      {/* Top Banner */}
      <div className="border-b border-white/10 bg-neutral-900/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-red-600 text-white shadow-md">
                <Sparkles size={16} />
              </span>
              <h3 className="text-xl font-black tracking-[-0.03em] text-white">
                Ready to transform your living space?
              </h3>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              Consult with our architectural team today or explore our ready-to-execute interior collections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500"
            >
              Request 3D Consultation
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              <Bot size={15} /> Talk to AI Architect
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_0.9fr_0.9fr_1.1fr] lg:px-8">
        {/* Col 1: Brand Info */}
        <div>
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-neutral-950 shadow-md">
              <Sparkles size={18} className="text-red-600" />
            </span>
            <div>
              <span className="block text-lg font-black tracking-[-0.05em] text-white">
                KIWI INTERIO<span className="text-red-500">.</span>
              </span>
              <span className="block text-[8px] font-bold tracking-[0.24em] text-neutral-400">
                LUXURY ARCHITECTURE & LIVING
              </span>
            </div>
          </Link>
          <p className="mt-5 text-xs leading-6 text-neutral-400 max-w-sm">
            Bespoke turnkey interior architecture, curated material catalog, and real-time commerce platform for modern residences in Haryana & Delhi NCR.
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>100% Certified Architects & Verified Materials</span>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">
            Explore
          </p>
          <div className="mt-4 space-y-2.5 text-xs text-neutral-400">
            <Link to="/" className="block transition hover:text-white">
              Home Showcase
            </Link>
            <Link to="/interiors" className="block transition hover:text-white">
              Interior Collections
            </Link>
            <Link to="/ai-assistant" className="block transition hover:text-white">
              AI Interior Assistant
            </Link>
            <Link to="/contact" className="block transition hover:text-white">
              Design Consultation Desk
            </Link>
            <Link to="/profile" className="block transition hover:text-white">
              Client Portal & Orders
            </Link>
          </div>
        </div>

        {/* Col 3: Support & Policies */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">
            Customer Care
          </p>
          <div className="mt-4 space-y-2.5 text-xs text-neutral-400">
            <Link to="/profile?tab=messages" className="flex items-center gap-1.5 transition hover:text-white">
              <Headphones size={13} className="text-red-400" />
              Live Studio Support
            </Link>
            <p>Razorpay Secure Checkout</p>
            <p>Order Cancellation & Refund Policy</p>
            <p>Turnkey Execution Guarantee</p>
          </div>
        </div>

        {/* Col 4: Newsletter */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">
            Design Newsletter
          </p>
          <p className="mt-3 text-xs leading-relaxed text-neutral-400">
            Subscribe to receive seasonal design lookbooks and exclusive architectural blueprints.
          </p>

          <form onSubmit={handleSubscribe} className="mt-4">
            <div className="flex items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-1.5 focus-within:border-red-500 transition">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-transparent px-3 text-xs text-white outline-none placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-red-600 px-3 text-xs font-bold text-white transition hover:bg-red-500"
              >
                {subscribed ? <CheckCircle2 size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>
            {subscribed && (
              <p className="mt-2 text-[11px] font-semibold text-emerald-400">
                ✓ Thank you for subscribing to Kiwi Interio!
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-[11px] text-neutral-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Kiwi Interio Studio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Platform Status: <strong className="text-neutral-300">Operational</strong>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
