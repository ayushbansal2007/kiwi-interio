const mongoose = require("mongoose");
const Logger = require("../utils/logger");

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
       Logger.info("MongoDB connected successfully")
    }
    catch(err){
        Logger.error("MongoDB connection failed",err)
    }
}
module.exports=connectDB;