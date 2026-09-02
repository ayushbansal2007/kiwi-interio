import { useEffect, useMemo, useState } from "react";
import {
  CheckCheck,
  Clock3,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../services/apiClient";
import { onSupportNewMessage, sendSupportMessage } from "../services/socket";

interface ConversationItem {
  user: {
    _id: string;
    name: string;
    email: string;
    number?: string;
    avatar?: string;
    role?: string;
    lastLoginAt?: string;
  };
  latestMessage: string;
  latestSenderRole: "user" | "admin";
  latestCreatedAt: string;
  unreadCount: number;
  totalMessages: number;
}

interface SupportMessage {
  _id: string;
  userId: string;
  senderRole: "user" | "admin";
  senderName?: string;
  message: string;
  createdAt: string;
}

export default function AdminSupportDesk() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<SupportMessage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  // Load conversation summary list
  const loadConversations = async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const res = await apiClient(`${API_BASE_URL}/api/support/admin/conversations`);
      const payload = await res.json();
      if (payload.success && Array.isArray(payload.data)) {
        setConversations(payload.data);
        // Auto-select first conversation if none selected
        if (!selectedUserId && payload.data.length > 0) {
          setSelectedUserId(payload.data[0].user._id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      if (!silent) setLoadingList(false);
    }
  };

  useEffect(() => {
    void loadConversations();
  }, [API_BASE_URL]);

  // Load chat messages when selectedUserId changes
  useEffect(() => {
    if (!selectedUserId) {
      setActiveMessages([]);
      return;
    }

    let isCancelled = false;
    setLoadingChat(true);

    apiClient(`${API_BASE_URL}/api/support/admin/messages/${selectedUserId}`)
      .then((res) => res.json())
      .then((payload) => {
        if (!isCancelled && payload.success && Array.isArray(payload.data)) {
          setActiveMessages(payload.data);
          // Mark conversation as read locally
          setConversations((prev) =>
            prev.map((c) =>
              c.user._id === selectedUserId ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      })
      .catch((err) => console.error("Error loading chat messages:", err))
      .finally(() => {
        if (!isCancelled) setLoadingChat(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedUserId, API_BASE_URL]);

  // Socket listener for incoming support messages
  useEffect(() => {
    const unsub = onSupportNewMessage((newMsg: SupportMessage) => {
      // 1. Update active message thread if currently viewing this user
      if (selectedUserId && newMsg.userId === selectedUserId) {
        setActiveMessages((prev) => {
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }

      // 2. Update conversation list preview
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.user._id === newMsg.userId);
        if (index !== -1) {
          const updated = [...prev];
          const conv = updated[index];
          const isViewing = selectedUserId === newMsg.userId;
          updated[index] = {
            ...conv,
            latestMessage: newMsg.message,
            latestSenderRole: newMsg.senderRole,
            latestCreatedAt: newMsg.createdAt,
            unreadCount:
              newMsg.senderRole === "user" && !isViewing
                ? conv.unreadCount + 1
                : conv.unreadCount,
            totalMessages: conv.totalMessages + 1,
          };
          // Move to top
          return [updated[index], ...updated.filter((_, i) => i !== index)];
        } else {
          // New conversation from new user: refresh conversation list
          void loadConversations(true);
          return prev;
        }
      });
    });

    return () => {
      unsub();
    };
  }, [selectedUserId]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.user._id === selectedUserId),
    [conversations, selectedUserId]
  );

  const filteredConversations = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.user.name?.toLowerCase().includes(q) ||
        c.user.email?.toLowerCase().includes(q) ||
        c.user.number?.includes(q) ||
        c.latestMessage?.toLowerCase().includes(q)
    );
  }, [conversations, searchTerm]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputMessage).trim();
    if (!selectedUserId || !messageText || sending) return;

    setSending(true);

    sendSupportMessage(
      {
        targetUserId: selectedUserId,
        message: messageText,
      },
      async (response) => {
        if (!response || !response.success) {
          // REST Fallback
          try {
            const res = await apiClient(
              `${API_BASE_URL}/api/support/admin/messages/${selectedUserId}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: messageText }),
              }
            );
            const payload = await res.json();
            if (payload.data) {
              setActiveMessages((prev) => [...prev, payload.data]);
            }
          } catch (err) {
            console.error("Failed to send message via REST fallback:", err);
          }
        } else if (response.data) {
          setActiveMessages((prev) => {
            if (prev.some((m) => m._id === response.data._id)) return prev;
            return [...prev, response.data];
          });
        }
        setSending(false);
      }
    );

    if (!textToSend) {
      setInputMessage("");
    }
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[28px] bg-neutral-950 px-6 py-7 text-white sm:px-8 sm:py-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-red-600/30 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-200">
                <MessageSquare size={13} /> Live Support Desk
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                Socket Active
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
              1-on-1 Client Support Inbox
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Direct real-time communication between Kiwi Studio managers and registered customers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void loadConversations()}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/15"
            >
              <RefreshCw size={13} className={loadingList ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Main Two-Column Inbox */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ================= LEFT COLUMN: CONVERSATIONS LIST ================= */}
        <section className="flex flex-col rounded-[30px] border border-neutral-200/80 bg-white shadow-sm lg:col-span-4 xl:col-span-4 h-[680px]">
          <div className="border-b border-neutral-100 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-950 flex items-center gap-2">
                <Users size={17} className="text-red-600" />
                Client Inquiries
              </h3>
              {totalUnread > 0 && (
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  {totalUnread} Unread
                </span>
              )}
            </div>

            {/* Search filter */}
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-3 py-2 text-xs focus-within:border-neutral-950 focus-within:bg-white transition">
              <Search size={14} className="text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by client name, email or phone..."
                className="w-full bg-transparent text-xs text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-auto divide-y divide-neutral-100">
            {loadingList ? (
              <div className="grid h-60 place-items-center">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />
              </div>
            ) : filteredConversations.length ? (
              filteredConversations.map((conv) => {
                const isSelected = selectedUserId === conv.user._id;
                return (
                  <button
                    key={conv.user._id}
                    onClick={() => setSelectedUserId(conv.user._id)}
                    className={`flex w-full items-start gap-3 p-4 text-left transition ${
                      isSelected
                        ? "bg-[#fff6f0] border-l-4 border-red-600"
                        : "hover:bg-neutral-50"
                    }`}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-neutral-100 text-sm font-black text-neutral-800 shadow-sm">
                      {conv.user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-xs font-bold text-neutral-950">
                          {conv.user.name}
                        </p>
                        <span className="shrink-0 text-[10px] text-neutral-400">
                          {new Date(conv.latestCreatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-neutral-500 mt-0.5">
                        {conv.latestSenderRole === "admin" ? (
                          <span className="text-red-600 font-semibold">You: </span>
                        ) : null}
                        {conv.latestMessage || "No messages yet"}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400 truncate">
                          {conv.user.email}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="grid h-4 min-w-[16px] place-items-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="grid h-60 place-items-center text-center p-6">
                <div>
                  <MessageSquare size={28} className="mx-auto text-neutral-300" />
                  <p className="mt-2 text-xs font-bold text-neutral-700">No support chats found</p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    When customers start a conversation from their profile, it will appear here in real time.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT COLUMN: CHAT CANVAS ================= */}
        <section className="flex flex-col rounded-[30px] border border-neutral-200/80 bg-white shadow-sm lg:col-span-8 xl:col-span-8 h-[680px] overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <header className="border-b border-neutral-100 bg-[#fffaf6] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-neutral-950 text-sm font-black text-white shadow-sm">
                    {selectedConversation.user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-neutral-950 flex items-center gap-2">
                      {selectedConversation.user.name}
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[9px] font-bold text-neutral-700">
                        {selectedConversation.user.role || "Customer"}
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <Mail size={11} /> {selectedConversation.user.email}
                      </span>
                      {selectedConversation.user.number && (
                        <span className="inline-flex items-center gap-1 font-semibold text-neutral-800">
                          <Phone size={11} /> +91 {selectedConversation.user.number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500">
                  <Clock3 size={13} className="text-neutral-400" />
                  <span>
                    Last active:{" "}
                    {selectedConversation.user.lastLoginAt
                      ? new Date(selectedConversation.user.lastLoginAt).toLocaleDateString()
                      : "Recent"}
                  </span>
                </div>
              </header>

              {/* Quick Template Actions Bar */}
              <div className="border-b border-neutral-100 bg-white px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                  <Sparkles size={12} className="text-red-600" /> Quick Replies:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      "Hello! Welcome to Kiwi Interio. How can our interior architectural team assist you today?"
                    )
                  }
                  className="shrink-0 rounded-full border border-neutral-200 bg-[#fffaf6] px-3 py-1 text-[11px] font-semibold text-neutral-700 hover:border-red-300 hover:text-red-600 transition"
                >
                  👋 Greeting
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      "Please fill out our official design consultation query form at https://kiwi-interio-xi.vercel.app/contact so our architects can review your floor plan & requirements."
                    )
                  }
                  className="shrink-0 rounded-full border border-red-200 bg-red-50/60 px-3 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 transition flex items-center gap-1"
                >
                  <FileText size={12} /> Send Query Form Link
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      "Our team lead will call you shortly on your registered number to discuss material selection and schedule a site measurement."
                    )
                  }
                  className="shrink-0 rounded-full border border-neutral-200 bg-[#fffaf6] px-3 py-1 text-[11px] font-semibold text-neutral-700 hover:border-neutral-900 transition flex items-center gap-1"
                >
                  <PhoneCall size={12} /> Request Call
                </button>
              </div>

              {/* Messages Scrollable Thread */}
              <div className="flex-1 space-y-4 overflow-auto p-6 bg-[#fffcf8]">
                {loadingChat ? (
                  <div className="grid h-full place-items-center">
                    <span className="h-7 w-7 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />
                  </div>
                ) : activeMessages.length ? (
                  activeMessages.map((msg) => {
                    const isUser = msg.senderRole === "user";
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <motion.article
                        key={msg._id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`max-w-[85%] rounded-3xl p-4 shadow-sm ${
                          isUser
                            ? "mr-auto rounded-tl-md bg-white ring-1 ring-neutral-200 text-neutral-900"
                            : "ml-auto rounded-tr-md bg-red-600 text-white shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider">
                          <span className={isAdmin ? "text-red-100" : "text-neutral-400"}>
                            {isUser ? selectedConversation.user.name : "You (Kiwi Studio)"}
                          </span>
                          <time className={isAdmin ? "text-red-200" : "text-neutral-400"}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.message}
                        </p>
                      </motion.article>
                    );
                  })
                ) : (
                  <div className="grid h-full place-items-center text-center p-6">
                    <div>
                      <MessageSquare size={32} className="mx-auto text-neutral-300" />
                      <p className="mt-2 text-sm font-bold text-neutral-800">
                        No messages exchanged yet with {selectedConversation.user.name}
                      </p>
                      <p className="mt-1 max-w-sm text-xs text-neutral-400">
                        Type a message below or use the quick reply buttons above to begin this conversation.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Composer Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSendMessage();
                }}
                className="border-t border-neutral-100 bg-white p-4 sm:px-6"
              >
                <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-2 transition focus-within:border-neutral-950 focus-within:bg-white">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Reply directly to ${selectedConversation.user.name}...`}
                    className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white transition hover:bg-red-600 disabled:opacity-40"
                    title="Send message"
                  >
                    <Send size={15} />
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-neutral-400 flex items-center gap-1">
                  <CheckCheck size={12} className="text-emerald-500" />
                  Real-time delivery over WebSockets directly to the customer's dashboard.
                </p>
              </form>
            </>
          ) : (
            <div className="grid h-full place-items-center text-center p-10">
              <div>
                <MessageSquare size={42} className="mx-auto text-neutral-300" />
                <h3 className="mt-3 text-base font-black text-neutral-900">
                  Select a client conversation
                </h3>
                <p className="mt-1 max-w-sm text-xs text-neutral-400">
                  Pick any client from the left inquiry list to read messages and reply directly in real time.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
