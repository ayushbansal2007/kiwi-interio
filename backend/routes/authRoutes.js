const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User =
 require("../models/userModel");
const authMiddleware =
  require("../middleware/authMiddleware");

// ---------------- REGISTER ----------------
router.post(
  "/register",
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
      const role =
        email ===
        "kiwiadmininterio@gmail.com"
          ? "admin"
          : "user";

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

      // token
      const token =
        jwt.sign(
          {
            userId:
              newUser._id,
            role:
              newUser.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn:
              "30d",
          }
        );

      res
        .status(201)
        .json({
          message:
            "User Registered",
          token,
          role:
            newUser.role,
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

      const token =
        jwt.sign(
          {
            userId:
              user._id,
            role:
              user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn:
              "30d",
          }
        );

      res.json({
        message:
          "Login successful",
        token,
        role:
          user.role,
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

module.exports = router;