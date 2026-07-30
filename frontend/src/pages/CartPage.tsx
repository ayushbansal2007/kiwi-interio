import { Link, Navigate, useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import { fetchCart, removeCartItem, updateCartItem } from "../services/commerceService";

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
    style?: string;
    roomType?: string;
  };
};

function CartPage() {
  useDocumentTitle("Cart | Kiwi Interio");
  const navigate = useNavigate();
  const { accessToken, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  const syncCart = async () => {
    const payload = await fetchCart();
    setCartItems(payload?.data?.items || []);
    setSubtotal(payload?.data?.subtotal || 0);
    window.dispatchEvent(new Event("cart-updated"));
  };

  useEffect(() => {
    if (accessToken) {
      void syncCart();
    }
  }, [accessToken]);

  if (!loading && !accessToken) {
    return <Navigate to="/login" />;
  }

  const handleQuantity = async (itemId: string, nextQuantity: number) => {
    setBusyId(itemId);
    try {
      await updateCartItem(itemId, nextQuantity);
      await syncCart();
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    setBusyId(itemId);
    try {
      await removeCartItem(itemId);
      await syncCart();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[32px] border border-neutral-200/80 bg-white p-6 shadow-[0_24px_60px_-45px_rgba(0,0,0,0.45)] sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">Cart</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.06em] text-neutral-950 sm:text-4xl">Your saved design shortlist.</h1>
              <p className="mt-2 text-sm leading-7 text-neutral-500">Review interiors, update quantities and move to checkout when you are ready.</p>
            </div>
            <span className="inline-flex w-max items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
              <ShoppingBag size={16} />
              {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        {cartItems.length === 0 ? (
          <section className="grid min-h-[380px] place-items-center rounded-[32px] border border-dashed border-neutral-200 bg-white p-8 text-center">
            <div>
              <h2 className="text-2xl font-black tracking-[-0.05em] text-neutral-950">Your cart is empty.</h2>
              <p className="mt-3 text-sm text-neutral-500">Add a few design concepts first, then come back here to continue checkout.</p>
              <Link to="/interiors" className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-600">
                Browse collections
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4">
              {cartItems.map((item) => (
                <article key={item.itemId} className="flex flex-col gap-4 rounded-[30px] border border-neutral-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5">
                  <img src={item.interior.image} alt={item.interior.title} className="h-40 w-full rounded-[24px] object-cover sm:h-32 sm:w-40" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">{item.interior.category} · {item.interior.roomType || "Interior"}</p>
                    <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-neutral-950">{item.interior.title}</h3>
                    <p className="mt-1 text-sm text-neutral-500">₹{item.interior.price.toLocaleString("en-IN")} per concept</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:items-end">
                    <div className="flex items-center rounded-full border border-neutral-200 bg-[#fffaf6] p-1">
                      <button onClick={() => handleQuantity(item.itemId, Math.max(1, item.quantity - 1))} disabled={busyId === item.itemId} className="grid h-9 w-9 place-items-center rounded-full text-neutral-700 transition hover:bg-white"><Minus size={16} /></button>
                      <span className="min-w-10 text-center text-sm font-bold text-neutral-900">{item.quantity}</span>
                      <button onClick={() => handleQuantity(item.itemId, item.quantity + 1)} disabled={busyId === item.itemId} className="grid h-9 w-9 place-items-center rounded-full text-neutral-700 transition hover:bg-white"><Plus size={16} /></button>
                    </div>
                    <p className="text-lg font-black text-neutral-950">₹{item.lineTotal.toLocaleString("en-IN")}</p>
                    <button onClick={() => handleDelete(item.itemId)} disabled={busyId === item.itemId} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 transition hover:text-red-600">
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-[30px] border border-neutral-200/80 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-600">Summary</p>
              <div className="mt-5 space-y-4 border-y border-neutral-100 py-5 text-sm">
                <div className="flex items-center justify-between"><span className="text-neutral-500">Subtotal</span><span className="font-bold text-neutral-950">₹{subtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex items-center justify-between"><span className="text-neutral-500">Shipping & consult</span><span className="font-bold text-emerald-600">Free</span></div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-500">Total</span>
                <span className="text-2xl font-black tracking-[-0.05em] text-neutral-950">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <button onClick={() => navigate("/checkout?source=cart")} className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-600">
                Continue to checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default CartPage;
