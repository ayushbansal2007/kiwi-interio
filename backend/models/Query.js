const mongoose = require("mongoose");

const querySchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    // Yeh automatic random 6 digit ka ticket generate karega string ke sath
    default: () => `KI-${Math.floor(100000 + Math.random() * 900000)}`
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "In-Progress", "Resolved"], 
    default: "Pending" 
  }
}, { timestamps: true });

module.exports = mongoose.model("Query", querySchema);