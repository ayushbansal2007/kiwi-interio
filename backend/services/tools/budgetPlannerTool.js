const Interior =
  require(
    "../../models/InteriorModel"
  );

const normalizeCategory =
  require(
    "../../utils/normalizeCategory"
  );

async function budgetPlannerTool(
  {
    category,
    budget,
  }
) {
  try {
    const normalizedCategory =
      normalizeCategory(
        category
      );

    const items =
      await Interior.find({
        category:
          normalizedCategory,

        price: {
          $lte:
            budget,
        },
      })
        .sort({
          price: -1,
        }) // best expensive option under budget
        .limit(3);

    return {
      found:
        items.length > 0,

      items,
    };
  } catch (error) {
    throw new Error(
      error.message
    );
  }
}

module.exports =
  budgetPlannerTool;