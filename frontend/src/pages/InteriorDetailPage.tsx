import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, BadgeCheck, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";
  useDocumentTitle(interior ? `${interior.title} | Kiwi Interio` : "Design Detail | Kiwi Interio");

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

  const quickSpecs = useMemo(
    () => interior
      ? [
          ["Category", interior.category],
          ["Subcategory", interior.subcategory || "Signature concept"],
          ["Style", interior.style || "Curated premium"],
          ["Room type", interior.roomType || "Residential interior"],
        ]
      : [],
    [interior]
  );

  const handleAddToCart = async () => {
    if (!interior) return;
    if (!user) {
      navigate("/login");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      const payload = await addToCart(interior._id, 1);
      if (!payload.success) throw new Error(payload.message || "Could not add to cart");
      window.dispatchEvent(new Event("cart-updated"));
      setNotice("Added to cart successfully");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#fffcf8]"><span className="h-10 w-10 animate-spin rounded-full border-2 border-red-100 border-t-red-600" /></div>;
  }

  if (error || !interior) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffcf8] px-6 text-center">
        <div>
          <h2 className="text-3xl font-black tracking-[-0.05em] text-neutral-950">{error || "Design concept not found"}</h2>
          <Link to="/interiors" className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-600">Back to collections</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
          <Link to="/interiors" className="transition hover:text-neutral-900">Collections</Link>
          <span>/</span>
          <span className="text-red-600">{interior.category}</span>
        </div>

        <section className="grid gap-6 rounded-[34px] border border-neutral-200/80 bg-white p-4 shadow-[0_30px_80px_-50px_rgba(0,0,0,0.4)] sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div className="overflow-hidden rounded-[30px] bg-neutral-100">
            <img src={interior.image} alt={interior.title} className="h-full min-h-[380px] w-full object-cover" />
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">{interior.category}</span>
              {interior.style && <span className="rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">{interior.style}</span>}
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.07em] text-neutral-950 sm:text-5xl">{interior.title}</h1>
            <p className="mt-4 text-sm leading-7 text-neutral-500 sm:text-base">{interior.description}</p>

            <div className="mt-6 rounded-[28px] bg-[#fffaf6] p-5 ring-1 ring-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">Starting project price</p>
                  <p className="mt-1 text-4xl font-black tracking-[-0.06em] text-neutral-950">₹{interior.price.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  {interior.inStock !== false && (interior.stockCount ?? 10) > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      In Stock ({interior.stockCount ?? 10} available)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 ring-1 ring-red-200">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-neutral-100"><ShieldCheck size={14} className="text-emerald-500" /> Secure booking</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-neutral-100"><Truck size={14} className="text-sky-500" /> Free consultation</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 ring-1 ring-neutral-100"><Sparkles size={14} className="text-red-500" /> AI-ready suggestions</span>
              </div>
            </div>

            {notice && <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{notice}</p>}

            {interior.inStock === false || (interior.stockCount ?? 10) <= 0 ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-xs text-red-800">
                <p className="font-bold">This design layout is temporarily out of stock for immediate delivery.</p>
                <p className="mt-1 text-red-600">You can still consult with our studio team via the AI assistant or dashboard chat.</p>
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleAddToCart}
                disabled={busy || interior.inStock === false || (interior.stockCount ?? 10) <= 0}
                className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3.5 text-sm font-bold transition ${
                  interior.inStock === false || (interior.stockCount ?? 10) <= 0
                    ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    : "border-neutral-200 text-neutral-800 hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                }`}
              >
                <ShoppingBag size={16} />
                {interior.inStock === false || (interior.stockCount ?? 10) <= 0
                  ? "Out of Stock"
                  : busy
                  ? "Adding..."
                  : "Add to cart"}
              </button>
              <button
                onClick={() =>
                  interior.inStock !== false &&
                  (interior.stockCount ?? 10) > 0 &&
                  navigate(
                    `/checkout?source=buy_now&id=${interior._id}&quantity=1`
                  )
                }
                disabled={interior.inStock === false || (interior.stockCount ?? 10) <= 0}
                className={`rounded-full px-5 py-3.5 text-sm font-bold text-white transition ${
                  interior.inStock === false || (interior.stockCount ?? 10) <= 0
                    ? "bg-neutral-300 cursor-not-allowed text-neutral-500"
                    : "bg-neutral-950 hover:bg-red-600"
                }`}
              >
                {interior.inStock === false || (interior.stockCount ?? 10) <= 0
                  ? "Unavailable"
                  : "Buy now"}
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[30px] border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-neutral-950">Quick specifications</h2>
            <div className="mt-5 divide-y divide-neutral-100">
              {quickSpecs.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span className="font-bold uppercase tracking-wider text-neutral-400">{label}</span>
                  <span className="font-semibold text-neutral-800">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-neutral-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black tracking-[-0.04em] text-neutral-950">What comes with this concept</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                "Design planning and modular concept detailing",
                "Material and finish guidance from the team",
                "Booking-ready checkout and profile history",
                "Flexible AI assistance for related products",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-[22px] bg-[#fffaf6] p-4 text-sm text-neutral-600 ring-1 ring-neutral-100">
                  <BadgeCheck size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <p>{item}</p>
                </div>
              ))}
            </div>

            {interior.tags?.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {interior.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 ring-1 ring-neutral-200">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default InteriorDetailPage;
