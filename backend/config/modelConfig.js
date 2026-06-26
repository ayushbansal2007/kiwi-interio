const modelConfig = {
  // 🔥 Model ekdum sahi hai—super fast aur free/cheap on Groq!
  model: "llama-3.1-8b-instant", 

  // Strict JSON ke liye 0.1 se 0.3 ke beech ka temperature best hai
  temperature: 0.1, 

  // Badha diya taaki bada database JSON content bina tute safely return ho sake
  maxTokens: 3000, 

  // Isko badha diya taaki tumhara heavy System Prompt + RAG context aaram se sama sake
  maxPromptLength: 12000, 

  // Chat history ke messages control karne ke liye context limit (Tokens me nahi, messages array count me)
  maxHistoryMessages: 20, 
};

module.exports = modelConfig;