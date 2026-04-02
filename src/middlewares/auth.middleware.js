import User from "../models/user.model.js";
import { USER_STATUS } from "../constants/userStatuses.js";
import { verifyAccessToken } from "../utils/token.js";

const unauthorized = (message = "Unauthorized") => {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
};

const extractBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }
  return authorizationHeader.slice(7).trim();
};

const authenticate = async (req, _res, next) => {
  try {
    const token =
      req.cookies?.accessToken || extractBearerToken(req.headers.authorization);

    if (!token) {
      throw unauthorized("Authentication required");
    }

    const payload = verifyAccessToken(token);

    const user = await User.findOne({ _id: payload.sub, isDeleted: false })
      .select("_id email role status")
      .lean();

    if (!user || user.status !== USER_STATUS.ACTIVE) {
      throw unauthorized("Unauthorized access");
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = "Invalid or expired access token";
    }
    next(error);
  }
};

export { authenticate };
