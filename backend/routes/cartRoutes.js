const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const Interior = require("../models/InteriorModel");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

const CART_POPULATE = {
  path: "items.interiorId",
  select: "title image price category subcategory style roomType",
};

const normalizeCart = (cartDoc) => {
  const safeItems = Array.isArray(cartDoc?.items) ? cartDoc.items : [];
  const items = safeItems
    .filter((item) => item?.interiorId)
    .map((item) => ({
      itemId: String(item._id),
      quantity: item.quantity,
      interior: item.interiorId,
      lineTotal: (item.interiorId.price || 0) * item.quantity,
    }));

  return {
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
};

router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId }).populate(CART_POPULATE).lean();
    return res.json({ success: true, data: normalizeCart(cart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { interiorId, quantity = 1 } = req.body;
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const interior = await Interior.findById(interiorId).select("_id");

    if (!interior) {
      return res.status(404).json({ success: false, message: "Selected design not found" });
    }

    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.userId, items: [] });
    }

    const existingItem = cart.items.find((item) => String(item.interiorId) === String(interiorId));
    if (existingItem) {
      existingItem.quantity += safeQuantity;
    } else {
      cart.items.push({ interiorId, quantity: safeQuantity });
    }

    await cart.save();
    const hydratedCart = await Cart.findById(cart._id).populate(CART_POPULATE).lean();
    return res.status(201).json({ success: true, data: normalizeCart(hydratedCart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/item/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    const targetItem = cart?.items?.id(req.params.itemId);

    if (!cart || !targetItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    targetItem.quantity = Math.max(1, Number(req.body.quantity) || 1);
    await cart.save();

    const hydratedCart = await Cart.findById(cart._id).populate(CART_POPULATE).lean();
    return res.json({ success: true, data: normalizeCart(hydratedCart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/item/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    const targetItem = cart?.items?.id(req.params.itemId);

    if (!cart || !targetItem) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    targetItem.deleteOne();
    await cart.save();

    const hydratedCart = await Cart.findById(cart._id).populate(CART_POPULATE).lean();
    return res.json({ success: true, data: normalizeCart(hydratedCart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/clear", async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { items: [] } },
      { upsert: true }
    );

    return res.json({ success: true, data: { items: [], itemCount: 0, subtotal: 0 } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
