import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  CreditCard,
  Edit2,
  FileText,
  MessageSquare,
  Package,
  Phone,
  Save,
  Send,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import { fetchCart, fetchOrders } from "../services/commerceService";
import { getProfile, updateProfile } from "../services/authService";
import { onOrderStatusUpdated, onSupportNewMessage, sendSupportMessage } from "../services/socket";
import { apiClient } from "../services/apiClient";

type UserProfile = {
  _id?: string;
  name: string;
  email: string;
  number?: string;
  role?: string;
  avatar?: string;
  authProvider?: string;
};

type CartItem = {
  itemId: string;
  quantity: number;
  lineTotal: number;
  interior: {
    _id: string;
    title: string;
    image: string;
    price: number;
    category: string;
    inStock?: boolean;
    stockCount?: number;
  };
};

type Order = {
  _id: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: string;
  items: {
    title: string;
    quantity: number;
    price: number;
    image: string;
  }[];
};

type SupportMessage = {
  _id: string;
  userId: string;
  senderRole: "user" | "admin";
  senderName?: string;
  message: string;
  createdAt: string;
};

const paymentLabels: Record<string, string> = {
  razorpay: "Razorpay",
  cod: "Pay later",
  bank_transfer: "Bank transfer",
};

function Profile() {
  useDocumentTitle("Dashboard | Kiwi Interio");
  const { accessToken, loading, logout, updateUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: string; text: string }>({
    type: "",
    text: "",
  });

  // Dedicated 1-on-1 Studio Support Chat state (Admin ↔ User only)
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const activeTab = params.get("tab") || "overview";

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditNumber(user.number || "");
    }
  }, [user]);

  // Real-time WebSocket subscriptions
  useEffect(() => {
    // 1. Live order cancellation & status update
    const unsubOrder = onOrderStatusUpdated((updated) => {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === updated.orderId
            ? {
                ...o,
                orderStatus: updated.orderStatus,
                paymentStatus: updated.paymentStatus,
                cancellationReason: updated.cancellationReason,
                cancelledBy: updated.cancelledBy,
                cancelledAt: updated.cancelledAt,
              }
            : o
        )
      );
    });

    // 2. Live incoming message from Admin (Human Support Desk)
    const unsubSupportMsg = onSupportNewMessage((msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      unsubOrder();
      unsubSupportMsg();
    };
  }, []);

  const handleSendUserMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const text = chatInput.trim();
    setSendingChat(true);

    sendSupportMessage(
      {
        message: text,
      },
      async (response) => {
        if (!response || !response.success) {
          // REST Fallback
          try {
            const res = await apiClient(`${API_BASE_URL}/api/support/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            if (data.data) {
              setMessages((prev) => [...prev, data.data]);
            }
          } catch (err) {
            console.error("Support message error:", err);
          }
        } else if (response.data) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === response.data._id)) return prev;
            return [...prev, response.data];
          });
        }
        setSendingChat(false);
      }
    );

    setChatInput("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaveLoading(true);
    setSaveMessage({ type: "", text: "" });

    const cleanedNumber = editNumber.replace(/\D/g, "");
    if (cleanedNumber && cleanedNumber.length < 10) {
      setSaveMessage({ type: "error", text: "Please enter a valid 10-digit phone number" });
      setSaveLoading(false);
      return;
    }

    try {
      const res = await updateProfile(accessToken, {
        name: editName.trim(),
        number: cleanedNumber,
      });

      if (res.user) {
        setUser(res.user);
        updateUser(res.user);
        setSaveMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        setTimeout(() => setSaveMessage({ type: "", text: "" }), 3000);
      } else {
        throw new Error(res.message || "Failed to update profile");
      }
    } catch (error) {
      setSaveMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Error updating profile",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    const loadPage = async () => {
      if (!accessToken) return;

      try {
        const [profile, cartPayload, ordersPayload, supportPayload] = await Promise.all([
          getProfile(accessToken),
          fetchCart(),
          fetchOrders(),
          apiClient(`${API_BASE_URL}/api/support/messages`).then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        setUser(profile);
        setCartItems(cartPayload?.data?.items || []);
        setOrders(ordersPayload?.data || []);
        setMessages(supportPayload?.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };

    void loadPage();
  }, [accessToken, API_BASE_URL]);

  const totalCartValue = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
    [cartItems]
  );

  const paidOrders = useMemo(
    () => orders.filter((order) => order.paymentStatus === "paid").length,
    [orders]
  );
  const dashboardCards: {
  label: string;
  value: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Cart value",
    value: `₹${totalCartValue.toLocaleString("en-IN")}`,
    icon: ShoppingBag,
  },
  {
    label: "Saved items",
    value: `${cartItems.length}`,
    icon: Package,
  },
  {
    label: "Total orders",
    value: `${orders.length}`,
    icon: CreditCard,
  },
  {
    label: "Paid orders",
    value: `${paidOrders}`,
    icon: Sparkles,
  },
];

  if (!loading && !accessToken) {
    return <Navigate to="/login" />;
  }

  if (pageLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fffcf8]">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[34px] border border-neutral-200/80 bg-white shadow-[0_24px_60px_-45px_rgba(0,0,0,0.45)]">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="px-6 py-8 sm:px-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">
                User dashboard
              </p>
              <div className="mt-4 flex items-start gap-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-red-100"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-neutral-950 text-white">
                    <UserRound size={28} />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-black tracking-[-0.06em] text-neutral-950 sm:text-4xl">
                    {user?.name}
                  </h1>
                  <p className="mt-2 text-sm text-neutral-500">{user?.email}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-neutral-400">
                    {user?.authProvider === "google" ? "Google account" : "Email account"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/interiors"
                  className="rounded-full bg-neutral-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-600"
                >
                  Browse designs
                </Link>
                <Link
                  to="/ai-assistant"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 transition hover:border-red-200 hover:text-red-600"
                >
                  <Bot size={14} />
                  AI assistant
                </Link>
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-700 transition hover:border-red-200 hover:text-red-600"
                >
                  <ShoppingBag size={14} />
                  Open cart
                </Link>
              </div>
            </div>

            <div className="grid gap-3 bg-neutral-950 p-6 text-white sm:grid-cols-2 lg:grid-cols-1">
             {dashboardCards.map(({ label, value, icon: Icon }) => (
  <div
    key={label}
    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
  >
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {label}
      </p>

      <Icon size={16} className="text-red-300" />
    </div>

    <p className="mt-2 text-2xl font-black">
      {value}
    </p>
  </div>
))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          {[
            ["overview", "Overview"],
            ["account", "Account"],
            ["cart", "Cart items"],
            ["orders", "Orders & payments"],
            ["messages", "Studio Support Chat"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setParams({ tab: key })}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                activeTab === key
                  ? "bg-neutral-950 text-white shadow-md shadow-neutral-950/20 scale-[1.02]"
                  : "bg-white text-neutral-500 ring-1 ring-neutral-200 hover:text-neutral-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.section
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid gap-4 lg:grid-cols-3"
            >
            <article className="rounded-[28px] border border-neutral-200/80 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-black text-neutral-950">Recent activity</h2>
              <div className="mt-4 space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between rounded-2xl bg-[#fffaf6] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-black text-neutral-950">
                        Order #{order._id.slice(-6)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {paymentLabels[order.paymentMethod] || order.paymentMethod} ·{" "}
                        {order.paymentStatus}
                      </p>
                    </div>
                    <p className="text-sm font-black text-neutral-950">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
                {!orders.length && (
                  <p className="text-sm text-neutral-500">No orders yet. Start with the catalog.</p>
                )}
              </div>
            </article>

            <article className="rounded-[28px] border border-neutral-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-neutral-950">Payment methods</h2>
              <div className="mt-4 space-y-3 text-sm text-neutral-600">
                <p>Razorpay — UPI, cards, netbanking</p>
                <p>Book now, pay later</p>
                <p>Bank transfer</p>
              </div>
              <Link
                to="/checkout"
                className="mt-5 inline-flex rounded-full bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
              >
                Go to checkout
              </Link>
            </article>
            </motion.section>
          )}

          {activeTab === "account" && (
            <motion.section
              key="account"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {!user?.number && !isEditing && (
                <div className="flex flex-col items-start justify-between gap-4 rounded-[28px] border border-amber-200 bg-amber-50/70 p-6 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white shadow-sm">
                      <Phone size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-amber-950">
                        Add your contact number
                      </h3>
                      <p className="mt-0.5 text-xs text-amber-800">
                        Receive real-time order updates, tracking alerts, and free designer consultations.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="shrink-0 rounded-full bg-amber-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-900"
                  >
                    Add Phone Number
                  </button>
                </div>
              )}

              {saveMessage.text && (
                <div
                  className={`rounded-2xl p-4 text-xs font-bold ${
                    saveMessage.type === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}

              {isEditing ? (
                <form
                  onSubmit={handleSaveProfile}
                  className="rounded-[30px] border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">
                        Account Settings
                      </p>
                      <h3 className="mt-1 text-xl font-black text-neutral-950">
                        Edit Profile Details
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setSaveMessage({ type: "", text: "" });
                      }}
                      className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Full Name
                      </span>
                      <input
                        required
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3 text-sm font-semibold text-neutral-950 outline-none transition focus:border-neutral-950 focus:bg-white"
                      />
                    </label>

                    <label className="block">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Phone Number
                        </span>
                        <span className="text-[10px] text-neutral-400">10 digits</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3 transition focus-within:border-neutral-950 focus-within:bg-white">
                        <span className="border-r border-neutral-200 pr-2.5 text-xs font-bold text-neutral-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={editNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setEditNumber(val);
                          }}
                          className="w-full bg-transparent text-sm font-semibold text-neutral-950 outline-none"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-600 disabled:opacity-50"
                    >
                      <Save size={14} />
                      {saveLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-full border border-neutral-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    ["Full name", user?.name || "—"],
                    ["Email", user?.email || "—"],
                    ["Phone", user?.number || "Not added"],
                  ].map(([label, value]) => (
                    <article
                      key={label}
                      className="rounded-[28px] border border-neutral-200/80 bg-white p-5 shadow-sm"
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        {label}
                      </p>
                      <p className="mt-3 text-xl font-black tracking-[-0.03em] text-neutral-950">
                        {value}
                      </p>
                    </article>
                  ))}

                  <article className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-neutral-200/80 bg-white p-5 shadow-sm md:col-span-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-600"
                    >
                      <Edit2 size={14} />
                      Edit Profile & Phone
                    </button>

                    <button
                      onClick={() => void logout()}
                      className="rounded-full border border-neutral-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-neutral-700 transition hover:border-red-200 hover:text-red-600"
                    >
                      Log out
                    </button>
                  </article>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === "cart" && (
            <motion.section
              key="cart"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {cartItems.length ? (
                cartItems.map((item) => {
                  const isItemOutOfStock =
                    item.interior.inStock === false ||
                    (item.interior.stockCount ?? 10) <= 0;

                  return (
                    <article
                      key={item.itemId}
                      className={`flex flex-col gap-4 rounded-[30px] border bg-white p-4 shadow-sm sm:flex-row sm:items-center ${
                        isItemOutOfStock
                          ? "border-red-200 bg-red-50/30"
                          : "border-neutral-200/80"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={item.interior.image}
                          alt={item.interior.title}
                          className={`h-28 w-full rounded-[22px] object-cover sm:w-32 ${
                            isItemOutOfStock ? "grayscale-[40%] opacity-80" : ""
                          }`}
                        />
                        {isItemOutOfStock && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-red-600 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
                          {item.interior.category}
                        </p>
                        <h3 className="mt-2 text-lg font-black text-neutral-950">
                          {item.interior.title}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          Qty {item.quantity} · ₹{item.lineTotal.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <Link
                        to="/cart"
                        className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600"
                      >
                        Open cart
                      </Link>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[30px] border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
                  No cart items yet.{" "}
                  <Link to="/interiors" className="font-bold text-red-600">
                    Browse collections
                  </Link>
                  .
                </div>
              )}
            </motion.section>
          )}

          {activeTab === "orders" && (
            <motion.section
              key="orders"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {orders.length ? (
                orders.map((order) => (
                  <article
                    key={order._id}
                    className="rounded-[30px] border border-neutral-200/80 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
                          Order #{order._id.slice(-6)}
                        </p>
                        <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-neutral-950">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                        <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-white">
                          {paymentLabels[order.paymentMethod] || order.paymentMethod}
                        </span>
                        <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-600">
                          {order.paymentStatus}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1.5 ${
                            order.orderStatus === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Cancellation Reason Banner if Cancelled */}
                    {order.orderStatus === "cancelled" && (
                      <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-xs text-red-950">
                        <div className="flex items-start gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-red-200 text-red-700">
                            <AlertTriangle size={16} />
                          </span>
                          <div className="space-y-1">
                            <p className="font-bold text-red-900">
                              Order Cancelled by Kiwi Design Team
                            </p>
                            <p className="text-red-800">
                              <span className="font-semibold">Reason: </span>
                              {order.cancellationReason || "Order cancelled due to operational constraints."}
                            </p>
                            {order.cancelledAt && (
                              <p className="text-[10px] text-red-600">
                                Cancelled on {new Date(order.cancelledAt).toLocaleString("en-IN")}
                              </p>
                            )}
                            <p className="pt-1 text-[11px] text-neutral-600">
                              Have questions? Reach us via the{" "}
                              <button
                                onClick={() => setParams({ tab: "messages" })}
                                className="font-bold text-red-600 underline"
                              >
                                Studio Support Chat
                              </button>{" "}
                              tab anytime.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {order.items.map((item, index) => (
                        <div
                          key={`${order._id}-${index}`}
                          className="flex items-center gap-3 rounded-[22px] bg-[#fffaf6] p-3"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                          <div>
                            <p className="text-sm font-black text-neutral-950">{item.title}</p>
                            <p className="mt-1 text-xs text-neutral-500">
                              Qty {item.quantity} · ₹
                              {(item.price * item.quantity).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[30px] border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
                  No orders yet.{" "}
                  <Link to="/interiors" className="font-bold text-red-600">
                    Start shopping
                  </Link>
                  .
                </div>
              )}
            </motion.section>
          )}

          {/* ================= STUDIO SUPPORT CHAT (1-ON-1 ADMIN ↔ USER WEBSOCKET) ================= */}
          {activeTab === "messages" && (
            <motion.section
              key="messages"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden rounded-[30px] border border-neutral-200/80 bg-white shadow-sm"
            >
              <div className="border-b border-neutral-100 bg-[#fffaf6] px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-neutral-950 text-white shadow-sm">
                      <MessageSquare size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-neutral-950">
                        Kiwi Support Desk (Direct 1-on-1)
                      </h2>
                      <p className="text-xs text-neutral-500">
                        Direct conversation with Kiwi Studio Admin & support managers
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                    Live Connected
                  </span>
                </div>
              </div>

              {/* Consultation Query Form Banner */}
              <div className="border-b border-amber-200/70 bg-amber-50/60 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-amber-700 shrink-0" />
                  <span>Need an official 3D design quote, architectural consultation, or custom floor plan?</span>
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1 font-bold text-red-600 hover:underline shrink-0"
                >
                  Submit Query Form →
                </Link>
              </div>

              <div className="h-[400px] space-y-4 overflow-auto p-6 bg-[#fffcf8]">
                {messages.length ? (
                  messages.map((chat) => {
                    const isUser = chat.senderRole === "user";
                    const isAdmin = chat.senderRole === "admin";
                    return (
                      <motion.article
                        key={chat._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`max-w-[85%] rounded-3xl p-4 shadow-sm ${
                          isUser
                            ? "ml-auto rounded-tr-md bg-neutral-950 text-white"
                            : "mr-auto rounded-tl-md bg-red-600 text-white shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                          <span className={isAdmin ? "text-red-100 font-bold" : "text-neutral-300"}>
                            {isUser
                              ? "You"
                              : chat.senderName || "Kiwi Studio Admin"}
                          </span>
                          <time>{new Date(chat.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                          {chat.message}
                        </p>
                      </motion.article>
                    );
                  })
                ) : (
                  <div className="grid h-full place-items-center text-center p-6">
                    <div>
                      <Sparkles size={32} className="mx-auto text-neutral-300" />
                      <h3 className="mt-3 text-base font-bold text-neutral-900">
                        Chat directly with Kiwi Studio Team
                      </h3>
                      <p className="mt-1 max-w-sm text-xs text-neutral-500">
                        Have questions about order customization, cancellation, or materials? Message our admin desk below.
                      </p>
                      <div className="mt-4">
                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                        >
                          <FileText size={13} />
                          Fill Design Consultation Form
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSendUserMessage}
                className="border-t border-neutral-100 bg-white p-4 sm:px-6"
              >
                <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-2 transition focus-within:border-neutral-950 focus-within:bg-white">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message to Kiwi Studio..."
                    className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    disabled={sendingChat || !chatInput.trim()}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white transition hover:bg-red-600 disabled:opacity-40"
                    title="Send message"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </form>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default Profile;
