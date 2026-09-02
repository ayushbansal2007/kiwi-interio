const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const connectDB = require("./db/connectDB");
const interiorRoutes = require("./routes/interiorRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const morgan = require("morgan");
const logger = require("./utils/logger");
const queryRoutes = require("./routes/queryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const supportRoutes = require("./routes/supportRoutes");
const cookieParser = require("cookie-parser");
const SupportMessage = require("./models/SupportMessage");
const User = require("./models/userModel");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: [
    "https://kiwi-interio-xi.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: corsOptions,
});

// Socket Authentication Middleware
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.split(" ")[1];

  if (!token) {
    socket.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    socket.user = null;
    next();
  }
});

io.on("connection", (socket) => {
  const userId = socket.user?.userId;
  const role = socket.user?.role;

  if (userId) {
    socket.join(`user:${userId}`);
    logger.info(`Socket connected for user: ${userId} (${role || "user"})`);

    if (["admin", "hr", "manager"].includes(role)) {
      socket.join("admin_room");
      logger.info(`Admin joined admin_room: ${userId}`);
    }
  }

  // Handle dedicated 1-on-1 Admin ↔ User Support Chat (completely separate from AI Agent)
  socket.on("support_send_message", async (data, callback) => {
    try {
      if (!socket.user) {
        if (callback) callback({ success: false, message: "Authentication required" });
        return;
      }

      const { targetUserId, message } = data || {};
      const senderRole = socket.user.role;
      const isAdmin = ["admin", "hr", "manager"].includes(senderRole);

      const conversationUserId = isAdmin ? targetUserId : socket.user.userId;

      if (!conversationUserId || !message || String(message).trim() === "") {
        if (callback) callback({ success: false, message: "Message cannot be empty" });
        return;
      }

      const senderUser = await User.findById(socket.user.userId).select("name").lean();

      const newSupportMsg = await SupportMessage.create({
        userId: conversationUserId,
        senderRole: isAdmin ? "admin" : "user",
        senderId: socket.user.userId,
        senderName: senderUser?.name || (isAdmin ? "Kiwi Studio Admin" : "Customer"),
        message: String(message).trim(),
      });

      // Broadcast to user's private room and admin room
      io.to(`user:${conversationUserId}`).emit("support_new_message", newSupportMsg);
      io.to("admin_room").emit("support_new_message", newSupportMsg);

      if (callback) callback({ success: true, data: newSupportMsg });
    } catch (error) {
      logger.error("Socket support_send_message error:", error);
      if (callback) callback({ success: false, message: error.message });
    }
  });

  socket.on("disconnect", () => {
    // client disconnected
  });
});

// Attach io to express app so routes can broadcast events
app.set("io", io);

morgan.token("user-role", (req) => {
  return req.user ? req.user.role : "GUEST";
});

const prodFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" [Role: :user-role]';

app.use(
  morgan(prodFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
    skip: (req, res) => {
      if (req.method !== "GET") return false;
      const isSuccess =
        (res.statusCode >= 200 && res.statusCode < 300) || res.statusCode === 304;
      return isSuccess;
    },
  })
);

app.use("/api", interiorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/login", authRoutes);
app.use("/api", aiRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/support", supportRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("Kiwi Interio API is running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
