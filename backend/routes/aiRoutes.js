const express = require("express");
const router = express.Router();
const client = require("../config/openai");
const systemPrompt = require("../prompts/systemPrompt");
const modelConfig = require("../config/modelConfig");
const retryWithBackoff = require("../services/retryService");

const fewShotExamples = require("../prompts/fewShotExamples");
const aiResponseSchema = require("../schemas/aiResponseSchema");

// Tools Import Section
const contactTool = require("../services/tools/contactTool");
const priceTool = require("../services/tools/priceTool");
const searchInteriorTool = require("../services/tools/searchInteriorTool");
const budgetPlannerTool = require("../services/tools/budgetPlannerTool");
const zodRetryService = require("../services/zodRetryService");

// 🔥 RAG ENGINE
const kiwiRagPipeline = require("../services/ragService"); 

// 🎯 STRICT DATABASE SERVICE
const { saveMessage, getConversation } = require("../services/chatMemoryService");
const authmiddleware = require("../middleware/authMiddleware");

// ==========================================
// 🔄 NEW ROUTE: FETCH CHAT HISTORY ON REFRESH
// ==========================================
router.get("/chat-history", authmiddleware, async (req, res) => {
  try {
    const userId = req.user.userId; // Middleware se secure userId nikali

    console.log(`📜 Fetching historical conversation for user: ${userId}`);
    const dbHistory = await getConversation(userId);

    // Frontend ko direct pure history array bhej do
    return res.json(dbHistory || []);
  } catch (error) {
    console.error("❌ CHAT HISTORY ROUTE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Database se history load karne me dikkat aa rahi hai.",
    });
  }
});

