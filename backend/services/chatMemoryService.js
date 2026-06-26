const Chat = require("../models/chatModel");

/**
 * Save Message securely with mandatory userId validation & dynamic metadata support
 * 🟢 FIXED: Added 'data' field so interior cards/tools layout can be persisted in MongoDB
 */
async function saveMessage({ userId, role, message, data = null }) {
  try {
    // 🛡️ CRITICAL CHECK: Strict Type and Value validation
    if (!userId || userId === "undefined" || userId === "null" || String(userId).trim() === "") {
      console.error("🚨 SECURITY ALERT: Attempted to save message without a valid userId!");
      throw new Error("Unauthorized: userId is missing or invalid.");
    }

    // Database core persistence
    // 🟢 FIXED: 'data' is now passed into the database document
    const savedChat = await Chat.create({
      userId,
      role,
      message,
      data: data || null, 
    });

    return savedChat;
  } catch (error) {
    throw new Error(`[SaveMessage Error]: ${error.message}`);
  }
}

/**
 * Get Conversation securely by forcing strict userId filtering + .lean() optimization
 * @param {string} userId - Unique identity of the user
 * @param {number} limitCount - Increased default limit to prevent aggressive slicing
 */
async function getConversation(userId, limitCount = 30) { // 🟢 FIXED: Default limit badha kar 30 kiya
  try {
    // 🛡️ CRITICAL CHECK: Security Guardrail
    if (!userId || userId === "undefined" || userId === "null" || String(userId).trim() === "") {
      console.warn("⚠️ WARNING: getConversation called with empty or invalid userId. Blocking query.");
      return []; 
    }

    // 🔥 100x Optimization: Fetch raw data with lean
    const chats = await Chat.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(limitCount)
      .lean(); 

    // Database se fetched reverse array ko read-order me handle karo
    return chats
      .reverse()
      .map((chat) => ({
        role: chat.role,
        content: chat.message,
        // 🟢 FIXED: Database se layout cards/tools ka data bhi frontend ko return karo
        data: chat.data || null, 
      }));
  } catch (error) {
    throw new Error(`[GetConversation Error]: ${error.message}`);
  }
}

module.exports = {
  saveMessage,
  getConversation,
};