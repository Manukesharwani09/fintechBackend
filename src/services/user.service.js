import BaseService from "./base.service.js";
import User from "../models/user.model.js";

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  findByEmail(email, options = {}) {
    return this.findOne({ email }, options);
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

    return this.paginate(filter, { page, limit, sort: { createdAt: -1 } });
  }
}

const userService = new UserService();

export default userService;
