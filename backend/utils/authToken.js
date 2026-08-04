const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: "/",
  };
};

const signAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

const signRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

const issueAuthTokens = (user) => ({
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user._id),
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", getRefreshCookieOptions());
};

const extractRefreshToken = (req) =>
  req.cookies?.refreshToken ||
  req.body?.refreshToken ||
  null;

module.exports = {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_COOKIE_MAX_AGE,
  getRefreshCookieOptions,
  signAccessToken,
  signRefreshToken,
  issueAuthTokens,
  setRefreshCookie,
  clearRefreshCookie,
  extractRefreshToken,
};
