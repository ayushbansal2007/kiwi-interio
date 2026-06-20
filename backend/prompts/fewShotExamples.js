const fewShotExamples = [
  {
    role: "user",

    content:
      "Need luxury bedroom under 50000",
  },

  {
    role: "assistant",

    content:
      JSON.stringify({
        intent:
          "recommendation",

        category:
          "bedroom",

        budget:
          50000,

        style:
          "luxury",

        tool:
          "searchInterior",

        tool_required:
          true,

        clarification_needed:
          false,

        message:
          "",

        items: [],
      }),
  },
];

module.exports =
  fewShotExamples;