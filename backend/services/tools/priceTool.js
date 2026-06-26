const Interior = require("../../models/InteriorModel");

async function priceTool({ category, budget }) {
  try {
    const query = {};
    const cleanCategory = category ? category.trim().toLowerCase() : "";

    if (budget > 0) {
      query.price = { $lte: Number(budget) };
    }

    if (cleanCategory) {
      query.$or = [
        { category: { $regex: cleanCategory, $options: "i" } },
        { subcategory: { $regex: cleanCategory, $options: "i" } },
        { roomType: { $regex: cleanCategory, $options: "i" } },
        { tags: { $elemMatch: { $regex: cleanCategory, $options: "i" } } },
        { title: { $regex: cleanCategory, $options: "i" } }
      ];
    }

    console.log("🛠️ FIXED PRICE QUERY:", JSON.stringify(query, null, 2));

    const items = await Interior.find(query).sort({ price: 1 }).limit(4);
    console.log("PRICE ITEMS LOADED:", items.length);

    return {
      found: items.length > 0,
      items,
    };
  } catch (error) {
    console.error("❌ PRICE TOOL ERROR:", error);
    throw new Error(error.message);
  }
}

module.exports = priceTool;