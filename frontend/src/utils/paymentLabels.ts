export const paymentMethodLabels: Record<string, string> = {
  razorpay: "Online Payment",
  cod: "Pay on Delivery",
  bank_transfer: "Bank Transfer",
};

export const getPaymentMethodLabel = (method: string) =>
  paymentMethodLabels[method] || method.replace(/_/g, " ");
