const Interior = require("../../models/InteriorModel");
const kiwiRagPipeline = require("../../services/ragService"); // 🟢 Local RAG integrated

async function searchInteriorTool({ category, budget, style }) {
  try {
    // 🟢 SAFE REGEX LOGIC FIXED (No empty {} outputs)
    const cleanCategory = category ? category.trim().toLowerCase() : "";
    const cleanStyle = style ? style.trim().toLowerCase() : "";

    // Agar direct filter lagana hai
    const filters = [];

    if (cleanCategory) {
      filters.push({
        $or: [
          { category: { $regex: cleanCategory, $options: "i" } },
          { subcategory: { $regex: cleanCategory, $options: "i" } },
          { roomType: { $regex: cleanCategory, $options: "i" } },
          { tags: { $elemMatch: { $regex: cleanCategory, $options: "i" } } },
          { title: { $regex: cleanCategory, $options: "i" } },
          { description: { $regex: cleanCategory, $options: "i" } }
        ]
      });
    }

    if (cleanStyle) {
      filters.push({
        $or: [
          { style: { $regex: cleanStyle, $options: "i" } },
          { tags: { $elemMatch: { $regex: cleanStyle, $options: "i" } } }
        ]
      });
    }

    if (budget && budget > 0) {
      filters.push({ price: { $lte: Number(budget) } });
    }

    const query = filters.length ? { $and: filters } : {};
    console.log("🛠️ FIXED KEYWORD SEARCH QUERY:", JSON.stringify(query, null, 2));

    // Execute Standard Query
    let items = await Interior.find(query).sort({ price: 1 }).limit(4);

    // 🟢 INTELLIGENT RAG FALLBACK (Best Part!)
    // Agar keyword search se kuch na mile, ya unme bedroom ke badle unrelated decor objects mil rahe hon:
    if (items.length === 0 || (cleanCategory === "bedroom" && !items.some(i => i.category?.toLowerCase().includes("bedroom")))) {
      console.log("🔄 Keyword mismatch or irrelevant items! Diverting traffic to Local Vector RAG Pipeline...");
      
      const rawBuildString = `${cleanStyle} ${cleanCategory}`.trim();
      const ragResult = await kiwiRagPipeline(rawBuildString || "bedroom modern design");
      
      if (ragResult.dbItems && ragResult.dbItems.length > 0) {
        // Apply final budget filter to RAG results to ensure client constraints are fully respected
        items = ragResult.dbItems.filter(item => !budget || item.price <= budget);
      }
    }

    console.log("🎯 VECTOR SYNCED FOUND ITEMS:", items.map(i => ({ title: i.title, category: i.category, price: i.price })));

    return {
      found: items.length > 0,
      items,
    };
  } catch (error) {
    console.error("❌ SEARCH ERROR:", error);
    throw new Error(error.message);
  }
}

module.exports = searchInteriorTool;