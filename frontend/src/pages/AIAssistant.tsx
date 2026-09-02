import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Bot,
  Send,
  User,
  Phone,
  Trash2,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { addToCart } from "../services/commerceService";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [userName, setUserName] = useState("User");
  const [addingId, setAddingId] = useState<string | null>(null);
  const [cartSuccess, setCartSuccess] = useState<string | null>(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  const navigate = useNavigate();
  const messagesEndRef = useRef<any>(null);
  useDocumentTitle("AI Interior Architect | Kiwi Interio");

  // History sync on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user?.name || user?.username || "Guest User");
      } catch (e) {
        console.log("User load error:", e);
      }
    }

    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(`${API_BASE_URL}/api/chat-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data && Array.isArray(res.data)) {
          const formattedMessages = res.data.map((chat: any) => ({
            role: chat.role,
            content: chat.content || chat.message,
            data: chat.data || null,
          }));
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.log("Error fetching server history:", err);
      }
    };

    fetchChatHistory();
  }, []);

  // Typing Effect
  const triggerTypingEffect = (fullText: string, rawAiReply: any) => {
    let index = 0;
    setTypingText("");

    const intervalId = setInterval(() => {
      if (fullText && fullText[index]) {
        setTypingText((prev) => prev + fullText[index]);
        index++;
      } else {
        index = fullText.length;
      }

      if (index >= fullText.length) {
        clearInterval(intervalId);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: fullText,
            data: rawAiReply
              ? {
                  items: rawAiReply.items || [],
                  tool: rawAiReply.tool || null,
                  data: rawAiReply.data || null,
                }
              : null,
          },
        ]);
        setTypingText("");
      }
    }, 12);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, typingText]);

  const handleClearChat = () => {
    if (window.confirm("Do you want to reset the current AI conversation?")) {
      setMessages([]);
      setTypingText("");
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setMessage(promptText);
  };

  const handleAddToCartQuick = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAddingId(itemId);
    try {
      await addToCart(itemId, 1);
      setCartSuccess(itemId);
      setTimeout(() => setCartSuccess(null), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  const handleGenerate = async () => {
    if (loading || !message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      data: null,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = message;
    setMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE_URL}/api/ai`,
        { message: currentInput },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const aiReply = res.data.reply;

      if (aiReply && aiReply.message) {
        triggerTypingEffect(aiReply.message, aiReply);
      } else {
        triggerTypingEffect(
          "I have processed your request. Let me know if you would like to explore specific materials or floor plan blueprints.",
          null
        );
      }
    } catch (error) {
      console.log("AI Chat Error:", error);
      triggerTypingEffect(
        "Our design server is experiencing heavy demand. Please try again in a few moments.",
        null
      );
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "🌟 Suggest a Scandinavian Living Room concept",
    "🍳 Modular Kitchen blueprints under ₹1.8L",
    "🛏️ Minimalist Master Bedroom layout",
    "📐 Turnkey 3BHK interior cost estimation",
  ];

  return (
    <div className="flex min-h-[calc(100vh-76px)] flex-col bg-[#fffcf8]">
      {/* Top Header Bar */}
      <div className="sticky top-[76px] z-30 border-b border-neutral-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-neutral-950 text-white shadow-md">
              <Bot size={20} className="text-red-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-neutral-950">Kiwi AI Architect</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
                  RAG Matrix Live
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Spatial layout recommendations & material cost planner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-600 transition hover:border-red-200 hover:text-red-600 shadow-xs"
              title="Reset conversation"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Welcome Screen if Empty */}
          {messages.length === 0 && !loading && !typingText && (
            <div className="my-10 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto max-w-lg rounded-[36px] border border-neutral-200/80 bg-white p-8 shadow-xl"
              >
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-neutral-950 text-white shadow-lg">
                  <Sparkles size={24} className="text-red-500" />
                </span>
                <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-neutral-950 sm:text-3xl">
                  Hello, {userName}!
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                  I'm your Kiwi AI interior architect. Ask me anything about floor plans, budget estimation, color combinations, or specific furniture designs from our catalog.
                </p>

                {/* Quick Prompts Chips */}
                <div className="mt-6 space-y-2 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Suggested Design Prompts:
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {samplePrompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => handleQuickPrompt(p.replace(/^[^\w]+/, ""))}
                        className="rounded-2xl border border-neutral-200/80 bg-[#fffaf6] p-3 text-left text-xs font-semibold text-neutral-700 transition hover:border-red-300 hover:bg-white hover:text-red-600"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 items-start ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar Icon */}
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-xs font-black shadow-sm ${
                  msg.role === "user"
                    ? "bg-neutral-950 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </span>

              {/* Message Bubble Canvas */}
              <div
                className={`max-w-[85%] space-y-3 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-[26px] p-5 shadow-sm text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-tr-md bg-neutral-950 text-white"
                      : "rounded-tl-md bg-white border border-neutral-200/80 text-neutral-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Render Product Cards if Returned by AI RAG */}
                {msg.data?.items && msg.data.items.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                    {msg.data.items.map((item: any) => (
                      <div
                        key={item._id}
                        onClick={() => navigate(`/interior/${item._id}`)}
                        className="group cursor-pointer overflow-hidden rounded-[26px] border border-neutral-200/80 bg-white p-3 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-neutral-100">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-600 shadow-xs">
                            {item.category}
                          </span>
                        </div>

                        <div className="pt-3">
                          <h3 className="truncate text-base font-black text-neutral-950">
                            {item.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                            {item.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                            <div>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                Starting Price
                              </p>
                              <p className="text-base font-black text-neutral-950">
                                ₹{item.price?.toLocaleString("en-IN")}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleAddToCartQuick(item._id, e)}
                              disabled={addingId === item._id}
                              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition hover:bg-red-600 disabled:opacity-50"
                            >
                              {cartSuccess === item._id ? (
                                <>
                                  <CheckCircle2 size={13} className="text-emerald-400" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={13} />
                                  {addingId === item._id ? "Adding..." : "Add to Cart"}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Showroom Direct Connect Tool */}
                {msg.data?.tool === "contactSupport" && msg.data?.data && (
                  <div className="rounded-[22px] border border-red-200 bg-red-50/70 p-4 space-y-2.5">
                    <p className="text-xs font-bold text-red-950">
                      Direct Showroom & Architect Line
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`tel:${msg.data.data.phone}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-neutral-900 shadow-xs border border-neutral-200 hover:bg-neutral-50"
                      >
                        <Phone size={13} className="text-emerald-600" />
                        Call Showroom: {msg.data.data.phone}
                      </a>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-950 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-600"
                      >
                        Submit Design Form →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Real-Time Typing Stream */}
          {typingText && (
            <div className="flex gap-3 items-start animate-fade-in">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-red-600 text-white shadow-sm">
                <Bot size={16} />
              </span>
              <div className="max-w-[85%] rounded-[26px] rounded-tl-md border border-neutral-200 bg-white p-5 shadow-sm">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-900">
                  {typingText}
                  <span className="inline-block h-3.5 w-1.5 animate-pulse bg-red-600 ml-1 align-middle" />
                </p>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && !typingText && (
            <div className="flex gap-3 items-start animate-pulse">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-red-600 text-white shadow-sm">
                <Bot size={16} />
              </span>
              <div className="max-w-md rounded-[26px] rounded-tl-md border border-neutral-200 bg-white p-5 shadow-sm space-y-2">
                <div className="h-3.5 w-48 rounded-full bg-neutral-200" />
                <div className="h-3 w-64 rounded-full bg-neutral-100" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Composer Input Bar */}
      <div className="sticky bottom-0 z-30 border-t border-neutral-200/80 bg-white/95 p-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-2.5 shadow-sm transition focus-within:border-neutral-950 focus-within:bg-white">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleGenerate();
                }
              }}
              placeholder="Ask anything about interior blueprints, budgets, materials, colors..."
              className="w-full bg-transparent text-xs sm:text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !message.trim()}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white transition hover:bg-red-600 disabled:opacity-40"
              title="Send prompt"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-neutral-400">
            Kiwi AI Assistant generates real-time inventory recommendations from verified architectural catalogs.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;