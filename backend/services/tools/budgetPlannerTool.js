const Interior = require("../../models/InteriorModel");
const normalizeCategory = require("../../utils/normalizeCategory");

async function budgetPlannerTool({ category, budget }) {
  try {
    const normalizedCategory = normalizeCategory(category);
    
    // 🟢 FIXED: Strict absolute match ke badle regex safe match lagao, safety priority ke sath
    const query = {
      category: { $regex: `^${normalizedCategory.trim()}$`, $options: "i" },
      price: { $lte: Number(budget) }
    };

    console.log("🛠️ FIXED BUDGET PLANNER QUERY:", query);

    const items = await Interior.find(query)
      .sort({ price: -1 }) // Best option under budget
      .limit(3);

    return {
      found: items.length > 0,
      items,
    };
  } catch (error) {
    console.error("❌ BUDGET PLANNER ERROR:", error);
    throw new Error(error.message);
  }
}

module.exports = budgetPlannerTool;