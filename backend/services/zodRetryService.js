async function zodRetryService(
  {
    client,
    modelConfig,
    message,
    validationError,
    aiResponseSchema,
  }
) {
  try {
    const retryResponse =
      await client.chat.completions.create(
        {
          model:
            modelConfig.model,

          messages: [
            {
              role:
                "system",

              content: `
Your previous response failed Zod validation.

Zod Error:
${JSON.stringify(
  validationError,
  null,
  2
)}

STRICT RULES:
- Return ONLY valid JSON.
- Follow schema exactly.
- No markdown.
- No explanation.
- Fix datatype issues.
- Fix missing fields.
- Do not invent fields.
`,
            },

            {
              role:
                "user",

              content:
                message,
            },
          ],

          temperature:
            0,
        }
      );

    const fixedReply =
      retryResponse
        .choices[0]
        .message.content;

    const fixedParsed =
      JSON.parse(
        fixedReply
      );

    const validation =
      aiResponseSchema.safeParse(
        fixedParsed
      );

    return {
      success:
        validation.success,

      data:
        validation.data,

      error:
        validation.error
          ?.errors,
    };
  } catch (error) {
    throw new Error(
      error.message
    );
  }
}

module.exports =
  zodRetryService;