import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Bot,
  Send,
  User,
  Phone,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // 🟢 Added for navigation
import useDocumentTitle from "../hooks/useDocumentTitle";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [userName, setUserName] = useState("User");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";
  
  const navigate = useNavigate(); // 🟢 Initialized navigate hook
  const messagesEndRef = useRef<any>(null);
  useDocumentTitle("AI Assistant");

  // ==========================================
  // 🔄 1. PERFECT HISTORY SYNC (INITIAL LOAD)
  // ==========================================
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
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && Array.isArray(res.data)) {
          const formattedMessages = res.data.map((chat: any) => ({
            role: chat.role,
            content: chat.content,
            data: chat.data || null
          }));
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.log("Error fetching server history:", err);
      }
    };

    fetchChatHistory();
  }, []);

  // ==========================================
  // ⏳ 2. FIXED TYPING EFFECT (CRASH-PROOF & CARDS SAFE)
  // ==========================================
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
            // 🟢 Structured properly so items never disappear after typing complete
            data: rawAiReply ? {
              items: rawAiReply.items || [],
              tool: rawAiReply.tool || null,
              data: rawAiReply.data || null
            } : null,
          },
        ]);
        setTypingText("");
      }
    }, 15);
  };

  // ==========================================
  // 📜 3. CONTROLLED AUTO-SCROLL
  // ==========================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, typingText]);

  // 🧹 4. Clear Chat Handler
  const handleClearChat = () => {
    if (window.confirm("Kya aap sach me saari chat history delete karna chahte hain?")) {
      setMessages([]);
      setTypingText("");
    }
  };

  // ==========================================
  // 🚀 5. HANDLE SEND MESSAGE (CRASH PROOF)
  // ==========================================
  const handleGenerate = async () => {
    if (loading || !message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");

    try {
      setLoading(true);
      setTypingText(""); 

      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_BASE_URL}/api/ai`,
        { message: currentMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API RESPONSE:", res.data);
      
      const aiReply = res.data?.reply;
      const aiMessageText = aiReply?.message || aiReply?.content || "Done";

      triggerTypingEffect(aiMessageText, aiReply);

    } catch (error: any) {
      console.log("CRITICAL API ERROR:", error);
      const serverErrorMessage = error.response?.data?.message || "Server temporarily busy hai. Kripya dubaara koshish karein.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: serverErrorMessage,
          data: {
            message: serverErrorMessage,
            items: []
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-60px)] md:h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/50 flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="border-b border-red-100 bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-3 shadow-sm z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-2.5 sm:p-3 rounded-[18px] sm:rounded-[22px] text-white shadow-md shadow-red-500/20">
              <Bot size={22} className="sm:w-[26px] sm:h-[26px]" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold flex items-center gap-1.5 text-gray-900">
                Kiwi AI Assistant <span className="text-red-500 text-xs sm:text-sm">✨</span>
              </h1>
              <p className="text-gray-500 text-[10px] sm:text-xs">
                Welcome, <span className="font-semibold text-red-600">{userName}</span> 👋 Design your space
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Online</span>
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                title="Clear Chat History"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CHAT CONTAINER */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 && !loading && (
            <div className="text-center mt-12 sm:mt-16 animate-fade-in">
              <div className="inline-flex bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] mb-4 sm:mb-6 shadow-xl shadow-red-500/10">
                <Bot size={35} className="sm:w-[45px] sm:h-[45px]" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight px-2">
                Welcome back, <span className="text-red-500">{userName}</span>!
              </h2>
              <p className="text-gray-500 mt-3 text-xs sm:text-base max-w-xl mx-auto leading-relaxed px-4">
                Aap mujhse bedroom designs, modern kitchens, luxury sofas, pricing ya interiors ka budget plan karne ko bol sakte hain.
              </p>
            </div>
          )}

          {/* RENDER CHAT MESSAGES */}
          {messages.map((msg, index) => (
            <div key={index} className="space-y-4">
              {/* USER MESSAGE */}
              {msg.role === "user" && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] sm:max-w-[80%] bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-[20px] rounded-br-sm shadow-md">
                    <div className="flex items-center gap-2 mb-1 opacity-75">
                      <User size={12} />
                      <span className="font-medium text-[10px]">You</span>
                    </div>
                    <p className="leading-relaxed text-xs sm:text-sm">{msg.content}</p>
                  </div>
                </div>
              )}

              {/* AI MESSAGE */}
              {msg.role === "assistant" && (
                <div className="flex gap-2 sm:gap-3 items-start">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-[14px] sm:rounded-[18px] shadow-sm shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="flex-1 bg-white rounded-[20px] sm:rounded-[26px] p-4 sm:p-5 shadow-sm border border-gray-100 space-y-4 overflow-hidden">
                    {msg.content && (
                      <div className="bg-slate-50 border border-slate-100 rounded-[14px] sm:rounded-[18px] p-3 sm:p-4">
                        <p className="text-gray-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </p>
                      </div>
                    )}

                    {/* INTERIOR TOOLS CARDS */}
                    {msg.data?.items && msg.data.items.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {msg.data.items.map((item: any) => (
                          // 🟢 1. Fixed URL navigation from /interiors/ to /interior/
                          <div 
                            key={item._id} 
                            onClick={() => navigate(`/interior/${item._id}`)}
                            className="group cursor-pointer overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                          >
                            <div className="relative overflow-hidden aspect-video bg-gray-100">
                              <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              <div className="absolute top-2 left-2">
                                <span className="bg-white/95 backdrop-blur-sm text-red-500 px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm capitalize">{item.category}</span>
                              </div>
                            </div>
                            <div className="p-3.5 space-y-1.5">
                              <h2 className="font-bold text-base text-gray-900 line-clamp-1">{item.title}</h2>
                              <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">{item.description}</p>
                              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                <div>
                                  <p className="text-[9px] text-gray-400 font-medium">Starting from</p>
                                  <p className="text-red-500 font-extrabold text-base">₹{item.price?.toLocaleString()}</p>
                                </div>
                                <button className="bg-gray-900 group-hover:bg-red-500 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-sm transition-colors duration-200">
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CONTACT SUPPORT OVERLAY */}
                    {msg.data?.tool === "contactSupport" && msg.data?.data && (
                      <div className="bg-gradient-to-br from-red-50/50 to-white rounded-[16px] p-3 border border-red-50 space-y-2">
                        <h3 className="text-xs font-bold text-gray-900">Direct Showroom Channels</h3>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <a href={`tel:${msg.data.data.phone}`} className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 text-[11px] font-semibold px-3 py-2 rounded-xl border border-gray-200 shadow-sm transition-all">
                            <Phone size={12} className="text-green-600" /> Call: {msg.data.data.phone}
                          </a>
                          <a href={`https://wa.me/${msg.data.data.whatsapp?.replace("+", "")}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold px-3 py-2 rounded-xl shadow-sm transition-all">
                            WhatsApp Connect
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* LIVE TYPING STREAM */}
          {typingText && (
            <div className="flex gap-2 sm:gap-3 items-start animate-fade-in">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-[14px] sm:rounded-[18px] shadow-sm shrink-0">
                <Bot size={16} />
              </div>
              <div className="flex-1 bg-white rounded-[20px] sm:rounded-[26px] p-4 sm:p-5 shadow-sm border border-gray-100">
                <div className="bg-slate-50 border border-slate-100 rounded-[14px] sm:rounded-[18px] p-3 sm:p-4">
                  <p className="text-gray-800 text-xs sm:text-sm leading-relaxed">
                    {typingText}
                    <span className="inline-block w-1.5 h-3.5 bg-red-500 animate-pulse ml-1 align-middle" />
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* LOADING STREAM */}
          {loading && !typingText && (
            <div className="flex gap-2 sm:gap-3 items-start animate-pulse">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded-[14px] sm:rounded-[18px] shadow-sm shrink-0">
                <Bot size={16} />
              </div>
              <div className="flex-1 bg-white rounded-[20px] sm:rounded-[26px] border border-gray-100 p-4 sm:p-5 shadow-sm space-y-2.5">
                <div className="h-3 rounded bg-gray-200 w-full" />
                <div className="h-3 rounded bg-gray-200 w-[60%]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT BAR */}
      <div className="fixed bottom-[58px] md:sticky md:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 p-3 sm:p-4 z-20">
        <div className="max-w-5xl mx-auto flex gap-2 sm:gap-3 items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="Ghar ke interior ke baare me kuch bhi pucho..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 sm:px-5 sm:py-3 outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all text-xs sm:text-sm text-gray-800 shadow-inner"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !message.trim()}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 active:scale-95 transition-all text-white rounded-full p-2.5 sm:p-3 shadow-md shadow-red-500/10 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;