// ==========================================
// 🚀 MAIN AI AGENT ROUTER INTERCEPTOR
// ==========================================
router.post("/ai", authmiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { message } = req.body;

    // ---------------- 1. VALIDATION ----------------
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message required",
      });
    }

    // ---------------- 2. HARDCODED OVERRIDE FOR GREETINGS (COST SAVER) ----------------
    const cleanMessage = message.trim().toLowerCase();
    const isGreeting = /^(hello|hi|hey|hola|greetings|good morning|good afternoon|good evening|wassup|yo|hello assistant|hi assistant)$/.test(cleanMessage);

    if (isGreeting) {
      // Greeting ko securely database me store karo taaki history clean rahe
      await saveMessage({ userId, role: "user", message });
      
      const greetingReply = {
        intent: "greeting",
        tool: "null",
        tool_required: false,
        clarification_needed: false,
        message: "Hello! Kiwi AI Assistant me aapka swagat hai. Aap apne ghar ke interior ya furniture designs ke baare me kya poochna chahte hain? ✨",
        items: []
      };

      await saveMessage({ userId, role: "assistant", message: greetingReply.message });

      return res.json({
        success: true,
        reply: greetingReply
      });
    }

    // ---------------- 3. MEMORY (SAVE USER CHAT FOR COMPLEX QUERIES) ----------------
    await saveMessage({
      userId,
      role: "user",
      message,
    });

    // ---------------- 4. 🔥 RAG CONTEXT FETCHING ----------------
    // // console.log("🔍 Fetching Vector RAG matches for:", message);
    const { contextText, dbItems } = await kiwiRagPipeline(message);

    // ---------------- 5. 🎯 FIXED: SAFE HISTORY EXCLUSION (NO DATA LOSS) ----------------
    const dbHistory = await getConversation(userId);
    
    // 🔥 MASTER FIX: Kyunki humne message upar save kar diya hai, toh array ka sabse aakhri element current message hi hoga.
    // Hum safely sirf us aakhri duplicate element ko pop out karenge, purani history ka koi data loss nahi hoga!
    if (dbHistory && dbHistory.length > 0) {
      dbHistory.pop(); 
    }

    const messages = [
      {
        role: "system",
        content: `${systemPrompt}\n\n=== REAL-TIME INVENTORY CONTEXT ===\n${contextText || "No direct matches found."}`,
      },
      ...fewShotExamples,
      ...dbHistory, // Saari genuine purani history bina kisi deletion ke safe hai
      {
        role: "user",
        content: message, // Current fresh message entry here
      },
    ];

    // ---------------- 6. AI RESPONSE (WITH PROTECTION) ----------------
    const response = await retryWithBackoff(() =>
      client.chat.completions.create({
        model: modelConfig.model,
        messages,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
      })
    );

    let aiReply = response.choices[0].message.content;
    console.log("AI RAW RESPONSE:", aiReply);

    // ---------------- 7. SAFE JSON PARSE (CRASH PROOF) ----------------
    let parsedReply;
    try {
      const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No valid JSON found");
      parsedReply = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.log("⚠️ JSON PARSE ERROR! AI returned raw text. Converting to valid structure...");
      
      parsedReply = {
        intent: "recommendation",
        tool: "null",
        tool_required: false,
        clarification_needed: false,
        message: aiReply || "Aapka message mil gaya hai. Aap interior ke baare me kya poochna chahte hain?",
        items: []
      };
    }

    // ---------------- 8. ZOD VALIDATION & RETRY ----------------
    if (parsedReply.tool !== undefined && parsedReply.tool !== "null") {
      const validation = aiResponseSchema.safeParse(parsedReply);
      if (!validation.success) {
        const retry = await zodRetryService({
          client,
          modelConfig,
          message,
          validationError: validation.error.errors,
          aiResponseSchema,
        });

        if (retry.success) {
          parsedReply = retry.data; 
        }
      }
    }

    // 🎯 AI ka final message securely database me save hoga sebelum tool outputs
    const finalAiMessage = parsedReply?.message || "Tool response";
    await saveMessage({
      userId,
      role: "assistant",
      message: finalAiMessage,
    });

    // ---------------- 9. TOOL CALLING SECTIONS (CLEAN CONDITIONAL RETURNS) ----------------
    let shouldShowItems = 
      parsedReply.tool_required === true || 
      (parsedReply.tool && parsedReply.tool !== "null") || 
      ["recommendation", "price_query", "budget_planning"].includes(parsedReply.intent);

    // A. Contact Tool
    if (parsedReply.tool === "contactSupport") {
      const contactData = contactTool();
      return res.json({
        success: true,
        reply: {
          ...parsedReply,
          data: contactData,
          items: []
        },
      });
    }

    // B. Price Tool
    if (parsedReply.tool === "price") {
      const result = await priceTool(parsedReply.category);
      return res.json({
        success: true,
        reply: {
          intent: "price_query",
          category: parsedReply.category,
          budget: result.items[0]?.price || parsedReply.budget || 0,
          style: parsedReply.style || "",
          tool: "price",
          tool_required: true,
          clarification_needed: false,
          message: finalAiMessage,
          items: result.items,
        },
      });
    }

    // C. Search Tool
    if (parsedReply.tool === "searchInterior") {
      const result = await searchInteriorTool({
        category: parsedReply.category,
        budget: parsedReply.budget,
        style: parsedReply.style,
      });

      const finalItems = result.items.length ? result.items : (dbItems || []);

      return res.json({
        success: true,
        reply: {
          intent: "recommendation",
          category: parsedReply.category,
          budget: parsedReply.budget,
          style: parsedReply.style,
          tool: "searchInterior",
          tool_required: true,
          clarification_needed: false,
          message: finalAiMessage,
          items: finalItems,
        },
      });
    }

    // D. Budget Planner
    if (parsedReply.tool === "budgetPlanner") {
      const result = await budgetPlannerTool({
        category: parsedReply.category,
        budget: parsedReply.budget,
      });

      return res.json({
        success: true,
        reply: {
          intent: "budget_planning",
          category: parsedReply.category,
          budget: parsedReply.budget,
          style: parsedReply.style || "",
          tool: "budgetPlanner",
          tool_required: true,
          clarification_needed: false,
          message: finalAiMessage,
          items: result.items,
        },
      });
    }

    // ---------------- 10. DEFAULT FALLBACK RESPONSE (IF NO TOOLS TRIGGERED) ----------------
    return res.json({
      success: true,
      reply: {
        ...parsedReply,
        items: shouldShowItems ? (dbItems || []) : [] 
      }
    });

  } catch (error) {
    console.error("AI ROUTE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error occurred",
    });
  }
});

module.exports = router;