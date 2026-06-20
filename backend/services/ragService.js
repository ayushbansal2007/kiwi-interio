const Interior = require("../models/InteriorModel"); // Sahi model path jo humne fix kiya tha

let extractor = null;

/**
 * Local Model Loader (Singleton Pattern)
 * Server chalu hote hi model ek baar load hoga, bar-bar nahi taaki performance fast rahe.
 */
async function getExtractor() {
  if (!extractor) {
    console.log("📥 Loading Local Embedding Model for RAG Pipeline...");
    const { pipeline } = await import("@xenova/transformers");
    extractor = await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5");
    console.log("💪 Local RAG Model Loaded successfully!");
  }
  return extractor;
}

/**
 * Kiwi FREE Local RAG Retrieval Pipeline
 * @param {string} userQuery - Frontend se aaya hua user ka raw message
 * @returns {Object} - contextText (AI ke liye) aur dbItems (Frontend layout ke liye)
 */
async function kiwiRagPipeline(userQuery) {
  try {
    if (!userQuery || !userQuery.trim()) {
      return { contextText: "", dbItems: [] };
    }

    // 1. Model get karo aur user query ka embedding banao
    const model = await getExtractor();
    const output = await model(userQuery, { pooling: "mean", normalize: true });
    const queryEmbedding = Array.from(output.data);

    // 2. MONGO DB VECTOR SEARCH: Jo index humne 'free_vector_index' banaya tha use call karo
    const vectorSearchResults = await Interior.aggregate([
      {
        $vectorSearch: {
          index: "free_vector_index",   // 🎯 Option 1 wala sahi naam jo MongoDB me save hai
          path: "embedding",            // Schema target field
          queryVector: queryEmbedding,  // Local package se nikla hua array
          numCandidates: 10,            // Rough filter pool
          limit: 3                      // Top 3 best matching products
        }
      },
      {
        $addFields: {
          score: { $meta: "vectorSearchScore" } // Matching accuracy score inject karo
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          price: 1,
          category: 1,
          image: 1,
          style: 1,
          roomType: 1
        }
      }
    ]);

    // Agar database se kuch na mile
    if (vectorSearchResults.length === 0) {
      console.log("ℹ️ Local RAG: No matching inventory items found.");
      return { contextText: "No matching items found in the current store inventory.", dbItems: [] };
    }

    console.log(`🎯 Local RAG Match Success! Found ${vectorSearchResults.length} items.`);

    // 3. CHUNKING STRING GENERATION: System prompt me merge karne ke liye string block banao
    const contextText = vectorSearchResults.map(item => `
Product ID: ${item._id}
Title: ${item.title}
Category: ${item.category}
Price: ₹${item.price}
Style: ${item.style || "Modern"}
Details: ${item.description}
    `).join("\n---\n");

    return {
      contextText,
      dbItems: vectorSearchResults // Route ke tools me use karne ke liye
    };

  } catch (error) {
    console.error("❌ Local RAG Pipeline Internal Error:", error);
    // Crash na ho server isliye safe fallback return karo
    return { contextText: "", dbItems: [] };
  }
}

module.exports = kiwiRagPipeline;