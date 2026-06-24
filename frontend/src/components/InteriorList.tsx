import { useEffect, useMemo, useState } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";

interface Interior {
  _id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  subcategory: string;
  style: string;
  roomType: string;
  tags: string[];
}

function InteriorList() {
  useDocumentTitle("The Masterpiece Collection | Kiwi Interio");
    
  const [interiors, setInteriors] = useState<Interior[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteriors = async () => {
      try {
        const res = await fetch("https://kiwi-interio.onrender.com/api/interiors");
        const data = await res.json();
        setInteriors(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInteriors();
  }, []);

  const categories = useMemo(() => [
    "All",
    ...new Set(interiors.map((item) => item.category)),
  ], [interiors]);

  const filteredInteriors = useMemo(() =>
    selectedCategory === "All"
      ? interiors
      : interiors.filter((item) => item.category === selectedCategory),
    [interiors, selectedCategory]
  );

  const visibleInteriors = filteredInteriors.slice(0, visibleCount);

  return (
    <section className="bg-white text-black py-24 px-6 lg:px-16 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* 1. Dynamic Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black pb-8 mb-16">
          <div className="space-y-4">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-red-600">
              © Kiwi Interio Studio
            </p>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
              Selected <br />
              <span className="text-red-600">Archived</span> Works
            </h2>
          </div>
          <p className="text-stone-500 text-sm max-w-xs mt-6 md:mt-0 font-light tracking-wide leading-relaxed">
            A meticulous curation of ultra-premium living concepts designed exclusively for elite properties.
          </p>
        </div>

        {/* 2. Sleek Minimal Navigation Bar */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 border-b border-stone-100 pb-6 mb-12">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedCategory(category);
                setVisibleCount(8);
              }}
              className={`text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 relative pb-2 ${
                selectedCategory === category
                  ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-red-600"
                  : "text-stone-400 hover:text-red-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 3. Skeleton Loader */}
        {loading ? (
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-x-6 gap-y-12">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4 animate-pulse">
                <div className="h-[400px] bg-stone-100" />
                <div className="w-1/4 h-3 bg-stone-100" />
                <div className="w-3/4 h-5 bg-stone-100" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* 4. The 10x Thin High-End Luxury Grid */}
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-x-6 gap-y-16">
              {visibleInteriors.map((item) => (
                <div
                  key={item._id}
                  className="group relative flex flex-col justify-between bg-white overflow-hidden transition-all duration-500"
                >
                  {/* Image Framework with Minimal Frame */}
                  <div className="relative overflow-hidden aspect-[3/4] bg-stone-50 border border-stone-100 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />

                    {/* Subtle Category Stamp */}
                    <div className="absolute top-4 left-4 bg-white px-3 py-1 text-[9px] font-black uppercase tracking-widest text-black border border-stone-200">
                      {item.style}
                    </div>

                    {/* 🎯 SIGNATURE KIWI-INTERIO BUTTON POP-UP OVERLAY */}
                    {/* Modern Clean Mask + Sleek Horizontal Slider Button */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                      
                      {/* Premium Solid Capsule Button Style Pop */}
                      <div className="w-full max-w-[220px] bg-white text-black py-4 px-5 flex items-center justify-between shadow-2xl border border-red-600 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-bold text-red-600 tracking-widest uppercase leading-none mb-1">VIEW WORK</span>
                          <span className="text-xs font-black tracking-wider text-black uppercase leading-none">KIWI INTERIO</span>
                        </div>
                        {/* Sharp Forward Arrow */}
                        <span className="text-xl font-light transform group-hover:translate-x-1 transition-transform duration-300">
                          →
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* High Contrast Clean Typography Block */}
                  <div className="pt-5 space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Location or Tag Marker */}
                      <p className="text-[10px] font-bold tracking-[0.25em] text-red-600 uppercase">
                        {item.category} <span className="text-stone-300 font-normal mx-1">/</span> {item.subcategory}
                      </p>

                      {/* Display Header Title */}
                      <h3 className="text-lg font-bold text-black uppercase tracking-tight mt-1 group-hover:text-red-600 transition-colors duration-300">
                        {item.title}
                      </h3>

                      {/* Micro description - Hidden elegantly or clamped */}
                      <p className="text-stone-500 text-xs font-light leading-relaxed mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Pricing Row */}
                    <div className="flex items-baseline justify-between pt-4 mt-4 border-t border-stone-100">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Investment Value
                      </span>
                      <span className="text-lg font-black text-black">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* 5. Minimalist Load More Action */}
            {visibleCount < filteredInteriors.length && (
              <div className="flex justify-center mt-24">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="bg-black text-white hover:bg-red-600 text-xs font-bold uppercase tracking-[0.2em] px-14 py-5 transition-colors duration-300 shadow-xl"
                >
                  Load More Collections
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default InteriorList;