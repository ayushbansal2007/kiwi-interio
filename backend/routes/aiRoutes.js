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

// Helper function to extract valid string safely from AI objects
const sanitizeParam = (val, defaultFallback = "") => {
  if (!val) return defaultFallback;
  if (typeof val === "object") return defaultFallback; 
  return String(val).trim();
};

// ==========================================
// 🔄 ROUTE: FETCH CHAT HISTORY ON REFRESH
// ==========================================
router.get("/chat-history", authmiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log(`📜 Fetching historical conversation for user: ${userId}`);
    const dbHistory = await getConversation(userId);
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

    // ---------------- 2. HARDCODED OVERRIDE FOR GREETINGS ----------------
    const cleanMessage = message.trim().toLowerCase();
    const isGreeting = /^(hello|hi|hey|hola|greetings|good morning|good afternoon|good evening|wassup|yo|hello assistant|hi assistant)$/.test(cleanMessage);

    if (isGreeting) {
      await saveMessage({ userId, role: "user", message, data: null });
      
      const greetingReply = {
        intent: "greeting",
        tool: "null",
        tool_required: false,
        clarification_needed: false,
        message: "Hello! Kiwi AI Assistant me aapka swagat hai. Aap apne ghar ke interior ya furniture designs ke baare me kya poochna chahte hain? ✨",
        items: []
      };

      await saveMessage({ userId, role: "assistant", message: greetingReply.message, data: greetingReply });

      return res.json({
        success: true,
        reply: greetingReply
      });
    }

    // ---------------- 3. HISTORY FETCH & CLEAN CHAT MAP ----------------
    const historyLogs = await getConversation(userId);
    let validHistory = historyLogs && Array.isArray(historyLogs) ? historyLogs : [];

    // 🟢 FIXED: Groq API ko 'data' property se bachane ke liye clean aur slice map lagaya
    const cleanMessagesForGroq = validHistory.slice(-modelConfig.maxHistoryMessages).map((msg) => ({
      role: msg.role,
      content: msg.content || msg.message || "",
    }));

    // Save user interaction into DB
    await saveMessage({
      userId,
      role: "user",
      message,
      data: null 
    });

    // ---------------- 4. 🔥 RAG CONTEXT FETCHING ----------------
    const { contextText, dbItems } = await kiwiRagPipeline(message);

    // ---------------- 5. PROMPT CONSTRUCTION ARRAY ----------------
    const messages = [
      {
        role: "system",
        content: `${systemPrompt}\n\n=== REAL-TIME INVENTORY CONTEXT ===\n${contextText || "No direct matches found."}\n\nIMPORTANT: You must reply strictly using the verified JSON structure template specified in your system training. Do not wrap code blocks in markdown outside JSON.`,
      },
      ...fewShotExamples,
      ...cleanMessagesForGroq, // 🟢 FIXED: Placed the clean map array here instead of dirty 'validHistory'
      {
        role: "user",
        content: message, 
      },
    ];

    // ---------------- 6. AI RESPONSE WITH STRUCTURAL ENFORCEMENT ----------------
    const response = await retryWithBackoff(() =>
      client.chat.completions.create({
        model: modelConfig.model,
        messages,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        response_format: { type: "json_object" } 
      })
    );

    let aiReply = response.choices[0].message.content;
    console.log("AI RAW RESPONSE:", aiReply);

    // ---------------- 7. SAFE JSON PARSE (CRASH PROOF) ----------------
    let parsedReply;
    try {
      parsedReply = JSON.parse(aiReply);
    } catch (error) {
      console.log("⚠️ JSON PARSE ERROR! AI returned raw text. Converting to valid structure...");
      const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsedReply = JSON.parse(jsonMatch[0]); } catch(e) { parsedReply = null; }
      }
      
      if (!parsedReply) {
        parsedReply = {
          intent: "recommendation",
          tool: "searchInterior", 
          tool_required: true,
          clarification_needed: false,
          message: "Aapke bataye gaye space ke liye hamare paas kuch premium catalogs hain. Check kijiye.",
          category: "bedroom",
          budget: 0,
          style: ""
        };
      }
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

    // 🟢 CRITICAL PARAMETERS SANITIZATION FRAMEWORK
    const categoryStr = sanitizeParam(parsedReply.category, "bedroom");
    const styleStr = sanitizeParam(parsedReply.style, "");
    const budgetNum = Number(parsedReply.budget) || 0;
    const finalAiMessage = parsedReply?.message || "Tool response";

    // Dynamic reference container placeholder for the payload to be persisted
    let finalizedPayload = null;

    // ---------------- 9. TOOL CALLING SECTIONS ----------------
    
    // A. Contact Tool
    if (parsedReply.tool === "contactSupport") {
      const contactData = contactTool();
      finalizedPayload = {
        ...parsedReply,
        category: categoryStr,
        style: styleStr,
        budget: budgetNum,
        data: contactData,
        items: []
      };
    }

    // B. Price Tool
    else if (parsedReply.tool === "price") {
      const result = await priceTool({
        category: categoryStr,
        budget: budgetNum
      });

      finalizedPayload = {
        intent: "price_query",
        category: categoryStr,
        budget: result.items[0]?.price || budgetNum || 0,
        style: styleStr,
        tool: "price",
        tool_required: true,
        clarification_needed: false,
        message: finalAiMessage,
        items: result.items,
      };
    }

    // C. SEARCH TOOL
    else if (parsedReply.tool === "searchInterior" || parsedReply.intent === "recommendation") {
      const result = await searchInteriorTool({
        category: categoryStr,
        budget: budgetNum,
        style: styleStr,
      });

      const finalItems = result.items && result.items.length ? result.items : (dbItems || []);

      finalizedPayload = {
        intent: "recommendation",
        category: categoryStr,
        budget: budgetNum,
        style: styleStr,
        tool: "searchInterior",
        tool_required: true,
        clarification_needed: false,
        message: finalAiMessage,
        items: finalItems,
      };
    }

    // D. Budget Planner Tool
    else if (parsedReply.tool === "budgetPlanner") {
      const result = await budgetPlannerTool({
        category: categoryStr,
        budget: budgetNum,
      });

      finalizedPayload = {
        intent: "budget_planning",
        category: categoryStr,
        budget: budgetNum,
        style: styleStr,
        tool: "budgetPlanner",
        tool_required: true,
        clarification_needed: false,
        message: finalAiMessage,
        items: result.items,
      };
    }

    // E. Default Fallback Framework
    else {
      finalizedPayload = {
        ...parsedReply,
        category: categoryStr,
        style: styleStr,
        budget: budgetNum,
        items: dbItems || []
      };
    }

    // 🟢 FIXED: Ab actual tools ke results (items aur cards) ready hone ke baad database me save hoga!
    await saveMessage({
      userId,
      role: "assistant",
      message: finalizedPayload.message,
      data: finalizedPayload // Dynamic structural object saved cleanly in Mixed Schema field!
    });

    // Return exact formatted object flow
    return res.json({
      success: true,
      reply: finalizedPayload
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