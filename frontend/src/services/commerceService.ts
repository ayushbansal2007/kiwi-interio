import { apiClient } from "./apiClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

export const fetchCart = async () => {
  const response = await apiClient(`${API_BASE_URL}/api/cart`);
  return response.json();
};

export const addToCart = async (interiorId: string, quantity = 1) => {
  const response = await apiClient(`${API_BASE_URL}/api/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interiorId, quantity }),
  });

  return response.json();
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const response = await apiClient(`${API_BASE_URL}/api/cart/item/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });

  return response.json();
};

export const removeCartItem = async (itemId: string) => {
  const response = await apiClient(`${API_BASE_URL}/api/cart/item/${itemId}`, {
    method: "DELETE",
  });

  return response.json();
};

export const clearCart = async () => {
  const response = await apiClient(`${API_BASE_URL}/api/cart/clear`, {
    method: "DELETE",
  });

  return response.json();
};

export const fetchOrders = async () => {
  const response = await apiClient(`${API_BASE_URL}/api/orders/my-orders`);
  return response.json();
};

export const createOrder = async (payload: unknown) => {
  const response = await apiClient(`${API_BASE_URL}/api/orders/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
};

export const verifyPayment = async (payload: unknown) => {
  const response = await apiClient(`${API_BASE_URL}/api/orders/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
};
