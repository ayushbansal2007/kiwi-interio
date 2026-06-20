const mongoose = require("mongoose");
require("dotenv").config();

// Tumhara model path
const Interior = require("./models/InteriorModel"); 

const mongoURI = process.env.MONGO_URI || "mongodb+srv://p0945311_db_user:ayush%402007@cluster0.wiwzurt.mongodb.net/kiwiinterio?retryWrites=true&w=majority&appName=Cluster0";

async function seedEmbeddings() {
  try {
    // 1. Local execution ke liye package import karo
    console.log("📥 Loading local embedding model (Xenova/bge-small-en-v1.5)...");
    const { pipeline } = await import("@xenova/transformers");
    
    // Feature extraction pipeline setup (bge-small-en-v1.5 model local load hoga)
    const extractor = await pipeline("feature-extraction", "Xenova/bge-small-en-v1.5");
    console.log("💪 Local Model Loaded successfully!");

    // 2. Database connection
    console.log("🔄 Connecting to Database...");
    await mongoose.connect(mongoURI);
    console.log("✅ Database Connected.");

    // 3. Items nikaalo
    const items = await Interior.find({});
    console.log(`📦 Total ${items.length} items mile database me encode karne ke liye.`);

    if (items.length === 0) {
      console.log("⚠️ Database me koi products nahi mile!");
      process.exit(0);
    }

    // 4. Loop chalao aur bina internet ke locally numbers generate karo
    for (let item of items) {
      console.log(`\n⚙️ Processing item: "${item.title}"`);

      const textToEncode = `
        Title: ${item.title}
        Category: ${item.category}
        Description: ${item.description}
        Style: ${item.style || "Modern"}
      `.trim();

      // Local model se embedding nikalo
      const output = await extractor(textToEncode, { pooling: "mean", normalize: true });
      
      // Output ko normal JavaScript array me convert karo
      const embedding = Array.from(output.data);

      // Check validation (384 size)
      if (embedding.length === 384) {
        item.embedding = embedding;
        await item.save();
        console.log(`✅ Vector saved locally! (Dimensions: ${embedding.length})`);
      } else {
        console.error(`⚠️ Warning: Expected 384 dimensions, got ${embedding.length}`);
      }
    }

    console.log("\n🎉 CONGRATULATIONS! ALL 50 PRODUCTS ARE NOW EMBEDDED LOCALLY FOR FREE!");

  } catch (error) {
    console.error("\n❌ Seeding process me dikkat aayi:", error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedEmbeddings();