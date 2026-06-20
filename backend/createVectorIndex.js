const { MongoClient } = require("mongodb");
require("dotenv").config();

const url = process.env.MONGO_URI || "mongodb+srv://p0945311_db_user:ayush%402007@cluster0.wiwzurt.mongodb.net/kiwiinterio?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  const client = new MongoClient(url);

  try {
    console.log("🔄 Connecting to KiwiInterio Database...");
    await client.connect();
    
    const database = client.db("kiwiinterio");
    const collection = database.collection("interiors");

    console.log("🚀 Creating 384-Dimension Free Vector Search Index...");

    const indexDefinition = {
      name: "free_vector_index", 
      type: "vectorSearch", 
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding", // Schema field where weights are stored
            numDimensions: 384, // 🔥 Changed from 1536 to 384 for Hugging Face Free Model
            similarity: "cosine" 
          }
        ]
      }
    };

    const result = await collection.createSearchIndex(indexDefinition);
    console.log(`\n✅ Success! Free Search Index "${result}" triggered successfully!`);
    
  } catch (err) {
    console.error("❌ Index banane me panga hua:", err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

run();