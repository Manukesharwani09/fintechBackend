import crypto from "crypto";

const hashToken = (token) => {
  if (!token) {
    throw new Error("Token value is required for hashing");
  }

  return crypto.createHash("sha256").update(token).digest("hex");
};

export { hashToken };
