import jwt from "jsonwebtoken";

import config from "../config/env.js";

const assertSecrets = () => {
  if (!config.jwt.secret || !config.jwt.refreshSecret) {
    throw new Error("JWT secrets are not configured");
  }
};

const generateAccessToken = (user) => {
  assertSecrets();

  const payload = {
    sub: user?._id?.toString() || user?.id,
    role: user?.role,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const generateRefreshToken = (user) => {
  assertSecrets();

  const payload = {
    sub: user?._id?.toString() || user?.id,
    tokenIssuedAt: Date.now(),
  };

  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

const verifyRefreshToken = (token) => {
  assertSecrets();
  return jwt.verify(token, config.jwt.refreshSecret);
};

const decodeRefreshToken = (token) => jwt.decode(token);

export {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  decodeRefreshToken,
};
