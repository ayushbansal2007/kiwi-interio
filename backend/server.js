const  express=require("express")
const cors=require("cors")
require("dotenv").config()
const connectDB = require("./db/connectDB");
const interiorRoutes=require("./routes/interiorRoutes")
const authRoutes=require("./routes/authRoutes")
const aiRoutes = require("./routes/aiRoutes");
const morgan=require("morgan")
const logger=require("./utils/logger")


const app=express();

app.use(cors());
app.use(express.json())
morgan.token("user-role", (req) => {
  return req.user ? req.user.role : "GUEST";
});

const prodFormat = ":remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length] \":referrer\" [Role: :user-role]";
app.use(
  morgan(prodFormat, {
    stream: { 
      write: (message) => logger.info(message.trim()) 
    },
    
    // 🎯 STRICT SKIP LOGIC
    skip: (req, res) => {
      // 1. Agar request GET nahi hai, toh log karo (Don't skip)
      if (req.method !== "GET") return false;

      // 2. Agar GET hai, toh check karo ki kya response kamyab raha?
      // Status code 200 se 299 ke beech ho YA 304 (Cache) ho, toh use SKIP kar do!
      const isSuccess = (res.statusCode >= 200 && res.statusCode < 300) || res.statusCode === 304;

      return isSuccess; // Agar success hai toh true return karega (yaani skip ho jayega)
    }
  })
);

app.use("/api",interiorRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/login",authRoutes)
app.use("/api", aiRoutes);


connectDB();
app.get("/",(req,res)=>{
    res.send('hello world')
})
app.listen(5000,()=>{
   logger.info("Server is running on port 5000")
})
