import type { ReactElement } from "react";

const reviews = [
  {
    name: "Rahul Sharma",
    city: "Bhiwani",
    review: "Catalog dekhna aur phir direct design book karna ab kaafi premium lagta hai. It finally feels like a modern interior brand.",
  },
  {
    name: "Priya Verma",
    city: "Hisar",
    review: "The AI suggestions plus polished checkout flow made the whole journey far more trustworthy than a normal enquiry form.",
  },
  {
    name: "Amit Yadav",
    city: "Rohtak",
    review: "Profile page mein cart aur order history dekhna very helpful hai. Team experience ab fully organized lagta hai.",
  },
];

function Testimonials(): ReactElement {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">Client love</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] text-neutral-950 sm:text-4xl">What people feel after the upgrade.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-neutral-500">
            The experience now feels closer to a premium design marketplace instead of a simple portfolio website.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {reviews.map((item) => (
            <article key={item.name} className="flex h-full flex-col justify-between rounded-[30px] border border-neutral-200/70 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.45)]">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-amber-500">{"★★★★★".split("").map((star, index) => <span key={`${item.name}-${index}`}>{star}</span>)}</div>
                  <span className="text-4xl font-serif text-red-100">“</span>
                </div>
                <p className="mt-5 text-sm leading-7 text-neutral-600">"{item.review}"</p>
              </div>
              <div className="mt-8 flex items-center gap-3 border-t border-neutral-100 pt-5">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 font-black text-red-600">{item.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-black text-neutral-900">{item.name}</p>
                  <p className="text-xs uppercase tracking-widest text-neutral-400">{item.city}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
