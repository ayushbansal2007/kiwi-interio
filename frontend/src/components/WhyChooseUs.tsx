import { Banknote, LayoutPanelTop, MapPinHouse, ShieldCheck } from "lucide-react";
import type { ReactElement } from "react";

const benefits = [
  {
    title: "Local expertise",
    desc: "Designed with Bhiwani families, floor plans, and lifestyle expectations in mind.",
    icon: MapPinHouse,
  },
  {
    title: "Commerce-ready buying",
    desc: "Shortlist, cart, checkout and pay online without breaking your design discovery flow.",
    icon: Banknote,
  },
  {
    title: "Smarter discovery",
    desc: "AI recommendations, refined catalog filters and detailed design pages work together.",
    icon: LayoutPanelTop,
  },
  {
    title: "Trusted fulfilment",
    desc: "From first query to final order tracking, the whole journey stays transparent and secure.",
    icon: ShieldCheck,
  },
];

function WhyChooseUs(): ReactElement {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[36px] border border-neutral-200/70 bg-white px-6 py-8 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.4)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">Why Kiwi Interio</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-neutral-950 sm:text-4xl">
              A smoother interior-buying experience.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-neutral-500">
            The same premium visual identity now supports an easier buying journey—browse, compare, consult, cart and convert from one cohesive interface.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map(({ title, desc, icon: Icon }) => (
            <article key={title} className="rounded-[28px] border border-neutral-100 bg-[#fffaf6] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-red-600 shadow-sm ring-1 ring-red-100">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 text-lg font-black tracking-[-0.03em] text-neutral-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
