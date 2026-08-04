import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  IndianRupee,
  RefreshCw,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiClient } from "../services/apiClient";

type OrderRecord = {
  _id: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  userId?: {
    name?: string;
    email?: string;
    number?: string;
  };
  items: {
    title: string;
    quantity: number;
    price: number;
  }[];
};

type PaymentsPayload = {
  orders: OrderRecord[];
  summary: {
    totalOrders: number;
    totalRevenue: number;
    paidOrders: number;
    pendingPayments: number;
  };
  paymentMethodBreakdown: {
    _id: string;
    count: number;
    amount: number;
  }[];
};

type SummaryCard = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const paymentLabels: Record<string, string> = {
  razorpay: "Razorpay (Online)",
  cod: "Cash on Delivery",
  bank_transfer: "Bank Transfer",
};

export default function AdminPayments() {
  const [payload, setPayload] =
    useState<PaymentsPayload | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://kiwi-interio.onrender.com";

  const loadPayments = useCallback(
    async (isRefresh = false) => {
      isRefresh
        ? setRefreshing(true)
        : setLoading(true);

      setError("");

      try {
        const response = await apiClient(
          `${API_BASE_URL}/api/admin/orders?limit=50`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Could not load payment data"
          );
        }

        setPayload(data.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load payment data"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [API_BASE_URL]
  );

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const updateOrderStatus =
    async (
      orderId: string,
      patch: {
        orderStatus?: string;
        paymentStatus?: string;
      }
    ) => {
      const response =
        await apiClient(
          `${API_BASE_URL}/api/admin/orders/${orderId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              patch
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not update order"
        );
      }

      setPayload((current) =>
        current
          ? {
              ...current,
              orders:
                current.orders.map(
                  (order) =>
                    order._id === orderId
                      ? {
                          ...order,
                          ...patch,
                        }
                      : order
                ),
            }
          : current
      );
    };

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-red-100 border-t-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const summary = payload?.summary;

  const summaryCards: SummaryCard[] = [
    {
      label: "Total Orders",
      value:
        summary?.totalOrders ?? 0,
      icon: Wallet,
    },
    {
      label: "Paid Revenue",
      value: currency.format(
        summary?.totalRevenue ?? 0
      ),
      icon: IndianRupee,
    },
    {
      label: "Paid Orders",
      value:
        summary?.paidOrders ?? 0,
      icon: CreditCard,
    },
    {
      label: "Pending Payments",
      value:
        summary?.pendingPayments ??
        0,
      icon: RefreshCw,
    },
  ];

  return (
    <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-600">
            Payments workspace
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-neutral-950">
            Orders & Payment Methods
          </h2>
        </div>

        <button
          onClick={() => void loadPayments(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-red-600 disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="grid gap-4 md:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {card.label}
                </p>

                <Icon
                  size={18}
                  className="text-red-500"
                />
              </div>

              <p className="mt-3 text-2xl font-black text-neutral-950">
                {card.value}
              </p>
            </article>
          );
        })}
      </div>

      {/* ================= PAYMENT BREAKDOWN ================= */}

      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-950">
          Payment Method Breakdown
        </h3>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(payload?.paymentMethodBreakdown || []).map(
            (item) => (
              <div
                key={item._id}
                className="rounded-xl bg-neutral-50 px-4 py-3 ring-1 ring-neutral-100"
              >
                <p className="text-xs font-bold text-neutral-950">
                  {paymentLabels[item._id] ||
                    item._id}
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  {item.count} Orders ·{" "}
                  {currency.format(item.amount)}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* ================= ORDER LIST ================= */}

      <section className="space-y-4">
        {(payload?.orders || []).map((order) => (
          <article
            key={order._id}
            className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  Order #{order._id.slice(-6)}
                </p>

                <h4 className="mt-2 text-xl font-black text-neutral-950">
                  {currency.format(order.totalAmount)}
                </h4>

                <p className="mt-1 text-sm text-neutral-500">
                  {order.userId?.name ||
                    "Guest"}
                  {" · "}
                  {order.userId?.email ||
                    "No Email"}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(
                    order.createdAt
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {paymentLabels[
                    order.paymentMethod
                  ] || order.paymentMethod}
                </span>

                <span className="rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                  {order.paymentStatus}
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {order.orderStatus}
                </span>

              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                          {order.paymentStatus === "pending" &&
                order.paymentMethod !== "razorpay" && (
                  <button
                    onClick={() =>
                      void updateOrderStatus(order._id, {
                        paymentStatus: "paid",
                        orderStatus: "confirmed",
                      })
                    }
                    className="rounded-full bg-emerald-600 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-emerald-700"
                  >
                    Mark Paid
                  </button>
                )}

              {order.orderStatus !== "completed" && (
                <button
                  onClick={() =>
                    void updateOrderStatus(order._id, {
                      orderStatus: "completed",
                    })
                  }
                  className="rounded-full bg-neutral-950 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-neutral-800"
                >
                  Mark Completed
                </button>
              )}

              {order.orderStatus !== "cancelled" && (
                <button
                  onClick={() =>
                    void updateOrderStatus(order._id, {
                      orderStatus: "cancelled",
                    })
                  }
                  className="rounded-full border border-neutral-200 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-600 transition hover:bg-neutral-100"
                >
                  Cancel Order
                </button>
              )}
            </div>

            {/* ================= ORDER ITEMS ================= */}

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {order.items.map((item, index) => (
                <div
                  key={`${order._id}-${index}`}
                  className="rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">
                      {item.title}
                    </span>

                    <span className="text-xs text-neutral-500">
                      Qty {item.quantity}
                    </span>
                  </div>

                  <p className="mt-1 text-red-600 font-bold">
                    {currency.format(
                      item.price * item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}