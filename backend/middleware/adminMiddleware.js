// 📁 backend/middleware/adminMiddleware.js

const adminMiddleware = (req, res, next) => {
  try {
    // check role from JWT token
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin Access Only",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = adminMiddleware;