class BaseService {
  constructor(model) {
    if (!model) {
      throw new Error("Model is required for a service instance.");
    }

    this.model = model;
  }

  buildQuery(filter = {}, options = {}) {
    const { includeDeleted = false } = options;
    const defaultFilter = includeDeleted ? {} : { isDeleted: false };
    return { ...defaultFilter, ...filter };
  }

  applyQueryOptions(query, options = {}) {
    const { projection, populate, sort, limit, skip, lean } = options;

    if (projection) {
      query.select(projection);
    }
    if (populate) {
      query.populate(populate);
    }
    if (sort) {
      query.sort(sort);
    }
    if (typeof limit === "number") {
      query.limit(limit);
    }
    if (typeof skip === "number") {
      query.skip(skip);
    }
    if (typeof lean === "boolean") {
      query.lean(lean);
    }

    return query;
  }

  find(filter = {}, options = {}) {
    const query = this.model.find(this.buildQuery(filter, options));
    return this.applyQueryOptions(query, options);
  }

  findOne(filter = {}, options = {}) {
    const query = this.model.findOne(this.buildQuery(filter, options));
    return this.applyQueryOptions(query, options);
  }

  findById(id, options = {}) {
    return this.findOne({ _id: id }, options);
  }

  async paginate(filter = {}, options = {}) {
    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * safeLimit;

    const queryOptions = { ...options, limit: safeLimit, skip, sort };

    const [items, total] = await Promise.all([
      this.find(filter, queryOptions),
      this.count(filter, options),
    ]);

    return {
      items,
      meta: {
        total,
        page: Math.max(page, 1),
        limit: safeLimit,
        pages: Math.ceil(total / safeLimit) || 1,
      },
    };
  }

  count(filter = {}, options = {}) {
    return this.model.countDocuments(this.buildQuery(filter, options));
  }

  create(payload, options = {}) {
    return this.model.create([payload], options).then(([doc]) => doc);
  }

  updateById(id, payload, options = {}) {
    const queryOptions = { new: true, runValidators: true, ...options };
    return this.model.findOneAndUpdate(
      this.buildQuery({ _id: id }, options),
      payload,
      queryOptions,
    );
  }

  softDeleteById(id, options = {}) {
    return this.model.softDeleteById(id, options);
  }

  restoreById(id, options = {}) {
    return this.model.restoreById(id, options);
  }
}

export default BaseService;
