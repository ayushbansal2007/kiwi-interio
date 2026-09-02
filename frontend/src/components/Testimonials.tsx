import type { ReactElement } from "react";
import { BadgeCheck, Quote, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

const reviews = [
  {
    name: "Vikram Singhania",
    city: "Gurugram, NCR",
    project: "4BHK Luxury Villa Blueprint",
    rating: 5,
    review:
      "Kiwi Interio revolutionized how we selected our living space. The 3D concepts and direct cart booking gave us complete clarity on pricing and material aesthetics before execution.",
  },
  {
    name: "Priya Sharma",
    city: "Bhiwani, Haryana",
    project: "Minimalist Modular Kitchen",
    rating: 5,
    review:
      "The AI Assistant gave us great space-planning options, and the direct Studio Support Chat kept us updated daily. Super seamless and trustworthy!",
  },
  {
    name: "Amitabh Verma",
    city: "Hisar, Haryana",
    project: "Scandinavian Master Bedroom",
    rating: 5,
    review:
      "From order placement to turnkey finishing, the craftsmanship was impeccable. Having order history, cancellation transparency, and real-time support on one dashboard is awesome.",
  },
];

const stats = [
  { value: "500+", label: "Turnkey Spaces Styled" },
  { value: "99.4%", label: "On-Time Completion" },
  { value: "4.9 ★", label: "Average Client Rating" },
  { value: "24 Hrs", label: "Consultation Turnaround" },
];

function Testimonials(): ReactElement {
  return (
    <section className="relative overflow-hidden bg-[#fffaf6] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-red-600">
            <Sparkles size={12} />
            Verified Homeowners
          </span>
          <h2 className="text-3xl font-black tracking-[-0.06em] text-neutral-950 sm:text-5xl">
            Trusted by discerning homeowners across the region.
          </h2>
          <p className="text-sm leading-relaxed text-neutral-500">
            Real stories from residents who designed and booked their dream living spaces with Kiwi Interio.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-[32px] border border-neutral-200/80 bg-white p-6 shadow-sm">
          {stats.map((item) => (
            <div key={item.label} className="text-center p-2">
              <p className="text-2xl font-black tracking-[-0.05em] text-neutral-950 sm:text-3xl">
                {item.value}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.map((item, idx) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="flex h-full flex-col justify-between rounded-[32px] border border-neutral-200/80 bg-white p-7 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.3)] transition duration-300"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-amber-500">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <Quote size={24} className="text-red-200" />
                </div>

                <span className="mt-4 inline-block rounded-full bg-[#fffaf6] px-2.5 py-1 text-[10px] font-bold text-neutral-600">
                  {item.project}
                </span>

                <p className="mt-4 text-sm leading-relaxed text-neutral-600">
                  "{item.review}"
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-neutral-100 pt-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-neutral-950 font-black text-white text-sm shadow-sm">
                  {item.name.charAt(0)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-black text-neutral-950 flex items-center gap-1.5">
                    {item.name}
                    <BadgeCheck size={14} className="text-emerald-500 shrink-0" />
                  </p>
                  <p className="truncate text-[11px] font-semibold text-neutral-400">
                    {item.city}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
