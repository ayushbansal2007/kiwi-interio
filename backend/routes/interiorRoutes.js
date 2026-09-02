const express = require("express");
const router = express.Router();

const Interior = require("../models/InteriorModel");
const authMiddleware = require("../middleware/authMiddleware");
const rolesMiddleware = require("../middleware/roleMiddleware");

// 🌐 1. FETCH ALL INTERIORS (For Gallery List Page)
router.get("/interiors", async (req, res) => {
  try {
    const interiors = await Interior.find()
      .select("title description image price category subcategory style roomType tags inStock stockCount")
      .lean();
    res.json(interiors);
  } catch (err) {
    console.error("Error fetching interiors", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🎯 2. FETCH SINGLE INTERIOR BY ID (For Details/Buy Now Page)
router.get("/interiors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const singleInterior = await Interior.findById(id).lean();

    if (!singleInterior) {
      return res.status(404).json({ message: "Interior collection details not found" });
    }

    res.json(singleInterior);
  } catch (err) {
    console.error("Error fetching interior by ID:", err);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid product format identifier" });
    }
    res.status(500).json({ message: "Server error layout extraction failed" });
  }
});

// ⚙️ 3. UPDATE INTERIOR BY ID (Admin Protected Area Only)
router.put(
  "/interior/:id",
  authMiddleware,
  rolesMiddleware("admin", "manager"),
  async (req, res) => {
    try {
      const updatedInterior = await Interior.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedInterior) {
        return res.status(404).json({ message: "Interior not found" });
      }

      const io = req.app.get("io");
      if (io) {
        io.emit("stock_updated", {
          interiorId: updatedInterior._id,
          inStock: updatedInterior.inStock,
          stockCount: updatedInterior.stockCount,
        });
      }

      res.json(updatedInterior);
    } catch (err) {
      console.error("Error updating interior", err);
      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports = router;
