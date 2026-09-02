const express = require("express");
const router = express.Router();
const SupportMessage = require("../models/SupportMessage");
const User = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// =======================================================
// 👤 USER ENDPOINTS (Dedicated Admin ↔ User Support)
// =======================================================

// 1. User gets their own 1-on-1 support messages with Admin
router.get("/messages", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const messages = await SupportMessage.find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark admin messages as read for this user
    await SupportMessage.updateMany(
      { userId, senderRole: "admin", isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. User sends message to Admin
router.post("/messages", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message } = req.body;

    if (!message || String(message).trim() === "") {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const user = await User.findById(userId).select("name email").lean();

    const newMsg = await SupportMessage.create({
      userId,
      senderRole: "user",
      senderId: userId,
      senderName: user?.name || "Customer",
      message: String(message).trim(),
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${userId}`).emit("support_new_message", newMsg);
      io.to("admin_room").emit("support_new_message", newMsg);
    }

    res.json({ success: true, data: newMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================
// 🛡️ ADMIN ENDPOINTS (Dedicated Admin ↔ User Support Desk)
// =======================================================

// 3. Admin lists all customer support conversations
router.get(
  "/admin/conversations",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  async (req, res) => {
    try {
      // Group latest message by userId
      const userList = await SupportMessage.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$userId",
            latestMessage: { $first: "$message" },
            latestSenderRole: { $first: "$senderRole" },
            latestCreatedAt: { $first: "$createdAt" },
            unreadCount: {
              $sum: {
                $cond: [{ $and: [{ $eq: ["$senderRole", "user"] }, { $eq: ["$isRead", false] }] }, 1, 0],
              },
            },
            totalMessages: { $sum: 1 },
          },
        },
        { $sort: { latestCreatedAt: -1 } },
      ]);

      const populatedUsers = await User.populate(userList, {
        path: "_id",
        select: "name email number avatar lastLoginAt role",
      });

      const formatted = populatedUsers
        .filter((item) => item._id) // filter out deleted accounts
        .map((item) => ({
          user: item._id,
          latestMessage: item.latestMessage,
          latestSenderRole: item.latestSenderRole,
          latestCreatedAt: item.latestCreatedAt,
          unreadCount: item.unreadCount,
          totalMessages: item.totalMessages,
        }));

      res.json({ success: true, data: formatted });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 4. Admin gets conversation with a specific user
router.get(
  "/admin/messages/:userId",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await SupportMessage.find({ userId })
        .sort({ createdAt: 1 })
        .lean();

      // Mark user messages as read
      await SupportMessage.updateMany(
        { userId, senderRole: "user", isRead: false },
        { $set: { isRead: true } }
      );

      res.json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// 5. Admin sends a direct message to a specific user
router.post(
  "/admin/messages/:userId",
  authMiddleware,
  roleMiddleware("admin", "hr", "manager"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { message } = req.body;

      if (!message || String(message).trim() === "") {
        return res.status(400).json({ success: false, message: "Message cannot be empty" });
      }

      const adminUser = await User.findById(req.user.userId).select("name").lean();

      const newMsg = await SupportMessage.create({
        userId,
        senderRole: "admin",
        senderId: req.user.userId,
        senderName: adminUser?.name || "Kiwi Studio Admin",
        message: String(message).trim(),
      });

      const io = req.app.get("io");
      if (io) {
        io.to(`user:${userId}`).emit("support_new_message", newMsg);
        io.to("admin_room").emit("support_new_message", newMsg);
      }

      res.json({ success: true, data: newMsg });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
