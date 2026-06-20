const mongoose =
  require(
    "mongoose"
  );

const InteriorSchema =
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    // main category
    category: {
      type: String,
      required: true,
    },

    // product type
    subcategory: {
      type: String,
      default: "",
    },

    // design style
    style: {
      type: String,
      default: "",
    },

    // search keywords
    tags: {
      type: [String],
      default: [],
    },

    // room type
    roomType: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },
    embedding: {
    type: [Number],
    required: false, 
  },
  });

const Interior =
  mongoose.models
    .Interior ||
  mongoose.model(
    "Interior",
    InteriorSchema
  );

module.exports =
  Interior;