import userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  attachAuthCookies,
  clearAuthCookies,
  extractRefreshToken,
} from "../utils/cookies.js";
import { isValidEmail } from "../utils/validation.js";

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const registrationDisabled = (_req, res) => {
  res.status(403).json({
    message: "Registration is disabled. Please contact an administrator.",
  });
};

const validateLoginInput = (body) => {
  if (!isValidEmail(body.email)) {
    throw badRequest("Please provide a valid email address.");
  }

  if (
    typeof body.password !== "string" ||
    body.password.length < 8 ||
    body.password.length > 128
  ) {
    throw badRequest("Password must be between 8 and 128 characters.");
  }
};

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  validateLoginInput(req.body);

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
