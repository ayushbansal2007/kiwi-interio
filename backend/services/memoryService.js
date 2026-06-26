// 🎯 Global Map: Har user ki personal history RAM me rakhne ke liye
const usersConversationMap = new Map();

// ⏰ Global Map: Har user ke automatic cleanup timer ko track karne ke liye
const memoryTimers = new Map();

/**
 * Logout ya Inactivity ke waqt RAM saaf karne ke liye helper function
 */
function clearUserMemory(userId) {
  if (userId && usersConversationMap.has(userId)) {
    usersConversationMap.delete(userId);
    
    // Agar koi active timer bacha hai, toh use bhi clear karo
    if (memoryTimers.has(userId)) {
      clearTimeout(memoryTimers.get(userId));
      memoryTimers.delete(userId);
    }
    console.log(`🧹 RAM automatic clear ho gayi is user ki: ${userId}`);
  }
}

/**
 * Kisi specific user ki history me naya message add karne ke liye (With TTL & Data Support)
 * 🟢 FIXED: Added custom data parameter for RAG tools layout caching
 */
function addMessage(userId, role, content, contextWindow, data = null) {
  if (!userId) {
    console.error("Error: userId is required.");
    return;
  }

  // 1. Khali array check aur set karna
  if (!usersConversationMap.has(userId)) {
    usersConversationMap.set(userId, []);
  }

  const userHistory = usersConversationMap.get(userId);

  // 2. Naya chat object push karo
  // 🟢 FIXED: Ab content ke sath cards aur tools ka structured 'data' bhi RAM me cache hoga
  userHistory.push({ 
    role, 
    content,
    data: data || null 
  });

  // 3. Token Optimization (Sliding Window)
  if (userHistory.length > contextWindow) {
    const trimmedHistory = userHistory.slice(-contextWindow);
    usersConversationMap.set(userId, trimmedHistory);
  }

  // ==========================================
  // ⏳ 🔥 SOLID TTL LOGIC (RAM PROTECTION)
  // ==========================================
  
  if (memoryTimers.has(userId)) {
    clearTimeout(memoryTimers.get(userId));
  }

  // Ek naya 30-minute ka timer lagao taaki session lamba aur stable chale
  const inactivityTimeout = setTimeout(() => {
    console.log(`⏱️ Inactivity detected. Action: Clear RAM.`);
    clearUserMemory(userId); 
  }, 30 * 60 * 1000); // 30 Minutes backup window

  memoryTimers.set(userId, inactivityTimeout);
}

function getMemory(userId) {
  if (!userId) return [];
  return usersConversationMap.get(userId) || [];
}

module.exports = {
  addMessage,
  getMemory,
  clearUserMemory,
};