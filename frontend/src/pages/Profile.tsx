import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import { fetchCart, fetchOrders } from "../services/commerceService";
import { getProfile } from "../services/authService";

type UserProfile = {
  name: string;
  email: string;
  number?: string;
  role?: string;
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

function Profile() {
  useDocumentTitle("Profile | Kiwi Interio");
  const { accessToken, loading } = useAuth();
  const [params, setParams] = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const activeTab = params.get("tab") || "account";

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

  if (!loading && !accessToken) {
    return <Navigate to="/login" />;
  }

  if (pageLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#fffcf8]"><span className="h-10 w-10 animate-spin rounded-full border-2 border-red-100 border-t-red-600" /></div>;
  }

  return (
    <main className="min-h-screen bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[34px] border border-neutral-200/80 bg-white px-6 py-8 shadow-[0_24px_60px_-45px_rgba(0,0,0,0.45)] sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">My profile</p>
          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.06em] text-neutral-950 sm:text-4xl">{user?.name}</h1>
              <p className="mt-2 text-sm leading-7 text-neutral-500">Manage your details, review cart items and revisit every completed order.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Cart value", `₹${totalCartValue.toLocaleString("en-IN")}`],
                ["Saved items", `${cartItems.length}`],
                ["Orders", `${orders.length}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-[#fffaf6] px-4 py-3 ring-1 ring-neutral-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</p>
                  <p className="mt-1 text-xl font-black text-neutral-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          {[
            ["account", "Account"],
            ["cart", "Cart items"],
            ["orders", "Order history"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setParams({ tab: key })}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] transition ${
                activeTab === key ? "bg-neutral-950 text-white" : "bg-white text-neutral-500 ring-1 ring-neutral-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "account" && (
          <section className="grid gap-4 md:grid-cols-3">
            {[
              ["Full name", user?.name || "—"],
              ["Email", user?.email || "—"],
              ["Phone", user?.number || "Not added"],
            ].map(([label, value]) => (
              <article key={label} className="rounded-[28px] border border-neutral-200/80 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{label}</p>
                <p className="mt-3 text-xl font-black tracking-[-0.03em] text-neutral-950">{value}</p>
              </article>
            ))}
          </section>
        )}

        {activeTab === "cart" && (
          <section className="space-y-4">
            {cartItems.length ? cartItems.map((item) => (
              <article key={item.itemId} className="flex flex-col gap-4 rounded-[30px] border border-neutral-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <img src={item.interior.image} alt={item.interior.title} className="h-28 w-full rounded-[22px] object-cover sm:w-32" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">{item.interior.category}</p>
                  <h3 className="mt-2 text-lg font-black text-neutral-950">{item.interior.title}</h3>
                  <p className="mt-1 text-sm text-neutral-500">Qty {item.quantity} · ₹{item.lineTotal.toLocaleString("en-IN")}</p>
                </div>
                <Link to="/cart" className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600">
                  Open cart
                </Link>
              </article>
            )) : (
              <div className="rounded-[30px] border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
                No cart items yet. <Link to="/interiors" className="font-bold text-red-600">Browse collections</Link>.
              </div>
            )}
          </section>
        )}

        {activeTab === "orders" && (
          <section className="space-y-4">
            {orders.length ? orders.map((order) => (
              <article key={order._id} className="rounded-[30px] border border-neutral-200/80 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">Order #{order._id.slice(-6)}</p>
                    <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-neutral-950">₹{order.totalAmount.toLocaleString("en-IN")}</h3>
                    <p className="mt-1 text-sm text-neutral-500">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                    <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-white">{order.paymentMethod}</span>
                    <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-600">{order.paymentStatus}</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-600">{order.orderStatus}</span>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {order.items.map((item, index) => (
                    <div key={`${order._id}-${index}`} className="flex items-center gap-3 rounded-[22px] bg-[#fffaf6] p-3">
                      <img src={item.image} alt={item.title} className="h-16 w-16 rounded-2xl object-cover" />
                      <div>
                        <p className="text-sm font-black text-neutral-950">{item.title}</p>
                        <p className="mt-1 text-xs text-neutral-500">Qty {item.quantity} · ₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )) : (
              <div className="rounded-[30px] border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-500">
                No orders yet. <Link to="/interiors" className="font-bold text-red-600">Start shopping</Link>.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

export default Profile;
