import userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  attachAuthCookies,
  clearAuthCookies,
  extractRefreshToken,
} from "../utils/cookies.js";
import {
  isValidEmail,
  isStrongPassword,
  isValidOptionalString,
} from "../utils/validation.js";

const badRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const validateRegistrationInput = (body) => {
  if (!isValidEmail(body.email)) {
    throw badRequest("Please provide a valid email address.");
  }

  if (!isStrongPassword(body.password)) {
    throw badRequest(
      "Password must be at least 8 characters and include letters and numbers.",
    );
  }

  [
    [body.firstName, "First name"],
    [body.lastName, "Last name"],
    [body.timezone, "Timezone"],
  ].forEach(([value, label]) => {
    if (!isValidOptionalString(value, { maxLength: 120 })) {
      throw badRequest(`${label} must be a string up to 120 characters.`);
    }
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

const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, timezone, role } = req.body;

  validateRegistrationInput(req.body);

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
    data: { user },
    message: "Registration successful",
  });
});

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
  register,
  login,
  refreshSession,
  logout,
};
