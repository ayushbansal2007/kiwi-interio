import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import { apiClient } from "../services/apiClient";
import { addToCart } from "../services/commerceService";

import { onStockUpdated } from "../services/socket";

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
  inStock?: boolean;
  stockCount?: number;
}

function InteriorList(): ReactElement {
  useDocumentTitle("Collections | Kiwi Interio");

  const { user } = useAuth();
  const navigate = useNavigate();
  const [interiors, setInteriors] = useState<Interior[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  useEffect(() => {
    const fetchInteriors = async () => {
      try {
        const res = await apiClient(`${API_BASE_URL}/api/interiors`);
        const data = await res.json();
        setInteriors(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    void fetchInteriors();

    // Listen for real-time stock updates
    const unsubStock = onStockUpdated((stockData) => {
      setInteriors((prev) =>
        prev.map((item) =>
          item._id === stockData.interiorId
            ? {
                ...item,
                inStock: stockData.inStock,
                stockCount: stockData.stockCount,
              }
            : item
        )
      );
    });

    return () => {
      unsubStock();
    };
  }, [API_BASE_URL]);

  const categories = useMemo(() => ["All", ...new Set(interiors.map((item) => item.category))], [interiors]);

  const filteredInteriors = useMemo(
    () => (selectedCategory === "All" ? interiors : interiors.filter((item) => item.category === selectedCategory)),
    [interiors, selectedCategory]
  );

  const visibleInteriors = filteredInteriors.slice(0, visibleCount);

  const handleAddToCart = async (id: string) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setActionId(id);
    setNotice("");
    try {
      const payload = await addToCart(id, 1);
      if (!payload.success) throw new Error(payload.message || "Could not add to cart");
      window.dispatchEvent(new Event("cart-updated"));
      setNotice("Design added to cart");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not add to cart");
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="bg-[#fffcf8] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">Curated catalogue</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] text-neutral-950 sm:text-5xl">
              Browse interiors the way you’d shop premium products.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-neutral-500">
            Explore styled spaces, compare categories and move your favorite concepts into cart with a single click.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setVisibleCount(8);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                selectedCategory === category
                  ? "bg-neutral-950 text-white shadow-lg shadow-neutral-950/10"
                  : "bg-white text-neutral-500 ring-1 ring-neutral-200 hover:text-neutral-950"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {notice && <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{notice}</p>}

        {loading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-[30px] bg-white p-3 shadow-sm">
                <div className="aspect-[4/5] rounded-[24px] bg-neutral-100" />
                <div className="mt-4 h-3 w-24 rounded bg-neutral-100" />
                <div className="mt-3 h-6 w-3/4 rounded bg-neutral-100" />
                <div className="mt-4 h-10 rounded-full bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <motion.div
              layout
              className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4"
            >
              <AnimatePresence>
                {visibleInteriors.map((item, idx) => {
                  const isOutOfStock =
                    item.inStock === false || (item.stockCount ?? 10) <= 0;

                  return (
                    <motion.article
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, delay: (idx % 8) * 0.05 }}
                      className="group overflow-hidden rounded-[30px] border border-neutral-200/70 bg-white p-3 shadow-[0_16px_40px_-32px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_-34px_rgba(0,0,0,0.38)]"
                    >
                      <div className="relative overflow-hidden rounded-[24px] bg-neutral-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className={`aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105 ${
                            isOutOfStock ? "grayscale-[40%] opacity-90" : ""
                          }`}
                        />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
                            {item.category}
                          </span>
                          {item.style && (
                            <span className="rounded-full bg-neutral-950/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                              {item.style}
                            </span>
                          )}
                        </div>

                        {isOutOfStock && (
                          <div className="absolute right-4 top-4">
                            <span className="rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-md">
                              Out of stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="px-1 pb-1 pt-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                          {item.roomType || item.subcategory || "Interior concept"}
                        </p>
                        <Link
                          to={`/interior/${item._id}`}
                          className="mt-2 block text-xl font-black tracking-[-0.04em] text-neutral-950 transition hover:text-red-600"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
                          {item.description}
                        </p>

                        <div className="mt-5 flex items-end justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                              Starting price
                            </p>
                            <p className="mt-1 text-2xl font-black tracking-[-0.05em] text-neutral-950">
                              ₹{item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <Link
                            to={`/interior/${item._id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-red-600"
                          >
                            View
                            <ArrowRight size={14} />
                          </Link>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleAddToCart(item._id)}
                            disabled={actionId === item._id || isOutOfStock}
                            className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-3 text-xs font-bold uppercase tracking-wider transition ${
                              isOutOfStock
                                ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                : "border-neutral-200 text-neutral-800 hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                            }`}
                          >
                            <ShoppingBag size={14} />
                            {isOutOfStock
                              ? "Out of stock"
                              : actionId === item._id
                              ? "Adding..."
                              : "Add to cart"}
                          </button>
                          <button
                            onClick={() =>
                              !isOutOfStock &&
                              navigate(
                                `/checkout?source=buy_now&id=${item._id}&quantity=1`
                              )
                            }
                            disabled={isOutOfStock}
                            className={`rounded-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition ${
                              isOutOfStock
                                ? "bg-neutral-300 cursor-not-allowed text-neutral-500"
                                : "bg-neutral-950 hover:bg-red-600"
                            }`}
                          >
                            {isOutOfStock ? "Unavailable" : "Buy now"}
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {visibleCount < filteredInteriors.length && (
              <div className="mt-14 flex justify-center">
                <button onClick={() => setVisibleCount((prev) => prev + 8)} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-neutral-900 ring-1 ring-neutral-200 transition hover:bg-neutral-950 hover:text-white">
                  Load more concepts
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
