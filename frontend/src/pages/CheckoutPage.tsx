import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import { createOrder, fetchCart, verifyPayment } from "../services/commerceService";
import { apiClient } from "../services/apiClient";

type CheckoutItem = {
  _id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  quantity: number;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function CheckoutPage() {
  useDocumentTitle("Checkout | Kiwi Interio");
  const navigate = useNavigate();
  const { user, accessToken, loading } = useAuth();
  const [params] = useSearchParams();
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.number || "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod" | "bank_transfer">("razorpay");

  const source = params.get("source") === "buy_now" ? "buy_now" : "cart";
  const productId = params.get("id") || "";
  const quantity = Number(params.get("quantity") || "1");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      fullName: user?.name || current.fullName,
      email: user?.email || current.email,
      phone: user?.number || current.phone,
    }));
  }, [user]);

  useEffect(() => {
    const loadPreview = async () => {
      if (!accessToken) return;

      try {
        if (source === "cart") {
          const payload = await fetchCart();
          const nextItems = (payload?.data?.items || []).map((item: any) => ({
            _id: item.interior._id,
            title: item.interior.title,
            image: item.interior.image,
            category: item.interior.category,
            price: item.interior.price,
            quantity: item.quantity,
          }));
          setItems(nextItems);
          return;
        }

        const response = await apiClient(`${API_BASE_URL}/api/interiors/${productId}`);
        const payload = await response.json();
        setItems([
          {
            _id: payload._id,
            title: payload.title,
            image: payload.image,
            category: payload.category,
            price: payload.price,
            quantity: Math.max(1, quantity || 1),
          },
        ]);
      } catch (error) {
        console.error(error);
      }
    };

    void loadPreview();
  }, [accessToken, productId, quantity, source]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  if (!loading && !accessToken) {
    return <Navigate to="/login" />;
  }

  const launchRazorpay = async (checkoutData: any) => {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error("Razorpay checkout could not load");
    }

    return new Promise<void>((resolve, reject) => {
      const RazorpayCheckout = window.Razorpay;
      if (!RazorpayCheckout) {
        reject(new Error("Razorpay checkout is unavailable"));
        return;
      }

      const instance = new RazorpayCheckout({
        key: checkoutData.razorpay.key,
        amount: checkoutData.razorpay.amount,
        currency: checkoutData.razorpay.currency,
        name: checkoutData.razorpay.name,
        description: checkoutData.razorpay.description,
        order_id: checkoutData.razorpay.orderId,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        notes: {
          address: form.addressLine,
        },
        theme: {
          color: "#dc2626",
        },
        handler: async (response: any) => {
          const verification = await verifyPayment({
            internalOrderId: checkoutData.internalOrderId,
            ...response,
          });

          if (!verification.success) {
            reject(new Error(verification.message || "Payment verification failed"));
            return;
          }

          window.dispatchEvent(new Event("cart-updated"));
          resolve();
        },
        modal: {
          ondismiss: () => reject(new Error("Payment window closed")),
        },
      });

      instance.open();
    });
  };

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const payload = await createOrder({
        paymentMethod,
        source,
        interiorId: productId,
        quantity,
        shippingAddress: form,
      });

      if (!payload.success) {
        throw new Error(payload.message || "Could not create order");
      }

      if (payload.data.requiresPayment) {
        await launchRazorpay(payload.data);
      } else {
        window.dispatchEvent(new Event("cart-updated"));
      }

      navigate("/profile?tab=orders");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffcf8] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-neutral-200/80 bg-white p-6 shadow-[0_24px_60px_-45px_rgba(0,0,0,0.45)] sm:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-600">Checkout</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-neutral-950 sm:text-4xl">Confirm your design order.</h1>
          <p className="mt-2 text-sm leading-7 text-neutral-500">Choose a payment method, submit your address and complete the order securely.</p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <form onSubmit={handleCheckout} className="rounded-[32px] border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black tracking-[-0.04em] text-neutral-950">Delivery details</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["fullName", "Full name"],
                ["email", "Email"],
                ["phone", "Phone"],
                ["city", "City"],
                ["state", "State"],
                ["pincode", "Pincode"],
              ].map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</span>
                  <input
                    required
                    value={(form as any)[key]}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    className="w-full rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3 text-sm outline-none transition focus:border-red-300 focus:bg-white"
                  />
                </label>
              ))}
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-400">Address line</span>
                <textarea
                  required
                  rows={4}
                  value={form.addressLine}
                  onChange={(event) => setForm((current) => ({ ...current, addressLine: event.target.value }))}
                  className="w-full rounded-2xl border border-neutral-200 bg-[#fffaf6] px-4 py-3 text-sm outline-none transition focus:border-red-300 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-black tracking-[-0.03em] text-neutral-950">Payment method</h3>
              <div className="mt-4 grid gap-3">
                {[
                  ["razorpay", "Pay online with Razorpay", "UPI, cards, netbanking and wallets"],
                  ["cod", "Book now, pay later", "Confirm the order and settle with the team"],
                  ["bank_transfer", "Bank transfer", "We will share payment details after order creation"],
                ].map(([value, title, desc]) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setPaymentMethod(value as any)}
                    className={`rounded-[24px] border px-4 py-4 text-left transition ${paymentMethod === value ? "border-red-200 bg-red-50" : "border-neutral-200 bg-white hover:border-neutral-300"}`}
                  >
                    <p className="text-sm font-black text-neutral-950">{title}</p>
                    <p className="mt-1 text-xs text-neutral-500">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {message && <p className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}

            <button disabled={busy || !items.length} className="mt-8 w-full rounded-full bg-neutral-950 px-6 py-4 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50">
              {busy ? "Processing..." : paymentMethod === "razorpay" ? "Proceed to Razorpay" : "Place order"}
            </button>
          </form>

          <aside className="rounded-[32px] border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-[-0.04em] text-neutral-950">Order summary</h2>
              <Link to={source === "cart" ? "/cart" : `/interior/${productId}`} className="text-xs font-bold uppercase tracking-wider text-red-600">Edit</Link>
            </div>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 rounded-[24px] bg-[#fffaf6] p-3">
                  <img src={item.image} alt={item.title} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">{item.category}</p>
                    <h3 className="truncate text-sm font-black text-neutral-950">{item.title}</h3>
                    <p className="mt-1 text-xs text-neutral-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-black text-neutral-950">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-neutral-100 pt-5 text-sm">
              <div className="flex items-center justify-between"><span className="text-neutral-500">Subtotal</span><span className="font-bold text-neutral-950">₹{total.toLocaleString("en-IN")}</span></div>
              <div className="flex items-center justify-between"><span className="text-neutral-500">Shipping</span><span className="font-bold text-emerald-600">Free</span></div>
              <div className="flex items-center justify-between text-lg font-black text-neutral-950"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;
