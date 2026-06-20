const jwt = require("jsonwebtoken");
const Logger = require("../utils/logger");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Bearer token check (Interviewer ka trap bhi fixed!)
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) reject(err); 
        resolve(payload);     
       });
    });

    
    req.user = decoded;
    
    next();
  } catch (error) {
   Logger.error("Authentication error:", error);
    return res.status(401).json({
      message: "Invalid or Expired Token",
    });
  }
};

module.exports = authMiddleware;