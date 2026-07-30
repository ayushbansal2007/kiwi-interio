const express = require("express");
const crypto = require("crypto");
const axios = require("axios");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Interior = require("../models/InteriorModel");

router.use(authMiddleware);

const SHIPPING_FEE = 0;

const CART_POPULATE = {
  path: "items.interiorId",
  select: "title image price category subcategory style roomType",
};

const buildCartPayload = async (userId) => {
  const cart = await Cart.findOne({ userId }).populate(CART_POPULATE);
  const items = (cart?.items || [])
    .filter((item) => item?.interiorId)
    .map((item) => ({
      interiorId: item.interiorId._id,
      title: item.interiorId.title,
      image: item.interiorId.image,
      category: item.interiorId.category,
      price: item.interiorId.price,
      quantity: item.quantity,
    }));

  if (!items.length) {
    throw new Error("Your cart is empty");
  }

  return {
    source: "cart",
    cart,
    items,
  };
};

const buildBuyNowPayload = async (interiorId, quantity = 1) => {
  const interior = await Interior.findById(interiorId).lean();

  if (!interior) {
    throw new Error("Selected design not found");
  }

  return {
    source: "buy_now",
    cart: null,
    items: [
      {
        interiorId: interior._id,
        title: interior.title,
        image: interior.image,
        category: interior.category,
        price: interior.price,
        quantity: Math.max(1, Number(quantity) || 1),
      },
    ],
  };
};

const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    subtotal,
    totalAmount: subtotal + SHIPPING_FEE,
  };
};

const createRazorpayOrder = async (amount, receipt, notes) => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing on the server");
  }

  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await axios.post(
    "https://api.razorpay.com/v1/orders",
    {
      amount,
      currency: "INR",
      receipt,
      notes,
    },
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

router.post("/create", async (req, res) => {
  try {
    const { paymentMethod = "razorpay", source = "cart", interiorId, quantity, shippingAddress } = req.body;
    const payload = source === "buy_now"
      ? await buildBuyNowPayload(interiorId, quantity)
      : await buildCartPayload(req.user.userId);

    const { subtotal, totalAmount } = calculateTotals(payload.items);
    const order = await Order.create({
      userId: req.user.userId,
      items: payload.items,
      source: payload.source,
      subtotal,
      totalAmount,
      paymentMethod,
      shippingAddress,
      orderStatus: paymentMethod === "razorpay" ? "draft" : "placed",
      paymentStatus: "pending",
    });

    if (paymentMethod === "razorpay") {
      const razorpayOrder = await createRazorpayOrder(
        totalAmount * 100,
        `kiwi_${order._id}`.slice(0, 40),
        {
          internalOrderId: String(order._id),
          customerId: String(req.user.userId),
        }
      );

      order.payment.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        success: true,
        data: {
          requiresPayment: true,
          internalOrderId: order._id,
          razorpay: {
            key: process.env.RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: razorpayOrder.id,
            name: "Kiwi Interio",
            description: "Interior design order checkout",
          },
          order,
        },
      });
    }

    if (payload.source === "cart" && payload.cart) {
      payload.cart.items = [];
      await payload.cart.save();
    }

    return res.status(201).json({
      success: true,
      data: {
        requiresPayment: false,
        order,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/verify-payment", async (req, res) => {
  try {
    const { internalOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findOne({ _id: internalOrderId, userId: req.user.userId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: "Razorpay secret missing on server" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.payment.razorpayOrderId = razorpay_order_id;
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    await order.save();

    if (order.source === "cart") {
      await Cart.findOneAndUpdate({ userId: req.user.userId }, { $set: { items: [] } });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/my-orders", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
