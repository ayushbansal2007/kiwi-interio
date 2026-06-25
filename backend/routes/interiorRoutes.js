const express = require("express"); // Importing Express framework
const router = express.Router(); // Creating a router instance

const Interior = require("../models/InteriorModel"); // importing the Interior model
const authMiddleware = require("../middleware/authMiddleware");
const rolesMiddleware = require("../middleware/roleMiddleware");

// 🌐 1. FETCH ALL INTERIORS (For Gallery List Page)
router.get("/interiors", async (req, res) => {
    try {
       const interiors = await Interior.find()
            .select("title image price category subcategory style") // 👈 Heavy description aur tags ko list me se drop kiya
            .lean(); 
        res.json(interiors); // Sending the fetched interiors as a JSON response
    }
    catch (err) {
        console.error("Error fetching interiors", err);
        res.status(500).json({ message: "Server error" }); // Sending a 500 status code with an error message
    }
});

// 🎯 2. NEW ENDPOINT: FETCH SINGLE INTERIOR BY ID (For Details/Buy Now Page)
router.get("/interiors/:id", async (req, res) => {
    try {
        const { id } = req.params; // Frontend se aayi dynamic URL parameter ID extract ki

        // Database mein product ID ke corresponding documents match kiye
        const singleInterior = await Interior.findById(id).lean();

        // Agar database mein us ID ka koi record nahi milta
        if (!singleInterior) {
            return res.status(404).json({ message: "Interior collection details not found" });
        }

        // Return core metadata with correct category and price to frontend
        res.json(singleInterior);
    } 
    catch (err) {
        console.error("Error fetching interior by ID:", err);
        // CastError check: Agar user wrong length ya invalid format ki objectID bhejta hai
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
  rolesMiddleware("admin"),

  async (req, res) => {
    try {
      const updatedInterior = await Interior.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

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