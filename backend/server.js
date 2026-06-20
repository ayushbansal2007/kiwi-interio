const express = require("express")
const cors = require("cors")
require("dotenv").config()
const connectDB = require("./db/connectDB");
const interiorRoutes = require("./routes/interiorRoutes")
const authRoutes = require("./routes/authRoutes")
const aiRoutes = require("./routes/aiRoutes");
const morgan = require("morgan")
const logger = require("./utils/logger")

const app = express();

// 🌐 SECURE CORS SETUP FOR VERCEL LIVE LINK
const corsOptions = {
    origin: [
        "https://kiwi-interio-xi.vercel.app", // Tumhara live frontend link
        "http://localhost:5173"              // Local testing ke liye Vite ka port
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};

app.use(cors(corsOptions)); // Default cors() ki jagah ab options pass kar diye
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
      if (req.method !== "GET") return false;
      const isSuccess = (res.statusCode >= 200 && res.statusCode < 300) || res.statusCode === 304;
      return isSuccess;
    }
  })
);

app.use("/api", interiorRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/login", authRoutes)
app.use("/api", aiRoutes);

connectDB();

app.get("/", (req, res) => {
    res.send('hello world')
})

app.listen(5000, () => {
   logger.info("Server is running on port 5000")
})