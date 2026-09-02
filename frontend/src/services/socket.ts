import { io, Socket } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://kiwi-interio.onrender.com";

let socket: Socket | null = null;

export const getSocket = (token?: string | null): Socket => {
  const activeToken = token || localStorage.getItem("token");

  if (!socket || socket.disconnected) {
    socket = io(API_BASE_URL, {
      auth: {
        token: activeToken || "",
      },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  } else if (activeToken && socket.auth) {
    socket.auth = { token: activeToken };
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// 💬 DEDICATED 1-ON-1 ADMIN ↔ USER SUPPORT CHAT
export const sendSupportMessage = (
  payload: {
    targetUserId?: string;
    message: string;
  },
  callback?: (response: { success: boolean; data?: any; message?: string }) => void
) => {
  const s = getSocket();
  s.emit("support_send_message", payload, callback);
};

export const onSupportNewMessage = (callback: (message: any) => void) => {
  const s = getSocket();
  s.on("support_new_message", callback);
  return () => {
    s.off("support_new_message", callback);
  };
};

export const onOrderStatusUpdated = (callback: (data: any) => void) => {
  const s = getSocket();
  s.on("order_status_updated", callback);
  return () => {
    s.off("order_status_updated", callback);
  };
};

export const onStockUpdated = (callback: (data: any) => void) => {
  const s = getSocket();
  s.on("stock_updated", callback);
  return () => {
    s.off("stock_updated", callback);
  };
};
