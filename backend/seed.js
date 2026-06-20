require("dotenv").config();

const mongoose =
  require("mongoose");

const Interior =
  require(
    "./models/interiorModel"
  );

// JSON files
const bedroom =
  require(
    "./data/bedroom.json"
  );

const kitchen =
  require(
    "./data/kitchen.json"
  );

const livingRoom =
  require(
    "./data/living-room.json"
  );

const chair =
  require(
    "./data/chair.json"
  );

const homeDecor =
  require(
    "./data/home-decor.json"
  );

// merge all data
const interiorsData =
  [
    ...bedroom,
    ...kitchen,
    ...livingRoom,
    ...chair,
    ...homeDecor,
  ];

async function seedDB() {
  try {

    // connect db
    await mongoose.connect(
      process.env
        .MONGO_URI
    );

    console.log(
      "MongoDB Connected"
    );

    // delete old data
    await Interior.deleteMany(
      {}
    );

    console.log(
      "Old data deleted"
    );

    // insert new data
    await Interior.insertMany(
      interiorsData
    );

    console.log(
      `${interiorsData.length} interiors inserted`
    );

    process.exit(
      0
    );

  } catch (
    error
  ) {

    console.log(
      "Seed Error:",
      error
    );

    process.exit(
      1
    );
  }
}

seedDB();