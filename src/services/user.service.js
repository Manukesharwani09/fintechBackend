import BaseService from "./base.service.js";
import User from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { USER_ROLE_VALUES, USER_ROLES } from "../constants/userRoles.js";
import { USER_STATUS, USER_STATUS_VALUES } from "../constants/userStatuses.js";
import mongoose from "mongoose";
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

const normalizeText = (value) =>
  typeof value === "string" ? value.trim() || undefined : undefined;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

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
    const existing = await this.model
      .findOne({ email: email?.trim().toLowerCase() })
      .withDeleted()
      .select("_id isDeleted");

    if (!existing) {
      return;
    }

    if (existing.isDeleted) {
      throw buildError(
        "An account with this email exists but is deactivated. Please contact support to restore it.",
        409,
      );
    }

    throw buildError("Email is already registered", 409);
  }

  async registerUser(payload) {
    const normalizedEmail = payload.email?.trim().toLowerCase();
    if (!normalizedEmail || !payload.password) {
      throw buildError("Email and password are required", 400);
    }

    await this.ensureEmailAvailable(normalizedEmail);

    const passwordHash = await hashPassword(payload.password);

    let role;
    if (
      payload.role === undefined ||
      payload.role === null ||
      payload.role === ""
    ) {
      role = USER_ROLES.VIEWER;
    } else if (USER_ROLE_VALUES.includes(payload.role)) {
      role = payload.role;
    } else {
      throw buildError(`Role '${payload.role}' does not exist.`, 400);
    }

    const userPayload = {
      email: normalizedEmail,
      passwordHash,
      role,
      profile: {
        firstName: normalizeText(payload.firstName),
        lastName: normalizeText(payload.lastName),
        timezone: normalizeText(payload.timezone),
      },
    };

    let user;
    try {
      user = await this.create(userPayload);
    } catch (error) {
      if (error?.code === 11000) {
        // Unique index catch-all in case of race condition between availability check and insert
        throw buildError("Email is already registered", 409);
      }
      throw error;
    }
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

    const invalidCredentials = () => buildError("Invalid credentials", 401);

    if (!user) {
      throw invalidCredentials();
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw invalidCredentials();
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    return user;
  }

  async loginUser(email, password) {
    const user = await this.validateCredentials(email, password);
    const now = new Date();
    await this.model.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: now } },
    );
    user.lastLoginAt = now;
    const tokens = await this.issueAuthTokens(user);
    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async listUsers(params = {}) {
    const {
      page = 1,
      limit = 25,
      status,
      role,
      includeDeleted = false,
    } = params;
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
      includeDeleted,
    });
    return {
      items: results.items.map((doc) => this.sanitizeUser(doc)),
      meta: results.meta,
    };
  }

  async getUserById(userId, options = {}) {
    if (!isValidObjectId(userId)) {
      throw buildError("Invalid user id", 400);
    }

    const user = await this.findById(userId, options);
    if (!user) {
      throw buildError("User not found", 404);
    }

    return this.sanitizeUser(user);
  }

  async createUserByAdmin(payload) {
    const normalizedEmail = payload.email?.trim().toLowerCase();
    if (!normalizedEmail || !payload.password) {
      throw buildError("Email and password are required", 400);
    }

    await this.ensureEmailAvailable(normalizedEmail);

    let role;
    if (
      payload.role === undefined ||
      payload.role === null ||
      payload.role === ""
    ) {
      role = USER_ROLES.VIEWER;
    } else if (USER_ROLE_VALUES.includes(payload.role)) {
      role = payload.role;
    } else {
      throw buildError(`Role '${payload.role}' does not exist.`, 400);
    }

    const passwordHash = await hashPassword(payload.password);

    const userPayload = {
      email: normalizedEmail,
      passwordHash,
      role,
      profile: {
        firstName: normalizeText(payload.firstName),
        lastName: normalizeText(payload.lastName),
        timezone: normalizeText(payload.timezone),
      },
    };

    let user;
    try {
      user = await this.create(userPayload);
    } catch (error) {
      if (error?.code === 11000) {
        throw buildError("Email is already registered", 409);
      }
      throw error;
    }

    return { user: this.sanitizeUser(user) };
  }

  async updateUserById(userId, payload, actorId) {
    if (!isValidObjectId(userId)) {
      throw buildError("Invalid user id", 400);
    }

    const updates = {};

    if (payload.email !== undefined) {
      const normalizedEmail = payload.email?.trim().toLowerCase();
      if (!normalizedEmail) {
        throw buildError("Email cannot be empty", 400);
      }

      const existing = await this.model
        .findOne({ email: normalizedEmail, _id: { $ne: userId } })
        .withDeleted()
        .select("_id");

      if (existing) {
        throw buildError("Email is already registered", 409);
      }

      updates.email = normalizedEmail;
    }

    if (
      payload.firstName !== undefined ||
      payload.lastName !== undefined ||
      payload.timezone !== undefined
    ) {
      updates.profile = {
        firstName: normalizeText(payload.firstName),
        lastName: normalizeText(payload.lastName),
        timezone: normalizeText(payload.timezone),
      };
    }

    if (payload.password) {
      updates.passwordHash = await hashPassword(payload.password);
      updates.refreshTokenHash = null;
      updates.refreshTokenExpiresAt = null;
    }

    if (!Object.keys(updates).length) {
      throw buildError("No updatable fields provided", 400);
    }

    const updated = await this.updateById(
      userId,
      { $set: updates },
      { includeDeleted: true },
    );
    if (!updated) {
      throw buildError("User not found", 404);
    }

    if (actorId && String(actorId) === String(userId) && updates.passwordHash) {
      await this.revokeRefreshToken(userId);
    }

    return this.sanitizeUser(updated);
  }

  async assignRole(userId, role, actorId) {
    if (!isValidObjectId(userId)) {
      throw buildError("Invalid user id", 400);
    }
    if (!USER_ROLE_VALUES.includes(role)) {
      throw buildError("Invalid role", 400);
    }
    if (actorId && String(actorId) === String(userId)) {
      throw buildError("You cannot change your own role", 403);
    }

    const updated = await this.updateById(
      userId,
      { $set: { role } },
      { includeDeleted: true },
    );

    if (!updated) {
      throw buildError("User not found", 404);
    }

    return this.sanitizeUser(updated);
  }

  async updateUserStatus(userId, status, actorId) {
    if (!isValidObjectId(userId)) {
      throw buildError("Invalid user id", 400);
    }
    if (!USER_STATUS_VALUES.includes(status)) {
      throw buildError("Invalid status", 400);
    }
    if (
      actorId &&
      String(actorId) === String(userId) &&
      status !== USER_STATUS.ACTIVE
    ) {
      throw buildError("You cannot deactivate your own account", 403);
    }

    const setPayload = { status };
    if (status !== USER_STATUS.ACTIVE) {
      setPayload.refreshTokenHash = null;
      setPayload.refreshTokenExpiresAt = null;
    }

    const updated = await this.updateById(
      userId,
      { $set: setPayload },
      { includeDeleted: true },
    );

    if (!updated) {
      throw buildError("User not found", 404);
    }

    return this.sanitizeUser(updated);
  }

  async softDeleteUser(userId, actorId) {
    if (!isValidObjectId(userId)) {
      throw buildError("Invalid user id", 400);
    }
    if (actorId && String(actorId) === String(userId)) {
      throw buildError("You cannot delete your own account", 403);
    }

    const user = await this.model
      .findOne({ _id: userId })
      .withDeleted()
      .select("_id isDeleted");

    if (!user) {
      throw buildError("User not found", 404);
    }
    if (user.isDeleted) {
      return { alreadyDeleted: true };
    }

    await this.model.updateOne(
      { _id: userId },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          refreshTokenHash: null,
          refreshTokenExpiresAt: null,
        },
      },
    );

    return { deleted: true };
  }

  async restoreUser(userId) {
    if (!isValidObjectId(userId)) {
      throw buildError("Invalid user id", 400);
    }

    const result = await this.model.updateOne(
      { _id: userId, isDeleted: true },
      {
        $set: { isDeleted: false, deletedAt: null, status: USER_STATUS.ACTIVE },
      },
      { includeDeleted: true },
    );

    if (!result.matchedCount) {
      const exists = await this.model
        .findOne({ _id: userId })
        .withDeleted()
        .select("_id");
      if (!exists) {
        throw buildError("User not found", 404);
      }
      return { alreadyRestored: true };
    }

    return { restored: true };
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
      .select("+refreshTokenHash status");

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

    if (user.status !== USER_STATUS.ACTIVE) {
      throw buildError("Unauthorized", 401);
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
