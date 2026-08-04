import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  Bot,
  CreditCard,
  Package,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import { fetchCart, fetchOrders } from "../services/commerceService";
import { getProfile } from "../services/authService";

type UserProfile = {
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
  };
};

type Order = {
  _id: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: {
    title: string;
    quantity: number;
    price: number;
    image: string;
  }[];
};

const paymentLabels: Record<string, string> = {
  razorpay: "Razorpay",
  cod: "Pay later",
  bank_transfer: "Bank transfer",
};

function Profile() {
  useDocumentTitle("Dashboard | Kiwi Interio");
  const { accessToken, loading, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const activeTab = params.get("tab") || "overview";

  useEffect(() => {
    const loadPage = async () => {
      if (!accessToken) return;

      try {
        const [profile, cartPayload, ordersPayload] = await Promise.all([
          getProfile(accessToken),
          fetchCart(),
          fetchOrders(),
        ]);

        setUser(profile);
        setCartItems(cartPayload?.data?.items || []);
        setOrders(ordersPayload?.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };

    void loadPage();
  }, [accessToken]);

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
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setParams({ tab: key })}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                activeTab === key
                  ? "bg-neutral-950 text-white"
                  : "bg-white text-neutral-500 ring-1 ring-neutral-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <section className="grid gap-4 lg:grid-cols-3">
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
          </section>
        )}

        {activeTab === "account" && (
          <section className="grid gap-4 md:grid-cols-3">
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
            <article className="rounded-[28px] border border-neutral-200/80 bg-white p-5 shadow-sm md:col-span-3">
              <button
                onClick={() => void logout()}
                className="rounded-full border border-neutral-200 px-5 py-3 text-xs font-bold uppercase tracking-wider text-neutral-700 transition hover:border-red-200 hover:text-red-600"
              >
                Log out
              </button>
            </article>
          </section>
        )}

        {activeTab === "cart" && (
          <section className="space-y-4">
            {cartItems.length ? (
              cartItems.map((item) => (
                <article
                  key={item.itemId}
                  className="flex flex-col gap-4 rounded-[30px] border border-neutral-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                >
                  <img
                    src={item.interior.image}
                    alt={item.interior.title}
                    className="h-28 w-full rounded-[22px] object-cover sm:w-32"
                  />
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
              ))
            ) : (
              <div className="rounded-[30px] border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
                No cart items yet.{" "}
                <Link to="/interiors" className="font-bold text-red-600">
                  Browse collections
                </Link>
                .
              </div>
            )}
          </section>
        )}

        {activeTab === "orders" && (
          <section className="space-y-4">
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
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-600">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>
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
          </section>
        )}
      </div>
    </main>
  );
}

export default Profile;
