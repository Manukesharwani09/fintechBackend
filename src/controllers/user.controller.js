import userService from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, status, role } = req.query;

  const result = await userService.listUsers({
    page: Number(page) || 1,
    limit: Number(limit) || 25,
    status,
    role,
  });

  res.status(200).json({ data: result.items, meta: result.meta });
});

export default {
  listUsers,
};
