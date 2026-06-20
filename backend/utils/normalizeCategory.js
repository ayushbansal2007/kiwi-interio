function normalizeCategory(
  category
) {
  if (
    !category
  )
    return "";

  const text =
    category
      .toLowerCase()
      .trim();

  const map = {
    // bedroom
    bedroom:
      "bedroom",
    room:
      "bedroom",
    bedrom:
      "bedroom",

    // kitchen
    kitchen:
      "kitchen",
    kichen:
      "kitchen",
    modular:
      "kitchen",

    // living room
    living:
      "living-room",
    hall:
      "living-room",
    drawing:
      "living-room",

    // furniture / decor
    sofa:
      "living-room",
    couch:
      "living-room",
    table:
      "living-room",
    chair:
      "living-room",
    tv:
      "living-room",
    decor:
      "living-room",
  };

  return (
    map[text] ||
    text
  );
}

module.exports =
  normalizeCategory;