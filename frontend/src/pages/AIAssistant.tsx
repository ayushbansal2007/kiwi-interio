import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Bot,
  Send,
  User,
  Phone,
  Trash2,
} from "lucide-react";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [userName, setUserName] = useState("User");
  
  const messagesEndRef = useRef<any>(null);

  // ==========================================
  // 🔄 1. PERFECT HISTORY SYNC (INITIAL LOAD)
  // ==========================================
  useEffect(() => {
    // A. User metadata load karo
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user?.name || user?.username || "Guest User");
      } catch (e) {
        console.log("User load error:", e);
      }
    }

    // B. Server se saari pichli database chat history khinch kar lao
    const fetchChatHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/chat-history", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 🔥 FIX: Agar database me purani chat hai, toh use direct state me set karo
        // Isse page refresh hote hi user ko apna kal wala modern bed ka content screen par dikhega!
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
  // ⏳ 2. FIXED TYPING EFFECT (SMOOTH & SAFE)
  // ==========================================
  const triggerTypingEffect = (fullText: string, rawAiReply: any) => {
    let index = 0;
    setTypingText("");

    // 🚀 100x FIX: 1000 setTimeout ke bajay, sirf EK SINGLE interval RAM me chalega.
    const intervalId = setInterval(() => {
      setTypingText((prev) => prev + fullText[index]);
      index++;

      // Jab poora text print ho jaye, toh chunk ko close karo
      if (index >= fullText.length) {
        clearInterval(intervalId); // Memory cleanup

        // Ab poore text ko official message state me ek sath push karo
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: fullText,
            data: rawAiReply,
          },
        ]);
        setTypingText(""); // Streaming placeholder saaf
      }
    }, 15); // Stable 15ms frame rate render
  };

  // ==========================================
  // 📜 3. CONTROLLED AUTO-SCROLL
  // ==========================================
  useEffect(() => {
    // 🔥 FIX: typingText dependency removed!
    // Ab user typing ke dauran upar scroll karke purani chat bina jhatke ke padh sakta hai.
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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

    // Naya message screen par turant jodo (Purane state ko barkrar rakhte hue)
    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");

    try {
      setLoading(true);
      setTypingText(""); 

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/ai",
        { message: currentMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API RESPONSE:", res.data);
      
      const aiReply = res.data?.reply;
      const aiMessageText = aiReply?.message || aiReply?.content || "Done";

      // 🔥 EXPOSE FIXED: Purane loops ko tata-byebye bolo, clean animation chalu karo
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
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/50 flex flex-col">
      {/* HEADER */}
      <div className="border-b border-red-100 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-sm z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-[22px] text-white shadow-md shadow-red-500/20">
              <Bot size={26} />
            </div>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                Kiwi AI Assistant <span className="text-red-500 text-sm">✨</span>
              </h1>
              <p className="text-gray-500 text-xs">
                Welcome, <span className="font-semibold text-red-600">{userName}</span> 👋 Design your dream space
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-700">Online</span>
            </div>
            
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 border border-transparent hover:border-red-100"
                title="Clear Chat History"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CHAT CONTAINER */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.length === 0 && !loading && (
            <div className="text-center mt-16 animate-fade-in">
              <div className="inline-flex bg-gradient-to-r from-red-500 to-red-600 text-white p-5 rounded-[28px] mb-6 shadow-xl shadow-red-500/10">
                <Bot size={45} />
              </div>
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                Welcome back, <span className="text-red-500">{userName}</span>!
              </h2>
              <p className="text-gray-500 mt-3 text-base max-w-xl mx-auto leading-relaxed">
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
                  <div className="max-w-[80%] bg-gradient-to-r from-gray-800 to-gray-900 text-white px-5 py-3.5 rounded-[24px] rounded-br-sm shadow-md">
                    <div className="flex items-center gap-2 mb-1.5 opacity-75">
                      <User size={13} />
                      <span className="font-medium text-xs">You</span>
                    </div>
                    <p className="leading-relaxed text-sm">{msg.content}</p>
                  </div>
                </div>
              )}

              {/* AI MESSAGE */}
              {msg.role === "assistant" && (
                <div className="flex gap-3 items-start">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2.5 rounded-[18px] shadow-sm">
                    <Bot size={18} />
                  </div>
                  <div className="flex-1 bg-white rounded-[26px] p-5 shadow-sm border border-gray-100 space-y-4">
                    {(msg.data?.message || msg.content) && (
                      <div className="bg-slate-50 border border-slate-100 rounded-[18px] p-4">
                        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                          {msg.data?.message || msg.content}
                        </p>
                      </div>
                    )}

                    {/* INTERIOR TOOLS CARDS */}
                    {msg.data?.items?.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-4 pt-2">
                        {msg.data.items.map((item: any) => (
                          <div key={item._id} className="group overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="relative overflow-hidden aspect-video bg-gray-100">
                              <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              <div className="absolute top-3 left-3">
                                <span className="bg-white/95 backdrop-blur-sm text-red-500 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm capitalize">{item.category}</span>
                              </div>
                            </div>
                            <div className="p-4 space-y-2">
                              <h2 className="font-bold text-lg text-gray-900 line-clamp-1">{item.title}</h2>
                              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{item.description}</p>
                              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                                <div>
                                  <p className="text-[10px] text-gray-400 font-medium">Starting from</p>
                                  <p className="text-red-500 font-extrabold text-xl">₹{item.price?.toLocaleString()}</p>
                                </div>
                                <button className="bg-gray-900 hover:bg-red-500 text-white text-xs px-4 py-2 rounded-xl shadow-sm transition-colors duration-200 font-medium">View Details</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CONTACT SUPPORT OVERLAY */}
                    {msg.data?.tool === "contactSupport" && msg.data?.data && (
                      <div className="bg-gradient-to-br from-red-50/50 to-white rounded-[20px] p-4 border border-red-50 space-y-3">
                        <h3 className="text-sm font-bold text-gray-900">Direct Showroom Channels</h3>
                        <div className="flex flex-wrap gap-2">
                          <a href={`tel:${msg.data.data.phone}`} className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 shadow-sm transition-all">
                            <Phone size={14} className="text-green-600" /> Call: {msg.data.data.phone}
                          </a>
                          <a href={`https://wa.me/${msg.data.data.whatsapp?.replace("+", "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all">
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
            <div className="flex gap-3 items-start animate-fade-in">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2.5 rounded-[18px] shadow-sm">
                <Bot size={18} />
              </div>
              <div className="flex-1 bg-white rounded-[26px] p-5 shadow-sm border border-gray-100">
                <div className="bg-slate-50 border border-slate-100 rounded-[18px] p-4">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {typingText}
                    <span className="inline-block w-1.5 h-3.5 bg-red-500 animate-pulse ml-1 align-middle" />
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* LOADING STREAM */}
          {loading && !typingText && (
            <div className="flex gap-3 items-start animate-pulse">
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2.5 rounded-[18px] shadow-sm">
                <Bot size={18} />
              </div>
              <div className="flex-1 bg-white rounded-[26px] border border-gray-100 p-5 shadow-sm space-y-3">
                <div className="h-3.5 rounded bg-gray-200 w-full" />
                <div className="h-3.5 rounded bg-gray-200 w-[60%]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT BAR */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4">
        <div className="max-w-5xl mx-auto flex gap-3 items-center">
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
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all text-sm text-gray-800 shadow-inner"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !message.trim()}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 active:scale-95 transition-all text-white rounded-full p-3 shadow-md shadow-red-500/10 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;