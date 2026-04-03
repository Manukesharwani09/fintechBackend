import userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  attachAuthCookies,
  clearAuthCookies,
  extractRefreshToken,
} from "../utils/cookies.js";

const registrationDisabled = (_req, res) => {
  res.status(403).json({
    message: "Registration is disabled. Please contact an administrator.",
  });
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, tokens } = await userService.loginUser(email, password);
  attachAuthCookies(res, tokens);

  res.status(200).json({
    data: { user },
    message: "Login successful",
  });
});

const refreshSession = asyncHandler(async (req, res) => {
  const incomingRefreshToken = extractRefreshToken(req);

  const { user, tokens } =
    await userService.refreshSession(incomingRefreshToken);

  attachAuthCookies(res, tokens);

  res.status(200).json({
    data: { user },
    message: "Session refreshed",
  });
});

const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken = extractRefreshToken(req);
  await userService.revokeByRefreshToken(incomingRefreshToken);
  clearAuthCookies(res);

  res.status(200).json({
    message: "Logged out successfully",
  });
});

export default {
  registrationDisabled,
  login,
  refreshSession,
  logout,
};
