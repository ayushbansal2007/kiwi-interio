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
 * Kisi specific user ki history me naya message add karne ke liye (With TTL)
 */
function addMessage(userId, role, content, contextWindow) {
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
  userHistory.push({ role, content });

  // 3. Token Optimization (Sliding Window)
  if (userHistory.length > contextWindow) {
    const trimmedHistory = userHistory.slice(-contextWindow);
    usersConversationMap.set(userId, trimmedHistory);
  }
  

  // ==========================================
  // ⏳ 🔥 SOLID TTL LOGIC (RAM PROTECTION)
  // ==========================================
  
  // A. Agar is user ka pehle se koi timer chal raha hai, toh use CANCEL karo
  // Kyunki user ne abhi-abhi message bheja hai, iska matlab woh abhi active hai!
  if (memoryTimers.has(userId)) {
    clearTimeout(memoryTimers.get(userId));
  }

  // B. Ek naya 15-minute ka timer lagao
  const inactivityTimeout = setTimeout(() => {
    console.log(`⏱️ 15 Minutes se user shaant hai. Action: Clear RAM.`);
    clearUserMemory(userId); // Automatic RAM saaf!
  }, 15 * 60 * 1000); // 15 Minutes in milliseconds (15 * 60 * 1000)

  // C. Is naye timer ko map me save kar lo taaki agle message par reset kar sakein
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