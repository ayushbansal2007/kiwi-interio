import { useEffect, useMemo, useState } from "react";
// 🟢 FIXED: Type import rules apply kiye aur Router Link ko fetch kiya navigation ke liye
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
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

function InteriorList(): ReactElement {
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
       // direct tracking state mutation
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
            {/* 4. The 10x Thin High-End Luxury eCommerce Grid */}
            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-x-6 gap-y-16">
              {visibleInteriors.map((item) => (
                <div
                  key={item._id}
                  className="group relative flex flex-col justify-between bg-white border border-stone-100 p-3 hover:shadow-xl transition-all duration-500"
                >
                  {/* Image Framework with Router Link binding */}
                  <div className="relative overflow-hidden aspect-[3/4] bg-stone-50 border border-stone-100 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="eager"
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700 ease-out"
                    />

                    {/* eCommerce Status Tags */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                      <div className="bg-black text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest border border-stone-800">
                        {item.style}
                      </div>
                      <div className="bg-red-600 text-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest">
                        PREMIUM BUILD
                      </div>
                    </div>

                    {/* 🎯 ECOMMERCE DYNAMIC LINK OVERLAY */}
                    <Link 
                      to={`/interior/${item._id}`}
                      className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 gap-3"
                    >
                      {/* Interactive View Details Button */}
                      <div className="w-full max-w-[200px] bg-white text-black py-3.5 px-4 flex items-center justify-between shadow-2xl border border-stone-200 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <span className="text-[10px] font-black tracking-widest uppercase">QUICK DETAILS</span>
                        <span className="text-sm font-light">→</span>
                      </div>
                    </Link>
                  </div>

                  {/* High Contrast Clean Typography Block */}
                  <div className="pt-4 space-y-2 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Category Location Path */}
                      <p className="text-[10px] font-bold tracking-[0.25em] text-red-600 uppercase">
                        {item.category} <span className="text-stone-300 font-normal mx-1">/</span> {item.subcategory}
                      </p>

                      {/* Display Header Title linked to product description */}
                      <Link to={`/interior/${item._id}`}>
                        <h3 className="text-md font-black text-black uppercase tracking-tight mt-1 hover:text-red-600 transition-colors duration-300">
                          {item.title}
                        </h3>
                      </Link>

                      <p className="text-stone-500 text-xs font-light leading-relaxed mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* eCommerce Operational Data Injections */}
                    <div className="space-y-3 pt-3 mt-2 border-t border-stone-100">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                          ESTIMATED VALUE
                        </span>
                        <span className="text-lg font-black text-black tracking-tight">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* 🛍️ BUY NOW / BOOK CONSULTATION ECOMMERCE CTA BUTTON */}
                      <Link 
                        to={`/interior/${item._id}`} 
                        className="block w-full text-center bg-black hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest py-3.5 transition-colors duration-300"
                      >
                        BUY NOW & CUSTOMIZE
                      </Link>
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