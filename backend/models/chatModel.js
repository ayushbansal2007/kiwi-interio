const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // 🟢 FIXED: Dynamic Object schema field for layout metadata framework (Cards, Tools, Items)
    data: {
      type: mongoose.Schema.Types.Mixed, // Mixed type se isme arrays, objects kuch bhi save ho sakega smoothly
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);