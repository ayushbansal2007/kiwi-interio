import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bot,
  Clock3,
  Mail,
  MessageCircleMore,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  TicketCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../services/apiClient";
import { onSupportNewMessage, sendSupportMessage } from "../services/socket";

type DashboardData = {
  summary: {
    totalUsers: number;
    activeUsersLast30Days: number;
    loginsLast24Hours: number;
    totalChats: number;
    totalTickets: number;
    ticketBreakdown: Record<string, number>;
  };
  catalogByCategory: { _id: string; products: number; catalogValue: number }[];
  aiDemandByCategory: { _id: string; conversations: number; latestActivity: string }[];
};

type User = {
  _id: string;
  name: string;
  email: string;
  number?: string;
  chatCount: number;
  lastLoginAt?: string;
};

type AIChat = {
  _id: string;
  role: "user" | "assistant";
  message: string;
  createdAt: string;
  data?: { category?: string };
};

type SupportMsg = {
  _id: string;
  userId: string;
  senderRole: "user" | "admin";
  senderName?: string;
  message: string;
  createdAt: string;
};

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatDate = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "No login recorded";

export default function AdminAnalytics() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Drawer Mode: "support" for 1-on-1 human chat vs "ai_logs" for AI interactions
  const [drawerTab, setDrawerTab] = useState<"support" | "ai_logs">("support");
  const [supportMessages, setSupportMessages] = useState<SupportMsg[]>([]);
  const [aiChats, setAiChats] = useState<AIChat[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  const loadData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const [dashboardResponse, usersResponse] = await Promise.all([
        apiClient(`${API_BASE_URL}/api/admin/dashboard`),
        apiClient(`${API_BASE_URL}/api/admin/users?limit=50`),
      ]);
      const [dashboardPayload, usersPayload] = await Promise.all([dashboardResponse.json(), usersResponse.json()]);
      if (!dashboardResponse.ok || !usersResponse.ok) throw new Error(dashboardPayload.message || usersPayload.message || "Could not load workspace data");
      setDashboard(dashboardPayload.data);
      setUsers(usersPayload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load workspace data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => { void loadData(); }, [loadData]);

  const openConversation = async (user: User) => {
    setSelectedUser(user);
    setSupportMessages([]);
    setAiChats([]);
    setDrawerLoading(true);
    try {
      const [supportRes, aiRes] = await Promise.all([
        apiClient(`${API_BASE_URL}/api/support/admin/messages/${user._id}`),
        apiClient(`${API_BASE_URL}/api/admin/users/${user._id}/conversations?limit=100`),
      ]);
      const supportPayload = await supportRes.json();
      const aiPayload = await aiRes.json();
      
      setSupportMessages(supportPayload.data || []);
      setAiChats(aiPayload.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load conversation");
    } finally {
      setDrawerLoading(false);
    }
  };

  const [adminMessageInput, setAdminMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    // Listen for live 1-on-1 support messages from socket
    const unsubscribe = onSupportNewMessage((newMsg: SupportMsg) => {
      if (selectedUser && newMsg.userId === selectedUser._id) {
        setSupportMessages((prev) => {
          if (prev.some((c) => c._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedUser]);

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adminMessageInput.trim() || sendingMessage) return;

    const messageText = adminMessageInput.trim();
    setSendingMessage(true);

    try {
      sendSupportMessage(
        {
          targetUserId: selectedUser._id,
          message: messageText,
        },
        async (response) => {
          if (!response || !response.success) {
            // Fallback via REST API
            const res = await apiClient(
              `${API_BASE_URL}/api/support/admin/messages/${selectedUser._id}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: messageText }),
              }
            );
            const data = await res.json();
            if (data.data) {
              setSupportMessages((prev) => [...prev, data.data]);
            }
          } else if (response.data) {
            setSupportMessages((prev) => {
              if (prev.some((c) => c._id === response.data._id)) return prev;
              return [...prev, response.data];
            });
          }
        }
      );

      setAdminMessageInput("");
    } catch (err) {
      console.error("Error sending admin message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) return <div className="grid min-h-[420px] place-items-center"><div className="text-center"><span className="mx-auto mb-4 block h-9 w-9 animate-spin rounded-full border-2 border-red-100 border-t-red-600" /><p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-400">Loading workspace</p></div></div>;
  if (!dashboard) return <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">{error || "Analytics are unavailable right now."}</div>;

  const openTickets = (dashboard.summary.ticketBreakdown.Pending || 0) + (dashboard.summary.ticketBreakdown["In-Progress"] || 0);
  const metrics = [
    { label: "Registered clients", value: dashboard.summary.totalUsers, icon: Users, tint: "bg-violet-50 text-violet-600", note: "Customer accounts" },
    { label: "Active this month", value: dashboard.summary.activeUsersLast30Days, icon: Activity, tint: "bg-emerald-50 text-emerald-600", note: "Logged in within 30 days" },
    { label: "AI conversations", value: dashboard.summary.totalChats, icon: MessageCircleMore, tint: "bg-sky-50 text-sky-600", note: "Messages stored securely" },
    { label: "Open support tickets", value: openTickets, icon: TicketCheck, tint: "bg-orange-50 text-orange-600", note: `${dashboard.summary.totalTickets} total requests` },
  ];
  const maxDemand = Math.max(...dashboard.aiDemandByCategory.map((item) => item.conversations), 1);

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[28px] bg-neutral-950 px-6 py-7 text-white sm:px-8 sm:py-9">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-red-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-28 h-32 w-32 rounded-full bg-orange-300/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200"><BarChart3 size={13} /> Live business view</span>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] sm:text-4xl">Your studio, at a glance.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-300">Track customer engagement, AI demand, and live support requests in one calm, focused workspace.</p>
          </div>
          <button onClick={() => void loadData(true)} disabled={refreshing} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-neutral-950 transition hover:bg-red-50 disabled:opacity-60"><RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh</button>
        </div>
      </section>

      {error && <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tint, note }) => (
          <article key={label} className="group rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-[0_10px_30px_-22px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_-22px_rgba(0,0,0,0.35)]">
            <div className="flex items-start justify-between"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${tint}`}><Icon size={19} /></span><ArrowUpRight size={17} className="text-neutral-300 transition group-hover:text-neutral-700" /></div>
            <p className="mt-6 text-3xl font-black tracking-[-0.05em] text-neutral-950">{value.toLocaleString("en-IN")}</p>
            <p className="mt-1 text-sm font-bold text-neutral-800">{label}</p>
            <p className="mt-1 text-[11px] text-neutral-400">{note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-neutral-200/80 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">Demand signals</p><h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-neutral-950">What clients ask AI about</h3></div><Bot className="text-red-500" size={21} /></div>
          <div className="mt-7 space-y-5">{dashboard.aiDemandByCategory.length ? dashboard.aiDemandByCategory.map((item) => <div key={item._id}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="capitalize font-semibold text-neutral-700">{item._id}</span><span className="text-xs font-bold text-neutral-950">{item.conversations} chats</span></div><div className="h-2 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400" style={{ width: `${(item.conversations / maxDemand) * 100}%` }} /></div></div>) : <p className="rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-400">No categorised AI conversations yet.</p>}</div>
        </article>

        <article className="rounded-3xl border border-neutral-200/80 bg-white p-5 sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">Catalog overview</p><h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-neutral-950">Value by category</h3>
          <div className="mt-5 divide-y divide-neutral-100">{dashboard.catalogByCategory.slice(0, 5).map((item) => <div key={item._id} className="flex items-center justify-between gap-4 py-3.5"><div><p className="text-sm font-bold text-neutral-800">{item._id}</p><p className="text-[11px] text-neutral-400">{item.products} listed designs</p></div><p className="text-sm font-black text-neutral-950">{currency.format(item.catalogValue)}</p></div>)}</div>
          <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-4 text-amber-800">Catalog value is based on listed prices, not completed sales revenue.</p>
        </article>
      </section>

      {/* Customer Directory & Support Launch */}
      <section className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white">
        <div className="flex flex-col justify-between gap-3 border-b border-neutral-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">Client Support & Inquiries</p>
            <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-neutral-950">Customer Communication Hub</h3>
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-600">{users.length} registered clients</span>
        </div>
        <div className="max-h-[480px] divide-y divide-neutral-100 overflow-auto">
          {users.length ? users.map((user) => (
            <button key={user._id} onClick={() => void openConversation(user)} className="group flex w-full flex-col gap-4 px-5 py-4 text-left transition hover:bg-red-50/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-neutral-100 text-sm font-black text-neutral-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-neutral-900">{user.name}</span>
                  <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1"><Mail size={12} /> {user.email}</span>
                    {user.number && <span className="inline-flex items-center gap-1"><Phone size={12} /> {user.number}</span>}
                  </span>
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-4 pl-[52px] sm:pl-0">
                <span className="text-xs text-neutral-400"><Clock3 size={12} className="mr-1 inline" /> {formatDate(user.lastLoginAt)}</span>
                <span className="rounded-full bg-neutral-950 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition group-hover:bg-red-600 flex items-center gap-1.5">
                  <MessageSquare size={12} /> Open Support Desk
                </span>
              </div>
            </button>
          )) : <p className="p-7 text-sm text-neutral-400">No customer accounts found.</p>}
        </div>
      </section>

      {/* ================= DEDICATED CUSTOMER CONVERSATION DRAWER ================= */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[60] flex justify-end bg-neutral-950/40 p-0 backdrop-blur-sm" role="dialog" aria-modal="true">
            <motion.section
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="flex h-full w-full max-w-2xl flex-col bg-[#fffcf8] shadow-2xl"
            >
              <header className="border-b border-neutral-200 bg-white px-5 py-5 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600 shadow-sm">
                      <UserRound size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-black tracking-[-0.03em] text-neutral-950">{selectedUser.name}</h3>
                      <p className="text-xs text-neutral-500">{selectedUser.email}{selectedUser.number ? ` · ${selectedUser.number}` : ""}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-950 hover:text-white" aria-label="Close conversation">
                    <X size={18} />
                  </button>
                </div>

                {/* Segmented Mode Selector: Support Desk (1-on-1) vs AI Logs */}
                <div className="mt-4 flex rounded-2xl bg-[#fffaf6] p-1 ring-1 ring-neutral-200">
                  <button
                    onClick={() => setDrawerTab("support")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition ${
                      drawerTab === "support"
                        ? "bg-neutral-950 text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <MessageSquare size={14} />
                    1-on-1 Live Support Chat
                  </button>
                  <button
                    onClick={() => setDrawerTab("ai_logs")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold uppercase tracking-wider transition ${
                      drawerTab === "ai_logs"
                        ? "bg-neutral-950 text-white shadow-sm"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Bot size={14} />
                    AI Assistant History ({aiChats.length})
                  </button>
                </div>
              </header>

              {/* Mode 1: Pure 1-on-1 Human Support Desk */}
              {drawerTab === "support" && (
                <>
                  <div className="flex-1 space-y-4 overflow-auto px-5 py-6 sm:px-7">
                    {drawerLoading ? (
                      <div className="grid h-40 place-items-center">
                        <span className="h-7 w-7 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />
                      </div>
                    ) : supportMessages.length ? (
                      supportMessages.map((msg) => {
                        const isUser = msg.senderRole === "user";
                        return (
                          <motion.article
                            key={msg._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`max-w-[90%] rounded-3xl px-4 py-3.5 ${
                              isUser
                                ? "mr-auto rounded-tl-md bg-white shadow-sm ring-1 ring-neutral-200 text-neutral-900"
                                : "ml-auto rounded-tr-md bg-red-600 text-white shadow-md"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              <span className={!isUser ? "text-red-100" : "text-neutral-400"}>
                                {isUser ? selectedUser.name : "You (Studio Admin)"}
                              </span>
                              <time>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                              {msg.message}
                            </p>
                          </motion.article>
                        );
                      })
                    ) : (
                      <div className="grid h-48 place-items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-6 text-center">
                        <div>
                          <MessageSquare size={28} className="mx-auto text-neutral-300" />
                          <p className="mt-2 text-sm font-bold text-neutral-700">No support messages yet.</p>
                          <p className="mt-1 text-xs text-neutral-400">Send a live message below to start a 1-on-1 human conversation with {selectedUser.name}.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Composer for Human Support */}
                  <form onSubmit={handleSendAdminMessage} className="border-t border-neutral-200 bg-white p-4 sm:px-6">
                    <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-2 transition focus-within:border-red-500 focus-within:bg-white">
                      <input
                        type="text"
                        value={adminMessageInput}
                        onChange={(e) => setAdminMessageInput(e.target.value)}
                        placeholder={`Reply directly to ${selectedUser.name} as Kiwi Studio Admin...`}
                        className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !adminMessageInput.trim()}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white transition hover:bg-red-600 disabled:opacity-40"
                        title="Send message"
                      >
                        <Send size={15} />
                      </button>
                    </div>
                    <p className="mt-1.5 text-[10px] text-neutral-400">
                      ⚡ Delivered in real time to the customer's Studio Support Desk via WebSockets.
                    </p>
                  </form>
                </>
              )}

              {/* Mode 2: Read-Only AI Agent History */}
              {drawerTab === "ai_logs" && (
                <div className="flex-1 space-y-4 overflow-auto px-5 py-6 sm:px-7">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                    ℹ️ These are the user's interactions with the Kiwi AI Assistant (Chatbot).
                  </div>

                  {aiChats.length ? (
                    aiChats.map((chat) => (
                      <article
                        key={chat._id}
                        className={`max-w-[92%] rounded-3xl px-4 py-3.5 ${
                          chat.role === "user"
                            ? "mr-auto rounded-tl-md bg-white shadow-sm ring-1 ring-neutral-200 text-neutral-900"
                            : "ml-auto rounded-tr-md bg-neutral-950 text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          <span>{chat.role === "user" ? "Customer" : "Kiwi AI Bot"}{chat.data?.category ? ` · ${chat.data.category}` : ""}</span>
                          <time>{formatDate(chat.createdAt)}</time>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                          {chat.message}
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className="grid h-48 place-items-center rounded-3xl border border-dashed border-neutral-200 bg-white text-center">
                      <p className="text-sm text-neutral-400">No AI chatbot logs for this client.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
