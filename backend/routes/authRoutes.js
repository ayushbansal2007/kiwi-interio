const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User =
 require("../models/userModel");
const authMiddleware =
  require("../middleware/authMiddleware");
  const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");

// Staff roles are assigned server-side. Do not accept a role from the browser.
const getConfiguredRole = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail === "kiwiadmininterio@gmail.com") return "admin";
  if (normalizedEmail === "hr@kiwiinterio.com") return "hr";
  return null;
};

// ---------------- REGISTER ----------------
router.post(
  "/register",
  registerLimiter,
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        number,
      } = req.body;

      // check existing user
      const existingUser =
        await User.findOne({
          email,
        });

      if (existingUser) {
        return res
          .status(400)
          .json({
            message:
              "User already exists",
          });
      }

      // hash password
      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      // admin email
      const role = getConfiguredRole(email) || "user";

      // save user
      const newUser =
        await User.create({
          name,
          email,
          password:
            hashedPassword,
          number,
          role,
        });

      const accessToken = jwt.sign(
        {
          userId: newUser._id,
          role: newUser.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      res
        .status(201)
        .json({
          message:
            "User registered successfully",
          accessToken,
          user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            number: newUser.number,
            role: newUser.role,
          },
        });
    } catch (error) {
      res
        .status(500)
        .json({
          message:
            error.message,
        });
    }
  }
);

// ---------------- LOGIN ----------------
router.post(
  "/login",
  loginLimiter,
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res
          .status(400)
          .json({
            message:
              "User not found",
          });
      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res
          .status(400)
          .json({
            message:
              "Invalid credentials",
          });
      }

      // Apply fixed staff permissions to existing accounts too. This upgrades
      // the configured HR account from a previously stored "user" role on login.
      const configuredRole = getConfiguredRole(user.email);
      if (configuredRole && user.role !== configuredRole) {
        user.role = configuredRole;
      }

      // Keep a reliable audit timestamp for the admin dashboard.
      user.lastLoginAt = new Date();
      await user.save();

      const accessToken = jwt.sign(
  {
    userId: user._id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "15m",
  }
);
const refreshToken = jwt.sign(
  {
    userId: user._id,
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn: "7d",
  }
);
res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

      res.json({
        message:
          "Login successful",
       accessToken,
      user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    number: user.number,
    role: user.role,
  },
      });
    } catch (error) {
      res
        .status(500)
        .json({
          message:
            error.message,
        });
    }
  }
);
 router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not found",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.json({
      accessToken,
    });

  } catch (error) {
    res.status(401).json({
      message: "Invalid refresh token",
    });
  }
});
// ---------------- PROFILE ----------------
router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId
        ).select(
          "-password"
        );

      res.json(user);
    } catch (error) {
      res
        .status(500)
        .json({
          message:
            error.message,
        });
    }
  }
);


router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({
    message: "Logout successful",
  });
});

module.exports = router;
