import userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, status, role, includeDeleted } = req.query;

  const result = await userService.listUsers({
    page: Number(page) || 1,
    limit: Number(limit) || 25,
    status,
    role,
    includeDeleted: includeDeleted || false,
  });

  res.status(200).json({ data: result.items, meta: result.meta });
});

const getUserById = asyncHandler(async (req, res) => {
  const includeDeleted = req.query.includeDeleted || false;
  const user = await userService.getUserById(req.params.userId, {
    includeDeleted,
  });
  res.status(200).json({ data: user });
});

const createUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, timezone, role } = req.body;

  const result = await userService.createUserByAdmin({
    email,
    password,
    firstName,
    lastName,
    timezone,
    role,
  });

  res.status(201).json({
    data: { user: result.user },
    message: "User created successfully",
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const updated = await userService.updateUserById(
    req.params.userId,
    req.body,
    req.user?.id,
  );

  res.status(200).json({
    data: updated,
    message: "User updated successfully",
  });
});

const assignUserRole = asyncHandler(async (req, res) => {
  const updated = await userService.assignRole(
    req.params.userId,
    req.body.role,
    req.user?.id,
  );

  res.status(200).json({
    data: updated,
    message: "Role updated successfully",
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const updated = await userService.updateUserStatus(
    req.params.userId,
    req.body.status,
    req.user?.id,
  );

  res.status(200).json({
    data: updated,
    message: "Status updated successfully",
  });
});

const softDeleteUser = asyncHandler(async (req, res) => {
  const result = await userService.softDeleteUser(
    req.params.userId,
    req.user?.id,
  );
  res.status(200).json({
    data: result,
    message: result.alreadyDeleted
      ? "User already deleted"
      : "User deleted successfully",
  });
});

const restoreUser = asyncHandler(async (req, res) => {
  const result = await userService.restoreUser(req.params.userId);
  res.status(200).json({
    data: result,
    message: result.alreadyRestored
      ? "User already active"
      : "User restored successfully",
  });
});

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  assignUserRole,
  updateUserStatus,
  softDeleteUser,
  restoreUser,
};
