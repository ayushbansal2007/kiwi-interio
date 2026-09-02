const express = require("express");
const router = express.Router();

const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Query = require("../models/Query");
const Interior = require("../models/InteriorModel");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// HR can inspect intelligence and conversations. Catalog writes use a separate
// admin-only route, so HR cannot edit product data.
router.use(authMiddleware, roleMiddleware("admin", "hr"));

const safeLimit = (value, fallback = 20, maximum = 100) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
};

// Dashboard figures are deliberately split into catalog value and AI demand.
// Revenue needs an Order/Payment collection; a product's listed price is not revenue.
router.get("/dashboard", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsersLast30Days,
      loginsLast24Hours,
      totalChats,
      totalTickets,
      ticketStatuses,
      catalogByCategory,
      aiDemandByCategory,
      recentChats,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({ role: { $ne: "admin" }, lastLoginAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ role: { $ne: "admin" }, lastLoginAt: { $gte: oneDayAgo } }),
      Chat.countDocuments(),
      Query.countDocuments(),
      Query.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Interior.aggregate([
        { $group: { _id: { $ifNull: ["$category", "Uncategorised"] }, products: { $sum: 1 }, catalogValue: { $sum: "$price" } } },
        { $sort: { catalogValue: -1 } },
      ]),
      Chat.aggregate([
        { $match: { role: "assistant", "data.category": { $type: "string", $ne: "" } } },
        { $group: { _id: "$data.category", conversations: { $sum: 1 }, latestActivity: { $max: "$createdAt" } } },
        { $sort: { conversations: -1 } },
      ]),
      Chat.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("userId", "name email number role lastLoginAt")
        .select("userId role message data createdAt")
        .lean(),
    ]);

    const ticketBreakdown = ticketStatuses.reduce((result, item) => ({ ...result, [item._id]: item.count }), {});
    res.json({
      success: true,
      data: {
        summary: { totalUsers, activeUsersLast30Days, loginsLast24Hours, totalChats, totalTickets, ticketBreakdown },
        catalogByCategory,
        aiDemandByCategory,
        recentChats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User cards include a message count; detailed conversations below use populate()
// so the admin always sees the actual linked account, not client-supplied data.
router.get("/users", async (req, res) => {
  try {
    const limit = safeLimit(req.query.limit, 50);
    const users = await User.aggregate([
      { $match: { role: { $ne: "admin" } } },
      { $lookup: { from: Chat.collection.name, localField: "_id", foreignField: "userId", as: "chats" } },
      { $addFields: { chatCount: { $size: "$chats" } } },
      { $project: { password: 0, chats: 0 } },
      { $sort: { lastLoginAt: -1, createdAt: -1 } },
      { $limit: limit },
    ]);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const limit = safeLimit(req.query.limit, 50);
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name email number role")
      .lean();

    const summary = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0],
            },
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] },
          },
        },
      },
    ]);

    const paymentMethodBreakdown = await Order.aggregate([
      { $group: { _id: "$paymentMethod", count: { $sum: 1 }, amount: { $sum: "$totalAmount" } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        orders,
        summary: summary[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          paidOrders: 0,
          pendingPayments: 0,
        },
        paymentMethodBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/orders/:orderId/status", async (req, res) => {
  try {
    const { orderStatus, paymentStatus, cancellationReason } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === "cancelled") {
        order.cancellationReason =
          (cancellationReason && String(cancellationReason).trim()) ||
          "Order cancelled by Kiwi team";
        order.cancelledBy = "admin";
        order.cancelledAt = new Date();
      } else {
        // If order was revived/confirmed
        if (order.orderStatus !== "cancelled") {
          order.cancellationReason = "";
          order.cancelledBy = "";
          order.cancelledAt = null;
        }
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    // Broadcast live WebSocket event to the user
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${order.userId}`).emit("order_status_updated", {
        orderId: order._id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        cancellationReason: order.cancellationReason,
        cancelledBy: order.cancelledBy,
        cancelledAt: order.cancelledAt,
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/users/:userId/conversations", async (req, res) => {
  try {
    const limit = safeLimit(req.query.limit, 100);
    const chats = await Chat.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name email number role lastLoginAt")
      .select("userId role message data createdAt")
      .lean();

    res.json({ success: true, data: chats.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin sends message directly to a user
router.post("/users/:userId/message", async (req, res) => {
  try {
    const { message, category } = req.body;
    const userId = req.params.userId;

    if (!message || String(message).trim() === "") {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const newChat = await Chat.create({
      userId,
      role: "admin",
      message: String(message).trim(),
      data: category ? { category } : null,
    });

    const chatPayload = {
      _id: newChat._id,
      userId,
      role: newChat.role,
      message: newChat.message,
      data: newChat.data,
      createdAt: newChat.createdAt,
    };

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${userId}`).emit("new_message", chatPayload);
      io.to("admin_room").emit("new_message", chatPayload);
    }

    res.json({ success: true, data: chatPayload });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
