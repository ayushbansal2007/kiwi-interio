import { useState } from "react";
import { CheckCircle2, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { apiClient } from "../services/apiClient";

function ContactQuery() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const response = await apiClient(`${API_BASE_URL}/api/queries/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, message }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTicketId(data.data?.ticketId || "KI-SUBMITTED");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        setTimeout(() => {
          setTicketId(null);
          setIsOpen(false);
        }, 4000);
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
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-2xl ring-2 ring-white/30 transition hover:bg-red-600 sm:px-5 sm:py-3.5"
      >
        {isOpen ? (
          <>
            <X size={15} />
            <span>Close</span>
          </>
        ) : (
          <>
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span>Free 3D Blueprint</span>
          </>
        )}
      </motion.button>

      {/* Floating Modal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 max-h-[80vh] w-[calc(100vw-32px)] overflow-hidden rounded-[32px] border border-neutral-200/80 bg-white shadow-2xl sm:w-[400px]"
          >
            {/* Modal Header */}
            <div className="bg-neutral-950 p-6 text-white">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-red-600 text-white">
                  <Sparkles size={14} />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-400">
                  Direct Studio Desk
                </p>
              </div>
              <h3 className="mt-2 text-xl font-black tracking-[-0.04em]">
                Request Architectural Blueprint
              </h3>
              <p className="mt-1 text-xs text-neutral-400">
                Share your space details. Our chief designer will contact you within 24 hours.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 bg-[#fffaf6]">
              {ticketId && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-xs font-bold text-emerald-800"
                >
                  <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-1" />
                  <p>Inquiry Registered Successfully!</p>
                  <p className="mt-0.5 text-[10px] text-emerald-600">Ticket #{ticketId}</p>
                </motion.div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs text-neutral-900 outline-none transition focus:border-neutral-950"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs text-neutral-900 outline-none transition focus:border-neutral-950"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10 digit contact number"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs text-neutral-900 outline-none transition focus:border-neutral-950"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Project / Room Requirements
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. 3BHK Modular kitchen, living room wooden paneling..."
                  className="w-full rounded-2xl border border-neutral-200 bg-white p-3 text-xs text-neutral-900 outline-none resize-none transition focus:border-neutral-950"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-neutral-950 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-red-600 disabled:opacity-40"
              >
                {loading ? "Registering Blueprint Request..." : "Submit Consultation Request"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ContactQuery;