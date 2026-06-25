import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useParams, Link } from "react-router-dom";
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

function InteriorDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const [interior, setInterior] = useState<Interior | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // FAQ state manager
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const API_BASE_URL = 
    window.location.hostname === "localhost"
      ? "http://localhost:5000/api"
      : "https://kiwi-interio.onrender.com/api";

  useDocumentTitle(interior ? `${interior.title} | Kiwi Interio` : "Loading Design Masterpiece...");

  useEffect(() => {
    if (!id) return;

    const fetchSingleInterior = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/interiors/${id}`);
        if (!res.ok) throw new Error("Design setup could not be retrieved.");
        const data = await res.json();
        setInterior(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchSingleInterior();
  }, [id, API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-stone-200 border-t-red-600 rounded-full animate-spin" />
        <p className="text-xs uppercase font-bold tracking-[0.25em] text-stone-500">Loading Kiwi Blueprints...</p>
      </div>
    );
  }

  if (error || !interior) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black uppercase tracking-tight">{error || "Design Concept Not Found."}</h2>
        <Link to="/" className="mt-8 bg-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest">Back To Collections</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black pt-24 pb-32 px-4 sm:px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        
        {/* ─── UPPER ZONE: AMAZON HERO IMAGE & BUY BOX ─── */}
        <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold tracking-widest uppercase mb-8">
          <Link to="/" className="hover:text-black">COLLECTIONS</Link>
          <span>/</span>
          <span className="text-red-600">{interior.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-16 border-b border-stone-200">
          {/* Left: HD Image Display */}
          <div className="lg:col-span-7 border border-stone-100 bg-stone-50 shadow-xl overflow-hidden">
            <img src={interior.image} alt={interior.title} className="w-full h-[350px] sm:h-[500px] lg:h-[580px] object-cover" />
          </div>

          {/* Right: Premium Buy Box */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-black tracking-widest text-red-600 uppercase mb-1">{interior.roomType}</p>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900 leading-tight">{interior.title}</h1>
            </div>

            <p className="text-stone-500 text-sm leading-relaxed font-light">{interior.description}</p>

            <div className="bg-stone-50 border-l-4 border-black p-5 space-y-1">
              <p className="text-stone-400 text-[9px] tracking-widest uppercase font-bold">M.R.P. Inclusive of Execution</p>
              <p className="text-3xl font-black text-black tracking-tight">₹{interior.price.toLocaleString("en-IN")}/-</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">✔ Free Site Inspection & Layout Customization</p>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-black hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest py-4.5 transition-colors shadow-md">
                Buy Now & Book Project
              </button>
              <button className="w-full border border-stone-300 hover:border-black text-black text-xs font-bold uppercase tracking-widest py-4 transition-colors">
                Add to Blueprint Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* ─── LOWER ZONE: AMAZON STYLE PRODUCT BREAKDOWN ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-16">
          
          {/* Left Column: Specs Table & Package Details */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* 📊 Section 1: Technical Specifications Table */}
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider mb-6 pb-2 border-b-2 border-black inline-block">
                Product Technical Specifications
              </h3>
              <div className="border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      <td className="p-4 font-bold text-stone-500 uppercase tracking-wider w-1/3 border-r border-stone-200">Category</td>
                      <td className="p-4 font-semibold text-black uppercase">{interior.category}</td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="p-4 font-bold text-stone-500 uppercase tracking-wider border-r border-stone-200">Subcategory</td>
                      <td className="p-4 font-semibold text-black uppercase">{interior.subcategory}</td>
                    </tr>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      <td className="p-4 font-bold text-stone-500 uppercase tracking-wider border-r border-stone-200">Design Aesthetic</td>
                      <td className="p-4 font-semibold text-black uppercase">{interior.style} Layout</td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="p-4 font-bold text-stone-500 uppercase tracking-wider border-r border-stone-200">Primary Material Used</td>
                      <td className="p-4 text-stone-600">Premium HDMR & Anti-Scratch Acrylic Panels (Greenpanel/Action TESA)</td>
                    </tr>
                    <tr className="bg-stone-50">
                      <td className="p-4 font-bold text-stone-500 uppercase tracking-wider border-r border-stone-200">Hardware & Fittings</td>
                      <td className="p-4 text-stone-600">Soft-close Hydraulic Hinger & Hafele/Hettich Channels</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📦 Section 2: What's Included in this Price */}
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider mb-6 pb-2 border-b-2 border-black inline-block">
                What's Included In the Estimate?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Complete raw material sourcing and on-site hardware delivery.",
                  "Full carpentry fabrication with 10X Thin laser finishing.",
                  "Premium lighting layout wiring with modular switch integration.",
                  "5-Year onsite breakdown warranty certificate on structural profiles."
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start border border-stone-200 p-4 bg-stone-50">
                    <span className="text-red-600 font-bold">✓</span>
                    <p className="text-stone-600 text-xs leading-relaxed font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: FAQ Accordion Support */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-lg font-black uppercase tracking-wider pb-2 border-b-2 border-black inline-block w-full">
              Have Questions? (FAQs)
            </h3>
            
            <div className="space-y-3">
              {[
                { q: "Can I change colors or materials later?", a: "Yes, fully customizable! Site engineer validation ke baad aap finishes choose kar sakte hain." },
                { q: "How long does the execution process take?", a: "Standard setups take 21-30 business days from blueprint approvals to final handover." },
                { q: "Is there an EMI financing setup option available?", a: "Yes, zero-cost booking options are processed directly during site consultation checks." }
              ].map((faq, index) => (
                <div key={index} className="border border-stone-200 bg-white">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-black uppercase tracking-wider transition-colors hover:bg-stone-50"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg font-light text-stone-400">{openFaq === index ? "−" : "+"}</span>
                  </button>
                  {openFaq === index && (
                    <div className="p-4 pt-0 text-stone-500 text-xs leading-relaxed font-light border-t border-stone-100 bg-stone-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

export default InteriorDetailPage;