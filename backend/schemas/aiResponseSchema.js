const { z } =
  require("zod");

const itemSchema =
  z.object({
    title:
      z.string(),

    description:
      z.string(),

    image:
      z.string(),

    category:
      z.string(),

    price:
      z.number(),
  });

const aiResponseSchema =
  z.object({
    intent:
      z.string(),

    category:
      z.string(),

    budget:
      z.number(),

    style:
      z.string(),

    tool:
      z.string(),

    tool_required:
      z.boolean(),

    clarification_needed:
      z.boolean(),

    message:
      z.string(),

    items:
      z.array(
        itemSchema
      ).default([]),
  });

module.exports =
  aiResponseSchema;