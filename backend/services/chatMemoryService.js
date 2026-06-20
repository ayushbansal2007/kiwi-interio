const Chat = require("../models/chatModel");

/**
 * Save Message securely with mandatory userId validation
 * (Called inside controller to persist user and assistant interactions)
 */
async function saveMessage({ userId, role, message }) {
  try {
    // 🛡️ CRITICAL CHECK: Strict Type and Value validation
    if (!userId || userId === "undefined" || userId === "null" || String(userId).trim() === "") {
      console.error("🚨 SECURITY ALERT: Attempted to save message without a valid userId!");
      throw new Error("Unauthorized: userId is missing or invalid.");
    }

    // Database core persistence
    const savedChat = await Chat.create({
      userId,
      role,
      message,
    });

    return savedChat;
  } catch (error) {
    throw new Error(`[SaveMessage Error]: ${error.message}`);
  }
}

/**
 * Get Conversation securely by forcing strict userId filtering + .lean() optimization
 * @param {string} userId - Unique identity of the user
 * @param {number} limitCount - Context window dynamic limit (Config se paas hoga)
 */
async function getConversation(userId, limitCount = 6) {
  try {
    // 🛡️ CRITICAL CHECK: Agar token expired hai ya invalid userId hai, leak mat hone do data
    if (!userId || userId === "undefined" || userId === "null" || String(userId).trim() === "") {
      console.warn("⚠️ WARNING: getConversation called with empty or invalid userId. Blocking query.");
      return []; // Return empty array to protect user privacy
    }

    // 🔥 100x Optimization: .lean() added to fetch raw, plain JavaScript objects from MongoDB
    // Isse Mongoose ke memory heavy internal triggers (change tracking, save methods) skip ho jayenge.
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
      }));
  } catch (error) {
    throw new Error(`[GetConversation Error]: ${error.message}`);
  }
}

module.exports = {
  saveMessage,
  getConversation,
};