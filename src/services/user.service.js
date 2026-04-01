import BaseService from "./base.service.js";
import User from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { USER_ROLE_VALUES, USER_ROLES } from "../constants/userRoles.js";
import { USER_STATUS } from "../constants/userStatuses.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  decodeRefreshToken,
} from "../utils/token.js";
import { hashToken } from "../utils/hash.js";

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  sanitizeUser(userDocument) {
    if (!userDocument) {
      return null;
    }

    const user = userDocument.toObject
      ? userDocument.toObject()
      : { ...userDocument };
    delete user.passwordHash;
    delete user.refreshTokenHash;
    delete user.refreshTokenExpiresAt;
    return user;
  }

  findByEmail(email, options = {}) {
    return this.findOne({ email: email?.trim().toLowerCase() }, options);
  }

  async ensureEmailAvailable(email) {
    const existing = await this.findByEmail(email, {
      projection: "_id",
      lean: true,
    });
    if (existing) {
      throw buildError("Email is already registered", 409);
    }
  }

  async registerUser(payload) {
    const normalizedEmail = payload.email?.trim().toLowerCase();
    if (!normalizedEmail || !payload.password) {
      throw buildError("Email and password are required", 400);
    }

    await this.ensureEmailAvailable(normalizedEmail);

    const passwordHash = await hashPassword(payload.password);
    const role = USER_ROLE_VALUES.includes(payload.role)
      ? payload.role
      : USER_ROLES.VIEWER;

    const userPayload = {
      email: normalizedEmail,
      passwordHash,
      role,
      profile: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        timezone: payload.timezone,
      },
    };

    const user = await this.create(userPayload);
    const tokens = await this.issueAuthTokens(user);
    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async validateCredentials(email, password) {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw buildError("Email and password are required", 400);
    }

    const user = await this.model
      .findOne({ email: normalizedEmail, isDeleted: false })
      .select("+passwordHash +refreshTokenHash");

    if (!user) {
      throw buildError("Invalid email or password", 401);
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw buildError("User is not active", 403);
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      throw buildError("Invalid email or password", 401);
    }

    return user;
  }

  async loginUser(email, password) {
    const user = await this.validateCredentials(email, password);
    const tokens = await this.issueAuthTokens(user);
    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async listUsers(params = {}) {
    const { page = 1, limit = 25, status, role } = params;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (role) {
      filter.role = role;
    }

    const results = await this.paginate(filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    return {
      items: results.items.map((doc) => this.sanitizeUser(doc)),
      meta: results.meta,
    };
  }

  async issueAuthTokens(userDocument) {
    const accessToken = generateAccessToken(userDocument);
    const refreshToken = generateRefreshToken(userDocument);
    await this.persistRefreshToken(userDocument._id, refreshToken);
    return { accessToken, refreshToken };
  }

  async persistRefreshToken(userId, refreshToken) {
    const decoded = decodeRefreshToken(refreshToken);
    const refreshTokenHash = hashToken(refreshToken);

    await this.model.updateOne(
      { _id: userId },
      {
        $set: {
          refreshTokenHash,
          refreshTokenExpiresAt: decoded?.exp
            ? new Date(decoded.exp * 1000)
            : null,
        },
      },
    );
  }

  async revokeRefreshToken(userId) {
    await this.model.updateOne(
      { _id: userId },
      {
        $set: { refreshTokenHash: null, refreshTokenExpiresAt: null },
      },
    );
  }

  async refreshSession(refreshToken) {
    if (!refreshToken) {
      throw buildError("Refresh token missing", 401);
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw buildError("Invalid refresh token", 401);
    }

    const user = await this.model
      .findOne({ _id: payload.sub, isDeleted: false })
      .select("+refreshTokenHash");

    if (!user || !user.refreshTokenHash) {
      throw buildError("Unauthorized", 401);
    }

    const incomingHash = hashToken(refreshToken);
    if (incomingHash !== user.refreshTokenHash) {
      throw buildError("Refresh token mismatch", 401);
    }

    if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
      throw buildError("Refresh token expired", 401);
    }

    const tokens = await this.issueAuthTokens(user);
    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async revokeByRefreshToken(refreshToken) {
    if (!refreshToken) {
      return;
    }

    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await this.model
        .findOne({ _id: payload.sub })
        .select("+refreshTokenHash");

      if (!user || !user.refreshTokenHash) {
        return;
      }

      const incomingHash = hashToken(refreshToken);
      if (incomingHash === user.refreshTokenHash) {
        await this.revokeRefreshToken(user._id);
      }
    } catch (error) {
      return;
    }
  }
}

const userService = new UserService();

export default userService;
