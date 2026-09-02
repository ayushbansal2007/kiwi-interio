const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/userModel");
const authMiddleware = require("../middleware/authMiddleware");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const {
  issueAuthTokens,
  setRefreshCookie,
  clearRefreshCookie,
  extractRefreshToken,
  signAccessToken,
  signRefreshToken,
} = require("../utils/authToken");

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const getConfiguredRole = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail === "kiwiadmininterio@gmail.com") return "admin";
  if (normalizedEmail === "hr@kiwiinterio.com") return "hr";
  return null;
};

const sendAuthResponse = (
  res,
  user,
  statusCode = 200,
  message = "Success",
  isNewUser = false
) => {
  const { accessToken, refreshToken } = issueAuthTokens(user);
  setRefreshCookie(res, refreshToken);

  const hasPhoneNumber = Boolean(user.number && user.number.trim().length > 0);

  return res.status(statusCode).json({
    message,
    accessToken,
    refreshToken,
    isNewUser,
    requiresProfileCompletion: !hasPhoneNumber,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      number: user.number || "",
      role: user.role,
      avatar: user.avatar || "",
      authProvider: user.authProvider || "local",
    },
  });
};

// ---------------- REGISTER ----------------
router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { name, email, password, number } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = getConfiguredRole(email) || "user";

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      number: number ? String(number).trim() : "",
      role,
      authProvider: "local",
    });

    return sendAuthResponse(res, newUser, 201, "User registered successfully", true);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        message: "This account uses Google sign-in. Please continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const configuredRole = getConfiguredRole(user.email);
    if (configuredRole && user.role !== configuredRole) {
      user.role = configuredRole;
    }

    user.lastLoginAt = new Date();
    await user.save();

    return sendAuthResponse(res, user, 200, "Login successful", false);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---------------- GOOGLE LOGIN ----------------
router.post("/google", loginLimiter, async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    if (!googleClient || !process.env.GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        message: "Google login is not configured on the server yet.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    const googleId = payload?.sub;
    const name = payload?.name || "Kiwi User";
    const picture = payload?.picture || "";

    if (!email || !googleId) {
      return res.status(400).json({ message: "Google account details are incomplete" });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    const configuredRole = getConfiguredRole(email);
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        number: "",
        role: configuredRole || "user",
        authProvider: "google",
      });
    } else {
      user.googleId = user.googleId || googleId;
      user.name = user.name || name;
      user.avatar = picture || user.avatar;
      user.authProvider = user.authProvider || "google";
      if (configuredRole && user.role !== configuredRole) {
        user.role = configuredRole;
      }
    }

    user.lastLoginAt = new Date();
    await user.save();

    return sendAuthResponse(
      res,
      user,
      200,
      isNewUser ? "Google sign-up successful" : "Google login successful",
      isNewUser
    );
  } catch (error) {
    res.status(401).json({ message: "Google authentication failed" });
  }
});

// ---------------- REFRESH ----------------
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = extractRefreshToken(req);

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const nextRefreshToken = signRefreshToken(user._id);
    const accessToken = signAccessToken(user);

    setRefreshCookie(res, nextRefreshToken);

    res.json({
      accessToken,
      refreshToken: nextRefreshToken,
    });
  } catch (error) {
    clearRefreshCookie(res);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// ---------------- PROFILE ----------------
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, number, avatar } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name && typeof name === "string") {
      user.name = name.trim();
    }
    if (typeof number === "string") {
      user.number = number.trim();
    }
    if (avatar && typeof avatar === "string") {
      user.avatar = avatar.trim();
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        number: user.number || "",
        role: user.role,
        avatar: user.avatar || "",
        authProvider: user.authProvider || "local",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/logout", (req, res) => {
  clearRefreshCookie(res);
  res.json({ message: "Logout successful" });
});

module.exports = router;
