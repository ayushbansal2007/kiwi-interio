const express = require("express");
const router = express.Router();

const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Query = require("../models/Query");
const Interior = require("../models/InteriorModel");
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

module.exports = router;
