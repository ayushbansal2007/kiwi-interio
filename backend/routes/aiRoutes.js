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

    // ---------------- 3. MEMORY (SAVE USER CHAT) ----------------
    await saveMessage({
      userId,
      role: "user",
      message,
    });

    // ---------------- 4. 🔥 RAG CONTEXT FETCHING ----------------
    const { contextText, dbItems } = await kiwiRagPipeline(message);

    // ---------------- 5. SAFE HISTORY EXCLUSION ----------------
    const dbHistory = await getConversation(userId);
    if (dbHistory && dbHistory.length > 0) {
      dbHistory.pop(); 
    }

    const messages = [
      {
        role: "system",
        content: `${systemPrompt}\n\n=== REAL-TIME INVENTORY CONTEXT ===\n${contextText || "No direct matches found."}`,
      },
      ...fewShotExamples,
      ...dbHistory,
      {
        role: "user",
        content: message,
      },
    ];

    // ---------------- 6. AI RESPONSE ----------------
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

    // 🎯 SMART BACKUP CHECK FOR AI MISTAKES (Fixes Empty Parameters)
    // Agar AI ne category khali chhodi ya galat format diya, toh user ke original message ya RAG item se extract karo
    if (!parsedReply.category || typeof parsedReply.category === 'object') {
      if (dbItems && dbItems.length > 0) {
        parsedReply.category = dbItems[0].category || "bedroom";
      } else {
        parsedReply.category = message; // Fallback to raw user query text
      }
    }

    const finalAiMessage = parsedReply?.message || "Tool response";
    await saveMessage({
      userId,
      role: "assistant",
      message: finalAiMessage,
    });

    // ---------------- 9. TOOL CALLING SECTIONS ----------------
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

    // C. 🎯 SEARCH TOOL (SMART PRE-CHECK FIXED)
    if (parsedReply.tool === "searchInterior") {
      // Robust filtering text extraction
      const targetCategory = (typeof parsedReply.category === "string" && parsedReply.category.trim() !== "") 
        ? parsedReply.category 
        : message;

      const result = await searchInteriorTool({
        category: targetCategory,
        budget: Number(parsedReply.budget) || 0,
        style: parsedReply.style || "",
      });

      // Agar filter query fail ho jaye toh RAG wale vector items use kar lo as safety net
      const finalItems = result.items && result.items.length ? result.items : (dbItems || []);

      return res.json({
        success: true,
        reply: {
          intent: "recommendation",
          category: targetCategory,
          budget: parsedReply.budget,
          style: parsedReply.style || "",
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
      const targetCategory = (typeof parsedReply.category === "string" && parsedReply.category.trim() !== "") 
        ? parsedReply.category 
        : message;

      const result = await budgetPlannerTool({
        category: targetCategory,
        budget: Number(parsedReply.budget) || 0,
      });

      return res.json({
        success: true,
        reply: {
          intent: "budget_planning",
          category: targetCategory,
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

    // ---------------- 10. DEFAULT FALLBACK RESPONSE ----------------
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