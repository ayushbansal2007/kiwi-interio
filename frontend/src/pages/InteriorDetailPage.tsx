import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  Layers,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
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

function InteriorDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interior, setInterior] = useState<Interior | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"specs" | "roadmap" | "materials">("specs");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  useDocumentTitle(
    interior ? `${interior.title} | Kiwi Interio` : "Design Detail | Kiwi Interio"
  );

  useEffect(() => {
    if (!id) return;

    const fetchSingleInterior = async () => {
      try {
        setLoading(true);
        const res = await apiClient(`${API_BASE_URL}/api/interiors/${id}`);
        if (!res.ok) throw new Error("Design setup could not be retrieved.");
        const data = await res.json();
        setInterior(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    void fetchSingleInterior();

    const unsubStock = onStockUpdated((stockData) => {
      if (stockData.interiorId === id) {
        setInterior((prev) =>
          prev
            ? {
                ...prev,
                inStock: stockData.inStock,
                stockCount: stockData.stockCount,
              }
            : prev
        );
      }
    });

    return () => {
      unsubStock();
    };
  }, [API_BASE_URL, id]);

  const isOutOfStock =
    interior?.inStock === false || (interior?.stockCount ?? 10) <= 0;

  const handleAddToCart = async () => {
    if (!interior || isOutOfStock) return;
    if (!user) {
      navigate("/login");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      const payload = await addToCart(interior._id, 1);
      if (!payload.success) throw new Error(payload.message || "Could not add to cart");
      setNotice("✓ Design concept added to your cart successfully!");
    } catch (err: any) {
      setNotice(err.message || "Could not add item to cart.");
    } finally {
      setBusy(false);
    }
  };

  const handleBuyNow = () => {
    if (!interior || isOutOfStock) return;
    if (!user) {
      navigate(`/login?redirect=/checkout?source=buy_now&id=${interior._id}&quantity=1`);
      return;
    }
    navigate(`/checkout?source=buy_now&id=${interior._id}&quantity=1`);
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-4">
        <div className="text-center">
          <span className="mx-auto mb-4 block h-9 w-9 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">
            Loading Architectural Blueprint
          </p>
        </div>
      </div>
    );
  }

  if (error || !interior) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="rounded-[36px] border border-red-100 bg-red-50/60 p-8">
          <AlertCircle size={32} className="mx-auto text-red-600" />
          <h2 className="mt-4 text-2xl font-black text-neutral-950">
            {error || "Design not found"}
          </h2>
          <p className="mt-2 text-xs text-neutral-500">
            The requested interior blueprint may have been updated or moved.
          </p>
          <Link
            to="/interiors"
            className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-600"
          >
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fffcf8] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
          <Link to="/" className="hover:text-neutral-950">Home</Link>
          <ChevronRight size={12} />
          <Link to="/interiors" className="hover:text-neutral-950">Collections</Link>
          <ChevronRight size={12} />
          <span className="text-neutral-700">{interior.category}</span>
          <ChevronRight size={12} />
          <span className="truncate max-w-xs font-bold text-neutral-950">{interior.title}</span>
        </nav>

        {/* Main Product Showcase Grid */}
        <section className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left Media Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <div className="group relative overflow-hidden rounded-[38px] border border-neutral-200/80 bg-neutral-950 shadow-2xl">
              <img
                src={interior.image}
                alt={interior.title}
                className={`aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105 ${
                  isOutOfStock ? "grayscale-[35%] opacity-90" : ""
                }`}
              />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/95 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600 shadow-md">
                  {interior.category}
                </span>
                {interior.style && (
                  <span className="rounded-full bg-neutral-950/85 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-md">
                    {interior.style}
                  </span>
                )}
              </div>

              {isOutOfStock ? (
                <div className="absolute right-5 top-5">
                  <span className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                    Out of Stock
                  </span>
                </div>
              ) : (
                <div className="absolute right-5 top-5">
                  <span className="rounded-full bg-emerald-600/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified Ready
                  </span>
                </div>
              )}
            </div>

            {/* Feature Trust Pills under image */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, title: "10-Yr Warranty", desc: "Certified materials" },
                { icon: Truck, title: "Free Delivery", desc: "Haryana & Delhi NCR" },
                { icon: Wrench, title: "Turnkey Setup", desc: "Done by Kiwi architects" },
              ].map((pill) => (
                <div key={pill.title} className="rounded-2xl border border-neutral-200/80 bg-white p-3 text-center shadow-xs">
                  <pill.icon size={18} className="mx-auto text-red-600" />
                  <p className="mt-1.5 text-xs font-bold text-neutral-950">{pill.title}</p>
                  <p className="text-[10px] text-neutral-400">{pill.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Product Overview & Buying Box */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                <Sparkles size={12} />
                {interior.roomType || interior.subcategory || "Architectural Concept"}
              </span>

              <h1 className="text-3xl font-black tracking-[-0.05em] text-neutral-950 sm:text-4xl">
                {interior.title}
              </h1>

              <p className="text-sm leading-relaxed text-neutral-600">
                {interior.description}
              </p>

              {/* Pricing & Stock Card */}
              <div className="rounded-[30px] border border-neutral-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      Turnkey Package Price
                    </p>
                    <p className="mt-1 text-3xl font-black tracking-[-0.06em] text-neutral-950">
                      ₹{interior.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Inclusive of GST, spatial 3D plans, fabrication & installation
                    </p>
                  </div>

                  {/* Stock Availability */}
                  <div className="text-right">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                        Out of stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        In Stock ({interior.stockCount ?? 10} units)
                      </span>
                    )}
                  </div>
                </div>

                {/* Feedback Notice */}
                {notice && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800"
                  >
                    {notice}
                  </motion.div>
                )}

                {/* Primary Purchase Buttons */}
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={busy || isOutOfStock}
                    className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-4 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                      isOutOfStock
                        ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                        : "border-neutral-300 bg-white text-neutral-900 hover:border-red-500 hover:text-red-600"
                    }`}
                  >
                    <ShoppingBag size={15} />
                    {busy ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition ${
                      isOutOfStock
                        ? "bg-neutral-300 cursor-not-allowed text-neutral-500"
                        : "bg-neutral-950 hover:bg-red-600 shadow-neutral-950/20"
                    }`}
                  >
                    {isOutOfStock ? "Unavailable" : "Buy Concept Now"}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tags Strip */}
            {interior.tags && interior.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {interior.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-neutral-600 shadow-2xs ring-1 ring-neutral-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </section>

        {/* Tabbed Specifications & Blueprint Roadmap */}
        <section className="mt-16 rounded-[36px] border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
          {/* Tabs Selector */}
          <div className="flex gap-2 border-b border-neutral-100 pb-4 overflow-x-auto">
            {[
              { id: "specs", label: "Architectural Specs", icon: Layers },
              { id: "roadmap", label: "Execution Roadmap", icon: Compass },
              { id: "materials", label: "Material Quality", icon: ShieldCheck },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === tab.id
                    ? "bg-neutral-950 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "specs" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Category", interior.category],
                  ["Subcategory", interior.subcategory || "Signature Design"],
                  ["Design Style", interior.style || "Contemporary Minimalist"],
                  ["Target Room", interior.roomType || "Residential Living"],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-2xl bg-[#fffaf6] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      {label}
                    </p>
                    <p className="mt-1 text-base font-black text-neutral-950">{val}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  { step: "01", title: "Site Measurement", time: "Day 1-2" },
                  { step: "02", title: "3D CAD Blueprint", time: "Day 3-5" },
                  { step: "03", title: "Factory Crafting", time: "Day 6-12" },
                  { step: "04", title: "Turnkey Handover", time: "Day 14" },
                ].map((s) => (
                  <div key={s.step} className="rounded-2xl bg-[#fffaf6] p-4 border border-neutral-100">
                    <span className="text-xs font-black text-red-600">{s.step}</span>
                    <p className="mt-1 text-sm font-black text-neutral-950">{s.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{s.time}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "materials" && (
              <div className="space-y-3 text-xs leading-relaxed text-neutral-600">
                <p>
                  • <strong>High-Density Plywood:</strong> Grade BWP Marine plywood with anti-termite and moisture resistance.
                </p>
                <p>
                  • <strong>Hardware & Fittings:</strong> Soft-close hydraulic German hinges with 10-year durability rating.
                </p>
                <p>
                  • <strong>Finish Coating:</strong> Anti-scratch acrylic and matte PU lacquered surfacing.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default InteriorDetailPage;
