import { useState } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";

function ContactQuery() {
  useDocumentTitle("Get In Touch | Kiwi Interio");

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loading || setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/queries/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setTimeout(() => {
          setSuccess(false);
          setIsOpen(false);
        }, 3500);
      } else {
        alert(data.message || "Failed to submit query");
      }
    } catch (error) {
      console.error("Query Error:", error);
      alert("Network Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🟢 FIXED: Mobile pe bottom-20 (navbar ke upar) aur desktop pe bottom-6. z-index ko z-40 kiya taaki navbar (z-50) iske upar clean close ho sake
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 font-sans text-black">
      
      {/* 🔴 CHATBOT STYLE TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black hover:bg-red-600 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 font-bold text-[10px] sm:text-xs uppercase tracking-widest"
      >
        {isOpen ? (
          <>
            <span>Close</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>Inquire Now</span>
          </>
        )}
      </button>

      {/* 🧾 FLOATING CONTACT QUERY PANEL */}
      {isOpen && (
        // 🟢 FIXED: `bottom-14 sm:bottom-16` spacing adjustments kiye taaki button ke thik upar pop-up khule aur text responsive handle ho
        <div className="absolute bottom-14 sm:bottom-16 right-0 w-[calc(100vw-32px)] sm:w-[380px] max-h-[70vh] flex flex-col bg-white border border-stone-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Top Branding Panel */}
          <div className="bg-stone-950 text-white p-4 sm:p-5 shrink-0">
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-red-500 mb-1">
              Connect With Studio
            </p>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
              Let's Shape Your Vision
            </h3>
            <p className="text-stone-400 text-[10px] sm:text-[11px] mt-0.5">
              Drop your details. Our team will sync within 24 hours.
            </p>
          </div>

          {/* Core Input Form */}
          {/* 🟢 FIXED: Added `overflow-y-auto` taaki chhote mobile screens pe form cut na ho aur scroll ho sake */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3 sm:space-y-4 bg-stone-50/60 overflow-y-auto flex-1">
            {success && (
              <div className="bg-emerald-600 text-white p-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-center rounded-lg">
                ✓ Workspace Concept Registered!
              </div>
            )}

            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <label className="text-[9px] font-bold uppercase text-stone-400 tracking-wider block mb-0.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full border-b border-stone-200 focus:border-black py-1 bg-transparent text-xs sm:text-sm outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-stone-400 tracking-wider block mb-0.5">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full border-b border-stone-200 focus:border-black py-1 bg-transparent text-xs sm:text-sm outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-stone-400 tracking-wider block mb-0.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full border-b border-stone-200 focus:border-black py-1 bg-transparent text-xs sm:text-sm outline-none transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase text-stone-400 tracking-wider block mb-0.5">Project Requirements</label>
                <textarea
                  required
                  rows={2}
                  className="w-full border border-stone-200 focus:border-black p-2 mt-1 bg-white text-xs sm:text-sm outline-none resize-none rounded-lg transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white hover:bg-red-600 py-2.5 sm:py-3 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40 mt-1 shadow-md"
            >
              {loading ? "Registering Query Schema..." : "Submit Inquiry"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default ContactQuery;