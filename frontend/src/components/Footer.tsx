import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-neutral-200 bg-neutral-950 text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-400">Kiwi Interio</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white">Design discovery, commerce and support—together.</h3>
          <p className="mt-4 max-w-md text-sm leading-7 text-neutral-400">
            Browse curated interior concepts, talk to Kiwi AI, save items to cart, and place design orders with a cleaner premium experience.
          </p>
        </div>

        <div>
          <p className="text-sm font-black text-white">Explore</p>
          <div className="mt-4 grid gap-3 text-sm text-neutral-400">
            <Link to="/" className="transition hover:text-white">Home</Link>
            <Link to="/interiors" className="transition hover:text-white">Collections</Link>
            <Link to="/ai-assistant" className="transition hover:text-white">AI Designer</Link>
            <Link to="/profile" className="transition hover:text-white">Profile</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-black text-white">Commerce stack</p>
          <div className="mt-4 space-y-3 text-sm text-neutral-400">
            <p>Secure checkout support</p>
            <p>Razorpay-ready payment flow</p>
            <p>Order history and customer tracking</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-neutral-500 sm:px-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Kiwi Interio. Crafted for premium interior commerce.</p>
          <p>Engine status: <span className="font-bold text-emerald-400">Operational</span></p>
        </div>
      </div>
    </footer>
  );
}
