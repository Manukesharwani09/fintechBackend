import userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  attachAuthCookies,
  clearAuthCookies,
  extractRefreshToken,
} from "../utils/cookies.js";

const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, timezone, role } = req.body;

  const { user, tokens } = await userService.registerUser({
    email,
    password,
    firstName,
    lastName,
    timezone,
    role,
  });

  attachAuthCookies(res, tokens);

  res.status(201).json({
    data: {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, tokens } = await userService.loginUser(email, password);
  attachAuthCookies(res, tokens);

  res.status(200).json({
    data: {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

const refreshSession = asyncHandler(async (req, res) => {
  const incomingRefreshToken = extractRefreshToken(req);

  const { user, tokens } =
    await userService.refreshSession(incomingRefreshToken);

  attachAuthCookies(res, tokens);

  res.status(200).json({
    data: {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
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
  register,
  login,
  refreshSession,
  logout,
};
