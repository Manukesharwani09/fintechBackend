import bcrypt from "bcrypt";

import config from "../config/env.js";

const hashPassword = (plainText) => {
  if (!plainText) {
    throw new Error("Password is required for hashing");
  }

  return bcrypt.hash(plainText, config.bcrypt.saltRounds);
};

const verifyPassword = (plainText, hash) => {
  if (!plainText || !hash) {
    return false;
  }

  return bcrypt.compare(plainText, hash);
};

export { hashPassword, verifyPassword };
